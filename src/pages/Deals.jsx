import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";

const cards = [
  {
    image: "/assets/mistwood/backgrounds/tea-sunrise.png",
    alt: "Sunrise over the tea hills near Nuwara Eliya",
    title: "Your dates",
    text: "Tell us when you would like the apartment. Nothing is held until the owner confirms it.",
  },
  {
    image: "/assets/mistwood/explore/tea-plantations.png",
    alt: "Tea pickers in the plantations near Nuwara Eliya",
    title: "A longer visit",
    text: "If you want more than a few nights, ask whether that changes the rate. No long-stay discount is published here.",
  },
  {
    image: "/assets/mistwood/backgrounds/tea-sunset.png",
    alt: "Sunset light over the tea hills near Nuwara Eliya",
    title: "A short break",
    text: "A shorter stay uses the same booking form. The owner sets the price for the nights you choose.",
  },
];

export default function Deals() {
  useEffect(() => { document.title = "Offers | Mistwood Residence"; }, []);

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker="Special Offers" title="Exclusive Stays" lede="Seasonal notes, without a published discount." crumb="Offers" />
        <section className="offer-band">
          <div className="mh-wrap">
            <p className="offer-lead">No offer is published yet. These cards explain how to ask. They are not prices, and they are not a percentage off.</p>
            <div className="offer-grid">
              {cards.map((card) => (
                <article key={card.title}>
                  <img alt={card.alt} src={card.image} loading="lazy" />
                  <div>
                    <h2>{card.title}</h2>
                    <p>{card.text}</p>
                    <Link className="mh-btn" to="/contact#booking">Request these dates <span aria-hidden="true">→</span></Link>
                  </div>
                </article>
              ))}
            </div>
            <p className="offer-note">The LKR 40,000 figure on the booking page is only an example of a 30 percent deposit. It is not a nightly rate.</p>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
