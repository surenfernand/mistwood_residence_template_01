import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSiteSettings, contactFromSettings } from "./site-settings.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(projectRoot, "server", "email-assets", "mistwood_admin_email", "assets");
const siteUrl = (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");

const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  })
  : null;

const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);
const messageHtml = (value) => escapeHtml(value).replace(/\r?\n/g, "<br>");
const cid = (name) => `mistwood-admin-${name}@mistwoodresidence`;
const attachment = (name, file) => ({ filename: file, path: path.join(assetRoot, file), cid: cid(name) });
const icon = (name) => `<img src="cid:${cid(name)}" width="20" alt="" style="display:block;width:20px;height:20px;">`;

function formatSriLankaTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
  }).format(date).replace(",", " ·");
}

function template({ id, name, email, phone, subject, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Not provided");
  const safeSubject = escapeHtml(subject || "General enquiry");
  const replySubject = encodeURIComponent(`Re: ${subject || "your enquiry"}`);
  const whatsappDigits = String(phone || "").replace(/\D/g, "");
  const whatsappText = encodeURIComponent(`Hello ${name}, thank you for contacting Mistwood Residence. `);
  const adminUrl = `${siteUrl}/admin/dashboard${id ? `?enquiry=${encodeURIComponent(id)}` : ""}`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f4f1eb;color:#17251e;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f1eb;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:760px;background:#fffaf5;overflow:hidden;box-shadow:0 10px 36px rgba(24,51,35,.11);">
<tr><td style="line-height:0;"><img src="cid:${cid("header")}" width="760" alt="Mistwood Residence — Nuwara Eliya" style="display:block;width:100%;max-width:760px;height:auto;"></td></tr>
<tr><td style="padding:13px 0 10px;background:#0d432e;text-align:center;line-height:0;"><img src="cid:${cid("website-logo")}" width="150" alt="Mistwood Residence" style="display:inline-block;width:150px;max-width:55%;height:auto;"></td></tr>
<tr><td style="padding:22px 42px 28px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center"><div style="display:inline-block;border-radius:50%;background:#e5eddc;padding:14px;color:#145035;font-size:28px;line-height:1;">✉</div><h1 style="margin:14px 0 10px;color:#0d3927;font:normal 38px Georgia,'Times New Roman',serif;">New Enquiry Received</h1><p style="margin:0;font-size:15px;line-height:1.6;">A new message has been submitted through the Mistwood Residence contact form.</p><div style="width:84px;height:3px;margin:18px auto;background:#a17a24;"></div></td></tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d9ddcf;border-radius:14px;"><tr><td style="padding:16px 20px;background:#edf1e7;border-radius:14px 14px 0 0;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td><h2 style="margin:0;color:#123d2b;font:normal 24px Georgia,'Times New Roman',serif;">Enquiry Details</h2></td><td align="right" style="font-size:12px;color:#345243;">Received: ${formatSriLankaTime()}</td></tr></table></td></tr><tr><td style="padding:8px 22px 18px;">
${detailRow("user", "Name:", safeName)}${detailRow("mail", "Email:", `<a href="mailto:${encodeURIComponent(email)}" style="color:#164831;text-decoration:none;">${safeEmail}</a>`)}${detailRow("phone", "Phone:", safePhone)}${detailRow("tag", "Subject:", safeSubject)}${detailRow("message", "Message:", `<span style="display:block;padding:14px;background:#f4f0e9;border-radius:12px;line-height:1.6;">${messageHtml(message)}</span>`, true)}</td></tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;"><tr><td width="33%" style="padding-right:4px;"><a href="mailto:${encodeURIComponent(email)}?subject=${replySubject}" style="display:block;padding:15px 7px;border-radius:10px;background:#10452e;color:#fff;text-align:center;text-decoration:none;font-size:13px;font-weight:bold;">↩ &nbsp; Reply via Email</a></td><td width="33%" style="padding:0 4px;"><a href="https://wa.me/${whatsappDigits}?text=${whatsappText}" style="display:block;padding:14px 7px;border:1px solid #2a6344;border-radius:10px;color:#164831;text-align:center;text-decoration:none;font-size:13px;font-weight:bold;">◉ &nbsp; Reply via WhatsApp</a></td><td width="34%" style="padding-left:4px;"><a href="${adminUrl}" style="display:block;padding:14px 7px;border:1px solid #a47c2a;border-radius:10px;color:#164831;text-align:center;text-decoration:none;font-size:13px;font-weight:bold;">↗ &nbsp; View in Admin Panel</a></td></tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;background:#eef1e8;border-radius:14px;"><tr><td style="padding:19px 23px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td width="150" valign="top"><h2 style="margin:0;color:#123d2b;font:normal 24px Georgia,'Times New Roman',serif;">ⓘ &nbsp;Next Steps</h2></td><td valign="top" style="font-size:13px;line-height:1.85;"><ul style="margin:0;padding-left:20px;"><li>Review the enquiry and check availability if relevant.</li><li>Send a response to the guest by email or WhatsApp.</li><li>Convert the enquiry into a booking or quotation when appropriate.</li></ul></td></tr></table></td></tr></table>
<p style="margin:0;padding:16px 0 0;color:#6c746d;font-size:11px;text-align:center;">Internal notification for authorised Mistwood Residence staff.</p></td></tr>
<tr><td style="padding:13px 0 10px;background:#0d432e;text-align:center;line-height:0;"><img src="cid:${cid("website-logo")}" width="142" alt="Mistwood Residence" style="display:inline-block;width:142px;max-width:52%;height:auto;"></td></tr>
<tr><td style="line-height:0;"><img src="cid:${cid("footer")}" width="760" alt="Mistwood Residence footer" style="display:block;width:100%;max-width:760px;height:auto;"></td></tr>
</table></td></tr></table></body></html>`;
}

function detailRow(iconName, label, value, isLast = false) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${isLast ? "" : "border-bottom:1px solid #e6e2d9;"}"><tr><td width="30" style="padding:11px 0;vertical-align:top;">${icon(iconName)}</td><td width="110" style="padding:11px 0;vertical-align:top;font-size:14px;font-weight:bold;">${label}</td><td style="padding:11px 0;vertical-align:top;font-size:14px;">${value}</td></tr></table>`;
}

export async function sendAdminEnquiryNotification(pool, enquiry) {
  if (!transporter) throw new Error("Email delivery is not configured. Add the SMTP environment variables before receiving enquiries.");
  const ctx = contactFromSettings(await getSiteSettings(pool));
  return transporter.sendMail({
    from: process.env.MAIL_FROM || ctx.mailFrom,
    to: ctx.adminAlertEmail,
    replyTo: enquiry.email,
    subject: `New enquiry: ${enquiry.subject || "General enquiry"} — ${enquiry.name}`,
    text: `New enquiry from ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone || "Not provided"}\nSubject: ${enquiry.subject || "General enquiry"}\n\n${enquiry.message}`,
    html: template(enquiry),
    attachments: [
      attachment("header", "header.png"), attachment("footer", "footer.png"),
      { filename: "mistwood-website-logo.png", path: path.join(projectRoot, "public", "assets", "mistwood", "branding", "logo.png"), cid: cid("website-logo") },
      attachment("user", "icons/user.svg"), attachment("mail", "icons/mail.svg"), attachment("phone", "icons/phone.svg"),
      attachment("tag", "icons/tag.svg"), attachment("message", "icons/message.svg"),
    ],
  });
}
