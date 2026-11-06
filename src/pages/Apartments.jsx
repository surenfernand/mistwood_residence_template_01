import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";

const thumbs = [
  ["/assets/room.jpg", "Sofas and lounge chairs in the living room"],
  ["/assets/dining-kitchen.jpg", "Dining table, chairs, and the refrigerator"],
  ["/assets/stay-balcony.jpg", "The balcony looking over the hills"],
];

const facts = [
  "Entire apartment for your group",
  "Living and dining in one room",
  "Kitchen with a refrigerator",
  "Private balcony",
  "Guest numbers confirmed by the owner",
  "Bedroom photos still to come",
];

export default function Apartments() {
  useEffect(() => { document.title = "Apartments | Mistwood Residence"; }, []);

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker="Our Apartment" title="Stay in Comfort" lede="One apartment, reserved as a whole, with the hills beyond the glass." crumb="Apartments" />
        <section className="ab-story apt-layout">
          <div className="mh-sprig sprig-right soft" aria-hidden="true" />
          <div className="mh-wrap ab-story-grid">
            <div>
              <figure className="ab-photo">
                <img alt="The living room at Mistwood Residence, open toward the dining table" src="/assets/living-wide.jpg" />
              </figure>
              <div className="apt-thumbs">
                {thumbs.map(([src, alt]) => <img key={src} alt={alt} src={src} loading="lazy" />)}
              </div>
            </div>
            <div className="ab-story-copy">
              <p className="mh-kicker gold ab-kicker">The apartment</p>
              <h2>What the photographs show</h2>
              <p>Sofas and lounge chairs share one room with the dining table. Glass doors open toward a balcony over the hills. A refrigerator and the edge of a kitchen counter are in the pictures. Bedroom and bathroom photographs are not in this set yet.</p>
              <ul className="apt-facts">
                {facts.map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
              <Link className="mh-btn" to="/contact#booking">Book Your Stay <span aria-hidden="true">→</span></Link>
              <p><Link className="ab-outline" to="/photos">Open the hotel photos <span aria-hidden="true">→</span></Link></p>
            </div>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
