import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader } from "../components/Highland.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

export default function NotFound() {
  const pub = usePublicSettings();
  useSiteTitle("Page Not Found");

  return (
    <>
      <HighlandHeader />
      <main className="not-found-hero">
        <div className="not-found-content">
          <p className="not-found-eyebrow">A little detour in the highlands</p>
          <div className="not-found-number" aria-label="Error 404">
            404
          </div>
          <h1 id="not-found-title">
            Looks like you&apos;ve <em>lost your way.</em>
          </h1>
          <p>
            The page you&apos;re looking for may have moved or no longer exists. The beauty of {pub.propertyName} is still
            just a click away.
          </p>
          <div className="not-found-actions">
            <Link className="mh-btn not-found-btn-primary" to="/">
              Return to Homepage <span aria-hidden="true">→</span>
            </Link>
            <Link className="mh-btn ghost not-found-btn-secondary" to="/contact">
              Contact Us
            </Link>
          </div>
          <p className="not-found-detail">Your highland escape awaits</p>
        </div>
      </main>
      <HighlandFooter />
    </>
  );
}