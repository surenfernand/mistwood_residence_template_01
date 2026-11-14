import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader } from "../components/Highland.jsx";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

export default function NotFound() {
  useSiteTitle("Page not found");

  return (
    <>
      <HighlandHeader />
      <main className="not-found-page">
        <section className="not-found-card" aria-labelledby="not-found-title">
          <p className="mh-kicker gold">404</p>
          <h1 id="not-found-title">Page not found</h1>
          <p>The page you requested may have moved, been removed, or never existed.</p>
          <div className="not-found-actions">
            <Link className="mh-btn" to="/">Go to Home <span aria-hidden="true">→</span></Link>
            <Link className="mh-btn ghost" to="/contact">Contact Us <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
