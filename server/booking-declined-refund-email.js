import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brandHeaderAttachment, emailDocument, emailFooter, goldRule } from "./email-layout.js";
import { getSiteSettings, contactFromSettings } from "./site-settings.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(projectRoot, "server", "email-assets", "mistwood_customer_confirmation_email", "assets");

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

const cid = (name) => `mistwood-refund-${name}@mistwoodresidence`;

function refundHtml(data, ctx) {
  const name = escapeHtml(data.guestName);
  const property = escapeHtml(ctx.propertyName || "Mistwood Residence");
  const contactPhone = ctx.contactPhone;
  const phoneE164 = contactPhone.replace(/\s/g, "");
  const timeframe = escapeHtml(data.refundTimeframe || "5–10 business days");

  const bodyHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">
<div style="width:66px;height:66px;border-radius:50%;background:#f8e7e2;color:#933831;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:63px;text-align:center;margin:0 auto 12px">×</div>
<h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:34px;line-height:1.15;color:#103e2b;margin:0 0 10px">We’re sorry — your reservation cannot be completed</h1>
${goldRule("16px auto 20px")}
</td></tr></table>
<p style="font-size:16px;line-height:1.65;margin:0 0 12px"><strong style="font-family:Georgia,serif;color:#103e2b">Dear ${name},</strong></p>
<p style="font-size:16px;line-height:1.65;margin:0 0 16px">Thank you for choosing ${property}. Unfortunately, we are unable to complete your reservation for the dates below because the accommodation is no longer available.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;background:#f8eee9;border-radius:14px"><tr><td style="padding:18px 20px;font-size:14px;line-height:1.7">
<strong style="font-family:Georgia,serif;color:#103e2b">Reservation reference:</strong> ${escapeHtml(data.reservationReference)}<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Arrival:</strong> ${escapeHtml(data.checkIn)}<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Departure:</strong> ${escapeHtml(data.checkOut)}<br>
<strong style="font-family:Georgia,serif;color:#103e2b">Amount to be refunded:</strong> ${formatMoney(data.refundAmount)}
</td></tr></table>
<p style="margin:0 0 16px;font-size:16px;line-height:1.65">A refund of <strong>${formatMoney(data.refundAmount)}</strong> has been initiated to the original payment method used through PayHere. Your bank or card provider may take <strong>${timeframe}</strong> to show the amount in your account.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6">If you have any questions, please contact us at <a href="tel:${phoneE164}" style="color:#103e2b">${escapeHtml(contactPhone)}</a> or <a href="${escapeHtml(ctx.whatsappUrl || "#")}" style="color:#103e2b">WhatsApp</a>.</p>
<p style="margin:0;font-size:15px;line-height:1.6">We sincerely apologise for the inconvenience.<br><br>Warm regards,<br><strong style="font-family:Georgia,serif;color:#103e2b">The ${property} Team</strong></p>`;

  return emailDocument({
    title: `${property} — reservation unavailable and refund initiated`,
    bodyHtml,
    headerCid: cid("header"),
    footerHtml: emailFooter(ctx),
  });
}

export async function sendBookingDeclinedRefundEmail(pool, payload) {
  if (!transporter) throw new Error("SMTP not configured");
  const ctx = contactFromSettings(await getSiteSettings(pool));
  const text = [
    `Dear ${payload.guestName},`,
    "",
    "We are unable to complete your reservation because the accommodation is no longer available.",
    `Reference: ${payload.reservationReference}`,
    `Arrival: ${payload.checkIn}`,
    `Departure: ${payload.checkOut}`,
    `Refund amount: ${formatMoney(payload.refundAmount)}`,
    "",
    `The refund has been initiated via PayHere. Your bank or card provider may take ${payload.refundTimeframe || "5–10 business days"} to show the amount.`,
    "",
    `Contact: ${ctx.contactEmail}`,
  ].join("\n");

  return transporter.sendMail({
    from: process.env.MAIL_FROM || ctx.mailFrom,
    to: payload.guestEmail,
    replyTo: ctx.contactEmail,
    subject: `${ctx.propertyName || "Mistwood Residence"} — reservation unavailable and refund initiated`,
    text,
    html: refundHtml(payload, ctx),
    attachments: [
      brandHeaderAttachment(cid("header")),
      {
        filename: path.basename(path.join(assetRoot, "header.jpg")),
        path: path.join(assetRoot, "header.jpg"),
        cid: cid("header"),
      },
    ],
  });
}