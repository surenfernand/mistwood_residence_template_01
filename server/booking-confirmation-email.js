import nodemailer from "nodemailer";
import QRCode from "qrcode";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(projectRoot, "server", "email-assets", "mistwood_customer_confirmation_email", "assets");
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

const cid = (name) => `mistwood-booking-${name}@mistwoodresidence`;
const attachment = (name, file) => ({ filename: path.basename(file), path: path.join(assetRoot, file), cid: cid(name) });

const baseAttachments = [
  attachment("header", "header.jpg"),
  attachment("footer", "footer.jpg"),
  attachment("check", "icons/check.svg"),
  attachment("calendar", "icons/calendar.svg"),
];

function bookingHtml(data, ctx) {
  const name = escapeHtml(data.guestName);
  const contactPhone = ctx.contactPhone;
  const phoneE164 = contactPhone.replace(/\s/g, "");
  const whatsappUrl = ctx.whatsappUrl;
  return `<!doctype html><html lang="en"><body style="margin:0;font-family:Georgia,serif;background:#f2f0eb;color:#103e2b">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table width="600" style="background:#fffaf5;border-radius:12px;overflow:hidden"><tr><td style="padding:28px">
<h1 style="font-weight:normal;font-size:28px;margin:0 0 12px">Your reservation is confirmed</h1>
<p>Dear ${name},</p>
<p>Thank you for your deposit. ${escapeHtml(ctx.propertyName || "Mistwood Residence")} is reserved for your stay.</p>
<table style="width:100%;background:#edf1e6;border-radius:10px;margin:16px 0;font-size:14px"><tr><td style="padding:16px">
<strong>Arrival:</strong> ${escapeHtml(data.checkIn)}<br>
<strong>Departure:</strong> ${escapeHtml(data.checkOut)}<br>
<strong>Guests:</strong> ${escapeHtml(data.guests)}<br>
<strong>Total stay:</strong> ${formatMoney(data.total)}<br>
<strong>Deposit paid:</strong> ${formatMoney(data.depositPaid)}<br>
<strong>Balance due:</strong> ${formatMoney(data.balanceDue)}
</td></tr></table>
<p>Show this QR code on arrival, or keep this email handy. Our team may scan it when you check in.</p>
<p><img src="cid:booking-qr" alt="Check-in QR code" width="200" height="200" style="display:block;margin:12px auto" /></p>
<p><a href="${escapeHtml(data.accountUrl)}" style="color:#103e2b">Create your guest account</a> to view your booking and pay the balance online before arrival.</p>
<p>Questions? <a href="tel:${phoneE164}">${escapeHtml(contactPhone)}</a> · <a href="${whatsappUrl}">WhatsApp</a></p>
<p>Warm regards,<br>The ${escapeHtml(ctx.propertyName || "Mistwood Residence")} Team</p>
</td></tr></table></td></tr></table></body></html>`;
}

export async function sendBookingConfirmationToGuest(pool, booking) {
  if (!transporter) throw new Error("SMTP not configured");
  const ctx = contactFromSettings(await getSiteSettings(pool));
  const qrBuffer = await QRCode.toBuffer(booking.checkInUrl, { type: "png", width: 280, margin: 1 });
  const text = `Dear ${booking.guestName},\n\nYour reservation is confirmed.\nArrival: ${booking.checkIn}\nDeparture: ${booking.checkOut}\nTotal: ${formatMoney(booking.total)}\nDeposit paid: ${formatMoney(booking.depositPaid)}\nBalance: ${formatMoney(booking.balanceDue)}\n\nCheck-in: ${booking.checkInUrl}\n\nGuest account: ${booking.accountUrl}\n`;
  return transporter.sendMail({
    from: process.env.MAIL_FROM || ctx.mailFrom,
    to: booking.guestEmail,
    replyTo: ctx.contactEmail,
    subject: `${ctx.propertyName || "Mistwood Residence"} — booking confirmed`,
    text,
    html: bookingHtml(booking, ctx),
    attachments: [
      ...baseAttachments,
      { filename: "check-in-qr.png", content: qrBuffer, cid: "booking-qr" },
    ],
  });
}
