import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brandFooterAttachment, brandHeaderAttachment, emailDocument, goldRule } from "./email-layout.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(projectRoot, "server", "email-assets", "mistwood_password_reset", "assets");
const contactEmail = process.env.CONTACT_EMAIL || "info@mistwoodresidence.com";
const from = process.env.MAIL_FROM || `Mistwood Residence <${contactEmail}>`;
const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } })
  : null;

const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

const cid = (name) => `mistwood-reset-${name}@mistwoodresidence`;
const icon = (file, size) => `<img src="cid:${cid(file)}" width="${size}" height="${size}" alt="" style="display:inline-block;vertical-align:middle;border:0">`;

function template({ name, resetUrl }) {
  const safeName = escapeHtml(name || "Admin");
  const safeUrl = escapeHtml(resetUrl);

  const bodyHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">
<div style="margin:0 auto 16px;width:66px;height:66px;border-radius:50%;background:#e3ecdc;line-height:66px;text-align:center">${icon("lock", 36)}</div>
<h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;color:#103e2b;font-size:34px;line-height:1.15;margin:0;font-weight:normal">Reset Your Admin Password</h1>
${goldRule("20px auto 28px")}
</td></tr></table>
<div style="text-align:left;font-size:16px;line-height:1.75"><h2 style="font-family:Georgia,serif;font-size:22px;color:#103d2b;margin:0 0 10px">Hello ${safeName},</h2>
<p style="margin:0 0 10px">We received a request to reset the password for your Mistwood Residence admin account.</p>
<p style="margin:0 0 22px">Click the button below to create a new password:</p></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:0 0 18px">
<a href="${safeUrl}" style="display:inline-block;background:#0c452e;color:#ffffff;text-decoration:none;font-size:18px;font-weight:bold;border-radius:11px;padding:17px 38px">Reset Your Password</a>
</td></tr></table>
<p style="font-size:15px;line-height:1.6;margin:0 0 22px;text-align:center">This link will expire in <strong style="color:#0c452e">30 minutes</strong> for your security.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e9eddf;border-radius:14px"><tr>
<td width="72" style="padding:20px 0 20px 20px;vertical-align:middle;text-align:center">${icon("shield", 44)}</td>
<td style="padding:20px 22px 20px 12px;text-align:left"><h3 style="font-family:Georgia,serif;color:#103e2b;font-size:20px;margin:0 0 6px">Didn&rsquo;t request this?</h3>
<p style="margin:0;font-size:14px;line-height:1.6">If you didn&rsquo;t ask to reset your password, you can safely ignore this email. Your password will remain unchanged.</p></td>
</tr></table>
<p style="font-size:14px;line-height:1.7;margin:22px 0 0;text-align:left">If the button doesn&rsquo;t work, copy this secure link into your browser:<br><a href="${safeUrl}" style="color:#0c452e;overflow-wrap:anywhere">${safeUrl}</a></p>
<p style="font-size:14px;line-height:1.6;margin:20px 0 0;text-align:left;color:#657269">Need help? Contact the property&rsquo;s verified support address.</p>`;

  return emailDocument({
    title: "Reset Your Admin Password | Mistwood Residence",
    bodyHtml,
    headerCid: cid("header"),
    footerCid: cid("footer"),
  });
}

export async function sendAdminPasswordReset({ name, email, resetUrl }) {
  if (!transporter) throw new Error("Email delivery is not configured.");
  return transporter.sendMail({
    from, to: email, replyTo: contactEmail, subject: "Reset your Mistwood Residence admin password",
    text: `Hello ${name || "Admin"},\n\nReset your Mistwood Residence admin password using this link. It expires in 30 minutes:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: template({ name, resetUrl }),
    attachments: [
      brandHeaderAttachment(cid("header")),
      brandFooterAttachment(cid("footer")),
      { filename: "lock.svg", path: path.join(assetRoot, "lock.svg"), cid: cid("lock") },
      { filename: "shield.svg", path: path.join(assetRoot, "shield.svg"), cid: cid("shield") },
    ],
  });
}
