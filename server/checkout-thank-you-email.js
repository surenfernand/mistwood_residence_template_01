import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { brandHeaderAttachment, emailDocument, emailFooter, goldRule } from "./email-layout.js";
import { getSiteSettings, contactFromSettings } from "./site-settings.js";

const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } })
  : null;
const cid = (name) => `mistwood-checkout-${name}@mistwoodresidence`;
const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

function messageHtml(data, ctx) {
  const property = escapeHtml(ctx.propertyName || "Mistwood Residence");
  const reviewUrl = escapeHtml(data.reviewUrl);
  return emailDocument({ title: `${property} — thank you for staying`, headerCid: cid("header"), footerHtml: emailFooter(ctx), bodyHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center"><div style="width:66px;height:66px;border-radius:50%;background:#e3ecdc;line-height:66px;text-align:center;margin:0 auto 12px;font-size:30px">♥</div><h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:34px;line-height:1.15;color:#103e2b;margin:0 0 10px">Thank you for staying with us</h1>${goldRule("16px auto 20px")}</td></tr></table><p style="font-size:16px;line-height:1.65;margin:0 0 12px"><strong style="font-family:Georgia,serif;color:#103e2b">Dear ${escapeHtml(data.guestName)},</strong></p><p style="font-size:16px;line-height:1.65;margin:0 0 16px">We hope you had a wonderful stay at ${property}. Thank you for choosing us—we would love to hear about your experience.</p><p style="font-size:15px;line-height:1.6;margin:0 0 10px;text-align:center">Scan this QR code or use the button below to leave a review.</p><p style="text-align:center;margin:0 0 18px"><img src="cid:checkout-review-qr" alt="QR code to leave a review" width="200" height="200" style="display:inline-block;margin:0 auto;border:0" /></p><table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 22px"><tr><td style="border-radius:8px;background:#174e35"><a href="${reviewUrl}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none">Leave a review</a></td></tr></table><p style="font-size:14px;line-height:1.6;margin:0;color:#5d625d;text-align:center">Warm regards,<br><strong style="font-family:Georgia,serif;color:#103e2b">The ${property} Team</strong></p>` });
}

export function renderCheckoutThankYouPreviewHtml(data, ctx) {
  return messageHtml(data, ctx);
}

export async function sendCheckoutThankYouEmail(pool, data) {
  if (!transporter) throw new Error("SMTP not configured");
  const ctx = contactFromSettings(await getSiteSettings(pool));
  const qrBuffer = await QRCode.toBuffer(data.reviewUrl, { type: "png", width: 280, margin: 1 });
  return transporter.sendMail({ from: process.env.MAIL_FROM || ctx.mailFrom, to: data.guestEmail, replyTo: ctx.contactEmail, subject: `${ctx.propertyName || "Mistwood Residence"} — thank you for staying with us`, text: `Dear ${data.guestName},\n\nThank you for staying with us. We would love to hear about your experience.\n\nLeave a review: ${data.reviewUrl}\n`, html: messageHtml(data, ctx), attachments: [brandHeaderAttachment(cid("header")), { filename: "leave-a-review-qr.png", content: qrBuffer, cid: "checkout-review-qr" }] });
}
