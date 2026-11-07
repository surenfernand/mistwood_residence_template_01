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
  DATABASE_URL=postgres://user:pass@host:5432/db npm start
  Run "npm start" alongside "npm run dev" to use the forms in development; Vite proxies /api to port 3000.

Database: PostgreSQL. Tables enquiries and booking_requests are created on startup.
Images live in public/ and are baked into the Docker image.

Deploy: pushing to main runs .github/workflows/docker-publish.yml, which builds and smoke-tests the image,
pushes surenfernando/mistwood-residence to Docker Hub, then redeploys the Coolify app.
Repository secrets: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, COOLIFY_URL, COOLIFY_API_TOKEN, COOLIFY_APP_UUID.

Pages: home, the apartment, hotel photos, around Nuwara Eliya, offers, contact, guest policies, and media credits.
Booking and the calendar are demonstrations only. No live inventory or payment.
Official logo: public/assets/logo-mark.png
Telegram, Instagram, and YouTube are placeholders until the owner adds URLs.
