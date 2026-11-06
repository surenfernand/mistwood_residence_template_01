import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";
import { usePhotos } from "../photos.jsx";

const apartmentShots = [
  { src: "/assets/living-wide.jpg", alt: "The living room at Mistwood Residence, open toward the dining table" },
  { src: "/assets/room.jpg", alt: "Sofas and lounge chairs in the living room" },
  { src: "/assets/dining-kitchen.jpg", alt: "Dining table, chairs, and the refrigerator" },
  { src: "/assets/stay-balcony.jpg", alt: "The balcony looking over the hills" },
  { src: "/assets/lounge-chairs.jpg", alt: "Lounge chairs in the living room" },
  { src: "/assets/living-sofa.jpg", alt: "The long sofa facing the window" },
  { src: "/assets/living-view.jpg", alt: "Living room with the hills beyond the curtains" },
  { src: "/assets/living-doors.jpg", alt: "Seating beside the balcony doors" },
  { src: "/assets/open-plan.jpg", alt: "Open-plan living and dining space" },
  { src: "/assets/dining-table.jpg", alt: "Dining table set for a stay" },
  { src: "/assets/dining-living.jpg", alt: "Dining area looking through to the living room" },
  { src: "/assets/dining-open.jpg", alt: "Dining area and the kitchen counter" },
  { src: "/assets/dining-side.jpg", alt: "Dining table and doorway" },
  { src: "/assets/entry-hall.jpg", alt: "Entry console and sitting bench" },
  { src: "/assets/hills.jpg", alt: "Highland view from the Mistwood balcony" },
];

const stageShots = apartmentShots.slice(0, 4);

const apartmentFacts = [
  ["Entire apartment for your group", "sofa"],
  ["Private balcony", "balcony"],
  ["Living and dining in one room", "dining"],
  ["Guest numbers confirmed by the owner", "key"],
  ["Kitchen with a refrigerator", "kitchen"],
  ["Bedroom photos still to come", "bed"],
];

function FactIcon({ name }) {
  const common = { viewBox: "0 0 32 32", "aria-hidden": true };
  if (name === "sofa") return <svg {...common}><path d="M6 18v7h20v-5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 18h14c3 0 6-2 6-5V9" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 18V10h8v8" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
  if (name === "balcony") return <svg {...common}><path d="M6 26V12h20v14" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 16h20M10 16v10M16 16v10M22 16v10" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
  if (name === "dining") return <svg {...common}><path d="M10 6v8c0 2 1.4 3 3 3v9M19 6c2 2 3 4 3 6 0 2-1 3-3 3v11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  if (name === "key") return <svg {...common}><circle cx="12" cy="14" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M15.5 16.5 24 25M20 21l3 3M18 19l2 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  if (name === "kitchen") return <svg {...common}><rect x="8" y="7" width="16" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 13h16M16 13v12" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
  return <svg {...common}><path d="M6 20v6h20v-6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M7 20c0-4 2.4-6 5-6h8c2.6 0 5 2 5 6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6 26h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

export default function Apartments() {
  const { openPhoto } = usePhotos();
  const [index, setIndex] = useState(0);
  const current = stageShots[index];

  useEffect(() => { document.title = "Apartments | Mistwood Residence"; }, []);

  const openGallery = (src) => {
    const start = Math.max(0, apartmentShots.findIndex((shot) => shot.src === src));
    openPhoto({ ...apartmentShots[start], gallery: apartmentShots, index: start });
  };
  const move = (delta) => setIndex((value) => (value + delta + stageShots.length) % stageShots.length);

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker="Our Apartment" title="Stay in Comfort" lede="One apartment, reserved as a whole, with the hills beyond the glass." crumb="Apartments" />
        <section className="apt-showcase">
          <img className="mh-apt-leaf tl" alt="" src="/assets/mistwood/decorations/leaf-branch.png" />
          <img className="mh-apt-leaf br" alt="" src="/assets/mistwood/decorations/leaf-branch.png" />
          <svg className="mh-apt-hills" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path fill="#efe8d8" d="M0 78C180 36 340 104 520 68 720 28 860 96 1080 58 1240 30 1360 74 1440 48V120H0Z" /><path fill="#e6dece" d="M0 98C220 72 420 114 680 88 940 62 1120 104 1440 74V120H0Z" /></svg>
          <div className="mh-wrap mh-apt-grid">
            <div className="mh-apt-gallery">
              <div className="mh-apt-stage">
                <button type="button" className="mh-apt-main" aria-label={`Enlarge ${current.alt}`} onClick={() => openGallery(current.src)}>
                  <img alt="" src={current.src} />
                </button>
                <button className="mh-apt-arrow prev" type="button" aria-label="Previous apartment photo" onClick={() => move(-1)}>‹</button>
                <button className="mh-apt-arrow next" type="button" aria-label="Next apartment photo" onClick={() => move(1)}>›</button>
              </div>
              <div className="mh-apt-thumbs">
                {stageShots.map((shot, shotIndex) => (
                  <button key={shot.src} type="button" className={shotIndex === index ? "is-on" : undefined} aria-label={shot.alt} aria-pressed={shotIndex === index} onClick={() => setIndex(shotIndex)}>
                    <img alt="" src={shot.src} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mh-apt-copy">
              <p className="mh-kicker gold mh-apt-kicker">The Apartment</p>
              <h2>What the Photographs Show</h2>
              <p className="mh-apt-lead">Sofas and lounge chairs share one room with the dining table. Glass doors open toward a balcony over the hills. A refrigerator and the edge of a kitchen counter are seen in the pictures. Bedroom and bathroom photographs are not in this set yet.</p>
              <ul className="mh-apt-facts">
                {apartmentFacts.map(([label, icon]) => (
                  <li key={label}><FactIcon name={icon} /><span>{label}</span></li>
                ))}
              </ul>
              <div className="mh-apt-actions">
                <Link className="mh-apt-book" to="/contact#booking">Book Your Stay <span aria-hidden="true">→</span></Link>
                <button className="mh-apt-photos" type="button" onClick={() => openGallery(current.src)}>Open the hotel photos <span aria-hidden="true">→</span></button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
