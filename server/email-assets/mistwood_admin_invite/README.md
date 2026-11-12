# Mistwood Residence — Admin team invitation email

## Files
- `index.html`: browser preview with `{{placeholders}}`
- `styles.css`: optional preview styles
- `assets/header.jpg`, `assets/footer.jpg`: branded header and footer
- `assets/user.svg`, `assets/tag.svg`, `assets/shield.svg`: inline icons (CID attachments in production)

## Template variables
- `{{invite_name}}` — invitee display name
- `{{role_name}}` — admin role label (e.g. Booking Staff)
- `{{setup_url}}` — absolute HTTPS link to `/admin/reset-password?token=…` (7-day token)
- `{{invited_by_line}}` — sentence naming who sent the invite (optional)

## Runtime
`server/admin-invite-email.js` renders the live HTML, attaches assets as CID images, and sends via SMTP.

## Security
Invitation tokens are stored hashed, expire after seven days, and are single-use when the password is set.
