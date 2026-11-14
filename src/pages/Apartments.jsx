import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";
import ApartmentGallery from "../components/ApartmentGallery.jsx";
import ApartmentSleepingArrangements from "../components/ApartmentSleepingArrangements.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

function buildFaqs(propertyName) {
  return [
    ["Is the apartment rented as a whole unit?", `Yes. ${propertyName} is one private apartment reserved for your group.`],
    ["Is parking available?", "Private parking is available for guests."],
    ["Is Wi-Fi available?", "Complimentary Wi-Fi is available in the apartment."],
    ["Is a Smart TV available?", "Yes. A Smart TV is available — you can sign in to Netflix or other streaming apps with your own account."],
    ["Is Peo TV available?", "Peo TV is available complimentary for guests."],
    ["Can guests prepare their own meals?", "Yes. The apartment has an equipped kitchen with a refrigerator and dining area. Meals, groceries, and a cook are not included unless arranged with the owner."],
  ];
}

export default function Apartments() {
  const pub = usePublicSettings();
  const faqs = useMemo(() => buildFaqs(pub.propertyName), [pub.propertyName]);
  const [openFaq, setOpenFaq] = useState(null);

  useSiteTitle("Apartment");

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
            <p>Cool air, rolling tea country, gardens, lakes, and quiet hill-country evenings are all close to {pub.propertyName}.</p>
            <Link className="apt-gold-link" to="/explore">Explore Nuwara Eliya <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <ApartmentSleepingArrangements propertyName={pub.propertyName} maxGuests={pub.maxGuests} />

        <section className="apt-faq" aria-labelledby="faq-title">
          <div className="mh-wrap apt-faq-grid"><div><p className="mh-kicker gold" style={{ justifyContent: "left" }}>Helpful Details</p><h2 id="faq-title">Frequently Asked Questions</h2><p>Everything we can confirm about a stay at {pub.propertyName}.</p></div><div>{faqs.map(([question, answer], faqIndex) => <article key={question} className={openFaq === faqIndex ? "is-open" : ""}><button type="button" aria-expanded={openFaq === faqIndex} onClick={() => setOpenFaq(openFaq === faqIndex ? null : faqIndex)}><span>{question}</span><b aria-hidden="true">+</b></button><div><p>{answer}</p></div></article>)}</div></div>
        </section>

        <section className="apt-final-cta">
          <div className="mh-wrap apt-final-cta-copy">
            <p className="mh-kicker gold">{pub.propertyName}</p>
            <h2>Your Highland Escape Awaits</h2>
            <p>
              Book your stay at {pub.propertyName} and enjoy the comfort of a private apartment in the heart of
              Nuwara Eliya.
            </p>
            <Link className="apt-gold-link" to="/contact#booking">
              Book Your Stay <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
