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

function template({ name, roleName, setupUrl }) {
  const safeName = escapeHtml(name || "Colleague");
  const safeRole = escapeHtml(roleName || "Admin");
  const safeUrl = escapeHtml(setupUrl);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f5f2ed;color:#172b25;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f2ed;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:720px;background:#fffaf5;overflow:hidden;"><tr><td style="line-height:0;"><img src="cid:mistwood-reset-header" width="720" alt="Mistwood Residence, Nuwara Eliya" style="display:block;width:100%;max-width:720px;height:auto;"></td></tr><tr><td style="padding:34px 54px 52px;text-align:center;"><h1 style="font-family:Georgia,'Times New Roman',serif;color:#0e3c2b;font-size:34px;line-height:1.15;margin:0;">You&rsquo;re invited to Mistwood Admin</h1><div style="width:85px;height:3px;background:#a37c26;margin:24px auto 34px;"></div><div style="text-align:left;font-size:17px;line-height:1.75;"><p style="margin:0 0 10px;">Hello ${safeName},</p><p style="margin:0 0 10px;">You have been invited to join the Mistwood Residence admin dashboard as <strong style="color:#0c452e">${safeRole}</strong>.</p><p style="margin:0 0 26px;">Click the button below to choose your password and sign in:</p></div><a href="${safeUrl}" style="display:inline-block;background:#0c452e;color:#ffffff;text-decoration:none;font-size:19px;font-weight:bold;border-radius:11px;padding:19px 42px;margin:0 auto 15px;">Set up your account</a><p style="font-size:16px;line-height:1.6;margin:12px 0 26px;">This invitation link expires in <strong style="color:#0c452e">7 days</strong>.</p><p style="font-size:14px;line-height:1.7;margin:26px 0 0;">If the button doesn&rsquo;t work, copy this link into your browser:<br><a href="${safeUrl}" style="color:#0c452e;overflow-wrap:anywhere;">${safeUrl}</a></p></td></tr><tr><td style="line-height:0;"><img src="cid:mistwood-reset-footer" width="720" alt="Mistwood Residence" style="display:block;width:100%;max-width:720px;height:auto;"></td></tr></table></td></tr></table></body></html>`;
}

export async function sendAdminInvite({ name, email, roleName, setupUrl }) {
  if (!transporter) throw new Error("Email delivery is not configured.");
  return transporter.sendMail({
    from, to: email, replyTo: contactEmail, subject: "You’re invited to Mistwood Residence admin",
    text: `Hello ${name || "Colleague"},\n\nYou have been invited to the Mistwood Residence admin dashboard as ${roleName || "Admin"}.\n\nSet your password using this link (expires in 7 days):\n${setupUrl}\n`,
    html: template({ name, roleName, setupUrl }),
    attachments: [
      { filename: "mistwood-password-reset-header.jpg", path: path.join(assetRoot, "header.jpg"), cid: "mistwood-reset-header" },
      { filename: "mistwood-password-reset-footer.jpg", path: path.join(assetRoot, "footer.jpg"), cid: "mistwood-reset-footer" },
    ],
  });
}
