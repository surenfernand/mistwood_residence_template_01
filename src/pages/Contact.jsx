import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Calendar from "../components/Calendar.jsx";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";

const SAMPLE_TOTAL = 40000;
const DEPOSIT_SHARE = 0.3;

function parseDay(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatStay(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function money(amount) {
  return `LKR ${amount.toLocaleString("en-LK")}`;
}

function isoDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function send(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again or message us on WhatsApp.");
  return data;
}

export default function Contact() {
  const [params] = useSearchParams();
  const initial = useMemo(() => ({
    start: parseDay(params.get("arrive")),
    end: parseDay(params.get("depart")),
  }), [params]);
  const [notice, setNotice] = useState("Choose your arrival and departure dates.");
  const [stay, setStay] = useState(null);
  const [guests, setGuests] = useState(params.get("guests") || "2");
  const [guest, setGuest] = useState({ name: "", email: "", phone: "", note: "", policies: false });
  const [step, setStep] = useState("details");
  const [payNotice, setPayNotice] = useState("");
  const [enquiryNotice, setEnquiryNotice] = useState("");
  const [sending, setSending] = useState(false);
  const payRef = useRef(null);

  useEffect(() => { document.title = "Contact us | Mistwood Residence"; }, []);

  useEffect(() => {
    if (step === "payment") payRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const updateGuest = (event) => {
    const { name, value, type, checked } = event.target;
    setGuest((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const book = async (event) => {
    event.preventDefault();
    if (sending) return;
    if (!stay?.start || !stay?.end) {
      setNotice("Please select your arrival and departure dates.");
      return;
    }
    if (!guest.name.trim() || !guest.email.trim() || !guest.phone.trim()) {
      setNotice("Please add your name, email address, and phone number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) {
      setNotice("Please enter an email address we can reply to.");
      return;
    }
    if (!guest.policies) {
      setNotice("Please confirm you have read the booking notes.");
      return;
    }
    setSending(true);
    setNotice("Saving your booking request…");
    try {
      await send("/api/bookings", {
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        note: guest.note,
        guests,
        arrive: isoDay(stay.start),
        depart: isoDay(stay.end),
      });
    } catch (error) {
      setNotice(error.message);
      return;
    } finally {
      setSending(false);
    }
    setNotice("");
    setPayNotice("Your booking request has been saved. The owner will confirm availability with you.");
    setStep("payment");
  };

  const startPayment = () => {
    setPayNotice("The payment gateway is not connected yet, so this deposit was not charged. Your details stay on this page until you leave it.");
  };

  const enquire = async (event) => {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setSending(true);
    setEnquiryNotice("Sending your message…");
    try {
      await send("/api/enquiries", fields);
      form.reset();
      setEnquiryNotice("Thank you. Your message has been received and we'll reply soon.");
    } catch (error) {
      setEnquiryNotice(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker="Get in Touch" title="Contact Us" lede="We're here to help with your stay." crumb="Contact" />
        <div className="ct-page">
        <section className="ct-panel" id="enquiry">
          <div className="mh-wrap ct-grid">
            <div className="ct-copy" data-reveal="left">
              <p className="mh-kicker gold ct-kicker">Get in touch</p>
              <h2>Let's Plan Your Stay</h2>
              <p>Have a question, need more information, or want to make a booking? Reach out to us — we'll be happy to assist you.</p>
              <ul className="ct-details" data-reveal="stagger">
                <li>
                  <span className="ct-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M8 5.2h1.8l1.1 2.6-1.6 1.1a10.4 10.4 0 0 0 5.8 5.8l1.1-1.6 2.6 1.1V16c0 .8-.7 1.4-1.5 1.3A13.2 13.2 0 0 1 6.7 6.7C6.6 5.9 7.2 5.2 8 5.2Z" /></svg>
                  </span>
                  <div>
                    <span>WhatsApp</span>
                    <a href="https://wa.me/94765900800">+94 76 590 0800</a>
                  </div>
                </li>
                <li>
                  <span className="ct-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></svg>
                  </span>
                  <div>
                    <span>Email</span>
                    <a href="mailto:info@mistwoodresidence.com">info@mistwoodresidence.com</a>
                  </div>
                </li>
                <li>
                  <span className="ct-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.8 12 21 12 21Z" /><circle cx="12" cy="10.6" r="2.1" /></svg>
                  </span>
                  <div>
                    <span>Address</span>
                    <strong>Nuwara Eliya, Sri Lanka.</strong>
                    <small>The exact address will be shared upon booking confirmation.</small>
                  </div>
                </li>
              </ul>
            </div>
            <form className="ct-card" data-reveal="up" onSubmit={enquire}>
              <h2>Send Us a Message</h2>
              <div className="ct-fields">
                <label className="ct-field">
                  <span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.1" /><path d="M5.5 19.2c.8-3 3.2-4.6 6.5-4.6s5.7 1.6 6.5 4.6" /></svg> Your Name <em>*</em></span>
                  <input id="name" name="name" autoComplete="name" placeholder="Enter your name" required />
                </label>
                <label className="ct-field">
                  <span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></svg> Email <em>*</em></span>
                  <input id="email" name="email" type="email" autoComplete="email" placeholder="Enter your email" required />
                </label>
                <label className="ct-field">
                  <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 4.8h2.2l1 2.4-1.5 1a11 11 0 0 0 5.9 5.9l1-1.5 2.4 1v2.2c0 .7-.6 1.3-1.3 1.2A14.2 14.2 0 0 1 6.9 6.1c-.1-.7.5-1.3 1.3-1.3Z" /></svg> Phone Number</span>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+94 …" />
                </label>
                <label className="ct-field">
                  <span>Subject</span>
                  <span className="ct-select">
                    <select id="subject" name="subject" defaultValue="" required>
                      <option value="" disabled>Choose a subject</option>
                      <option>Booking enquiry</option>
                      <option>Availability</option>
                      <option>General question</option>
                      <option>Special request</option>
                    </select>
                  </span>
                </label>
                <label className="ct-field wide">
                  <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6.5h14M5 12h10M5 17.5h7" /></svg> Your Message <em>*</em></span>
                  <textarea id="message" name="message" rows="5" placeholder="Write your message here…" required />
                </label>
              </div>
              <button className="ct-send" type="submit" disabled={sending}>Send Message <span aria-hidden="true">→</span></button>
              <p aria-live="polite" className="notice">{enquiryNotice}</p>
            </form>
          </div>
        </section>

        <section className="ct-book" id="booking">
          <div className="mh-wrap">
            <p className="mh-kicker gold">Book your stay</p>
            <h2>Your Details for the Stay</h2>
            <p className="ct-intro">For the train and what to pack, read the <Link to="/about#practical">practical notes</Link>. This form asks only for the details we need. The amount to pay is shown after you continue, and payment comes after that.</p>
            {step === "details" ? (
            <form className="booking-wrap booking-demo" data-reveal="up" onSubmit={book}>
              <div className="booking-grid">
                <Calendar initialStart={stay?.start || initial.start} initialEnd={stay?.end || initial.end} onChange={setStay} />
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
                <button className="btn" type="submit" disabled={sending}>Continue <span>↗</span></button>
              </div>
              <div className="form-columns">
                <div className="field"><label htmlFor="guest-name">Full name</label><input id="guest-name" name="name" autoComplete="name" placeholder="The name on the booking" required value={guest.name} onChange={updateGuest} /></div>
                <div className="field"><label htmlFor="guest-email">Email address</label><input id="guest-email" name="email" type="email" autoComplete="email" placeholder="Where we should reply" required value={guest.email} onChange={updateGuest} /></div>
                <div className="field"><label htmlFor="guest-phone">Phone number, with country code</label><input id="guest-phone" name="phone" type="tel" autoComplete="tel" placeholder="+94, or your country code" required value={guest.phone} onChange={updateGuest} /></div>
                <div className="field"><label htmlFor="guest-note">Message</label><input id="guest-note" name="note" placeholder="Arrival time or a question" value={guest.note} onChange={updateGuest} /></div>
              </div>
              <label className="check"><input type="checkbox" name="policies" checked={guest.policies} onChange={updateGuest} /> I have read the <Link to="/policies">booking, cancellation, and refund notes</Link>. I understand the owner still has to approve the final terms.</label>
              <p aria-live="polite" className="notice booking-notice">{notice}</p>
            </form>
            ) : (
            <div className="booking-wrap pay-step" ref={payRef}>
              <p className="pay-summary">{formatStay(stay.start)} to {formatStay(stay.end)} · {Math.round((stay.end - stay.start) / 86400000)} night(s) · {guests === "7" ? "7 or more guests" : `${guests} guest${guests === "1" ? "" : "s"}`} · {guest.name}</p>
              <div className="price-panel">
                <span className="eyebrow">Amount to pay now</span>
                <strong>{money(Math.round(SAMPLE_TOTAL * DEPOSIT_SHARE))}</strong>
                <p className="stay-note">Deposit to reserve the apartment, 30 percent of the sample stay. The owner will replace these figures with the live rate.</p>
                <div className="price-row"><span>Sample stay total</span><span>{money(SAMPLE_TOTAL)}</span></div>
                <div className="price-row"><span>Deposit to reserve the apartment, 30%</span><span>{money(Math.round(SAMPLE_TOTAL * DEPOSIT_SHARE))}</span></div>
                <div className="price-row"><span>Balance due at check-in, 70%</span><span>{money(SAMPLE_TOTAL - Math.round(SAMPLE_TOTAL * DEPOSIT_SHARE))}</span></div>
              </div>
              <div className="pay-gateway">
                <span className="eyebrow">Payment gateway</span>
                <h3>Pay the deposit</h3>
                <p>Card details are entered on the payment gateway, not in the form you just filled. The balance stays due at check-in.</p>
                <div className="pay-actions">
                  <button className="btn" type="button" onClick={startPayment}>Pay {money(Math.round(SAMPLE_TOTAL * DEPOSIT_SHARE))} <span>↗</span></button>
                  <button className="pay-back" type="button" onClick={() => { setStep("details"); setPayNotice(""); }}>Edit details</button>
                </div>
              </div>
              <p aria-live="polite" className="notice booking-notice">{payNotice}</p>
            </div>
            )}
          </div>
        </section>

        <section className="ct-map" id="map">
          <div className="mh-wrap">
            <p className="mh-kicker gold">Where to find us</p>
            <h2>The Town, Until the Address Is Confirmed</h2>
            <div className="map-card">
              <iframe className="map-frame" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Nuwara%20Eliya%20Sri%20Lanka&t=&z=11&ie=UTF8&iwloc=&output=embed" title="Map of Nuwara Eliya, Sri Lanka" />
              <div className="map-note"><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Nuwara+Eliya+Sri+Lanka" rel="noopener noreferrer" target="_blank">Open a larger map ↗</a></div>
            </div>
          </div>
        </section>
        </div>
      </main>
      <HighlandFooter />
    </>
  );
}
