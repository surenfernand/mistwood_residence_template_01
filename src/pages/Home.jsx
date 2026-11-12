import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader } from "../components/Highland.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const heroFrames = [
  { src: "/assets/mistwood/backgrounds/tea-sunrise.jpg", spot: "Tea sunrise", label: "Tea plantations at sunrise", journey: "The Residence" },
  { src: "/assets/mistwood/backgrounds/railway-sunset.jpg", spot: "is-sunrise", label: "Railway through the Nuwara Eliya hills at sunset", journey: "The Highlands" },
  { src: "/assets/mistwood/backgrounds/pexels-thilina-alagiyawanna-3266092-36847091.jpg", spot: "is-lake", label: "Gregory Lake", journey: "Tea Country" },
  { src: "/assets/mistwood/home/lake-boat.jpg", spot: "is-stay", label: "A boat on the lake below the hills", journey: "Your Stay" },
  // { src: "/assets/mistwood/videos/mistwood-highland-view.mp4", poster: "/assets/stay-balcony.jpg", type: "video", spot: "is-views", label: "Mistwood's sweeping highland view", journey: "Breathtaking Views" },
];

export default function Home() {
  const pub = usePublicSettings();
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);

  useSiteTitle("Home");

  useEffect(() => {
    const pin = document.querySelector(".mh-hero-pin");
    const hero = pin?.querySelector(".mh-hero");
    const slides = [...document.querySelectorAll(".mh-hero-frame")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heroFrames.filter((item) => item.type !== "video").forEach((item) => {
      const image = new Image();
      image.src = item.src;
      image.decode?.().catch(() => { });
    });

    let tick = 0;
    let lastPos = -1;
    const paint = () => {
      if (reduced || !pin || !hero || slides.length < 2) return;
      const top = pin.getBoundingClientRect().top;
      const total = Math.max(pin.offsetHeight - innerHeight, 0);
      const scrolled = Math.min(Math.max(-top, 0), total);
      const progress = total > 0 ? scrolled / total : 0;
      const pos = progress * (slides.length - 1);
      if (Math.abs(pos - lastPos) < 0.001) return;
      lastPos = pos;
      slides.forEach((slide, index) => {
        const distance = index - pos;
        const opacity = Math.max(0, 1 - Math.abs(distance));
        slide.style.opacity = opacity.toFixed(3);
        slide.style.transform = `translate3d(0, ${(Math.max(-1, Math.min(1, distance)) * 6).toFixed(2)}%, 0)`;
        slide.style.visibility = opacity > 0 ? "visible" : "hidden";
      });
      const shown = Math.round(pos);
      if (shown !== frameRef.current) {
        frameRef.current = shown;
        setFrame(shown);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(paint);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    paint();
    const settle = setTimeout(() => document.querySelector(".mh-hero")?.classList.add("is-settled"), 1300);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(tick);
      clearTimeout(settle);
    };
  }, []);

  const goToFrame = (index) => {
    const pin = document.querySelector(".mh-hero-pin");
    if (!pin) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frameRef.current = index;
      setFrame(index);
      return;
    }
    const total = pin.offsetHeight - window.innerHeight;
    const top = pin.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (total * index) / (heroFrames.length - 1), behavior: "smooth" });
  };

  return (
    <>
      <div className="progress" />
      <HighlandHeader />

      <main>
        <section className="mh-hero-pin" id="top" aria-label={pub.propertyName}>
          <div className="mh-hero" data-parallax>
            <div className="mh-hero-scene" aria-hidden="true">
              {heroFrames.map((item, index) => (
                <div key={item.src} className={index === frame ? "mh-hero-frame is-current" : "mh-hero-frame"}>
                  {item.type === "video" ? <video className={item.spot} src={item.src} poster={item.poster} autoPlay muted loop playsInline preload="metadata" /> : <img alt="" className={item.spot} src={item.src} />}
                </div>
              ))}
            </div>
            <div className="mh-hero-shade" aria-hidden="true" />
            {/* <img className="mh-hero-leaf" alt="" src="/assets/mistwood/decorations/leaf-branch.png" /> */}
            <div className="mh-wrap mh-hero-copy">
              <p className="mh-kicker light">Escape to the Highlands</p>
              <h1>{pub.propertyName}</h1>
              <p className="mh-lead">{pub.tagline}</p>
              <a className="mh-btn ghost" href="#about">Discover the Experience <span aria-hidden="true">→</span></a>
            </div>
            <nav className="mh-journey" aria-label="Hero photographs">
              {heroFrames.map((item, index) => (
                <button key={item.src} type="button" className={index === frame ? "is-active" : undefined} aria-label={item.journey} onClick={() => goToFrame(index)}><i /></button>
              ))}
            </nav>
            <section className="mh-strip" id="highlights" aria-label="Highland highlights">
              <ul data-reveal="stagger">
                <li>
                  <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M3 35 14 18l5 6 4-5 8 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" strokeLinecap="round" /><path d="M23 35 33 14l12 21" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" strokeLinecap="round" /></svg>
                  <span>Breathtaking Views</span>
                </li>
                <li>
                  <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M22 42c1.2-9 3-16 9-24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" /><path d="M31 18c8 0 14 4 13 11-8 0-12-4-13-11Z" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" /><path d="M31 18c2 4.5 1 8-1.2 11" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" /><path d="M26 28c-9 1-15 7-14 14 9-.4 13-5.5 14-14Z" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" /><path d="M26 28c-1.2 5 .2 8.5 3.2 11.5" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" /></svg>
                  <span>Tea Plantation<br />Experiences</span>
                </li>
                <li>
                  <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 30V16h7.5A5.5 5.5 0 0 1 20 21.5V30" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" /><path d="M7 24h34v8H7Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M16 24v-1.5A3.5 3.5 0 0 1 19.5 19h7A3.5 3.5 0 0 1 30 22.5V24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M12 32v4M36 32v4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  <span>Modern<br />Apartment</span>
                </li>
                <li>
                  <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 34 14 18l6 16Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M14 26v8" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" /><path d="M18 36 26 12l8 24Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M26 22v14" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" /><path d="M32 34 37 22l5 12Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M4 38c8-2.5 12-3 18-1.5 7 1.6 12 1.2 22-2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                  <span>Peaceful<br />Highland Living</span>
                </li>
              </ul>
            </section>
          </div>
        </section>

        <section className="mh-about" id="about">
          <div className="mh-sprig sprig-left" aria-hidden="true" />
          <div className="mh-wrap mh-about-grid">
            <figure className="mh-about-photo" data-reveal="image">
              <img alt={`The living room at ${pub.propertyName}, open toward the hills`} src="/assets/room.jpg" />
            </figure>
            <div className="mh-about-copy" data-reveal="right">
              <p className="mh-kicker gold">About Mistwood</p>
              <h2>A Tranquil Retreat in Nuwara Eliya</h2>
              <p>{pub.propertyDescription}</p>
              <ul className="mh-perks">
                <li><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4.5 14.5 16 5l11.5 9.5v11.5H4.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M13 26V18h6v8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg><span>Entire Apartment</span></li>
                <li><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="11" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="21.5" cy="12.25" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M4.5 25c.8-3.8 3.4-5.8 6.5-5.8s5.8 2 6.5 5.8M17.5 25c.55-2.7 2.35-4.25 4.65-4.25 2.45 0 4.25 1.55 4.85 4.25" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg><span>Up to {pub.maxGuests} Guests</span></li>
                <li><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4.5 12.5c6.25-5.8 16.75-5.8 23 0M8.5 16.5c4.1-3.75 10.9-3.75 15 0M12.5 20.5c1.95-1.75 5.05-1.75 7 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="16" cy="24.25" r="1.55" fill="currentColor" /></svg><span>Free Wi-Fi</span></li>
                <li><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="4.5" width="22" height="23" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M12 24V9h5.2a4.15 4.15 0 0 1 0 8.3H12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Private Parking</span></li>
              </ul>
              <Link className="mh-btn" to="/about">Learn More About Us <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        <section className="mh-apartment" id="apartment">
          <div className="mh-wrap">
            <p className="mh-kicker light">The Apartment</p>
            <h2>Modern Comforts in the Highlands</h2>
            <div className="mh-rooms" data-reveal="stagger">
              <article><img alt="Living room with sofas, lounge chairs, and a view toward the balcony" src="/assets/room.jpg" /><p><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 18v6h22v-6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 18c0-4 2.4-6 6-6h8c3.6 0 6 2 6 6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5 24v2M27 24v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> Spacious Living Area</p><span className="mh-room-detail">Sleeps up to 6</span></article>
              <article><img alt="Lounge chairs beside the window in the apartment" src="/assets/lounge-chairs.jpg" /><p><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 18v7h20v-5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 18h14c3 0 6-2 6-5V9" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 18V9h8v9" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Lounge Seating</p><span className="mh-room-detail">Space to unwind together</span></article>
              <article><img alt="Dining table with chairs and a refrigerator beside the kitchen" src="/assets/dining-kitchen.jpg" /><p><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 6v8c0 2 1.4 3 3 3v9M19 6c2 2 3 4 3 6 0 2-1 3-3 3v11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> Fully Equipped Kitchen</p><span className="mh-room-detail">Cook and dine at home</span></article>
              <article><img alt="Balcony looking over the green hills of Nuwara Eliya" src="/assets/stay-balcony.jpg" /><p><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 26V12h20v14" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 16h20M10 16v10M16 16v10M22 16v10" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> Scenic Balcony</p><span className="mh-room-detail">Mountain-view balcony</span></article>
            </div>
            <Link className="mh-btn ghost mh-apartment-link" to="/apartments">View Apartment <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="mh-deals" id="offers">
          <img className="mh-deal-highlands" alt="" src="/assets/mistwood/decorations/highland-terraces-bottom-right.png" />
          <div className="mh-wrap" data-reveal="up">
            <p className="mh-kicker gold">Seasonal stays</p>
            <h2>Handpicked stays for every occasion</h2>
            <p className="mh-intro">Seasonal packages for a highland getaway. Each offer has its own dates and a minimum stay.</p>
            <Link className="mh-btn center" to="/deals">See offers <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="mh-explore" id="explore">
          <div className="mh-wrap">
            <p className="mh-kicker light">Explore Nuwara Eliya</p>
            <h2>Discover the Beauty Around</h2>
            <p className="mh-intro light">From serene lakes to rolling tea estates, explore the best of Nuwara Eliya during your stay at {pub.propertyName}.</p>
            <div className="mh-places" data-reveal="stagger">
              <Link to="/explore"><img alt="Swan boat on Gregory Lake in Nuwara Eliya" src="/assets/mistwood/explore/gregory-lake-card.jpg" loading="lazy" /><span>Gregory Lake</span></Link>
              <Link to="/explore"><img alt="Tea-covered hills near Nuwara Eliya" src="/assets/mistwood/explore/tea-plantations-card.jpg" loading="lazy" /><span>Tea Plantations</span></Link>
              <Link to="/explore"><img alt="The entrance to Hakgala Botanical Garden" src="/assets/places/hakgala.jpg" loading="lazy" /><span>Hakgala Botanical Garden</span></Link>
              <Link to="/explore"><img alt="Lover's Leap waterfall near Nuwara Eliya" src="/assets/places/leap.jpg" loading="lazy" /><span>Lovers' Leap</span></Link>
            </div>
            <Link className="mh-btn ghost center" to="/explore">Explore More Attractions</Link>
          </div>
        </section>

        <section className="mh-way" aria-labelledby="mistwood-way-title">
          <img className="mh-way-leaf" alt="" src="/assets/mistwood/decorations/leaf-branch.png" />
          <div className="mh-wrap">
            <p className="mh-kicker gold">At Your Own Pace</p>
            <h2 id="mistwood-way-title">The Mistwood Way</h2>
            <p className="mh-intro">Return to a calm, comfortable base after a day in the highlands.</p>
            <div className="mh-way-grid" data-reveal="stagger">
              <article>
                <img src="/assets/room.jpg" alt="Morning light in the living room at Mistwood Residence" loading="lazy" />
                <div className="mh-way-copy">
                  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 22h13a4 4 0 0 0 0-8H8v8Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M21 16h4v6M6 23h18M12 9c-1-1.3-.8-2.7.2-4M17 9c-1-1.3-.8-2.7.2-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  <h3>Wake Slowly</h3>
                  <p>Ease into the day with a cup of tea or coffee as morning light fills your space.</p>
                </div>
              </article>
              <article>
                <img src="/assets/dining-kitchen.jpg" alt="Dining table ready for a shared meal at Mistwood Residence" loading="lazy" />
                <div className="mh-way-copy">
                  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 5v10c0 2.2 1.4 3.5 3 3.5V27M20 5c2 2.5 2.5 5.2 2.5 7.2 0 2.2-1 3.8-2.5 4.8V27" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M6 5v7M10 5v7M6 9h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  <h3>Gather Together</h3>
                  <p>Share good food and easy conversation in a welcoming, homely space.</p>
                </div>
              </article>
              <article>
                <video src="/assets/mistwood/videos/mistwood-balcony-mist.mp4" poster="/assets/stay-balcony.jpg" autoPlay muted loop playsInline preload="metadata" aria-label="Misty morning view from the Mistwood Residence balcony" />
                <div className="mh-way-copy">
                  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m4 23 8-9 5 5 4-4 7 8M4 27h24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="m18 10 3-3 3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <h3>Take in the View</h3>
                  <p>Step onto the balcony and enjoy uninterrupted, calming views of the green hills.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="mh-cta" id="stay">
          <div className="mh-wrap" data-reveal="up">
            <h2>Ready for a Highland Getaway?</h2>
            <p>Check availability and book your stay at {pub.propertyName} today.</p>
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
