Mistwood Residence

React + Vite site for the Nuwara Eliya apartment.

Install and run:
  npm install
  npm run dev

Build:
  npm run build
  npm run preview

Server (serves dist/ and the /api routes):
  npm run build
  npm start
  In development, run both the site and API in one terminal with "npm run dev:all",
  or run "npm run dev" and "npm run api" in two terminals. The API reads .env and Vite proxies /api to port 3000.
  Only one API process may listen on port 3000. Restart the API after editing .env.
  Local Postgres for this machine listens on 127.0.0.1:5433, database mistwood.

Database: PostgreSQL. Tables enquiries and booking_requests are created on startup.
Admin authentication: the server also creates `admins` and `admin_sessions` tables on startup. Set these environment variables before first launch to create the initial administrator (the password must have at least 12 characters):

  ADMIN_EMAIL=owner@example.com
  ADMIN_PASSWORD=use-a-long-unique-password
  ADMIN_NAME=Mistwood Administrator

The login is available at `/admin/login`. Administrator sessions are stored in PostgreSQL and sent only in an HTTP-only cookie.

Team admin users (up to 10 active accounts):
  The first administrator is created from ADMIN_EMAIL / ADMIN_PASSWORD and receives the Owner role (full access).
  Additional staff are invited from Admin → Users & Permissions (Owner only). Each invite sends an email with a
  password-setup link (same flow as reset-password; link valid for 7 days). SMTP must be configured for invites.
  Predefined roles: Owner, Manager, Booking Staff, Housekeeping — each grants access only to matching admin sections.
  API routes enforce permissions server-side; the sidebar hides sections the signed-in user cannot access.

  Role-based QA checklist (manual):
  - Sign in as Owner: all nav items visible; Users & Permissions loads; invite a test user.
  - Assign Booking Staff in DB or UI: only Dashboard, Bookings, Guests visible; rates/payments API returns 403.
  - Assign Housekeeping: Dashboard, Availability, Bookings; rates returns 403.
  - Deactivate a user: their sessions end; they cannot sign in.
  - Ensure at least one active Owner remains when changing roles or deactivating accounts.

  In-app notifications (bell icon on admin pages):
  - Owner: booking, enquiry, payment, stay reminders, team invite/deactivate events.
  - Manager: same as Owner except team events (no users permission).
  - Booking Staff: booking and enquiry events and stay reminders; no payment lines.
  - Housekeeping: stay movement/reminder and confirmed-stay lines; no enquiries or payments.
  - Mark one read / mark all read; badge clears; /admin/notifications lists the full feed.

  Profile menu (avatar in the top bar):
  - All roles: My profile, Account settings, Appearance, Help & support, Sign out.
  - Footer shows last sign-in time; rename profile updates the top bar; change-password keeps this session.
  - Appearance toggles (compact sidebar, reduce motion) persist in this browser via localStorage.

Property contact, deposit percent, booking rules, social links, and reviews: Admin → Settings (Owner only),
stored in PostgreSQL (`site_settings` and `social_entries`). The public site loads them from `/api/settings/public`.

Enquiry and booking emails require SMTP in `.env` / deployment:

  PUBLIC_SITE_URL=https://your-domain.example
  SMTP_HOST=smtp.your-provider.example
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-smtp-username
  SMTP_PASSWORD=your-smtp-password
  MAIL_FROM=optional override; default uses Settings mail-from name and contact email
Images live in public/ and are baked into the Docker image.

Deploy: pushing to main runs .github/workflows/docker-publish.yml, which builds and smoke-tests the image,
pushes surenfernando/mistwood-residence to Docker Hub, then redeploys the Coolify app.
Repository secrets: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, COOLIFY_URL, COOLIFY_API_TOKEN, COOLIFY_APP_UUID.

Pages: home, the apartment, hotel photos, around Nuwara Eliya, offers, contact, guest policies, and media credits.
Guest booking: calendar on Contact uses live availability and pricing. A 30% deposit is collected
via PayHere (configure PAYHERE_* and PUBLIC_SITE_URL in .env). Confirmation emails include a QR
check-in link; staff open /admin/check-in or scan the QR while signed in. Guests may create an
account from the confirmation email to pay the balance online at /account.
Official logo: public/assets/logo-mark.png
Social URLs are configured under Admin → Settings.
