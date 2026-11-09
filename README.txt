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
  In development, keep "npm run dev" running and start the API with "npm run api".
  That reads DATABASE_URL from .env and Vite proxies /api to port 3000.
  Local Postgres for this machine listens on 127.0.0.1:5433, database mistwood.

Database: PostgreSQL. Tables enquiries and booking_requests are created on startup.
Images live in public/ and are baked into the Docker image.

Deploy: pushing to main runs .github/workflows/docker-publish.yml, which builds and smoke-tests the image,
pushes surenfernando/mistwood-residence to Docker Hub, then redeploys the Coolify app.
Repository secrets: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, COOLIFY_URL, COOLIFY_API_TOKEN, COOLIFY_APP_UUID.

Pages: home, the apartment, hotel photos, around Nuwara Eliya, offers, contact, guest policies, and media credits.
Booking and the calendar are demonstrations only. No live inventory or payment.
Official logo: public/assets/logo-mark.png
Telegram, Instagram, and YouTube are placeholders until the owner adds URLs.
