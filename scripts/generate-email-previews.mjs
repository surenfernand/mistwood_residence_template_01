import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(root, "server", "email-assets");
const baseUrl = (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");

const replacements = {
  "{{guest_name}}": "Priya Mendis",
  "{{guest_email}}": "priya.mendis@example.com",
  "{{guest_phone}}": "+94 77 123 4567",
  "{{guest_message}}":
    "We are planning a family stay in March and would love to know availability for 6 guests.",
  "{{enquiry_subject}}": "March family stay — availability",
  "{{encoded_enquiry_subject}}": "March%20family%20stay",
  "{{guest_phone_digits}}": "94771234567",
  "{{encoded_whatsapp_reply}}": "Hello%20Priya",
  "{{admin_enquiry_url}}": `${baseUrl}/admin/dashboard?enquiry=preview`,
  "{{message}}":
    "We are planning a family stay in March and would love to know availability for 6 guests.",
  "{{submitted_at_slst}}": "12 Nov 2025, 2:32 PM (SLST)",
  "{{apartment_url}}": `${baseUrl}/apartments`,
  "{{gallery_url}}": `${baseUrl}/gallery`,
  "{{explore_url}}": `${baseUrl}/#explore`,
  "{{phone_e164}}": "+94771234567",
  "{{display_phone}}": "+94 77 123 4567",
  "{{contact_email}}": "hello@mistwoodresidence.com",
  "{{whatsapp_url}}": "https://wa.me/94771234567",
  "{{admin_name}}": "Suren Fernando",
  "{{reset_url}}": `${baseUrl}/admin/reset-password?token=preview-reset-token`,
  "{{invite_name}}": "Amaya Perera",
  "{{role_name}}": "Booking Staff",
  "{{setup_url}}": `${baseUrl}/admin/reset-password?token=preview-invite-token`,
  "{{invited_by_line}}": "Dilani Wickramasinghe invited you to join the Mistwood admin team.",
  "{phone_e164}": "+94771234567",
  "{contact_email}": "hello@mistwoodresidence.com",
  "{whatsapp_url}": "https://wa.me/94771234567",
};

const packages = [
  "mistwood_customer_confirmation_email",
  "mistwood_admin_email",
  "mistwood_password_reset",
  "mistwood_admin_invite",
];

for (const dir of packages) {
  const indexPath = path.join(assetRoot, dir, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn("skip (no index):", dir);
    continue;
  }
  let html = fs.readFileSync(indexPath, "utf8");
  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(key).join(value);
  }
  const out = path.join(assetRoot, dir, "preview.html");
  fs.writeFileSync(out, html, "utf8");
  console.log("wrote", path.relative(root, out));
}
