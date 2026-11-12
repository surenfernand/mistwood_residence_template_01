import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { Link } from "react-router-dom";
import { usePublicSettings } from "../hooks/usePublicSettings.js";

export default function Policies() {
  const pub = usePublicSettings();
  useSiteTitle("Guest policies");
  return (
    <>
      <section className="hero short">
        <div className="hero-bg" style={{ backgroundImage: 'url("/assets/entry-hall.jpg")' }} />
        <div className="container hero-content">
          <span className="eyebrow reveal">GUEST POLICIES</span>
          <h1 className="reveal delay1">What to know <em className="gold">before you book.</em></h1>
          <p className="reveal delay2">Four policies will sit on this page: privacy, booking, cancellation, and refund. The owner must approve the final wording before it can be treated as the apartment's terms.</p>
        </div>
        <div className="hero-scroll">SCROLL TO EXPLORE</div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <p className="muted reveal">The notes below explain what each policy will cover. They are not legal terms, and they are not a promise of a rate or a refund.</p>
          <article className="policy-block reveal" id="privacy">
            <span className="eyebrow">Privacy</span>
            <h2>How your details are used.</h2>
            <p>A booking will ask for your name, email, phone number with country code, travel dates, and the number of guests. Those details are for the stay and for replies to your enquiry. The owner will approve a privacy policy that says who can see them and how long they are kept. Do not send passport or payment card numbers through the enquiry form.</p>
          </article>
          <article className="policy-block reveal" id="booking-policy">
            <span className="eyebrow">Booking</span>
            <h2>How a stay is reserved.</h2>
            <p>
              You reserve the whole apartment, not a room. Nights are counted in Sri Lanka time, from the arrival date up to, but not including, the departure date.
              Minimum stay: {pub.minNights} night{pub.minNights === 1 ? "" : "s"}
              {pub.maxNights ? ` · maximum ${pub.maxNights} nights` : ""}.
              {pub.requireDeposit === false
                ? " No deposit is collected online when you book."
                : ` A ${pub.depositPercent}% deposit is collected to reserve the apartment, with the balance due at check-in.`}
            </p>
          </article>
          <article className="policy-block reveal" id="cancellation">
            <span className="eyebrow">Cancellation</span>
            <h2>If you need to change the dates.</h2>
            <p>{pub.cancellationPolicy}</p>
          </article>
          <article className="policy-block reveal" id="refund">
            <span className="eyebrow">Refund</span>
            <h2>If money has to be returned.</h2>
            <p>The owner will approve when a deposit or a payment is refunded, including after a cancellation. This preview does not take payment, so there is nothing to refund from the website itself. Any future refund will follow the approved policy and the payment service the owner chooses.</p>
          </article>
          <p className="reveal"><Link className="btn" to="/contact#booking">Back to booking <span>↗</span></Link></p>
        </div>
      </section>
    </>
  );
}
