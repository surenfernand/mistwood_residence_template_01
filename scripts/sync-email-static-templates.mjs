import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { emailDocumentPreview, goldRule } = await import(
  pathToFileURL(path.join(root, "server", "email-layout.js")).href,
);

const assetRoot = path.join(root, "server", "email-assets");

function writePreview(dir, fileName, content) {
  fs.writeFileSync(path.join(assetRoot, dir, fileName), content, "utf8");
  console.log("wrote", path.join("server/email-assets", dir, fileName));
}

function iconLocal(name, size = 20) {
  return `<img src="assets/icons/${name}.svg" width="${size}" height="${size}" alt="" style="display:inline-block;vertical-align:middle;border:0">`;
}

// --- Customer enquiry (source index with placeholders) ---
const customerBody = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 4px"><div style="width:66px;height:66px;border-radius:50%;background:#e3ecdc;text-align:center;line-height:66px">${iconLocal("check", 25)}</div><h1 class="hero-title" style="font-family:Georgia,serif;font-size:34px;line-height:1.15;color:#103e2b;font-weight:normal;margin:17px 0 14px">Thank You for Contacting Us!</h1>${goldRule()}</td></tr><tr><td style="font-size:16px;line-height:1.65;padding:0 0 18px"><strong style="font-family:Georgia,serif;color:#103e2b;font-size:20px">Dear {{guest_name}},</strong><div style="margin-top:7px">We have successfully received your enquiry. Thank you for getting in touch with Mistwood Residence.</div><div style="margin-top:5px">Our team will review your message and contact you as soon as possible with the relevant information.</div></td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#edf1e6;border-radius:14px"><tr><td class="info-cell" width="33%" valign="top" style="padding:18px 12px;text-align:center;border-right:1px solid #ccd5c7">${iconLocal("calendar")}<div style="font-family:Georgia,serif;color:#103e2b;font-size:17px;margin:7px 0 3px">Response</div><div style="font-size:13px;line-height:1.5">We&rsquo;ll be in touch shortly</div></td><td class="info-cell" width="34%" valign="top" style="padding:18px 12px;text-align:center;border-right:1px solid #ccd5c7">${iconLocal("home")}<div style="font-family:Georgia,serif;color:#103e2b;font-size:17px;margin:7px 0 3px">Property</div><div style="font-size:13px;line-height:1.5">Entire apartment<br>Private stay</div></td><td class="info-cell" width="33%" valign="top" style="padding:18px 12px;text-align:center">${iconLocal("pin")}<div style="font-family:Georgia,serif;color:#103e2b;font-size:17px;margin:7px 0 3px">Location</div><div style="font-size:13px;line-height:1.5">Nuwara Eliya<br>Sri Lanka</div></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:15px;background:#eef0e6;border-radius:14px"><tr><td width="140" class="explore-photo" style="width:140px;vertical-align:middle"><img src="assets/explore.jpg" alt="Misty tea hills" width="140" style="display:block;width:140px;max-width:100%;border-radius:14px 0 0 14px"></td><td style="padding:15px 13px;vertical-align:middle"><div style="font-family:Georgia,serif;color:#103e2b;font-size:23px">In the Meantime...</div><p style="margin:6px 0 9px;font-size:13px;line-height:1.5">Feel free to explore more about Mistwood Residence:</p><a href="{{apartment_url}}" style="display:inline-block;padding:12px 15px;margin:4px;border:1px solid #73927a;border-radius:9px;color:#103e2b;text-decoration:none;font-size:13px;font-weight:600;white-space:nowrap">${iconLocal("home")} &nbsp;View the Apartment &rarr;</a> <a href="{{gallery_url}}" style="display:inline-block;padding:12px 15px;margin:4px;border:1px solid #73927a;border-radius:9px;color:#103e2b;text-decoration:none;font-size:13px;font-weight:600;white-space:nowrap">${iconLocal("image")} &nbsp;Browse Gallery &rarr;</a> <a href="{{explore_url}}" style="display:inline-block;padding:12px 15px;margin:4px;border:1px solid #73927a;border-radius:9px;color:#103e2b;text-decoration:none;font-size:13px;font-weight:600;white-space:nowrap">${iconLocal("map")} &nbsp;Explore Nuwara Eliya &rarr;</a></td></tr></table>
<p style="font-size:14px;line-height:1.6;margin:18px 0 9px">If you have any urgent questions, you can also reach us directly:</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:5px 4px;font-size:13px">${iconLocal("phone")} <a href="tel:{{phone_e164}}" style="color:#103e2b;text-decoration:none">{{display_phone}}</a></td><td style="padding:5px 4px;font-size:13px">${iconLocal("mail")} <a href="mailto:{{contact_email}}" style="color:#103e2b;text-decoration:none">{{contact_email}}</a></td></tr></table><p style="font-size:14px;margin:8px 0 0"><a href="{{whatsapp_url}}" style="color:#103e2b;text-decoration:underline">${iconLocal("whatsapp")} Chat on WhatsApp</a></p>
<p style="font-size:15px;line-height:1.6;margin:21px 0 0">We look forward to welcoming you to Mistwood Residence!</p><p style="font-size:15px;line-height:1.5;margin:13px 0 0">Warm regards,<br><strong style="font-family:Georgia,serif;font-size:19px;color:#103e2b">The Mistwood Residence Team</strong></p><div style="width:60px;height:3px;background:#a47d25;margin-top:13px"></div><p style="font-size:11px;color:#657269;margin-top:24px">This email confirms receipt of your enquiry only; it does not confirm a reservation.</p>`;

const customerHtml = emailDocumentPreview({
  title: "Thank You for Contacting Mistwood Residence",
  bodyHtml: customerBody,
  extraHead: `<style>@media only screen and (max-width:600px){.info-cell{padding:14px 5px!important}.explore-photo{display:none!important}}</style>`,
});
writePreview(
  "mistwood_customer_confirmation_email",
  "index.html",
  customerHtml
    .replaceAll("../mistwood_customer_confirmation_email/assets/header.jpg", "assets/header.jpg")
    .replaceAll("../mistwood_customer_confirmation_email/assets/footer.jpg", "assets/footer.jpg"),
);

function detailRow(iconName, label, value, isLast = false) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${isLast ? "" : "border-bottom:1px solid #e6e2d9;"}"><tr><td width="30" style="padding:11px 0;vertical-align:top;">${iconLocal(iconName)}</td><td width="110" style="padding:11px 0;vertical-align:top;font-size:14px;font-weight:bold;">${label}</td><td style="padding:11px 0;vertical-align:top;font-size:14px;">${value}</td></tr></table>`;
}

const adminBody = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">
<div style="display:inline-block;width:66px;height:66px;border-radius:50%;background:#e3ecdc;color:#145035;font-size:28px;line-height:66px;text-align:center">✉</div>
<h1 class="hero-title" style="margin:14px 0 10px;color:#103e2b;font:normal 34px Georgia,'Times New Roman',serif">New Enquiry Received</h1>
<p style="margin:0;font-size:15px;line-height:1.6;text-align:center">A new message has been submitted through the Mistwood Residence contact form.</p>
${goldRule("18px auto 22px")}
</td></tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d9ddcf;border-radius:14px"><tr><td style="padding:16px 20px;background:#edf1e7;border-radius:14px 14px 0 0;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td><h2 style="margin:0;color:#123d2b;font:normal 24px Georgia,'Times New Roman',serif;">Enquiry Details</h2></td><td align="right" style="font-size:12px;color:#345243;">Received: {{submitted_at_slst}}</td></tr></table></td></tr><tr><td style="padding:8px 22px 18px;">
${detailRow("user", "Name:", "{{guest_name}}")}${detailRow("mail", "Email:", `<a href="mailto:{{guest_email}}" style="color:#164831;text-decoration:none;">{{guest_email}}</a>`)}${detailRow("phone", "Phone:", "{{guest_phone}}")}${detailRow("tag", "Subject:", "{{enquiry_subject}}")}${detailRow("message", "Message:", `<span style="display:block;padding:14px;background:#f4f0e9;border-radius:12px;line-height:1.6;">{{guest_message}}</span>`, true)}</td></tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;"><tr>
<td width="33%" style="padding-right:4px;"><a href="mailto:{{guest_email}}?subject=Re%3A%20{{encoded_enquiry_subject}}" style="display:block;padding:15px 7px;border-radius:10px;background:#10452e;color:#fff;text-align:center;text-decoration:none;font-size:13px;font-weight:bold;">↩ &nbsp; Reply via Email</a></td>
<td width="33%" style="padding:0 4px;"><a href="https://wa.me/{{guest_phone_digits}}?text={{encoded_whatsapp_reply}}" style="display:block;padding:14px 7px;border:1px solid #2a6344;border-radius:10px;color:#164831;text-align:center;text-decoration:none;font-size:13px;font-weight:bold;background:#fffaf5;">◉ &nbsp; Reply via WhatsApp</a></td>
<td width="34%" style="padding-left:4px;"><a href="{{admin_enquiry_url}}" style="display:block;padding:14px 7px;border:1px solid #a47c2a;border-radius:10px;color:#164831;text-align:center;text-decoration:none;font-size:13px;font-weight:bold;background:#fffaf5;">↗ &nbsp; View in Admin Panel</a></td>
</tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;background:#eef1e8;border-radius:14px;"><tr><td style="padding:19px 23px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td width="150" valign="top"><h2 style="margin:0;color:#123d2b;font:normal 24px Georgia,'Times New Roman',serif;">ⓘ &nbsp;Next Steps</h2></td><td valign="top" style="font-size:13px;line-height:1.85;"><ul style="margin:0;padding-left:20px;"><li>Review the enquiry and check availability if relevant.</li><li>Send a response to the guest by email or WhatsApp.</li><li>Convert the enquiry into a booking or quotation when appropriate.</li></ul></td></tr></table></td></tr></table>
<p style="margin:0;padding:16px 0 0;color:#6c746d;font-size:11px;text-align:center;">Internal notification for authorised Mistwood Residence staff.</p>`;

writePreview(
  "mistwood_admin_email",
  "index.html",
  emailDocumentPreview({ title: "New Enquiry Received | Mistwood Residence", bodyHtml: adminBody }),
);

const resetBody = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">
<div style="margin:0 auto 16px;width:66px;height:66px;border-radius:50%;background:#e3ecdc;line-height:66px;text-align:center"><img src="assets/lock.svg" width="36" height="36" alt=""></div>
<h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;color:#103e2b;font-size:34px;line-height:1.15;margin:0;font-weight:normal">Reset Your Admin Password</h1>
${goldRule("20px auto 28px")}
</td></tr></table>
<div style="text-align:left;font-size:16px;line-height:1.75"><h2 style="font-family:Georgia,serif;font-size:22px;color:#103d2b;margin:0 0 10px">Hello {{admin_name}},</h2>
<p style="margin:0 0 10px">We received a request to reset the password for your Mistwood Residence admin account.</p>
<p style="margin:0 0 22px">Click the button below to create a new password:</p></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:0 0 18px">
<a href="{{reset_url}}" style="display:inline-block;background:#0c452e;color:#ffffff;text-decoration:none;font-size:18px;font-weight:bold;border-radius:11px;padding:17px 38px">Reset Your Password</a>
</td></tr></table>
<p style="font-size:15px;line-height:1.6;margin:0 0 22px;text-align:center">This link will expire in <strong style="color:#0c452e">30 minutes</strong> for your security.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e9eddf;border-radius:14px"><tr>
<td width="72" style="padding:20px 0 20px 20px;vertical-align:middle;text-align:center"><img src="assets/shield.svg" width="44" height="44" alt=""></td>
<td style="padding:20px 22px 20px 12px;text-align:left"><h3 style="font-family:Georgia,serif;color:#103e2b;font-size:20px;margin:0 0 6px">Didn&rsquo;t request this?</h3>
<p style="margin:0;font-size:14px;line-height:1.6">If you didn&rsquo;t ask to reset your password, you can safely ignore this email. Your password will remain unchanged.</p></td>
</tr></table>
<p style="font-size:14px;line-height:1.7;margin:22px 0 0;text-align:left">If the button doesn&rsquo;t work, copy this secure link into your browser:<br><a href="{{reset_url}}" style="color:#0c452e;overflow-wrap:anywhere">{{reset_url}}</a></p>
<p style="font-size:14px;line-height:1.6;margin:20px 0 0;text-align:left;color:#657269">Need help? Contact the property&rsquo;s verified support address.</p>`;

writePreview(
  "mistwood_password_reset",
  "index.html",
  emailDocumentPreview({ title: "Reset Your Admin Password | Mistwood Residence", bodyHtml: resetBody }),
);

const inviteBody = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">
<div style="margin:0 auto 16px;width:66px;height:66px;border-radius:50%;background:#e3ecdc;line-height:66px;text-align:center"><img src="assets/user.svg" width="36" height="36" alt=""></div>
<h1 class="hero-title" style="font-family:Georgia,'Times New Roman',serif;color:#103e2b;font-size:34px;line-height:1.15;margin:0;font-weight:normal">You&rsquo;re invited to the admin team</h1>
${goldRule("20px auto 28px")}
</td></tr></table>
<div style="text-align:left;font-size:16px;line-height:1.75">
<h2 style="font-family:Georgia,serif;font-size:22px;color:#103d2b;margin:0 0 10px">Hello {{invite_name}},</h2>
<p style="margin:0 0 10px">{{invited_by_line}}</p>
<p style="margin:0 0 22px">Use the button below to choose your password and access bookings, guests, and property settings.</p>
</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e9eddf;border-radius:14px;margin:0 0 22px"><tr>
<td width="72" style="padding:18px 0 18px 20px;vertical-align:middle;text-align:center"><img src="assets/tag.svg" width="30" height="30" alt=""></td>
<td style="padding:18px 22px 18px 10px;text-align:left;font-size:15px;line-height:1.55"><strong style="display:block;font-family:Georgia,serif;color:#103e2b;font-size:17px;margin-bottom:4px">Your role</strong>{{role_name}}</td>
</tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:0 0 16px">
<a href="{{setup_url}}" style="display:inline-block;background:#0c452e;color:#ffffff;text-decoration:none;font-size:18px;font-weight:bold;border-radius:11px;padding:17px 38px">Accept invitation &amp; set password</a>
</td></tr></table>
<p style="font-size:15px;line-height:1.6;margin:0 0 22px;text-align:center">This invitation link expires in <strong style="color:#0c452e">7 days</strong>.</p>
<ol style="margin:0 0 22px;padding-left:22px;text-align:left;font-size:15px;line-height:1.65;color:#2c3f36">
<li>Open the secure link above.</li><li>Create your password.</li><li>Sign in at the Mistwood admin login page.</li>
</ol>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef0e6;border-radius:14px"><tr>
<td width="72" style="padding:20px 0 20px 20px;vertical-align:middle;text-align:center"><img src="assets/shield.svg" width="44" height="44" alt=""></td>
<td style="padding:20px 22px 20px 12px;text-align:left"><h3 style="font-family:Georgia,serif;color:#103e2b;font-size:20px;margin:0 0 6px">Not expecting this?</h3>
<p style="margin:0;font-size:14px;line-height:1.6">If you were not expecting an admin invitation, you can ignore this email. No account will be activated until you set a password.</p></td>
</tr></table>
<p style="font-size:14px;line-height:1.7;margin:22px 0 0;text-align:left">If the button doesn&rsquo;t work, copy this link into your browser:<br><a href="{{setup_url}}" style="color:#0c452e;overflow-wrap:anywhere">{{setup_url}}</a></p>
<p style="font-size:15px;line-height:1.6;margin:20px 0 0;text-align:left">Warm regards,<br><strong style="font-family:Georgia,serif;color:#103e2b">The Mistwood Residence Team</strong></p>`;

writePreview(
  "mistwood_admin_invite",
  "index.html",
  emailDocumentPreview({ title: "Admin team invitation | Mistwood Residence", bodyHtml: inviteBody }),
);

// Unified minimal preview styles
const sharedStyles = `/* Mistwood email preview — shared frame */
body{margin:0}
.email{box-shadow:0 10px 28px rgba(24,56,42,.07)}
@media (max-width:600px){.info-cell{padding:14px 5px!important}.explore-photo{display:none!important}}
`;
for (const dir of [
  "mistwood_customer_confirmation_email",
  "mistwood_admin_email",
  "mistwood_password_reset",
  "mistwood_admin_invite",
]) {
  fs.writeFileSync(path.join(assetRoot, dir, "styles.css"), sharedStyles, "utf8");
}
