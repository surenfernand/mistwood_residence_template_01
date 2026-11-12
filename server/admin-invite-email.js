import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brandFooterAttachment, brandHeaderAttachment, emailDocument, goldRule } from "./email-layout.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(projectRoot, "server", "email-assets", "mistwood_admin_invite", "assets");
const contactEmail = process.env.CONTACT_EMAIL || "info@mistwoodresidence.com";
const from = process.env.MAIL_FROM || `Mistwood Residence <${contactEmail}>`;
const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  })
  : null;

const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
})[character]);

const cid = (name) => `mistwood-invite-${name}@mistwoodresidence`;
const icon = (file, size) => `<img src="cid:${cid(file)}" width="${size}" height="${size}" alt="" style="display:inline-block;vertical-align:middle;border:0">`;

function invitedByLine(invitedBy) {
  if (!invitedBy) {
    return "You have been invited to join the Mistwood Residence admin dashboard.";
  }
  return `<strong>${escapeHtml(invitedBy)}</strong> has invited you to join the Mistwood Residence admin dashboard.`;
}

function template({ name, roleName, setupUrl, invitedBy }) {
  const safeName = escapeHtml(name || "Colleague");
  const safeRole = escapeHtml(roleName || "Admin");
  const safeUrl = escapeHtml(setupUrl);
  const inviteIntro = invitedByLine(invitedBy);

  const bodyHtml = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">
<div style="margin:0 auto 16px;width:66px;height:66px;border-radius:50%;background:#e3ecdc;line-height:66px;text-align:center">${icon("user", 36)}</div>
<h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;color:#103e2b;font-size:34px;line-height:1.15;margin:0;font-weight:normal">You&rsquo;re invited to the admin team</h1>
${goldRule("20px auto 28px")}
</td></tr></table>
<div style="text-align:left;font-size:16px;line-height:1.75">
<h2 style="font-family:Georgia,serif;font-size:22px;color:#103d2b;margin:0 0 10px">Hello ${safeName},</h2>
<p style="margin:0 0 10px">${inviteIntro}</p>
<p style="margin:0 0 22px">Use the button below to choose your password and access bookings, guests, and property settings.</p>
</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e9eddf;border-radius:14px;margin:0 0 22px"><tr>
<td width="72" style="padding:18px 0 18px 20px;vertical-align:middle;text-align:center">${icon("tag", 30)}</td>
<td style="padding:18px 22px 18px 10px;text-align:left;font-size:15px;line-height:1.55"><strong style="display:block;font-family:Georgia,serif;color:#103e2b;font-size:17px;margin-bottom:4px">Your role</strong>${safeRole}</td>
</tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:0 0 16px">
<a href="${safeUrl}" style="display:inline-block;background:#0c452e;color:#ffffff;text-decoration:none;font-size:18px;font-weight:bold;border-radius:11px;padding:17px 38px">Accept invitation &amp; set password</a>
</td></tr></table>
<p style="font-size:15px;line-height:1.6;margin:0 0 22px;text-align:center">This invitation link expires in <strong style="color:#0c452e">7 days</strong>.</p>
<ol style="margin:0 0 22px;padding-left:22px;text-align:left;font-size:15px;line-height:1.65;color:#2c3f36">
<li>Open the secure link above.</li>
<li>Create your password.</li>
<li>Sign in at the Mistwood admin login page.</li>
</ol>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef0e6;border-radius:14px"><tr>
<td width="72" style="padding:20px 0 20px 20px;vertical-align:middle;text-align:center">${icon("shield", 44)}</td>
<td style="padding:20px 22px 20px 12px;text-align:left"><h3 style="font-family:Georgia,serif;color:#103e2b;font-size:20px;margin:0 0 6px">Not expecting this?</h3>
<p style="margin:0;font-size:14px;line-height:1.6">If you were not expecting an admin invitation, you can ignore this email. No account will be activated until you set a password.</p></td>
</tr></table>
<p style="font-size:14px;line-height:1.7;margin:22px 0 0;text-align:left">If the button doesn&rsquo;t work, copy this link into your browser:<br><a href="${safeUrl}" style="color:#0c452e;overflow-wrap:anywhere">${safeUrl}</a></p>
<p style="font-size:15px;line-height:1.6;margin:20px 0 0;text-align:left">Warm regards,<br><strong style="font-family:Georgia,serif;color:#103e2b">The Mistwood Residence Team</strong></p>`;

  return emailDocument({
    title: "Admin team invitation | Mistwood Residence",
    bodyHtml,
    headerCid: cid("header"),
    footerCid: cid("footer"),
  });
}

export async function sendAdminInvite({ name, email, roleName, setupUrl, invitedBy }) {
  if (!transporter) throw new Error("Email delivery is not configured.");
  const introText = invitedBy
    ? `${invitedBy} has invited you to join the Mistwood Residence admin dashboard.`
    : "You have been invited to join the Mistwood Residence admin dashboard.";

  const attachments = [
    brandHeaderAttachment(cid("header")),
    brandFooterAttachment(cid("footer")),
    { filename: "user.svg", path: path.join(assetRoot, "user.svg"), cid: cid("user") },
    { filename: "tag.svg", path: path.join(assetRoot, "tag.svg"), cid: cid("tag") },
    { filename: "shield.svg", path: path.join(assetRoot, "shield.svg"), cid: cid("shield") },
  ];

  return transporter.sendMail({
    from,
    to: email,
    replyTo: contactEmail,
    subject: "You’re invited to Mistwood Residence — set up your admin account",
    text: [
      `Hello ${name || "Colleague"},`,
      "",
      introText,
      "",
      `Your role: ${roleName || "Admin"}`,
      "",
      "Accept your invitation and set your password using this link (expires in 7 days):",
      setupUrl,
      "",
      "1. Open the link",
      "2. Create your password",
      "3. Sign in at the admin login page",
      "",
      "If you were not expecting this invitation, you can ignore this email.",
      "",
      "Warm regards,",
      "The Mistwood Residence Team",
    ].join("\n"),
    html: template({ name, roleName, setupUrl, invitedBy }),
    attachments,
  });
}
