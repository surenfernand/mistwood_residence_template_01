import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSiteSettings, contactFromSettings } from "./site-settings.js";
import { emailDocument, goldRule } from "./email-layout.js";

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

const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);

const cid = (name) => `mistwood-customer-${name}@mistwoodresidence`;
const attachment = (name, file) => ({ filename: path.basename(file), path: path.join(assetRoot, file), cid: cid(name) });
const icon = (name, size = 25) => `<img src="cid:${cid(name)}" width="${size}" height="${size}" alt="" style="display:inline-block;vertical-align:middle;border:0">`;

const actionLink = "display:inline-block;padding:12px 15px;margin:4px;border:1px solid #73927a;border-radius:9px;color:#103e2b;text-decoration:none;font-size:13px;font-weight:600;white-space:nowrap";

function emailTemplate(name, ctx) {
  const guestName = escapeHtml(name);
  const safeEmail = escapeHtml(ctx.contactEmail);
  const safePhone = escapeHtml(ctx.contactPhone);
  const contactEmail = ctx.contactEmail;
  const phoneE164 = ctx.contactPhone.replace(/\s/g, "");
  const whatsappUrl = ctx.whatsappUrl;
  const apartmentUrl = `${siteUrl}/about`;
  const galleryUrl = `${siteUrl}/gallery`;
  const exploreUrl = `${siteUrl}/explore`;

  const bodyHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 4px"><div style="width:66px;height:66px;border-radius:50%;background:#e3ecdc;text-align:center;line-height:66px">${icon("check")}</div><h1 class="hero-title" style="font-family:Georgia,serif;font-size:34px;line-height:1.15;color:#103e2b;font-weight:normal;margin:17px 0 14px">Thank You for Contacting Us!</h1>${goldRule()}</td></tr><tr><td style="font-size:16px;line-height:1.65;padding:0 0 18px"><strong style="font-family:Georgia,serif;color:#103e2b;font-size:20px">Dear ${guestName},</strong><div style="margin-top:7px">We have successfully received your enquiry. Thank you for getting in touch with Mistwood Residence.</div><div style="margin-top:5px">Our team will review your message and contact you as soon as possible with the relevant information.</div></td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#edf1e6;border-radius:14px"><tr><td class="info-cell" width="33%" valign="top" style="padding:18px 12px;text-align:center;border-right:1px solid #ccd5c7">${icon("calendar")}<div style="font-family:Georgia,serif;color:#103e2b;font-size:17px;margin:7px 0 3px">Response</div><div style="font-size:13px;line-height:1.5">We&rsquo;ll be in touch shortly</div></td><td class="info-cell" width="34%" valign="top" style="padding:18px 12px;text-align:center;border-right:1px solid #ccd5c7">${icon("home")}<div style="font-family:Georgia,serif;color:#103e2b;font-size:17px;margin:7px 0 3px">Property</div><div style="font-size:13px;line-height:1.5">Entire apartment<br>Private stay</div></td><td class="info-cell" width="33%" valign="top" style="padding:18px 12px;text-align:center">${icon("pin")}<div style="font-family:Georgia,serif;color:#103e2b;font-size:17px;margin:7px 0 3px">Location</div><div style="font-size:13px;line-height:1.5">Nuwara Eliya<br>Sri Lanka</div></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:15px;background:#eef0e6;border-radius:14px"><tr><td width="140" class="explore-photo" style="width:140px;vertical-align:middle"><img src="cid:${cid("explore")}" alt="Misty tea hills" width="140" style="display:block;width:140px;max-width:100%;border-radius:14px 0 0 14px"></td><td style="padding:15px 13px;vertical-align:middle"><div style="font-family:Georgia,serif;color:#103e2b;font-size:23px">In the Meantime...</div><p style="margin:6px 0 9px;font-size:13px;line-height:1.5">Feel free to explore more about Mistwood Residence:</p><a href="${apartmentUrl}" style="${actionLink}">${icon("home")} &nbsp;View the Apartment &rarr;</a><a href="${galleryUrl}" style="${actionLink}">${icon("image")} &nbsp;Browse Gallery &rarr;</a><a href="${exploreUrl}" style="${actionLink}">${icon("map")} &nbsp;Explore Nuwara Eliya &rarr;</a></td></tr></table>
<p style="font-size:14px;line-height:1.6;margin:18px 0 9px">If you have any urgent questions, you can also reach us directly:</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:5px 4px;font-size:13px">${icon("phone")} <a href="tel:${phoneE164}" style="color:#103e2b;text-decoration:none">${safePhone}</a></td><td style="padding:5px 4px;font-size:13px">${icon("mail")} <a href="mailto:${encodeURIComponent(contactEmail)}" style="color:#103e2b;text-decoration:none">${safeEmail}</a></td></tr></table><p style="font-size:14px;margin:8px 0 0"><a href="${whatsappUrl}" style="color:#103e2b;text-decoration:underline">${icon("whatsapp")} Chat on WhatsApp</a></p>
<p style="font-size:15px;line-height:1.6;margin:21px 0 0">We look forward to welcoming you to Mistwood Residence!</p><p style="font-size:15px;line-height:1.5;margin:13px 0 0">Warm regards,<br><strong style="font-family:Georgia,serif;font-size:19px;color:#103e2b">The Mistwood Residence Team</strong></p><div style="width:60px;height:3px;background:#a47d25;margin-top:13px"></div><p style="font-size:11px;color:#657269;margin-top:24px">This email confirms receipt of your enquiry only; it does not confirm a reservation.</p>`;

  return emailDocument({
    title: "Thank You for Contacting Mistwood Residence",
    bodyHtml,
    headerCid: cid("header"),
    footerCid: cid("footer"),
    extraHead: "<style>@media only screen and (max-width:600px){.info-cell{padding:14px 5px!important}.explore-photo{display:none!important}}</style>",
  });
}

const enquiryAttachments = [
  attachment("header", "header.jpg"),
  attachment("footer", "footer.jpg"),
  attachment("explore", "explore.jpg"),
  attachment("check", "icons/check.svg"),
  attachment("calendar", "icons/calendar.svg"),
  attachment("home", "icons/home.svg"),
  attachment("pin", "icons/pin.svg"),
  attachment("image", "icons/image.svg"),
  attachment("map", "icons/map.svg"),
  attachment("phone", "icons/phone.svg"),
  attachment("mail", "icons/mail.svg"),
  attachment("whatsapp", "icons/whatsapp.svg"),
];

export async function sendEnquiryConfirmation(pool, { name, email }) {
  if (!transporter) throw new Error("Email delivery is not configured. Add the SMTP environment variables before receiving enquiries.");
  const ctx = contactFromSettings(await getSiteSettings(pool));
  return transporter.sendMail({
    from: process.env.MAIL_FROM || ctx.mailFrom,
    to: email,
    replyTo: ctx.contactEmail,
    subject: "Thank You for Contacting Mistwood Residence – Enquiry Received",
    text: `Dear ${name},\n\nWe have successfully received your enquiry. Thank you for getting in touch with Mistwood Residence.\n\nOur team will review your message and contact you as soon as possible.\n\n${ctx.contactPhone}\n${ctx.contactEmail}\n${ctx.whatsappUrl}\n\nWarm regards,\nThe Mistwood Residence Team`,
    html: emailTemplate(name, ctx),
    attachments: enquiryAttachments,
  });
}
