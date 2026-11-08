import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";
import ApartmentGallery from "../components/ApartmentGallery.jsx";
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
  ["Up to 6 guests", "key"],
  ["Private balcony", "balcony"],
  ["Kitchen with a refrigerator", "kitchen"],
];

const faqs = [
  ["Is the apartment rented as a whole unit?", "Yes. Mistwood Residence is one private apartment reserved for your group."],
  ["Is parking available?", "Private parking is available for guests."],
  ["Is Wi-Fi available?", "Complimentary Wi-Fi is available in the apartment."],
  ["Can guests prepare their own meals?", "Yes. The apartment has an equipped kitchen with a refrigerator and dining area. Meals, groceries, and a cook are not included unless arranged with the owner."],
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
  const [openFaq, setOpenFaq] = useState(null);
  const current = stageShots[index];

  useEffect(() => { document.title = "Apartment | Mistwood Residence"; }, []);

  const openGallery = (src) => {
    const start = Math.max(0, apartmentShots.findIndex((shot) => shot.src === src));
    openPhoto({ ...apartmentShots[start], gallery: apartmentShots, index: start });
  };
  const move = (delta) => setIndex((value) => (value + delta + stageShots.length) % stageShots.length);

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker="Our Apartment" title="Stay in Comfort" lede="One apartment, reserved as a whole, with the hills beyond the glass." crumb="Apartment" />
      

        <ApartmentGallery />

        <section className="apt-experience">
          <div className="mh-wrap apt-experience-copy">
            <p className="mh-kicker gold">Beyond Your Stay</p>
            <h2>Experience Nuwara Eliya</h2>
            <p>Cool air, rolling tea country, gardens, lakes, and quiet hill-country evenings are all close to Mistwood Residence.</p>
            <Link className="apt-gold-link" to="/explore">Explore Nuwara Eliya <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="apt-faq" aria-labelledby="faq-title">
          <div className="mh-wrap apt-faq-grid"><div><p className="mh-kicker gold" style={{ justifyContent: "left" }}>Helpful Details</p><h2 id="faq-title">Frequently Asked Questions</h2><p>Everything we can confirm about a stay at Mistwood Residence.</p></div><div>{faqs.map(([question, answer], faqIndex) => <article key={question} className={openFaq === faqIndex ? "is-open" : ""}><button type="button" aria-expanded={openFaq === faqIndex} onClick={() => setOpenFaq(openFaq === faqIndex ? null : faqIndex)}><span>{question}</span><b aria-hidden="true">+</b></button><div><p>{answer}</p></div></article>)}</div></div>
        </section>

        <section className="apt-final-cta"><div className="mh-wrap"><p className="mh-kicker gold">Mistwood Residence</p><h2 style={{ justifyContent: "center" }}>Your Highland Escape Awaits</h2><p>Book your stay at Mistwood Residence and enjoy the comfort of a private apartment in the heart of Nuwara Eliya.</p><Link className="apt-gold-link" to="/contact#booking">Book Your Stay <span aria-hidden="true">→</span></Link></div></section>
      </main>
      <HighlandFooter />
    </>
  );
}
