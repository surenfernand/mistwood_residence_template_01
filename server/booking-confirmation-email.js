import nodemailer from "nodemailer";
import QRCode from "qrcode";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brandFooterAttachment, brandHeaderAttachment, emailDocument, goldRule } from "./email-layout.js";
import { getSiteSettings, contactFromSettings } from "./site-settings.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(projectRoot, "server", "email-assets", "mistwood_customer_confirmation_email", "assets");
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

const cid = (name) => `mistwood-booking-${name}@mistwoodresidence`;
const attachment = (name, file) => ({ filename: path.basename(file), path: path.join(assetRoot, file), cid: cid(name) });
const icon = (name) => `<img src="cid:${cid(name)}" width="28" height="28" alt="" style="display:inline-block;vertical-align:middle;border:0">`;

function bookingHtml(data, ctx) {
  const name = escapeHtml(data.guestName);
  const property = escapeHtml(ctx.propertyName || "Mistwood Residence");
  const contactPhone = ctx.contactPhone;
  const phoneE164 = contactPhone.replace(/\s/g, "");
  const whatsappUrl = ctx.whatsappUrl;

  const bodyHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">
<div style="width:66px;height:66px;border-radius:50%;background:#e3ecdc;line-height:66px;text-align:center;margin:0 auto 12px">${icon("check")}</div>
<h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:34px;line-height:1.15;color:#103e2b;margin:0 0 10px">Your reservation is confirmed</h1>
${goldRule("16px auto 20px")}
</td></tr></table>
<p style="font-size:16px;line-height:1.65;margin:0 0 12px"><strong style="font-family:Georgia,serif;color:#103e2b">Dear ${name},</strong></p>
<p style="font-size:16px;line-height:1.65;margin:0 0 16px">Thank you for your deposit. ${property} is reserved for your stay.</p>
<table role="presentation" style="width:100%;background:#edf1e6;border-radius:14px;margin:0 0 18px" cellspacing="0" cellpadding="0"><tr><td style="padding:18px 20px;font-size:14px;line-height:1.7">
<strong style="font-family:Georgia,serif;color:#103e2b">Arrival:</strong> ${escapeHtml(data.checkIn)}<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Departure:</strong> ${escapeHtml(data.checkOut)}<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Guests:</strong> ${escapeHtml(data.guests)}<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Total stay:</strong> ${formatMoney(data.total)}<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Deposit paid:</strong> ${formatMoney(data.depositPaid)}<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Balance due:</strong> ${formatMoney(data.balanceDue)}
</td></tr></table>
<p style="font-size:15px;line-height:1.6;margin:0 0 10px;text-align:center">Show this QR code on arrival, or keep this email handy. Our team may scan it when you check in.</p>
<p style="text-align:center;margin:0 0 18px"><img src="cid:booking-qr" alt="Check-in QR code" width="200" height="200" style="display:inline-block;margin:0 auto;border:0" /></p>
<p style="font-size:15px;line-height:1.65;margin:0 0 16px"><a href="${escapeHtml(data.accountUrl)}" style="color:#103e2b;font-weight:600">Create your guest account</a> to view your booking and pay the balance online before arrival.</p>
<p style="font-size:14px;line-height:1.6;margin:0 0 18px">Questions? <a href="tel:${phoneE164}" style="color:#103e2b">${escapeHtml(contactPhone)}</a> · <a href="${whatsappUrl}" style="color:#103e2b">WhatsApp</a></p>
<p style="font-size:15px;line-height:1.6;margin:0">Warm regards,<br><strong style="font-family:Georgia,serif;color:#103e2b">The ${property} Team</strong></p>`;

  return emailDocument({
    title: `${property} — booking confirmed`,
    bodyHtml,
    headerCid: cid("header"),
    footerCid: cid("footer"),
  });
}

export function renderBookingConfirmationPreviewHtml(booking, ctx) {
  return bookingHtml(booking, ctx);
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
      brandHeaderAttachment(cid("header")),
      brandFooterAttachment(cid("footer")),
      attachment("check", "icons/check.svg"),
      { filename: "check-in-qr.png", content: qrBuffer, cid: "booking-qr" },
    ],
  });
}
