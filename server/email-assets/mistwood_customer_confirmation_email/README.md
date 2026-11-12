# Mistwood Residence — Customer Contact Enquiry Acknowledgement

## Preview
Open `index.html` in a browser. This package recreates the approved design as an editable HTML email. The scenic header and branded footer are cropped from the approved mockup and remain image-based; middle text, buttons, and links are real HTML.

## Files
- `index.html`: table-based HTML email, with most styles inline
- `styles.css`: optional responsive browser enhancements
- `assets/header.jpg`, `assets/footer.jpg`, `assets/explore.jpg`: image assets
- `assets/icons/*.svg`: individual icons (some email clients block SVG)
- `preview-reference.png`: original visual reference

## Dynamic fields
- `{{guest_name}}` — customer's name
- `{{apartment_url}}`, `{{gallery_url}}`, `{{explore_url}}` — full HTTPS website URLs
- `{{phone_e164}}`, `{{display_phone}}`, `{{contact_email}}`, `{{whatsapp_url}}` — verified property contact information

## Production delivery
1. Replace placeholders server-side using proper HTML escaping and safe URL validation. Do not directly inject untrusted customer input into HTML.
2. Replace relative image paths with publicly accessible absolute HTTPS URLs, or use CID attachments for images where supported. SVG icons may not render in Gmail/Outlook: convert them to PNG or use text alternatives.
3. Inline any necessary styles from `styles.css`; test rendering in Gmail, Outlook, Apple Mail, and on mobile.
4. Replace the image-based footer with updated branding if its sample phone/email differ from the real property's contact details.
5. Send after the Contact Us submission is saved successfully. Subject suggestion: `Thank You for Contacting Mistwood Residence – Enquiry Received`.
6. This is an enquiry acknowledgement, not a booking confirmation. No 24-hour response guarantee is included.
