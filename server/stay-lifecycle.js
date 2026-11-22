import crypto from "node:crypto";
import { sendCheckoutThankYouEmail } from "./checkout-thank-you-email.js";

const COLOMBO = "Asia/Colombo";
const siteUrl = () => (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
const tokenHash = (token) => crypto.createHash("sha256").update(token).digest("hex");

async function sendCheckoutFollowUp(pool, booking) {
  const rawToken = crypto.randomBytes(24).toString("base64url");
  const reviewUrl = `${siteUrl()}/review/${rawToken}`;
  await pool.query("update bookings set review_token_hash = $1 where id = $2", [tokenHash(rawToken), booking.id]);
  await sendCheckoutThankYouEmail(pool, { guestName: booking.guestName, guestEmail: booking.guestEmail, reviewUrl });
  await pool.query("update bookings set checkout_email_sent_at = now() where id = $1", [booking.id]);
}

export async function runStayLifecycleJob(pool) {
  const client = await pool.connect();
  let dueForEmail = [];
  let autoClosed = 0;
  try {
    await client.query("begin");

    const checkedIn = await client.query(
      `update bookings b
          set status = 'checked_out', updated_at = now()
         from site_settings s
        where s.id = 1
          and b.status = 'checked_in'
          and (now() at time zone $1) >= (b.check_out + s.check_out_time::time)
      returning b.id, b.booking_request_id as "requestId", b.guest_name as "guestName", b.guest_email as "guestEmail"`,
      [COLOMBO],
    );

    const confirmedPast = await client.query(
      `update bookings b
          set status = 'checked_out', updated_at = now()
        where b.status = 'confirmed' and b.check_out < (now() at time zone $1)::date
      returning b.id, b.booking_request_id as "requestId"`,
      [COLOMBO],
    );

    const all = [...checkedIn.rows, ...confirmedPast.rows];
    for (const row of all) {
      if (row.requestId) {
        await client.query(
          "update booking_requests set status = 'checked_out', status_changed_at = now(), updated_at = now() where id = $1 and status in ('confirmed', 'checked_in')",
          [row.requestId],
        );
      }
    }

    await client.query("commit");
    dueForEmail = checkedIn.rows;
    autoClosed = confirmedPast.rowCount;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  let emailsSent = 0;
  for (const booking of dueForEmail) {
    try {
      await sendCheckoutFollowUp(pool, booking);
      emailsSent += 1;
    } catch (error) {
      console.error(`Checkout thank-you email failed for booking ${booking.id}:`, error.message);
    }
  }
  return { checkedOut: dueForEmail.length, autoClosed, emailsSent };
}

export function scheduleStayLifecycle(pool) {
  const run = () => {
    runStayLifecycleJob(pool).then((result) => {
      if (result.checkedOut || result.autoClosed || result.emailsSent) {
        console.log(`Stay lifecycle: ${result.checkedOut} checked-out, ${result.autoClosed} auto-closed confirmed stays, ${result.emailsSent} thank-you emails sent`);
      }
    }).catch((error) => console.error("Stay lifecycle job failed:", error.message));
  };
  run();
  setInterval(run, 5 * 60 * 1000);
}
