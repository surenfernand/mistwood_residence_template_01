import nodemailer from "nodemailer";

const siteUrl = (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
import { getSiteSettings, contactFromSettings } from "./site-settings.js";

const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  })
  : null;

const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[c]);

const formatMoney = (n) => `LKR ${Number(n || 0).toLocaleString("en-LK")}`;

export async function sendBookingAdminNotification(pool, data) {
  if (!transporter) throw new Error("SMTP not configured");
  const ctx = contactFromSettings(await getSiteSettings(pool));
  const adminBookings = `${siteUrl}/admin/booking-requests`;
  const html = `<p>New paid reservation <strong>BR-${data.requestId}</strong> / booking #${data.bookingId}</p>
<ul>
<li>Guest: ${escapeHtml(data.guestName)} (${escapeHtml(data.guestEmail)}, ${escapeHtml(data.guestPhone || "")})</li>
<li>Stay: ${escapeHtml(data.checkIn)} → ${escapeHtml(data.checkOut)}</li>
<li>Total: ${formatMoney(data.total)} · Deposit: ${formatMoney(data.depositPaid)}</li>
</ul>
<p><a href="${adminBookings}">Open admin bookings</a> · Check-in link: ${escapeHtml(data.checkInUrl)}</p>`;
  const text = `New paid booking BR-${data.requestId}: ${data.guestName}, ${data.checkIn}–${data.checkOut}, deposit ${formatMoney(data.depositPaid)}`;
  return transporter.sendMail({
    from: process.env.MAIL_FROM || ctx.mailFrom,
    to: ctx.adminAlertEmail,
    subject: `New booking — ${data.guestName} (${data.checkIn})`,
    text,
    html,
  });
}
