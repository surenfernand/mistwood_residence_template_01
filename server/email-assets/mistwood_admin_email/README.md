# Mistwood Residence — Admin Enquiry Email

Open `index.html` in a browser for a visual preview. All assets are included locally.

## Template placeholders
Replace `{{guest_name}}`, `{{guest_email}}`, `{{guest_phone}}`, `{{enquiry_subject}}`, `{{guest_message}}`, `{{submitted_at_slst}}`, `{{guest_phone_digits}}`, `{{encoded_enquiry_subject}}`, `{{encoded_whatsapp_reply}}`, and `{{admin_enquiry_url}}` on the server.

## Email delivery notes
- The included HTML is a browser preview. For production email, inline `styles.css`, replace image and SVG paths with public HTTPS URLs or inline/CID images supported by your email provider, and test in Gmail/Outlook/mobile clients. Some email clients do not fully support CSS Grid; use table-based layouts for maximum compatibility.
- The header and footer are image crops from the provided design reference and therefore contain baked-in branding/contact text. Verify contact information before sending. Replace with licensed original assets if required.
- HTML-escape all user-supplied fields; convert message newlines safely. URL-encode action parameters. Never interpolate untrusted input into HTML without escaping.
- `admin_enquiry_url` must point to an authenticated admin enquiry detail page. Do not put sensitive access tokens in email links.
- Format `submitted_at_slst` in Asia/Colombo.
- Send only after successfully saving the enquiry; implement retries and logging for email failures.
