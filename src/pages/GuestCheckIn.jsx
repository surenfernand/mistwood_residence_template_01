import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HighlandFooter, HighlandHeader } from "../components/Highland.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const STATUS_LABELS = {
  confirmed: "Confirmed",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelled",
};

function formatDay(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "—";
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function statusLabel(status) {
  return STATUS_LABELS[status] || String(status || "—").replace(/_/g, " ");
}

export default function GuestCheckIn() {
  const { token } = useParams();
  const pub = usePublicSettings();
  useSiteTitle("Guest Check-in");

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("review-page", "check-in-page");
    return () => document.body.classList.remove("review-page", "check-in-page");
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Check-in link invalid.");
      return;
    }
    setLoading(true);
    setError("");
    fetch(`/api/check-in/${encodeURIComponent(token)}`, { credentials: "include" })
      .then((r) => r.json().then((x) => ({ ok: r.ok, x })))
      .then(({ ok, x }) => {
        if (!ok) {
          if (x.error === "Please sign in to access the admin panel.") {
            throw new Error(
              "This QR code is for hotel staff only. Please show it to a staff member when you arrive.",
            );
          }
          throw new Error(x.error || "Check-in link invalid.");
        }
        setData(x);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const checkIn = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/check-in/${encodeURIComponent(token)}`, { method: "POST", credentials: "include" });
      const x = await r.json();
      if (!r.ok) throw new Error(x.error || "Check-in failed.");
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const booking = data?.booking;
  const currentStatus = done ? "checked_in" : booking?.status;

  return (
    <>
      <HighlandHeader />
      <main className="review-page-main">
        <section className="review-hero">
          <p className="review-eyebrow">Arrival in the highlands</p>
          <h1>
            <em>Guest check-in</em>
          </h1>
          <p>
            Welcome to {pub.propertyName}. Staff use this page to confirm your arrival and begin your stay in the hills.
          </p>
        </section>

        <div className="review-shell">
          <aside className="review-aside">
            <p className="review-aside-kicker">Before you settle in</p>
            <h2>We&apos;re ready for you.</h2>
            <p>Scanning the QR from your confirmation email opens this secure staff check-in for your booking.</p>
            <div className="review-aside-rule" />
            <div className="review-feature">
              <span aria-hidden="true">✦</span>
              <p>Show this screen to reception or scan with a signed-in staff device.</p>
            </div>
            <div className="review-feature">
              <span aria-hidden="true">◇</span>
              <p>Guests enjoy the views — staff complete the check-in step here.</p>
            </div>
          </aside>

          <section className="review-form-area check-in-panel" aria-labelledby="check-in-title">
            {loading ? (
              <p className="review-loading booking-dialog-loading" role="status">
                <span className="booking-spinner" aria-hidden="true" />
                Loading booking details…
              </p>
            ) : null}

            {!loading && error && !booking ? (
              <div className="review-state">
                <p className="review-state-symbol" aria-hidden="true">
                  ◇
                </p>
                <h2 id="check-in-title">Unable to load check-in</h2>
                <p>{error}</p>
                <Link className="review-state-btn" to="/contact">
                  Contact {pub.propertyName}
                </Link>
                <Link className="review-state-link" to="/">
                  Return home
                </Link>
              </div>
            ) : null}

            {booking ? (
              <div>
                <p className="review-step">Staff check-in</p>
                <h2 id="check-in-title">Booking overview</h2>
                <p className="review-lead">
                  Confirm the details below, then complete check-in when the guest arrives.
                </p>

                <dl className="booking-dialog-list check-in-details">
                  <div>
                    <dt>Guest</dt>
                    <dd>{booking.guestName}</dd>
                  </div>
                  <div>
                    <dt>Arrival</dt>
                    <dd>{formatDay(booking.checkIn)}</dd>
                  </div>
                  <div>
                    <dt>Departure</dt>
                    <dd>{formatDay(booking.checkOut)}</dd>
                  </div>
                  {booking.guests ? (
                    <div>
                      <dt>Guests</dt>
                      <dd>{booking.guests}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <span className={`check-in-status is-${currentStatus}`}>{statusLabel(currentStatus)}</span>
                    </dd>
                  </div>
                </dl>

                {error ? (
                  <p className="review-error" role="alert">
                    {error}
                  </p>
                ) : null}

                {done ? (
                  <div className="review-state" style={{ paddingTop: 8 }}>
                    <p className="review-state-symbol" aria-hidden="true">
                      ✦
                    </p>
                    <h2>Guest checked in</h2>
                    <p>{booking.guestName} is now marked as checked in. Enjoy the highlands.</p>
                    <Link className="review-state-btn" to="/admin/booking-requests">
                      Open admin bookings
                    </Link>
                  </div>
                ) : booking.status === "confirmed" && data.adminSignedIn ? (
                  <button type="button" className="review-submit" onClick={checkIn} disabled={busy}>
                    {busy ? "Confirming…" : "Confirm check-in →"}
                  </button>
                ) : booking.status === "confirmed" ? (
                  <p className="review-privacy">
                    Staff must{" "}
                    <Link to="/admin/login">sign in to admin</Link> on this device, then return here to confirm
                    check-in.
                  </p>
                ) : (
                  <p className="review-privacy">This stay is already {statusLabel(booking.status).toLowerCase()}.</p>
                )}
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <HighlandFooter />
    </>
  );
}