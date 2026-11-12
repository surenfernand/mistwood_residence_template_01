# Mistwood Residence — Admin password reset email

## Files
- `index.html`: responsive email template with mostly inline CSS
- `styles.css`: optional browser-preview enhancements
- `assets/header.jpg` and `assets/footer.jpg`: cropped artwork from the supplied reference image
- `assets/lock.svg` and `assets/shield.svg`: vector icons

## Preview
Open `index.html` in a browser. The placeholders are intentionally visible until the backend substitutes values.

## Template variables
- `{{admin_name}}`: escaped display name, or `Admin`
- `{{reset_url}}`: absolute HTTPS single-use password reset URL generated server-side

## Email delivery
Email clients do not reliably load relative assets or external CSS. Before sending, replace `assets/...` references with publicly hosted HTTPS image URLs or CID attachments, and inline any remaining CSS. Some email clients do not support SVG images; convert icons to PNG or embed equivalent simple text/HTML. Use the property’s verified contact information in place of the illustrative contact information baked into the footer image.

## Security
Create a cryptographically random token, store only its hash, expire it after 30 minutes, and mark it used after a successful reset. Rate-limit requests and respond identically for known and unknown email addresses. Do not include passwords in email. Reset links must lead to your authenticated site's dedicated password-reset workflow. Consider revoking existing sessions after reset.

## Note
The header/footer are image crops from the user-supplied concept. They include artwork and sample contact details. The middle content is editable HTML. This package is a design implementation, not a functioning password-reset service.
