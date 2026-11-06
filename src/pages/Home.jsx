import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader } from "../components/Highland.jsx";

const journey = [
  { href: "#top", label: "The Highlands" },
  { href: "#about", label: "Tea Country" },
  { href: "#apartment", label: "The Residence" },
  { href: "#stay", label: "Your Stay" },
];

export default function Home() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    document.title = "Home | Mistwood Residence";
    const spy = () => {
      const mark = scrollY + innerHeight * 0.38;
      let next = 0;
      journey.forEach((item, index) => {
        const section = document.querySelector(item.href);
        if (section && section.offsetTop <= mark) next = index;
      });
      setActive(next);
    };
    addEventListener("scroll", spy, { passive: true });
    spy();
    return () => removeEventListener("scroll", spy);
  }, []);

  return (
    <>
      <div className="progress" />
      <HighlandHeader />

      <main>
        <section className="mh-hero" id="top">
          <div className="mh-hero-shade" aria-hidden="true" />
          <img className="mh-hero-leaf" alt="" src="/assets/mistwood/decorations/leaf-branch.png" />
          <div className="mh-wrap mh-hero-copy">
            <p className="mh-kicker light">Escape to the Highlands</p>
            <h1>Mistwood Residence</h1>
            <p className="mh-lead">Where Tea Hills Meet Modern Comfort</p>
            <a className="mh-btn ghost" href="#about">Discover the Experience <span aria-hidden="true">→</span></a>
          </div>
          <nav className="mh-journey" aria-label="On this page">
            {journey.map((item, index) => (
              <a key={item.href} className={index === active ? "is-active" : undefined} href={item.href}><span>{item.label}</span><i /></a>
            ))}
          </nav>
          <a className="mh-scroll" href="#highlights"><span className="mh-mouse" aria-hidden="true"><span /></span>Scroll to explore</a>
        </section>

        <section className="mh-strip" id="highlights">
          <ul>
            <li>
              <img className="mh-gold-icon" alt="" src="/assets/mistwood/icons/pin.png" />
              <span>Breathtaking Views<br />of Nuwara Eliya</span>
            </li>
            <li>
              <img className="mh-gold-icon" alt="" src="/assets/mistwood/icons/leaf.png" />
              <span>Tea Plantation<br />Experiences</span>
            </li>
            <li>
              <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 20 24 8l16 12v18H8V20Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M20 38V26h8v12" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              <span>Modern<br />Apartments</span>
            </li>
            <li>
              <img className="mh-gold-icon" alt="" src="/assets/mistwood/icons/pines.png" />
              <span>Peaceful<br />Highland Living</span>
            </li>
          </ul>
        </section>

        <section className="mh-about" id="about">
          <div className="mh-sprig sprig-left" aria-hidden="true" />
          <div className="mh-wrap mh-about-grid">
            <figure className="mh-about-photo">
              <img alt="The living room at Mistwood Residence, open toward the hills" src="/assets/room.jpg" />
              <span className="sprig-corner a" aria-hidden="true" />
              <span className="sprig-corner b" aria-hidden="true" />
            </figure>
            <div className="mh-about-copy">
              <p className="mh-kicker gold">About Mistwood</p>
              <h2>A Tranquil Retreat in Nuwara Eliya</h2>
              <p>Mistwood Residence is a charming apartment in the heart of Nuwara Eliya, offering modern comfort, serene surroundings, and easy access to the region’s most beautiful attractions.</p>
              <ul className="mh-perks">
                <li><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 14 16 6l11 8v12H5V14Z" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M13 26v-7h6v7" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg><span>Entire Apartment</span></li>
                <li><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="11" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="21" cy="12" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5 24c.6-3.4 3-5 6-5s5.4 1.6 6 5M17.5 24c.4-2.4 2-3.8 4-3.8 2.2 0 3.8 1.4 4.4 3.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg><span>Up to 6 Guests</span></li>
                <li><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 16c4-6 14-6 18 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M10 16c2.6-3.4 9.4-3.4 12 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="16" cy="16.5" r="1.3" fill="currentColor" /></svg><span>Free Wi-Fi</span></li>
                <li><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="6" y="12" width="16" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M22 16h3.2L27 19v3h-5" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="11" cy="22" r="1.4" fill="currentColor" /><circle cx="22.5" cy="22" r="1.4" fill="currentColor" /></svg><span>Private Parking</span></li>
              </ul>
              <Link className="mh-btn" to="/about">Learn More About Us <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        <section className="mh-apartment" id="apartment">
          <div className="mh-wrap">
            <p className="mh-kicker light">The Apartment</p>
            <h2>Modern Comforts in the Highlands</h2>
            <div className="mh-rooms">
              <article><img alt="Living room with sofas, lounge chairs, and a view toward the balcony" src="/assets/room.jpg" /><p><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 18v6h22v-6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 18c0-4 2.4-6 6-6h8c3.6 0 6 2 6 6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5 24v2M27 24v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> Spacious Living Area</p></article>
              <article><img alt="Lounge chairs beside the window in the apartment" src="/assets/lounge-chairs.jpg" /><p><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 18v7h20v-5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 18h14c3 0 6-2 6-5V9" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 18V9h8v9" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Lounge seating</p></article>
              <article><img alt="Dining table with chairs and a refrigerator beside the kitchen" src="/assets/dining-kitchen.jpg" /><p><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 6v8c0 2 1.4 3 3 3v9M19 6c2 2 3 4 3 6 0 2-1 3-3 3v11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> Fully Equipped Kitchen</p></article>
              <article><img alt="Balcony looking over the green hills of Nuwara Eliya" src="/assets/stay-balcony.jpg" /><p><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 26V12h20v14" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 16h20M10 16v10M16 16v10M22 16v10" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Scenic Balcony</p></article>
            </div>
          </div>
        </section>

        <section className="mh-deals" id="offers">
          <div className="mh-sprig sprig-right" aria-hidden="true" />
          <div className="mh-sprig sprig-left soft" aria-hidden="true" />
          <div className="mh-wrap">
            <p className="mh-kicker gold">Seasonal stays</p>
            <h2>Ask for the dates you want</h2>
            <p className="mh-intro">No discount is published on this website. Tell us the nights, and the owner confirms the rate before anything is held.</p>
            <Link className="mh-btn center" to="/deals">See offers <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="mh-explore" id="explore">
          <div className="mh-wrap">
            <p className="mh-kicker light">Explore Nuwara Eliya</p>
            <h2>Discover the Beauty Around</h2>
            <p className="mh-intro light">From serene lakes to rolling tea estates, explore the best of Nuwara Eliya during your stay at Mistwood Residence.</p>
            <div className="mh-places">
              <Link to="/explore"><img alt="Gregory Lake in Nuwara Eliya, with boats on the water" src="/assets/mistwood/explore/gregory-lake.png" loading="lazy" /><span>Gregory Lake</span></Link>
              <Link to="/explore"><img alt="Tea pickers in the plantations near Nuwara Eliya" src="/assets/mistwood/explore/tea-plantations.png" loading="lazy" /><span>Tea Plantations</span></Link>
              <Link to="/explore"><img alt="The entrance to Hakgala Botanical Garden" src="/assets/places/hakgala.jpg" loading="lazy" /><span>Hakgala Botanical Garden</span></Link>
              <Link to="/explore"><img alt="Lover's Leap waterfall near Nuwara Eliya" src="/assets/places/leap.jpg" loading="lazy" /><span>Lovers' Leap</span></Link>
            </div>
            <Link className="mh-btn ghost center" to="/explore">Explore More Attractions</Link>
          </div>
        </section>

        <section className="mh-cta" id="stay">
          <div className="mh-wrap">
            <h2>Ready for a Highland Getaway?</h2>
            <p>Check availability and book your stay at Mistwood Residence today.</p>
            <Link className="mh-btn" to="/contact#booking">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" /></svg>
              Book Your Stay <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <HighlandFooter />
    </>
  );
}
