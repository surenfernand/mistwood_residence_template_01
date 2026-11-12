import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";
import { formatOfferPeriod } from "../utils/offerPeriod.js";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const points = [
  ["Seasonal & Special Rates", "calendar"],
  ["Curated Stay Packages", "gift"],
  ["Experience Nuwara Eliya", "hills"],
  ["Book with Confidence", "shield"],
];

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PointIcon({ name }) {
  if (name === "gift") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="11" width="16" height="9" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 15h16M12 11v9M12 11c-1.2-2.4-3.6-3.2-4.6-1.6S9.2 11 12 11Zm0 0c1.2-2.4 3.6-3.2 4.6-1.6S14.8 11 12 11Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "hills") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 18 5.2-7.2 3.3 4.2 2.2-3 7.3 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m14 8.5 1.2-2 1.2 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5 19 6.2v5.4c0 4.2-2.8 6.8-7 8.4-4.2-1.6-7-4.2-7-8.4V6.2L12 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m8.8 12.1 2.2 2.2 4.2-4.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return <CalendarIcon />;
}

function OfferFacts({ startDate, endDate, minNights }) {
  const valid = formatOfferPeriod(startDate, endDate);
  return (
    <ul className="of-meta">
      <li>
        <CalendarIcon />
        <span>Valid: {valid}</span>
      </li>
      <li>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 16.5V10h16v6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 14h16M7 10V8.2A2.2 2.2 0 0 1 9.2 6h5.6A2.2 2.2 0 0 1 17 8.2V10" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span>Min. Stay: {minNights} {minNights === 1 ? "Night" : "Nights"}</span>
      </li>
    </ul>
  );
}

function Discount({ off }) {
  return (
    <p className="of-off">
      <strong>{off}%</strong>
      <span>OFF</span>
    </p>
  );
}

function FeaturedOffer({ offer }) {
  return (
    <article className="of-feature">
      <div className="of-photo">
        <img alt={offer.imageAlt || offer.name} src={offer.imageUrl} />
        {offer.badge ? <span className="of-badge">{offer.badge}</span> : null}
      </div>
      <div className="of-copy">
        <div>
          <h3>{offer.name}</h3>
          <p>{offer.description}</p>
          <OfferFacts startDate={offer.startDate} endDate={offer.endDate} minNights={offer.minNights} />
          <Link className="mh-btn" to={`/contact?offer=${offer.id}#booking`}>
            Book This Offer <span aria-hidden="true">→</span>
          </Link>
        </div>
        <Discount off={offer.discountPercent} />
      </div>
    </article>
  );
}

function OfferCard({ offer }) {
  return (
    <article className="of-card">
      <img alt={offer.imageAlt || offer.name} src={offer.imageUrl} />
      <div>
        <h3>{offer.name}</h3>
        <p>{offer.description}</p>
        <OfferFacts startDate={offer.startDate} endDate={offer.endDate} minNights={offer.minNights} />
        <Link className="mh-btn" to={`/contact?offer=${offer.id}#booking`}>
          Book This Offer <span aria-hidden="true">→</span>
        </Link>
      </div>
      <Discount off={offer.discountPercent} />
    </article>
  );
}

export default function Deals() {
  const pub = usePublicSettings();
  const [offers, setOffers] = useState([]);
  const [loadError, setLoadError] = useState("");

  useSiteTitle("Offers");

  useEffect(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then((data) => setOffers(data.offers || []))
      .catch(() => setLoadError("Offers are temporarily unavailable. Please try again later."));
  }, []);

  const featured = useMemo(() => offers.find((o) => o.featured) || offers[0] || null, [offers]);
  const grid = useMemo(() => offers.filter((o) => o.id !== featured?.id), [offers, featured]);

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero
          kicker="Special Offers"
          title={`Exclusive Deals at ${pub.propertyName}`}
          lede="Make the most of your stay in Nuwara Eliya with our seasonal offers and special packages."
          crumb="Offers"
        />
        <section className="of-band">
          <img className="of-leaf" alt="" src="/assets/mistwood/decorations/leaf-branch.png" />
          <div className="mh-wrap">
            <p className="mh-kicker gold">Our offers</p>
            <h2>Handpicked Stays for Every Occasion</h2>
            <p className="of-lead">
              Enjoy special rates, seasonal packages, and exclusive deals designed for a memorable highland getaway at
              {pub.propertyName}.
            </p>
            {loadError ? <p className="of-lead">{loadError}</p> : null}
            {!loadError && !offers.length ? (
              <p className="of-lead">No offers are published at the moment. Check back soon.</p>
            ) : null}
            {featured ? <FeaturedOffer offer={featured} /> : null}
            {grid.length ? (
              <div className="of-grid">
                {grid.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            ) : null}
          </div>
        </section>
        <section className="of-points" aria-label="What the offers include">
          <ul>
            {points.map(([label, name]) => (
              <li key={label}>
                <PointIcon name={name} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="mh-cta">
          <div className="mh-wrap">
            <h2>Ready to Plan Your Stay?</h2>
            <p>Check availability and book your preferred dates at {pub.propertyName}.</p>
            <Link className="mh-btn" to="/contact#booking">
              <CalendarIcon />
              Book Your Stay <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
