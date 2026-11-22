import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HighlandFooter, HighlandHeader } from "../components/Highland.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const RATING_LABELS = ["", "Disappointing", "Could be better", "Good", "Very good", "Exceptional"];
const PHONE_PATTERN = /^[+0-9() .-]{7,25}$/;

export default function GuestReview() {
  const { token } = useParams();
  const pub = usePublicSettings();
  useSiteTitle("Share Your Experience");

  const [view, setView] = useState("loading");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const shownRating = hoverRating || rating;

  useEffect(() => {
    document.body.classList.add("review-page");
    return () => document.body.classList.remove("review-page");
  }, []);

  useEffect(() => {
    if (!token) {
      setView("form");
      return;
    }
    setView("loading");
    fetch(`/api/review/${encodeURIComponent(token)}`)
      .then((r) => r.json().then((x) => ({ ok: r.ok, status: r.status, x })))
      .then(({ ok, status, x }) => {
        if (status === 410 || x.error === "already_used") {
          setView("unavailable");
          return;
        }
        if (!ok) {
          setView("unavailable");
          return;
        }
        const p = x.prefill || {};
        setDisplayName(p.displayName || "");
        setEmail(p.email || "");
        setPhone(p.phone || "");
        setView("form");
      })
      .catch(() => setView("unavailable"));
  }, [token]);

  const canSubmit = useMemo(() => {
    if (rating < 1 || rating > 5) return false;
    if (title.trim().length < 2) return false;
    if (body.trim().length < 10) return false;
    if (!displayName.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return false;
    if (!phone.trim() || !PHONE_PATTERN.test(phone.trim())) return false;
    if (!consent) return false;
    return true;
  }, [rating, title, body, displayName, email, phone, consent]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!canSubmit) {
      setError(
        "Please complete every field: rating, title, review text, display name, email, phone, and consent.",
      );
      return;
    }
    setBusy(true);
    const payload = {
      rating,
      title: title.trim(),
      body: body.trim(),
      displayName: displayName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      consent: true,
    };
    const url = token ? `/api/review/${encodeURIComponent(token)}` : "/api/review";
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const x = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(x.error || "Could not submit your review.");
      setView("success");
    } catch (err) {
      setError(err.message || "Could not submit your review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <HighlandHeader />
      <main className="review-page-main">
        <section className="review-hero">
          <p className="review-eyebrow">A note from the highlands</p>
          <h1>
            How was your <em>stay?</em>
          </h1>
          <p>
            Thank you for choosing {pub.propertyName}. We&apos;d love to hear about the moments that made your visit
            memorable.
          </p>
        </section>

        <div className="review-shell">
          <aside className="review-aside">
            <p className="review-aside-kicker">Your experience matters</p>
            <h2>Every stay tells a story.</h2>
            <p>Your feedback helps us make Mistwood even more welcoming for future guests.</p>
            <div className="review-aside-rule" />
            <div className="review-feature">
              <span aria-hidden="true">✦</span>
              <p>Just a few minutes to share your experience.</p>
            </div>
            <div className="review-feature">
              <span aria-hidden="true">♡</span>
              <p>We read every review with care.</p>
            </div>
            <div className="review-feature">
              <span aria-hidden="true">✓</span>
              <p>Your feedback is reviewed before appearing publicly.</p>
            </div>
            <div className="review-aside-rule" />
            <p className="review-quote">&ldquo;Where tea hills meet modern comfort.&rdquo;</p>
          </aside>

          <section className="review-form-area">
            {view === "loading" ? <p className="review-loading">Loading your review link…</p> : null}

            {view === "form" ? (
              <div>
                <p className="review-step">Guest review · Step 01 of 01</p>
                <h2>Share your experience</h2>
                <p className="review-lead">
                  Tell us how your time in the hills felt. Your thoughts mean a lot to our team.
                </p>
                <form className="review-form" onSubmit={submit} noValidate>
                  <div className="review-field">
                    <label>
                      Overall, how would you rate your stay? <span aria-hidden="true">*</span>
                    </label>
                    <div className="review-stars" role="group" aria-label="Rate your stay from one to five stars">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={shownRating >= value ? "is-selected" : ""}
                          aria-label={`${value} star${value > 1 ? "s" : ""}`}
                          aria-pressed={rating === value}
                          onClick={() => setRating(value)}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="review-rating-label" aria-live="polite">
                      {rating ? RATING_LABELS[rating] : "Select a rating"}
                    </p>
                  </div>

                  <div className="review-field">
                    <label htmlFor="review-title">Give your review a title *</label>
                    <input
                      id="review-title"
                      type="text"
                      maxLength={100}
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="A peaceful escape in the hills"
                    />
                  </div>

                  <div className="review-field">
                    <label htmlFor="review-text">Tell us about your stay *</label>
                    <textarea
                      id="review-text"
                      maxLength={2000}
                      required
                      minLength={10}
                      rows={6}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="What did you enjoy most? The views, the apartment, the atmosphere..."
                    />
                    <small>Minimum 10 characters · Maximum 2,000 characters</small>
                  </div>

                  <div className="review-field">
                    <label htmlFor="display-name">Name to display with your review *</label>
                    <input
                      id="display-name"
                      type="text"
                      maxLength={80}
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="review-contact-grid">
                    <div className="review-field">
                      <label htmlFor="guest-email">Email address *</label>
                      <input
                        id="guest-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                      <small>Used only to contact you about your feedback.</small>
                    </div>
                    <div className="review-field">
                      <label htmlFor="guest-phone">Contact number *</label>
                      <input
                        id="guest-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={25}
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                      />
                      <small>Include your country code.</small>
                    </div>
                  </div>

                  <label className="review-consent">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
                    <span>
                      I agree that {pub.propertyName} may display my review and chosen display name on its website after
                      moderation.
                    </span>
                  </label>

                  {error ? (
                    <p className="review-error" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button type="submit" className="review-submit" disabled={busy || !canSubmit}>
                    {busy ? "Submitting…" : "Submit My Review →"}
                  </button>
                  <p className="review-privacy">
                    Your contact details are for guest follow-up and should not be published with your review.
                    {token ? " Your review link is personal to your stay." : null}
                  </p>
                </form>
              </div>
            ) : null}

            {view === "success" ? (
              <div className="review-state">
                <p className="review-state-symbol" aria-hidden="true">
                  ✦
                </p>
                <h2>Thank you for sharing.</h2>
                <p>
                  Your review has been received and is awaiting approval. We&apos;re grateful you were part of the
                  Mistwood story.
                </p>
                <Link className="review-state-btn" to="/">
                  Return to {pub.propertyName}
                </Link>
              </div>
            ) : null}

            {view === "unavailable" ? (
              <div className="review-state">
                <p className="review-state-symbol" aria-hidden="true">
                  ◇
                </p>
                <h2>This link is unavailable.</h2>
                <p>This review link has expired or has already been used. You can still leave a review from our website footer.</p>
                <Link className="review-state-btn" to="/review">
                  Leave a review
                </Link>
                <Link className="review-state-link" to="/contact">
                  Contact Mistwood
                </Link>
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <HighlandFooter />
    </>
  );
}