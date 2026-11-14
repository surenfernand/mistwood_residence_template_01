import crypto from "node:crypto";
import { calculateStayQuote } from "./pricing.js";
import { verifyPayhereNotify } from "./payhere.js";
import { sendBookingConfirmationToGuest } from "./booking-confirmation-email.js";
import { sendBookingAdminNotification } from "./booking-admin-notification-email.js";
import { issueGuestSetupToken } from "./guest-auth.js";
import { getSiteSettings, contactFromSettings } from "./site-settings.js";
import { logPayhereEvent } from "./integrations.js";
import {
  notifyPaymentReceived,
  notifyBookingConfirmed,
  notifyNeedsAttention,
} from "./admin-notifications.js";

const siteUrl = () => (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
const tokenHash = (token) => crypto.createHash("sha256").update(token).digest("hex");
const PAYMENT_HOLD_MINUTES = 15;

export function issueCheckInToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export async function createCheckoutRequest(client, entry) {
  if (await availabilityConflict(client, entry.arrive, entry.depart)) {
    throw Object.assign(new Error("Those dates overlap an existing stay or blocked period. Please choose other dates."), {
      status: 409,
    });
  }
  const quote = await calculateStayQuote(client, entry.arrive, entry.depart, {
    selectedOfferId: entry.offerId ?? null,
  });
  if (entry.offerId && quote.offerEligibilityReasons?.length) {
    throw Object.assign(new Error(quote.offerEligibilityReasons.join(" ")), { status: 400, code: "offer_ineligible" });
  }
  const orderId = `MW-BR-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const { rows } = await client.query(
    `insert into booking_requests (
      name, email, phone, note, guests, arrive, depart, status,
      quoted_total, quoted_deposit, pricing_snapshot, payment_order_id, hold_expires_at
    ) values ($1, $2, $3, $4, $5, $6::date, $7::date, 'pending_payment', $8, $9, $10::jsonb, $11, now() + ($12 * interval '1 minute'))
    returning id, payment_order_id as "paymentOrderId", quoted_total as "quotedTotal", quoted_deposit as "quotedDeposit", hold_expires_at as "holdExpiresAt"`,
    [
      entry.name,
      entry.email,
      entry.phone,
      entry.note || null,
      entry.guests || null,
      entry.arrive,
      entry.depart,
      quote.total,
      quote.depositAmount,
      JSON.stringify(quote),
      orderId,
      PAYMENT_HOLD_MINUTES,
    ],
  );
  return { request: rows[0], quote };
}

export async function ensureBookingForPaidRequest(client, requestId, quote) {
  const { rows: existing } = await client.query(
    "select id, check_in_token_hash from bookings where booking_request_id = $1",
    [requestId],
  );
  if (existing.length) return { bookingId: existing[0].id, rawToken: null };

  const { rows: requests } = await client.query(
    "select id, name, email, phone, source, guests, arrive, depart from booking_requests where id = $1",
    [requestId],
  );
  if (!requests.length) return null;
  const request = requests[0];

  const rawToken = issueCheckInToken();
  const checkInTokenHash = tokenHash(rawToken);

  const { rows } = await client.query(
    `insert into bookings (
      booking_request_id, guest_name, guest_email, guest_phone, source, check_in, check_out, guests,
      status, nightly_rate, total_amount, deposit_amount, payment_status, check_in_token_hash, qr_issued_at
    ) values ($1, $2, $3, $4, coalesce($5, 'website'), $6::date, $7::date, $8, 'confirmed', $9, $10, $11, 'partial', $12, now())
    returning id`,
    [
      requestId,
      request.name,
      request.email,
      request.phone,
      request.source,
      request.arrive,
      request.depart,
      Math.max(parseInt(String(request.guests || "1"), 10) || 1, 1),
      quote.nights ? quote.total / quote.nights : quote.total,
      quote.total,
      quote.depositAmount,
      checkInTokenHash,
    ],
  );
  return { bookingId: rows[0].id, rawToken };
}

async function availabilityConflict(client, arrive, depart, excludeRequestId = null) {
  const { rowCount } = await client.query(
    `select 1 from bookings where status in ('confirmed','checked_in')
       and daterange(check_in,check_out,'[)') && daterange($1::date,$2::date,'[)')
     union all
     select 1 from availability_blocks
       where daterange(start_date,end_date,'[)') && daterange($1::date,$2::date,'[)')
     union all
     select 1 from booking_requests
       where status = 'pending_payment'
         and hold_expires_at > now()
         and ($3::bigint is null or id <> $3::bigint)
         and daterange(arrive,depart,'[)') && daterange($1::date,$2::date,'[)')
     limit 1`,
    [arrive, depart, excludeRequestId],
  );
  return Boolean(rowCount);
}

export async function fulfillPayherePayment(pool, body) {
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantSecret || !verifyPayhereNotify(body, merchantSecret)) {
    throw Object.assign(new Error("Invalid PayHere signature."), { status: 400 });
  }

  const statusCode = Number(body.status_code);
  if (statusCode !== 2) {
    return { ignored: true, reason: "not successful" };
  }

  const orderId = String(body.order_id || "");
  const baseOrderId = orderId.replace(/-BAL$/, "");
  const paymentId = String(body.payment_id || "");
  const payhereAmount = Number(body.payhere_amount);

  const client = await pool.connect();
  try {
    await client.query("begin");

    const { rows: payExists } = await client.query(
      "select id from booking_payments where transaction_reference = $1 limit 1",
      [paymentId],
    );
    if (payExists.length) {
      await client.query("commit");
      return { duplicate: true };
    }

    const { rows: reqRows } = await client.query(
      `select id, name, email, phone, guests, arrive::text as arrive, depart::text as depart,
              quoted_total, quoted_deposit, pricing_snapshot, status, hold_expires_at as "holdExpiresAt"
         from booking_requests where payment_order_id = $1 for update`,
      [baseOrderId],
    );
    const request = reqRows[0];
    if (!request) {
      await client.query("rollback");
      throw Object.assign(new Error("Unknown order."), { status: 404 });
    }

    const paymentType = String(body.custom_2 || "deposit");
    const quote = typeof request.pricing_snapshot === "string"
      ? JSON.parse(request.pricing_snapshot)
      : (request.pricing_snapshot || (await calculateStayQuote(client, request.arrive, request.depart)));
    const expectedAmount = paymentType === "balance"
      ? Number(quote.balanceDue)
      : Number(quote.depositAmount ?? request.quoted_deposit);

    if (Math.abs(payhereAmount - expectedAmount) > 0.02) {
      await client.query("rollback");
      throw Object.assign(new Error("Amount mismatch."), { status: 400 });
    }

    let bookingId;
    let rawToken = null;

    if (paymentType === "deposit") {
      if (request.holdExpiresAt && new Date(request.holdExpiresAt).getTime() <= Date.now()) {
        await client.query(
          "update booking_requests set needs_attention = true, status = 'cancelled', status_changed_at = now(), updated_at = now() where id = $1",
          [request.id],
        );
        await client.query("commit");
        await notifyNeedsAttention(pool, request.id).catch((e) => console.error("Expired hold notification failed:", e.message));
        return { expired: true, requestId: request.id };
      }
      if (await availabilityConflict(client, request.arrive, request.depart, request.id)) {
        await client.query(
          "update booking_requests set needs_attention = true, status = 'pending_payment', updated_at = now() where id = $1",
          [request.id],
        );
        await client.query("commit");
        try {
          await notifyNeedsAttention(pool, request.id);
        } catch (e) {
          console.error("Needs attention notification failed:", e.message);
        }
        return { conflict: true, requestId: request.id };
      }

      const created = await ensureBookingForPaidRequest(client, request.id, quote);
      bookingId = created.bookingId;
      rawToken = created.rawToken;

      await client.query(
        `insert into booking_payments (booking_id, amount, method, reference, status, paid_at, payment_type, transaction_reference)
         values ($1, $2, 'PayHere', $3, 'verified', now(), 'deposit', $4)`,
        [bookingId, payhereAmount, paymentId, paymentId],
      );

      await client.query(
        "update booking_requests set status = 'confirmed', hold_expires_at = null, status_changed_at = now(), updated_at = now() where id = $1",
        [request.id],
      );
    } else {
      const { rows: bookings } = await client.query(
        "select id, check_in_token_hash from bookings where booking_request_id = $1 for update",
        [request.id],
      );
      const booking = bookings[0];
      if (!booking) {
        await client.query("rollback");
        throw Object.assign(new Error("Booking not found for balance payment."), { status: 404 });
      }
      bookingId = booking.id;

      await client.query(
        `insert into booking_payments (booking_id, amount, method, reference, status, paid_at, payment_type, transaction_reference)
         values ($1, $2, 'PayHere', $3, 'verified', now(), 'full_payment', $4)`,
        [bookingId, payhereAmount, paymentId, paymentId],
      );

      await client.query(
        "update bookings set payment_status = 'paid', updated_at = now() where id = $1",
        [bookingId],
      );
    }

    await client.query(
      `insert into booking_audit_log (booking_request_id, booking_id, action, details)
       values ($1, $2, 'payhere_notify', $3::jsonb)`,
      [request.id, bookingId, JSON.stringify({ paymentId, paymentType, orderId })],
    );

    await client.query("commit");

    logPayhereEvent(
      pool,
      paymentType === "balance"
        ? "Balance payment verified via PayHere webhook."
        : "Deposit payment verified and booking confirmed via PayHere.",
    ).catch((e) => console.error("Integration activity log failed:", e.message));

    let accountUrl = `${siteUrl()}/account/login`;
    if (paymentType === "deposit") {
      try {
        const setupToken = await issueGuestSetupToken(pool, request.email);
        accountUrl = `${siteUrl()}/account/setup?token=${encodeURIComponent(setupToken)}`;
      } catch (e) {
        console.error("Guest setup token failed:", e.message);
      }
    }

    const emailPayload = {
      requestId: request.id,
      bookingId,
      guestName: request.name,
      guestEmail: request.email,
      guestPhone: request.phone,
      guests: request.guests,
      checkIn: request.arrive,
      checkOut: request.depart,
      total: quote.total,
      depositPaid: quote.depositAmount,
      balanceDue: quote.balanceDue,
      checkInUrl: rawToken ? `${siteUrl()}/check-in/${rawToken}` : `${siteUrl()}/admin/booking-requests`,
      accountUrl,
    };

    if (paymentType === "deposit" && rawToken) {
      const mailFlags = contactFromSettings(await getSiteSettings(pool));
      if (mailFlags.sendCustomerBookingEmail) {
        try {
          await sendBookingConfirmationToGuest(pool, emailPayload);
        } catch (e) {
          console.error("Guest booking email failed:", e.message);
        }
      }
      if (mailFlags.sendAdminBookingEmail) {
        try {
          await sendBookingAdminNotification(pool, emailPayload);
        } catch (e) {
          console.error("Admin booking email failed:", e.message);
        }
      }
    }

    try {
      await notifyPaymentReceived(pool, {
        bookingId,
        amount: payhereAmount,
        guestName: request.name,
      });
      if (paymentType === "deposit") {
        await notifyBookingConfirmed(pool, {
          requestId: request.id,
          guestName: request.name,
          arrive: request.arrive,
          depart: request.depart,
        });
      }
    } catch (e) {
      console.error("Payment in-app notifications failed:", e.message);
    }

    return { ok: true, bookingId, requestId: request.id, paymentType };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
