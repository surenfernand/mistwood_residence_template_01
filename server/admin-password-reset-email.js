import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(projectRoot, "server", "email-assets", "mistwood_password_reset", "assets");
const contactEmail = process.env.CONTACT_EMAIL || "info@mistwoodresidence.com";
const from = process.env.MAIL_FROM || `Mistwood Residence <${contactEmail}>`;
const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } })
  : null;

const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function template({ name, resetUrl }) {
  const safeName = escapeHtml(name || "Admin");
  const safeUrl = escapeHtml(resetUrl);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f5f2ed;color:#172b25;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f2ed;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:720px;background:#fffaf5;overflow:hidden;"><tr><td style="line-height:0;"><img src="cid:mistwood-reset-header" width="720" alt="Mistwood Residence, Nuwara Eliya" style="display:block;width:100%;max-width:720px;height:auto;"></td></tr><tr><td style="padding:34px 54px 52px;text-align:center;"><div style="margin:0 auto 20px;width:72px;height:72px;border-radius:50%;background:#e4eadb;color:#0d442e;font-size:38px;line-height:72px;text-align:center;">▣</div><h1 style="font-family:Georgia,'Times New Roman',serif;color:#0e3c2b;font-size:36px;line-height:1.15;margin:0;">Reset Your Admin Password</h1><div style="width:85px;height:3px;background:#a37c26;margin:24px auto 34px;"></div><div style="text-align:left;font-size:17px;line-height:1.75;"><h2 style="font-family:Georgia,serif;font-size:24px;color:#103d2b;margin:0 0 10px;">Hello ${safeName},</h2><p style="margin:0 0 10px;">We received a request to reset the password for your Mistwood Residence admin account.</p><p style="margin:0 0 26px;">Click the button below to create a new password:</p></div><a href="${safeUrl}" style="display:inline-block;background:#0c452e;color:#ffffff;text-decoration:none;font-size:19px;font-weight:bold;border-radius:11px;padding:19px 42px;margin:0 auto 15px;">Reset Your Password</a><p style="font-size:16px;line-height:1.6;margin:12px 0 26px;">This link will expire in <strong style="color:#0c452e">30 minutes</strong> for your security.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e9eddf;border-radius:15px;"><tr><td width="72" style="padding:22px 0 22px 23px;vertical-align:middle;color:#0d442e;font-size:35px;text-align:center;">◈</td><td style="padding:22px 25px 22px 12px;text-align:left;"><h3 style="font-family:Georgia,serif;color:#0e3c2b;font-size:22px;margin:0 0 6px;">Didn't request this?</h3><p style="margin:0;font-size:15px;line-height:1.6;">If you didn't ask to reset your password, you can safely ignore this email. Your password will remain unchanged.</p></td></tr></table><p style="font-size:14px;line-height:1.7;margin:26px 0 0;">If the button doesn't work, copy this secure link into your browser:<br><a href="${safeUrl}" style="color:#0c452e;overflow-wrap:anywhere;">${safeUrl}</a></p><p style="font-size:15px;line-height:1.6;margin:24px 0 0;">Need help? Contact the property's verified support address.</p></td></tr><tr><td style="line-height:0;"><img src="cid:mistwood-reset-footer" width="720" alt="Mistwood Residence" style="display:block;width:100%;max-width:720px;height:auto;"></td></tr></table></td></tr></table></body></html>`;
}

export async function sendAdminPasswordReset({ name, email, resetUrl }) {
  if (!transporter) throw new Error("Email delivery is not configured.");
  return transporter.sendMail({
    from, to: email, replyTo: contactEmail, subject: "Reset your Mistwood Residence admin password",
    text: `Hello ${name || "Admin"},\n\nReset your Mistwood Residence admin password using this link. It expires in 30 minutes:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: template({ name, resetUrl }),
    attachments: [
      { filename: "mistwood-password-reset-header.jpg", path: path.join(assetRoot, "header.jpg"), cid: "mistwood-reset-header" },
      { filename: "mistwood-password-reset-footer.jpg", path: path.join(assetRoot, "footer.jpg"), cid: "mistwood-reset-footer" },
      { filename: "mistwood-password-reset-lock.svg", path: path.join(assetRoot, "lock.svg"), cid: "mistwood-reset-lock" },
      { filename: "mistwood-password-reset-shield.svg", path: path.join(assetRoot, "shield.svg"), cid: "mistwood-reset-shield" },
    ],
  });
}
