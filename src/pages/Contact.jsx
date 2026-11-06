import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Calendar from "../components/Calendar.jsx";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";

function parseDay(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function Contact() {
  const [params] = useSearchParams();
  const initial = useMemo(() => ({
    start: parseDay(params.get("arrive")),
    end: parseDay(params.get("depart")),
  }), [params]);
  const [notice, setNotice] = useState("Choose your arrival and departure dates. This form does not reserve the apartment.");
  const [stay, setStay] = useState(null);
  const [guests, setGuests] = useState(params.get("guests") || "2");

  useEffect(() => { document.title = "Contact us | Mistwood Residence"; }, []);

  const book = (event) => {
    event.preventDefault();
    if (!stay?.start || !stay?.end) {
      setNotice("Please select your arrival and departure dates.");
      return;
    }
    const nights = Math.round((stay.end - stay.start) / 86400000);
    setNotice(`Selected ${nights} night(s) in Sri Lanka time. The departure day is not counted as a night. This preview does not check live availability or take a payment. These dates are not booked, and no payment has been taken. The owner will confirm availability, the rate, and the deposit before bookings open.`);
  };

  const enquire = (event) => {
    event.preventDefault();
    alert("This enquiry is a preview and has not been sent. The owner will add the email address before messages can be delivered.");
  };

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker="Get in Touch" title="Contact Us" lede="We're here to help with your stay." crumb="Contact" />
        <section className="ct-panel" id="enquiry">
          <div className="mh-wrap ct-grid">
            <ul className="ct-details" data-reveal="stagger">
              <li>
                <img alt="" src="/assets/mistwood/icons/whatsapp.png" />
                <span>WhatsApp</span>
                <a href="https://wa.me/94765900800">+94 76 590 0800</a>
              </li>
              <li>
                <img alt="" src="/assets/mistwood/icons/email.png" />
                <span>Email</span>
                <a href="#enquiry">info@mistwoodresidence.com</a>
                <small>The message form on this page does not send email yet.</small>
              </li>
              <li>
                <img alt="" src="/assets/mistwood/icons/pin.png" />
                <span>Address</span>
                <p>Nuwara Eliya, Sri Lanka. The street address is sent when a stay is confirmed.</p>
              </li>
            </ul>
            <form className="ct-form" data-reveal="up" onSubmit={enquire}>
              <label>Your name<input id="name" name="name" autoComplete="name" /></label>
              <label>Email<input id="email" name="email" type="email" autoComplete="email" /></label>
              <label>Phone number<input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+94 …" /></label>
              <label>Subject<input id="subject" name="subject" placeholder="Dates, guests, or a question" /></label>
              <label>Your message<textarea id="message" name="message" rows="5" /></label>
              <button className="mh-btn" type="submit">Send Message <span aria-hidden="true">→</span></button>
              <p>This form does not send the message yet.</p>
            </form>
          </div>
        </section>

        <section className="ct-book" id="booking">
          <div className="mh-wrap">
            <p className="mh-kicker gold ab-kicker">Book your stay</p>
            <h2>Choose dates, then wait for the owner</h2>
            <p className="ct-intro">For the train and what to pack, read the <Link to="/about#practical">practical notes</Link>. Payment is not taken on this preview. The sample total below is an illustration of a deposit, not the live rate.</p>
            <form className="booking-wrap booking-demo" data-reveal="up" onSubmit={book}>
              <div className="booking-grid">
                <Calendar initialStart={initial.start} initialEnd={initial.end} onChange={setStay} />
                <div className="field">
                  <label htmlFor="guests">Number of guests</label>
                  <select id="guests" value={guests} onChange={(event) => setGuests(event.target.value)}>
                    <option value="1">1 guest</option>
                    <option value="2">2 guests</option>
                    <option value="3">3 guests</option>
                    <option value="4">4 guests</option>
                    <option value="5">5 guests</option>
                    <option value="6">6 guests</option>
                    <option value="7">7 or more</option>
                  </select>
                </div>
                <button className="btn" type="submit">Request this stay <span>↗</span></button>
              </div>
              <div className="form-columns">
                <div className="field"><label htmlFor="guest-name">Full name</label><input id="guest-name" name="guest-name" autoComplete="name" placeholder="The name on the booking" /></div>
                <div className="field"><label htmlFor="guest-email">Email address</label><input id="guest-email" name="guest-email" type="email" autoComplete="email" placeholder="Where we should reply" /></div>
                <div className="field"><label htmlFor="guest-phone">Phone number, with country code</label><input id="guest-phone" name="guest-phone" type="tel" autoComplete="tel" placeholder="+94, or your country code" /></div>
                <div className="field"><label htmlFor="guest-note">Message</label><input id="guest-note" name="guest-note" placeholder="Arrival time or a question" /></div>
              </div>
              <label className="check"><input type="checkbox" name="policies" /> I have read the <Link to="/policies">booking, cancellation, and refund notes</Link>. I understand the owner still has to approve the final terms.</label>
              <div className="price-panel">
                <span className="eyebrow">Example only, not a live rate</span>
                <strong>LKR 40,000</strong>
                <p className="stay-note">A sample stay, so you can see how a 30 percent deposit would work. The owner will replace these numbers.</p>
                <div className="price-row"><span>Sample stay total</span><span>LKR 40,000</span></div>
                <div className="price-row"><span>Deposit to reserve the apartment, 30%</span><span>LKR 12,000</span></div>
                <div className="price-row"><span>Balance due at check-in, 70%</span><span>LKR 28,000</span></div>
              </div>
              <p aria-live="polite" className="notice booking-notice">{notice}</p>
            </form>
          </div>
        </section>

        <section className="ab-location" id="map">
          <div className="mh-wrap">
            <p className="mh-kicker gold ab-kicker">Where to find us</p>
            <h2>The town, until the address is confirmed</h2>
            <div className="map-card">
              <iframe className="map-frame" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Nuwara%20Eliya%20Sri%20Lanka&t=&z=11&ie=UTF8&iwloc=&output=embed" title="Map of Nuwara Eliya, Sri Lanka" />
              <div className="map-note"><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Nuwara+Eliya+Sri+Lanka" rel="noopener noreferrer" target="_blank">Open a larger map ↗</a></div>
            </div>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
