import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader } from "../components/Highland.jsx";

const qualities = [
  {
    label: "Peaceful & Scenic Location",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40c.2-8 3.2-13 8.2-16.2 1.6 5.2.4 10.2-2.2 14.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M24 40c-.4-9-4-14.5-10-18 1.2 6.2 2.6 11 5.4 15.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M24 41V16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    label: "Comfortable & Modern Living",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 22 24 10l16 12v16H8V22Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M20 38V26h8v12" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>,
  },
  {
    label: "Close to Top Attractions",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 36 18 18l8 10 6-7 10 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M6 36h36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    label: "Ideal for Families & Groups",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="32" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M7 34c.8-5 4-7.5 9-7.5s8.2 2.5 9 7.5M26 34c.6-3.6 3-5.6 6.2-5.6 3.4 0 5.8 2 6.6 5.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
];

const facilities = [
  { label: "Spacious Living Area", icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 26v10h32V26" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10 26c0-6 3.4-9 9-9h10c5.6 0 9 3 9 9" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 36v3M40 36v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> },
  { label: "Comfortable Bedrooms", icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 28v10h32v-8" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 28h22c4.4 0 8-3 8-7.5V14" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M12 28V14h12v14" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> },
  { label: "Fully Equipped Kitchen", icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 8v12c0 3 2 4.5 4.5 4.5V40M28 8c3 3 4.5 6 4.5 9 0 3-1.5 4.5-4.5 4.5V40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> },
  { label: "Free Wi-Fi", icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 22c8-8 24-8 32 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M14 28c5-5 15-5 20 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="24" cy="34" r="2" fill="currentColor" /></svg> },
  { label: "Private Parking", icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 30V18h22l6 6v6H8Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="16" cy="32" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="32" cy="32" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> },
  { label: "Scenic Balcony", icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 38V16h32v22" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 22h32M14 22v16M24 22v16M34 22v16" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> },
];

export default function About() {
  useEffect(() => { document.title = "About Us | Mistwood Residence"; }, []);

  return (
    <>
      <HighlandHeader />
      <main>
        <section className="ab-hero">
          <div className="mh-wrap ab-hero-copy">
            <p className="mh-kicker light">About Us</p>
            <h1>The Story of Mistwood Residence</h1>
            <p className="ab-sub">A Boutique Apartment Stay in the Heart of Nuwara Eliya</p>
            <p className="ab-crumb">
              <Link to="/">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.2 12 5l8 6.2V20H4v-8.8Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
                Home
              </Link>
              <span aria-hidden="true">›</span>
              About Us
            </p>
          </div>
        </section>

        <section className="ab-story">
          <div className="mh-sprig sprig-left" aria-hidden="true" />
          <div className="mh-sprig sprig-right soft" aria-hidden="true" />
          <div className="mh-wrap ab-story-grid">
            <figure className="ab-photo">
              <img alt="The living room at Mistwood Residence, with warm light and the dining table beyond" src="/assets/living-wide.jpg" />
            </figure>
            <div className="ab-story-copy">
              <p className="mh-kicker gold ab-kicker">Our Story</p>
              <h2>A Home in the Highlands</h2>
              <p>Mistwood Residence was created to offer travellers a peaceful and comfortable retreat in the heart of Nuwara Eliya. Surrounded by tea-covered hills, cool mountain air, and serene natural beauty, our apartment combines modern living with the charm of the highlands.</p>
            </div>
          </div>
          <ul className="mh-wrap ab-qualities">
            {qualities.map((item) => (
              <li key={item.label}>{item.icon}<span>{item.label}</span></li>
            ))}
          </ul>
        </section>

        <section className="ab-facilities">
          <div className="mh-wrap">
            <p className="mh-kicker light">Our Facilities</p>
            <h2>Everything You Need for a Relaxing Stay</h2>
            <ul>
              {facilities.map((item) => (
                <li key={item.label}>{item.icon}<span>{item.label}</span></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ab-location" id="practical">
          <div className="mh-wrap ab-location-grid">
            <div>
              <p className="mh-kicker gold ab-kicker">The Location</p>
              <h2>In the Heart of Nuwara Eliya</h2>
              <p>Mistwood Residence is conveniently located close to Nuwara Eliya’s key attractions, tea estates, gardens, and lakes, making it the ideal base to explore the beauty of the highlands.</p>
              <Link className="ab-outline" to="/explore">Explore Nearby Attractions <span aria-hidden="true">→</span></Link>
              <p className="ab-note">The street address is sent when a stay is confirmed. From Colombo, the drive climbs into the hill country. By train, the scenic ride ends at Nanu Oya, then a short drive into town. Nuwara Eliya evenings are cool, so bring a warm layer.</p>
            </div>
            <figure className="ab-photo">
              <img alt="Sunset over the tea hills near Nuwara Eliya" src="/assets/mistwood/backgrounds/tea-sunset.png" loading="lazy" />
            </figure>
          </div>
        </section>

        <section className="ab-quote" aria-label="A note on the stay">
          <div className="mh-wrap">
            <span className="ab-mark" aria-hidden="true">“</span>
            <p>A peaceful highland escape, where modern comfort meets the natural beauty of Nuwara Eliya.</p>
          </div>
        </section>

        <section className="ab-notes" id="meals">
          <div className="mh-wrap ab-notes-grid">
            <article>
              <p className="mh-kicker gold ab-kicker">Meals</p>
              <h2>Cook here, or eat in town</h2>
              <p>The apartment has a kitchen, with a refrigerator and a counter beside the dining table. Breakfast, a cook, and groceries are not included unless the owner arranges them. Afternoon tea is something you go into town for.</p>
            </article>
            <article>
              <p className="mh-kicker gold ab-kicker">Photographs</p>
              <h2>The rooms you can see</h2>
              <p>The pictures show the living room, the dining table, the balcony, and the entrance. Bedroom and bathroom photographs will be added when the owner provides them.</p>
              <Link className="ab-outline" to="/photos">Open the hotel photos <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
