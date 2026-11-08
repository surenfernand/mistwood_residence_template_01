import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";

const featured = {
  image: "/assets/mistwood/backgrounds/tea-sunrise.jpg",
  alt: "Sunrise over the tea hills near Nuwara Eliya",
  badge: "Most popular",
  title: "Highland Escape Deal",
  text: "Book your stay this month and enjoy a special rate for a peaceful highland retreat.",
  valid: "1 – 30 November 2026",
  nights: "2 Nights",
  off: "15%",
};

const offers = [
  {
    image: "/assets/dining-kitchen.jpg",
    alt: "Dining table and kitchen at Mistwood Residence",
    title: "Long Stay Savings",
    text: "Planning a longer escape? Enjoy great savings on extended stays.",
    valid: "All Year Round",
    nights: "7 Nights",
    off: "20%",
  },
  {
    image: "/assets/stay-balcony.jpg",
    alt: "The balcony looking over the hills",
    title: "Family Getaway",
    text: "A perfect highland holiday for families, with special savings and extra comfort.",
    valid: "1 Nov – 20 Dec 2026",
    nights: "2 Nights",
    off: "10%",
  },
  {
    image: "/assets/room.jpg",
    alt: "Sofas and lounge chairs in the living room",
    title: "Romantic Retreat",
    text: "A cosy escape for couples with special benefits and a relaxing atmosphere.",
    valid: "All Year Round",
    nights: "2 Nights",
    off: "15%",
  },
  {
    image: "/assets/mistwood/backgrounds/tea-sunset.jpg",
    alt: "Sunset light over the tea hills near Nuwara Eliya",
    title: "Festive Holiday Deal",
    text: "Celebrate the season in Nuwara Eliya with exclusive holiday rates.",
    valid: "20 Dec 2026 – 5 Jan 2027",
    nights: "3 Nights",
    off: "12%",
  },
];

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

function OfferFacts({ valid, nights }) {
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
        <span>Min. Stay: {nights}</span>
      </li>
    </ul>
  );
}

function Discount({ off }) {
  return (
    <p className="of-off">
      <strong>{off}</strong>
      <span>OFF</span>
    </p>
  );
}

export default function Deals() {
  useEffect(() => { document.title = "Offers | Mistwood Residence"; }, []);

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero
          kicker="Special Offers"
          title="Exclusive Deals at Mistwood Residence"
          lede="Make the most of your stay in Nuwara Eliya with our seasonal offers and special packages."
          crumb="Offers"
        />
        <section className="of-band">
          <img className="of-leaf" alt="" src="/assets/mistwood/decorations/leaf-branch.png" />
          <div className="mh-wrap">
            <p className="mh-kicker gold">Our offers</p>
            <h2>Handpicked Stays for Every Occasion</h2>
            <p className="of-lead">Enjoy special rates, seasonal packages, and exclusive deals designed for a memorable highland getaway at Mistwood Residence.</p>
            <article className="of-feature">
              <div className="of-photo">
                <img alt={featured.alt} src={featured.image} />
                <span className="of-badge">{featured.badge}</span>
              </div>
              <div className="of-copy">
                <div>
                  <h3>{featured.title}</h3>
                  <p>{featured.text}</p>
                  <OfferFacts valid={featured.valid} nights={featured.nights} />
                  <Link className="mh-btn" to="/contact#booking">Book This Offer <span aria-hidden="true">→</span></Link>
                </div>
                <Discount off={featured.off} />
              </div>
            </article>
            <div className="of-grid">
              {offers.map((offer) => (
                <article className="of-card" key={offer.title}>
                  <img alt={offer.alt} src={offer.image} />
                  <div>
                    <h3>{offer.title}</h3>
                    <p>{offer.text}</p>
                    <OfferFacts valid={offer.valid} nights={offer.nights} />
                    <Link className="mh-btn" to="/contact#booking">Book This Offer <span aria-hidden="true">→</span></Link>
                  </div>
                  <Discount off={offer.off} />
                </article>
              ))}
            </div>
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
            <p>Check availability and book your preferred dates at Mistwood Residence.</p>
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
