import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Calendar from "../components/Calendar.jsx";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { formatSettingsTime } from "../utils/formatSettingsTime.js";
import { validateStayRange } from "../utils/bookingDateRules.js";
import { getOfferEligibility } from "../utils/offerEligibility.js";
import { formatOfferPeriod } from "../utils/offerPeriod.js";

function submitPayhereForm(checkoutUrl, fields) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

function parseDay(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatStay(date) {
  if (!date || Number.isNaN(date.getTime?.())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function money(amount) {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) return "LKR —";
  try {
    return `LKR ${value.toLocaleString("en-LK")}`;
  } catch {
    return `LKR ${Math.round(value)}`;
  }
}

function isoDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function guestLabel(guests) {
  return `${guests} guest${guests === "1" ? "" : "s"}`;
}

function isInternationalPhone(value) {
  return /^\+[1-9]\d{7,14}$/.test(String(value || "").replace(/[\s().-]/g, ""));
}

function BookingDialog({ titleId, title, kicker, busy = false, onDismiss, children }) {
  const panelRef = useRef(null);
  const busyRef = useRef(busy);
  const dismissRef = useRef(onDismiss);
  busyRef.current = busy;
  dismissRef.current = onDismiss;

  useEffect(() => {
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement;
    panel?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        if (!busyRef.current) dismissRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll("button, [href], input, select, textarea")].filter((el) => !el.disabled);
      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, []);

  useEffect(() => {
    if (busy) panelRef.current?.focus();
  }, [busy]);

  return (
    <div className="booking-dialog-overlay">
      <div
        ref={panelRef}
        className="booking-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        tabIndex={-1}
      >
        <p className="mh-kicker gold">{kicker}</p>
        <h3 id={titleId}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function OfferBannerIcon({ name }) {
  if (name === "family") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8.5" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="9.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4.5 18c.8-2.8 3-4.5 5.5-4.5s4.7 1.7 5.5 4.5M13 18c.5-2 2.2-3.2 4-3.2 1.4 0 2.7.8 3.3 2.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-6.8-4.4-8.6-8.2C2.1 8.6 4.6 5.5 8 6.4c1.4.4 2.4 1.4 4 3 1.6-1.6 2.6-2.6 4-3 3.4-.9 5.9 2.2 4.6 5.4C18.8 15.6 12 20 12 20Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "moon") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.5 14.8a7.5 7.5 0 0 1-9.3-9.3 6.8 6.8 0 1 0 9.3 9.3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "tag") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12.5V6.8A2.8 2.8 0 0 1 6.8 4h5.7a2.8 2.8 0 0 1 2 1l7.7 7.7a2.8 2.8 0 0 1 0 4l-4.9 4.9a2.8 2.8 0 0 1-4 0L4 12.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="9.2" cy="9.2" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 2.2 5.6L20 9.3l-4.5 3.8 1.5 5.8L12 16.2l-5 2.7 1.5-5.8L4 9.3l5.8-.7L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function offerMarkIcon(imageKey) {
  if (imageKey === "family-getaway") return "family";
  if (imageKey === "romantic-retreat") return "heart";
  if (imageKey === "festive-holiday") return "tag";
  return "star";
}

function SelectedOfferBanner({ offer, eligible, reasons, onRemove }) {
  const validity = formatOfferPeriod(offer.startDate, offer.endDate);
  const minLabel = `Min. ${offer.minNights} night${offer.minNights === 1 ? "" : "s"}`;

  return (
    <article className={`booking-offer-banner${eligible === false ? " is-warning" : ""}`}>
      <img
        className="booking-offer-banner-leaf"
        src="/assets/mistwood/decorations/leaf-branch.png"
        alt=""
        aria-hidden="true"
      />
      <button type="button" className="booking-offer-banner-close" aria-label="Remove this offer" onClick={onRemove}>
        ×
      </button>
      <div className="booking-offer-banner-media">
        {offer.imageUrl ? (
          <img className="booking-offer-banner-photo" src={offer.imageUrl} alt="" />
        ) : (
          <div className="booking-offer-banner-photo is-empty" aria-hidden="true" />
        )}
        <span className="booking-offer-banner-chip">
          <OfferBannerIcon name="tag" />
          Selected offer
        </span>
      </div>
      <div className="booking-offer-banner-body">
        <div className="booking-offer-banner-head">
          <span className="booking-offer-banner-mark" aria-hidden="true">
            <OfferBannerIcon name={offerMarkIcon(offer.imageKey)} />
          </span>
          <div className="booking-offer-banner-titles">
            <h3>{offer.name}</h3>
            {offer.description ? <p className="booking-offer-banner-desc">{offer.description}</p> : null}
          </div>
        </div>
        <div className="booking-offer-banner-stats" role="list">
          <div className="booking-offer-banner-stat" role="listitem">
            <span className="booking-offer-banner-stat-icon" aria-hidden="true">
              <OfferBannerIcon name="tag" />
            </span>
            <span className="booking-offer-banner-stat-copy">
              <strong>{offer.discountPercent}% off</strong>
              <span>qualifying nights</span>
            </span>
          </div>
          <div className="booking-offer-banner-stat" role="listitem">
            <span className="booking-offer-banner-stat-icon" aria-hidden="true">
              <OfferBannerIcon name="calendar" />
            </span>
            <span className="booking-offer-banner-stat-copy">
              <strong>Valid</strong>
              <span>{validity}</span>
            </span>
          </div>
          <div className="booking-offer-banner-stat" role="listitem">
            <span className="booking-offer-banner-stat-icon" aria-hidden="true">
              <OfferBannerIcon name="moon" />
            </span>
            <span className="booking-offer-banner-stat-copy">
              <strong>{minLabel}</strong>
            </span>
          </div>
        </div>
        {eligible === false && reasons?.length ? (
          <p className="booking-offer-banner-alert is-warning" role="status">
            <span className="booking-offer-banner-alert-icon" aria-hidden="true">!</span>
            <span>{reasons.join(" ")}</span>
          </p>
        ) : (
          <p className="booking-offer-banner-alert" role="status">
            <span className="booking-offer-banner-alert-icon" aria-hidden="true">i</span>
            <span>
              <strong>Your total</strong> updates when dates match this offer.
            </span>
          </p>
        )}
      </div>
    </article>
  );
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
  const pub = usePublicSettings();
  const [params, setSearchParams] = useSearchParams();
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerIneligibleReasons, setOfferIneligibleReasons] = useState([]);
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
  const [enquiryDraft, setEnquiryDraft] = useState(null);
  const [sending, setSending] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [confirmError, setConfirmError] = useState("");
  const [quote, setQuote] = useState(null);
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const payRef = useRef(null);
  const enquiryFormRef = useRef(null);

  useSiteTitle("Contact us");

  const bookingRules = useMemo(
    () => ({
      minNights: Number(pub.minNights) || 1,
      maxNights: pub.maxNights != null ? Number(pub.maxNights) : null,
      sameDayBooking: pub.sameDayBooking !== false,
      advanceBookingDays: pub.advanceBookingDays != null ? Number(pub.advanceBookingDays) : null,
      leadTimeHours: Number(pub.leadTimeHours) || 0,
      checkInTime: pub.checkInTime || "14:00",
    }),
    [pub],
  );

  const offerParam = params.get("offer");

  const clearSelectedOffer = useCallback(() => {
    setSelectedOffer(null);
    setOfferIneligibleReasons([]);
    const next = new URLSearchParams(params);
    next.delete("offer");
    setSearchParams(next, { replace: true });
  }, [params, setSearchParams]);

  useEffect(() => {
    if (!offerParam) {
      setSelectedOffer(null);
      setOfferLoading(false);
      return;
    }
    let active = true;
    setOfferLoading(true);
    fetch("/api/offers")
      .then((r) => (r.ok ? r.json() : { offers: [] }))
      .then((data) => {
        if (!active) return;
        const found = (data.offers || []).find((row) => String(row.id) === String(offerParam));
        setSelectedOffer(found || null);
      })
      .catch(() => {
        if (active) setSelectedOffer(null);
      })
      .finally(() => {
        if (active) setOfferLoading(false);
      });
    return () => {
      active = false;
    };
  }, [offerParam]);

  useEffect(() => {
    const shouldFocusBooking = Boolean(offerParam) || window.location.hash === "#booking";
    if (!shouldFocusBooking) return undefined;
    const focusBooking = () => {
      const form = document.querySelector(".ct-book .booking-wrap");
      if (form) {
        form.classList.add("is-in");
        form.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const timer = window.setTimeout(focusBooking, offerParam && offerLoading ? 280 : 120);
    return () => window.clearTimeout(timer);
  }, [offerParam, offerLoading, selectedOffer?.id]);

  useEffect(() => {
    const status = params.get("payment");
    if (status !== "return") return;
    setPayNotice("Thank you — if your payment succeeded, a confirmation email will arrive shortly.");
    if (stay?.start && stay?.end) {
      setStep("payment");
      return;
    }
    setStep("details");
  }, [params, stay?.start, stay?.end]);

  const offerEligibility = useMemo(() => {
    if (!selectedOffer || !stay?.start || !stay?.end) return { eligible: null, reasons: [] };
    return getOfferEligibility(selectedOffer, isoDay(stay.start), isoDay(stay.end));
  }, [selectedOffer, stay]);

  useEffect(() => {
    if (!stay?.start || !stay?.end) {
      setQuote(null);
      return;
    }
    const arrive = isoDay(stay.start);
    const depart = isoDay(stay.end);
    const controller = new AbortController();
    const qs = new URLSearchParams({ arrive, depart });
    if (selectedOffer?.id) qs.set("offerId", String(selectedOffer.id));
    let active = true;
    fetch(`/api/pricing/quote?${qs}`, { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || "Could not price this stay.");
        return data;
      })
      .then((data) => {
        if (!active) return;
        if (data?.total == null) {
          setQuote(null);
          return;
        }
        setQuote(data);
        setNotice("");
      })
      .catch((err) => {
        if (!active) return;
        setQuote(null);
        if (err.name !== "AbortError") setNotice(err.message || "Could not price this stay.");
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [stay, selectedOffer?.id]);

  useEffect(() => {
    if (step === "payment") payRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const updateGuest = (event) => {
    const { name, value, type, checked } = event.target;
    setGuest((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const dismissDialog = useCallback(() => {
    if (sending) return;
    setDialog(null);
    setConfirmError("");
  }, [sending]);

  const book = (event) => {
    event.preventDefault();
    if (sending || dialog) return;
    if (!stay?.start || !stay?.end) {
      setNotice("Please select your arrival and departure dates.");
      return;
    }
    const rangeErr = validateStayRange(isoDay(stay.start), isoDay(stay.end), bookingRules);
    if (rangeErr) {
      setNotice(rangeErr);
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
    if (!isInternationalPhone(guest.phone)) {
      setNotice("Please enter a phone number with a country code, for example +94 76 590 0800.");
      return;
    }
    if (!guest.policies) {
      setNotice("Please confirm you have read the booking notes.");
      return;
    }
    if (selectedOffer) {
      const check = getOfferEligibility(selectedOffer, isoDay(stay.start), isoDay(stay.end));
      if (!check.eligible) {
        setOfferIneligibleReasons(check.reasons);
        setConfirmError("");
        setDialog("offer-ineligible");
        return;
      }
    }
    setNotice("");
    setConfirmError("");
    setDialog("confirm");
  };

  const proceedWithoutOffer = () => {
    clearSelectedOffer();
    setDialog("confirm");
    setOfferIneligibleReasons([]);
  };

  const confirmBooking = async () => {
    if (sending || !stay?.start || !stay?.end) return;
    setSending(true);
    setConfirmError("");
    let data;
    try {
      const payload = {
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        note: guest.note,
        guests,
        arrive: isoDay(stay.start),
        depart: isoDay(stay.end),
      };
      if (selectedOffer?.id && offerEligibility.eligible !== false) {
        payload.offerId = selectedOffer.id;
      }
      data = await send("/api/bookings", payload);
      setQuote(data.quote);
      setPaymentOrderId(data.paymentOrderId);
    } catch (error) {
      setConfirmError(error.message);
      setSending(false);
      return;
    }
    setSending(false);
    setNotice("");
    setPayNotice("");
    if (!data.quote?.requireDeposit || Number(data.quote?.depositAmount) <= 0) {
      setPayNotice("Your booking request is recorded. No deposit is required — we will confirm by email.");
      setStep("details");
    } else {
      setStep("payment");
    }
    setDialog(null);
  };

  const startPayment = async () => {
    if (!paymentOrderId) {
      setPayNotice("Please complete the booking form first.");
      return;
    }
    setPayNotice("");
    try {
      const r = await fetch("/api/payments/payhere/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: paymentOrderId, purpose: "deposit" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Payment could not start.");
      submitPayhereForm(data.checkoutUrl, data.fields);
    } catch (error) {
      setPayNotice(error.message);
    }
  };

  const enquire = (event) => {
    event.preventDefault();
    if (sending || dialog) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const draft = {
      name: String(fields.name || "").trim(),
      email: String(fields.email || "").trim(),
      phone: String(fields.phone || "").trim(),
      subject: String(fields.subject || "").trim(),
      message: String(fields.message || "").trim(),
    };
    if (!draft.name || !draft.email || !draft.subject || !draft.message) {
      setEnquiryNotice("Please add your name, email, subject, and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      setEnquiryNotice("Please enter an email address we can reply to.");
      return;
    }
    setEnquiryNotice("");
    setConfirmError("");
    setEnquiryDraft(draft);
    setDialog("enquiry-confirm");
  };

  const confirmEnquiry = async () => {
    if (sending || !enquiryDraft) return;
    setSending(true);
    setConfirmError("");
    try {
      await send("/api/enquiries", enquiryDraft);
    } catch (error) {
      setConfirmError(error.message);
      setSending(false);
      return;
    }
    setSending(false);
    enquiryFormRef.current?.reset();
    setEnquiryNotice("");
    setDialog("enquiry-success");
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
                    <a href={pub.whatsappUrl}>{pub.contactPhone}</a>
                  </div>
                </li>
                <li>
                  <span className="ct-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></svg>
                  </span>
                  <div>
                    <span>Email</span>
                    <a href={`mailto:${pub.contactEmail}`}>{pub.contactEmail}</a>
                  </div>
                </li>
                <li>
                  <span className="ct-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.8 12 21 12 21Z" /><circle cx="12" cy="10.6" r="2.1" /></svg>
                  </span>
                  <div>
                    <span>Address</span>
                    <strong>{pub.publicAddress}</strong>
                    <small>The exact address will be shared upon booking confirmation.</small>
                  </div>
                </li>
              </ul>
            </div>
            <form ref={enquiryFormRef} className="ct-card" data-reveal="up" onSubmit={enquire}>
              <h2>Send Us a Message</h2>
              <fieldset className="ct-fields" disabled={sending}>
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
              </fieldset>
              <button className="ct-send" type="submit" disabled={sending || Boolean(dialog)}>Send Message <span aria-hidden="true">→</span></button>
              <p aria-live="polite" className="notice">{enquiryNotice}</p>
            </form>
          </div>
        </section>

        <section className="ct-book" id="booking">
          <div className="mh-wrap">
            <p className="mh-kicker gold">Book your stay</p>
            <h2>Your Details for the Stay</h2>
         
            {offerLoading && offerParam ? (
              <p className="booking-offer-banner-note" role="status">
                Loading your selected offer…
              </p>
            ) : null}
            {!offerLoading && offerParam && !selectedOffer ? (
              <p className="booking-offer-banner-warn" role="status">
                That offer is no longer available.{" "}
                <Link to="/deals">Browse current deals</Link> or continue without an offer.
              </p>
            ) : null}
            {selectedOffer ? (
              <SelectedOfferBanner
                offer={selectedOffer}
                eligible={stay?.start && stay?.end ? offerEligibility.eligible : null}
                reasons={offerEligibility.reasons}
                onRemove={clearSelectedOffer}
              />
            ) : null}
            {step === "details" ? (
            <form className="booking-wrap booking-demo" onSubmit={book}>
              <fieldset className="booking-fields" disabled={sending}>
              <div className="booking-grid">
                <Calendar
                  initialStart={stay?.start || initial.start}
                  initialEnd={stay?.end || initial.end}
                  bookingRules={bookingRules}
                  onRuleNotice={setNotice}
                  onChange={setStay}
                />
                <div className="field">
                  <label htmlFor="guests">Number of guests</label>
                  <select id="guests" value={guests} onChange={(event) => setGuests(event.target.value)}>
                    {Array.from({ length: Math.max(1, Number(pub.maxGuests) || 8) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>{n === 1 ? "1 guest" : `${n} guests`}</option>
                    ))}
                  </select>
                </div>
                <button className="btn" type="submit" disabled={sending}>Continue <span>↗</span></button>
              </div>
              <div className="form-columns">
                <div className="field"><label htmlFor="guest-name">Full name</label><input id="guest-name" name="name" autoComplete="name" placeholder="The name on the booking" required value={guest.name} onChange={updateGuest} /></div>
                <div className="field"><label htmlFor="guest-email">Email address</label><input id="guest-email" name="email" type="email" autoComplete="email" placeholder="Where we should reply" required value={guest.email} onChange={updateGuest} /></div>
                <div className="field"><label htmlFor="guest-phone">Phone number, with country code</label><input id="guest-phone" name="phone" type="tel" autoComplete="tel" placeholder="+94 76 590 0800" pattern="\+[1-9][0-9\s().-]{7,18}" title="Use a phone number with a country code, for example +94 76 590 0800." required value={guest.phone} onChange={updateGuest} /></div>
                <div className="field"><label htmlFor="guest-note">Message</label><input id="guest-note" name="note" placeholder="Arrival time or a question" value={guest.note} onChange={updateGuest} /></div>
              </div>
              <label className="check"><input type="checkbox" name="policies" checked={guest.policies} onChange={updateGuest} /> I have read the <Link to="/policies">booking, cancellation, and refund notes</Link>.</label>
              {Number.isFinite(Number(quote?.total)) ? (
                <p className="notice booking-notice" aria-live="polite">
                  {quote.nights} night(s) · {money(quote.total)} total
                  {quote.appliedOffer?.name ? ` · ${quote.appliedOffer.name} applied` : ""}
                  {quote.requireDeposit && Number(quote.depositAmount) > 0
                    ? ` · ${money(quote.depositAmount)} deposit (${quote.depositPercent ?? 0}%)`
                    : " · no deposit due now"}
                </p>
              ) : null}
              <p aria-live="polite" className="notice booking-notice">{notice}</p>
              </fieldset>
            </form>
            ) : stay?.start && stay?.end ? (
            <div className="booking-wrap pay-step" ref={payRef}>
              <p className="pay-summary">{formatStay(stay.start)} to {formatStay(stay.end)} · {Math.round((stay.end - stay.start) / 86400000)} night(s) · {guestLabel(guests)} · {guest.name}</p>
              <div className="price-panel">
                <span className="eyebrow">Amount to pay now</span>
                <strong>{money(quote?.depositAmount || 0)}</strong>
                <p className="stay-note">
                  {quote?.requireDeposit && (quote?.depositAmount || 0) > 0
                    ? `Deposit to reserve the apartment (${quote.depositPercent}% of your stay total).`
                    : "No deposit is required for this stay."}
                </p>
                <div className="price-row"><span>Stay total</span><span>{money(quote?.total || 0)}</span></div>
                <div className="price-row"><span>Deposit now</span><span>{money(quote?.depositAmount || 0)}</span></div>
                <div className="price-row"><span>Balance due</span><span>{money(quote?.balanceDue || 0)}</span></div>
              </div>
              <div className="pay-gateway">
                <span className="eyebrow">Payment gateway</span>
                <h3>{quote?.requireDeposit && (quote?.depositAmount || 0) > 0 ? "Pay the deposit" : "Booking total"}</h3>
                <p>
                  {quote?.requireDeposit && (quote?.depositAmount || 0) > 0
                    ? "Card details are entered on the payment gateway, not in the form you just filled. The balance stays due at check-in."
                    : "Your request is saved. We will confirm your stay by email — no online deposit for this property."}
                </p>
                <div className="pay-actions">
                  {quote?.requireDeposit && (quote?.depositAmount || 0) > 0 ? (
                  <button className="btn" type="button" onClick={startPayment}>Pay {money(quote?.depositAmount || 0)} <span>↗</span></button>
                  ) : null}
                  <button className="pay-back" type="button" onClick={() => { setStep("details"); setPayNotice(""); }}>Edit details</button>
                </div>
              </div>
              <p aria-live="polite" className="notice booking-notice">{payNotice}</p>
            </div>
            ) : (
            <div className="booking-wrap pay-step">
              <p className="notice booking-notice" role="status">
                Your session expired or this page was opened without stay details. Choose dates again to continue booking.
              </p>
              <button className="pay-back" type="button" onClick={() => { setStep("details"); setPayNotice(""); }}>
                Back to booking form
              </button>
              {payNotice ? <p aria-live="polite" className="notice booking-notice">{payNotice}</p> : null}
            </div>
            )}
          </div>
        </section>

       
        </div>
      </main>
      <HighlandFooter />
      {dialog === "offer-ineligible" ? (
        <BookingDialog
          titleId="offer-ineligible-title"
          title="Offer not eligible for this stay"
          kicker="Adjust or continue"
          onDismiss={dismissDialog}
        >
          <p className="booking-dialog-lead">
            This reservation does not meet the requirements for <strong>{selectedOffer?.name}</strong>. You can
            go back and change your dates, or continue without the offer.
          </p>
          <ul className="booking-dialog-bullets">
            {offerIneligibleReasons.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="booking-dialog-actions">
            <button className="booking-dialog-cancel" type="button" onClick={dismissDialog}>
              No, keep editing
            </button>
            <button className="btn" type="button" onClick={proceedWithoutOffer}>
              Yes, remove offer and continue
            </button>
          </div>
        </BookingDialog>
      ) : null}
      {dialog === "confirm" && stay?.start && stay?.end ? (
        <BookingDialog titleId="booking-confirm-title" title="Confirm your stay" kicker="Review before sending" busy={sending} onDismiss={dismissDialog}>
          <p className="booking-dialog-lead">Check the dates and contact details below. Nothing is sent until you choose Continue.</p>
          <dl className="booking-dialog-list">
            <div><dt>Arrival</dt><dd>{formatStay(stay.start)}</dd></div>
            <div><dt>Departure</dt><dd>{formatStay(stay.end)}</dd></div>
            <div><dt>Nights</dt><dd>{Math.round((stay.end - stay.start) / 86400000)}</dd></div>
            <div><dt>Guests</dt><dd>{guestLabel(guests)}</dd></div>
            <div><dt>Full name</dt><dd>{guest.name.trim()}</dd></div>
            <div><dt>Email</dt><dd>{guest.email.trim()}</dd></div>
            <div><dt>Phone</dt><dd>{guest.phone.trim()}</dd></div>
            {guest.note.trim() ? <div><dt>Message</dt><dd>{guest.note.trim()}</dd></div> : null}
            {selectedOffer ? (
              <div>
                <dt>Offer</dt>
                <dd>{selectedOffer.name}</dd>
              </div>
            ) : null}
          </dl>
          {sending ? (
            <div className="booking-dialog-loading" role="status">
              <span className="booking-spinner" aria-hidden="true" />
              <span>Saving your reservation…</span>
            </div>
          ) : null}
          {confirmError ? <p className="booking-dialog-error" role="alert">{confirmError}</p> : null}
          <div className="booking-dialog-actions">
            <button className="booking-dialog-cancel" type="button" onClick={dismissDialog} disabled={sending}>Cancel</button>
            <button className="btn" type="button" onClick={confirmBooking} disabled={sending}>Continue <span aria-hidden="true">↗</span></button>
          </div>
        </BookingDialog>
      ) : null}
      {dialog === "enquiry-confirm" && enquiryDraft ? (
        <BookingDialog titleId="enquiry-confirm-title" title="Confirm your message" kicker="Review before sending" busy={sending} onDismiss={dismissDialog}>
          <p className="booking-dialog-lead">Check the details below. Nothing is sent until you choose Continue.</p>
          <dl className="booking-dialog-list">
            <div><dt>Name</dt><dd>{enquiryDraft.name}</dd></div>
            <div><dt>Email</dt><dd>{enquiryDraft.email}</dd></div>
            <div><dt>Phone</dt><dd>{enquiryDraft.phone || "Not provided"}</dd></div>
            <div><dt>Subject</dt><dd>{enquiryDraft.subject}</dd></div>
            <div><dt>Message</dt><dd>{enquiryDraft.message}</dd></div>
          </dl>
          {sending ? (
            <div className="booking-dialog-loading" role="status">
              <span className="booking-spinner" aria-hidden="true" />
              <span>Sending your message…</span>
            </div>
          ) : null}
          {confirmError ? <p className="booking-dialog-error" role="alert">{confirmError}</p> : null}
          <div className="booking-dialog-actions">
            <button className="booking-dialog-cancel" type="button" onClick={dismissDialog} disabled={sending}>Cancel</button>
            <button className="btn" type="button" onClick={confirmEnquiry} disabled={sending}>Continue <span aria-hidden="true">↗</span></button>
          </div>
        </BookingDialog>
      ) : null}
      {dialog === "enquiry-success" ? (
        <BookingDialog titleId="enquiry-success-title" title="Thank you" kicker="Message received" onDismiss={dismissDialog}>
          <p className="booking-dialog-lead">We have received your message. Please check your email for our reply.</p>
          <div className="booking-dialog-actions">
            <button className="btn" type="button" onClick={dismissDialog}>Close</button>
          </div>
        </BookingDialog>
      ) : null}
    </>
  );
}
