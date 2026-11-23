import { issuePayhereRefund } from "./payhere-refund.js";
import { sendBookingDeclinedRefundEmail } from "./booking-declined-refund-email.js";

const WEBSITE_SOURCE = "website";
const DEPOSIT_METHOD = "payhere";

export function validateCancelAndRefundEligibility({
  requestStatus,
  bookingStatus,
  source,
  payment,
  acceptedRefund,
}) {
  if (source?.toLowerCase() !== WEBSITE_SOURCE) {
    return "Cancel and refund is only available for website bookings.";
  }
  if (requestStatus !== "confirmed" || bookingStatus !== "confirmed") {
    return "Only confirmed reservations that have not checked in can be cancelled and refunded.";
  }
  if (["checked_in", "checked_out", "cancelled"].includes(bookingStatus)) {
    return "This stay can no longer be cancelled from booking requests.";
  }
  if (!payment) {
    return "No verified PayHere deposit was found for this booking.";
  }
  if (acceptedRefund) {
    return "A refund has already been recorded for this payment.";
  }
  return null;
}

export function refundableDepositPaymentSql() {
  return `select p.id, p.amount, p.transaction_reference as "transactionReference", p.reference, p.method
            from bookings b
            join booking_payments p on p.booking_id = b.id
           where b.booking_request_id = $1
             and p.status = 'verified'
             and p.payment_type = 'deposit'
             and lower(coalesce(p.method, '')) = $2
             and not exists (
               select 1 from booking_refunds rf
                where rf.booking_payment_id = p.id and rf.status = 'accepted'
             )
           order by p.paid_at desc nulls last, p.id desc
           limit 1`;
}

export function idempotencyKeyForRequest(requestId) {
  return `br-${requestId}-cancel-refund`;
}

export async function loadCancelAndRefundContext(client, requestId) {
  const { rows: requestRows } = await client.query(
    `select id, name, email, arrive::text as arrive, depart::text as depart,
            source, status, payment_order_id as "paymentOrderId"
       from booking_requests where id = $1`,
    [requestId],
  );
  const request = requestRows[0];
  if (!request) return null;

  const { rows: bookingRows } = await client.query(
    `select id, status, payment_status as "paymentStatus", guest_name as "guestName", guest_email as "guestEmail"
       from bookings where booking_request_id = $1`,
    [requestId],
  );
  const booking = bookingRows[0] || null;

  const { rows: paymentRows } = await client.query(refundableDepositPaymentSql(), [requestId, DEPOSIT_METHOD]);
  const payment = paymentRows[0] || null;

  const { rows: refundRows } = await client.query(
    `select id, status, payhere_refund_id as "payhereRefundId", amount
       from booking_refunds
      where booking_request_id = $1 and status = 'accepted'
      limit 1`,
    [requestId],
  );
  const acceptedRefund = refundRows[0] || null;

  const error = validateCancelAndRefundEligibility({
    requestStatus: request.status,
    bookingStatus: booking?.status,
    source: request.source,
    payment,
    acceptedRefund,
  });

  const refundAmount = payment ? Number(payment.amount) : 0;

  return {
    request,
    booking,
    payment,
    acceptedRefund,
    refundAmount,
    canCancelAndRefund: !error,
    ineligibleReason: error,
    refundPreview: payment
      ? {
        guestName: request.name,
        reservationReference: `BR-${request.id}`,
        checkIn: request.arrive,
        checkOut: request.depart,
        refundAmount,
        currency: "LKR",
      }
      : null,
  };
}

export async function cancelAndRefundBookingRequest(pool, requestId, adminId) {
  const idempotencyKey = idempotencyKeyForRequest(requestId);
  const client = await pool.connect();

  let locked;
  try {
    await client.query("begin");
    const { rows: requestRows } = await client.query(
      "select id, status from booking_requests where id = $1 for update",
      [requestId],
    );
    if (!requestRows.length) {
      await client.query("rollback");
      throw Object.assign(new Error("Booking request not found."), { status: 404 });
    }
    await client.query("select id from bookings where booking_request_id = $1 for update", [requestId]);

    const ctx = await loadCancelAndRefundContext(client, requestId);
    if (!ctx?.booking || !ctx.payment) {
      await client.query("rollback");
      throw Object.assign(new Error(ctx?.ineligibleReason || "Cannot cancel this booking."), { status: 400 });
    }

    const { rows: existingAccepted } = await client.query(
      "select id, payhere_refund_id as \"payhereRefundId\" from booking_refunds where idempotency_key = $1 and status = 'accepted' limit 1",
      [idempotencyKey],
    );
    if (existingAccepted.length) {
      await client.query("commit");
      client.release();
      return {
        ok: true,
        alreadyProcessed: true,
        refundAmount: ctx.refundAmount,
        payhereRefundId: existingAccepted[0].payhereRefundId,
        emailSent: false,
      };
    }

    const { rows: pendingRows } = await client.query(
      "select id, status from booking_refunds where idempotency_key = $1 and status in ('pending', 'failed') order by id desc limit 1",
      [idempotencyKey],
    );
    let refundRowId;
    if (pendingRows.length) {
      refundRowId = pendingRows[0].id;
      if (pendingRows[0].status === "failed") {
        await client.query(
          "update booking_refunds set status = 'pending', provider_message = null, provider_response = null, updated_at = now() where id = $1",
          [refundRowId],
        );
      }
    } else {
      const inserted = await client.query(
        `insert into booking_refunds (
           booking_request_id, booking_id, booking_payment_id, amount, payhere_payment_id,
           status, idempotency_key, initiated_by_admin_id
         ) values ($1, $2, $3, $4, $5, 'pending', $6, $7)
         returning id`,
        [
          requestId,
          ctx.booking.id,
          ctx.payment.id,
          ctx.refundAmount,
          ctx.payment.transactionReference || ctx.payment.reference,
          idempotencyKey,
          adminId,
        ],
      );
      refundRowId = inserted.rows[0].id;
    }
    await client.query("commit");
    locked = { refundRowId, ctx };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    client.release();
    throw error;
  }
  client.release();

  const { ctx, refundRowId } = locked;
  const payherePaymentId = ctx.payment.transactionReference || ctx.payment.reference;
  let payhereResult;
  try {
    payhereResult = await issuePayhereRefund({
      paymentId: payherePaymentId,
      description: `Mistwood BR-${requestId} — accommodation unavailable`,
      amount: ctx.refundAmount,
    });
  } catch (error) {
    const failClient = await pool.connect();
    try {
      await failClient.query(
        `update booking_refunds
            set status = 'failed', provider_message = $2, provider_response = $3::jsonb, updated_at = now()
          where id = $1`,
        [refundRowId, error.message, JSON.stringify(error.payhere || {})],
      );
    } finally {
      failClient.release();
    }
    throw error;
  }

  const finalizeClient = await pool.connect();
  let emailSent = false;
  let emailError = null;
  try {
    await finalizeClient.query("begin");
    await finalizeClient.query("select id from booking_requests where id = $1 for update", [requestId]);
    await finalizeClient.query("select id from bookings where booking_request_id = $1 for update", [requestId]);

    const fresh = await loadCancelAndRefundContext(finalizeClient, requestId);
    if (fresh?.acceptedRefund && Number(fresh.acceptedRefund.id) !== Number(refundRowId)) {
      await finalizeClient.query("commit");
      return {
        ok: true,
        alreadyProcessed: true,
        refundAmount: fresh.refundAmount,
        payhereRefundId: fresh.acceptedRefund.payhereRefundId,
        emailSent: false,
      };
    }

    const payhereRefundId = payhereResult.data != null ? String(payhereResult.data) : null;
    await finalizeClient.query(
      `update booking_refunds
          set status = 'accepted',
              payhere_refund_id = $2,
              provider_message = $3,
              provider_response = $4::jsonb,
              updated_at = now()
        where id = $1`,
      [refundRowId, payhereRefundId, payhereResult.msg, JSON.stringify(payhereResult)],
    );

    await finalizeClient.query(
      `insert into booking_payments (booking_id, amount, method, reference, status, paid_at, payment_type, transaction_reference, recorded_by_admin_id)
       values ($1, $2, $3, $4, 'refunded', now(), 'refund', $5, $6)`,
      [
        ctx.booking.id,
        -Math.abs(ctx.refundAmount),
        "PayHere",
        payhereRefundId || `refund-${refundRowId}`,
        payhereRefundId || `refund-${refundRowId}`,
        adminId,
      ],
    );

    await finalizeClient.query(
      "update bookings set status = 'cancelled', payment_status = 'refunded', updated_at = now() where id = $1",
      [ctx.booking.id],
    );
    const fromStatus = fresh?.request.status;
    await finalizeClient.query(
      "update booking_requests set status = 'cancelled', status_changed_at = now(), updated_at = now() where id = $1",
      [requestId],
    );
    await finalizeClient.query(
      "insert into booking_request_status_history (booking_request_id, from_status, to_status, changed_by_admin_id) values ($1, $2, 'cancelled', $3)",
      [requestId, fromStatus, adminId],
    );
    await finalizeClient.query(
      `insert into booking_audit_log (booking_request_id, booking_id, action, details, created_by_admin_id)
       values ($1, $2, 'cancel_and_refund', $3::jsonb, $4)`,
      [
        requestId,
        ctx.booking.id,
        JSON.stringify({
          refundAmount: ctx.refundAmount,
          payhereRefundId,
          payherePaymentId,
          bookingPaymentId: ctx.payment.id,
        }),
        adminId,
      ],
    );
    await finalizeClient.query("commit");

    try {
      await sendBookingDeclinedRefundEmail(pool, {
        guestName: ctx.request.name,
        guestEmail: ctx.request.email,
        reservationReference: `BR-${requestId}`,
        checkIn: ctx.request.arrive,
        checkOut: ctx.request.depart,
        refundAmount: ctx.refundAmount,
        refundTimeframe: "5–10 business days",
      });
      emailSent = true;
    } catch (mailError) {
      emailError = mailError.message || "Could not send refund email.";
      console.error("Refund cancellation email failed:", emailError);
    }

    return {
      ok: true,
      refundAmount: ctx.refundAmount,
      payhereRefundId,
      emailSent,
      emailError,
    };
  } catch (error) {
    await finalizeClient.query("rollback").catch(() => {});
    throw error;
  } finally {
    finalizeClient.release();
  }
}