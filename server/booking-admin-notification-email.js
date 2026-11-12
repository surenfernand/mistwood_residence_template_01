import nodemailer from "nodemailer";
import { brandFooterAttachment, brandHeaderAttachment, emailDocument, goldRule } from "./email-layout.js";
import { getSiteSettings, contactFromSettings } from "./site-settings.js";

const siteUrl = (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");

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

const cid = (name) => `mistwood-booking-admin-${name}@mistwoodresidence`;

function notificationHtml(data) {
  const adminBookings = `${siteUrl}/admin/booking-requests`;

  const bodyHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">
<div style="display:inline-block;width:66px;height:66px;border-radius:50%;background:#e3ecdc;color:#145035;font-size:26px;line-height:66px;text-align:center">✓</div>
<h1 class="hero-title" style="margin:14px 0 10px;color:#103e2b;font:normal 34px Georgia,'Times New Roman',serif">New paid booking</h1>
<p style="margin:0;font-size:15px;line-height:1.6;text-align:center">Reservation <strong>BR-${escapeHtml(data.requestId)}</strong> · booking #${escapeHtml(data.bookingId)}</p>
${goldRule("18px auto 22px")}
</td></tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#edf1e6;border-radius:14px;margin:0 0 18px"><tr><td style="padding:18px 20px;font-size:14px;line-height:1.75">
<strong style="font-family:Georgia,serif;color:#103e2b">Guest:</strong> ${escapeHtml(data.guestName)} (${escapeHtml(data.guestEmail)}${data.guestPhone ? `, ${escapeHtml(data.guestPhone)}` : ""})<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Stay:</strong> ${escapeHtml(data.checkIn)} → ${escapeHtml(data.checkOut)}<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Total:</strong> ${formatMoney(data.total)} · <strong style="font-family:Georgia,serif;color:#103e2b">Deposit:</strong> ${formatMoney(data.depositPaid)}
</td></tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td width="50%" style="padding-right:6px"><a href="${adminBookings}" style="display:block;padding:14px 10px;border-radius:10px;background:#10452e;color:#fff;text-align:center;text-decoration:none;font-size:13px;font-weight:bold">Open admin bookings</a></td>
<td width="50%" style="padding-left:6px"><a href="${escapeHtml(data.checkInUrl)}" style="display:block;padding:14px 10px;border:1px solid #2a6344;border-radius:10px;color:#164831;text-align:center;text-decoration:none;font-size:13px;font-weight:bold;background:#fffaf5">Guest check-in link</a></td>
</tr></table>
<p style="margin:18px 0 0;color:#6c746d;font-size:11px;text-align:center">Internal notification for authorised Mistwood Residence staff.</p>`;

  return emailDocument({
    title: "New paid booking | Mistwood Residence",
    bodyHtml,
    headerCid: cid("header"),
    footerCid: cid("footer"),
  });
}

export function renderBookingAdminNotificationPreviewHtml(data) {
  return notificationHtml(data);
}

export async function sendBookingAdminNotification(pool, data) {
  if (!transporter) throw new Error("SMTP not configured");
  const ctx = contactFromSettings(await getSiteSettings(pool));
  const html = notificationHtml(data);
  const text = `New paid booking BR-${data.requestId}: ${data.guestName}, ${data.checkIn}–${data.checkOut}, deposit ${formatMoney(data.depositPaid)}`;
  return transporter.sendMail({
    from: process.env.MAIL_FROM || ctx.mailFrom,
    to: ctx.adminAlertEmail,
    subject: `New booking — ${data.guestName} (${data.checkIn})`,
    text,
    html,
    attachments: [
      brandHeaderAttachment(cid("header")),
      brandFooterAttachment(cid("footer")),
    ],
  });
}
