import { useState } from "react";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { addDays, isoDay } from "../utils/adminDates.js";
import Calendar from "../components/Calendar.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";

const dateFromIso = (value) => new Date(`${value}T12:00:00+05:30`);
const isoFromDate = (value) => value ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(value) : "";

export default function AdminBookingCreate() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pub = usePublicSettings();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "2",
    sendConfirmation: true,
  });
  const [stay, setStay] = useState(() => ({
    start: dateFromIso(addDays(isoDay(), 7)),
    end: dateFromIso(addDays(isoDay(), 10)),
  }));

  useSiteTitle("Create booking ");

  const update = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!stay.start || !stay.end) throw new Error("Choose both check-in and check-out dates.");
      const r = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, checkIn: isoFromDate(stay.start), checkOut: isoFromDate(stay.end) }),
      });
      const x = await r.json();
      if (r.status === 401) return navigate("/admin/login", { replace: true });
      if (!r.ok) throw Error(x.error);
      navigate("/admin/booking-requests", { replace: true });
    } catch (err) {
      setError(err.message || "Could not create booking.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-app booking-admin">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Create booking</h1>
            <span>Add a phone or walk-in reservation and block the calendar.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="booking-requests-page" style={{ maxWidth: 980 }}>
          <section className="booking-wrap" style={{ marginTop: 22 }}>
            <p>
              <Link to="/admin/booking-requests">← Back to booking requests</Link>
            </p>
            <p className="muted">Choose the stay dates, then add the guest details to create a confirmed reservation.</p>
            <form className="booking-demo" onSubmit={submit}>
              <fieldset className="booking-fields" disabled={busy}>
              <div className="booking-grid">
                <Calendar
                  modal
                  initialStart={stay.start}
                  initialEnd={stay.end}
                  bookingRules={{
                    minNights: pub.minNights,
                    maxNights: pub.maxNights,
                    sameDayBooking: true,
                    advanceBookingDays: pub.advanceBookingDays,
                    leadTimeHours: 0,
                    checkInTime: pub.checkInTime,
                  }}
                  onRuleNotice={setError}
                  onChange={setStay}
                />
                <div className="field">
                  <label htmlFor="admin-booking-guests">Number of guests</label>
                  <select id="admin-booking-guests" value={form.guests} onChange={update("guests")}>
                    {Array.from({ length: Math.max(1, Number(pub.maxGuests) || 8) }, (_, index) => index + 1).map((number) => (
                      <option key={number} value={String(number)}>{number === 1 ? "1 guest" : `${number} guests`}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn" disabled={busy}>{busy ? "Saving…" : "Create confirmed stay"} <span>↗</span></button>
              </div>
              <div className="form-columns">
                <div className="field"><label htmlFor="admin-booking-name">Full name</label><input id="admin-booking-name" required autoComplete="name" placeholder="Guest name" value={form.name} onChange={update("name")} /></div>
                <div className="field"><label htmlFor="admin-booking-email">Email address</label><input id="admin-booking-email" required type="email" autoComplete="email" placeholder="guest@example.com" value={form.email} onChange={update("email")} /></div>
                <div className="field"><label htmlFor="admin-booking-phone">Phone number</label><input id="admin-booking-phone" autoComplete="tel" placeholder="Optional" value={form.phone} onChange={update("phone")} /></div>
              </div>
              <label className="check"><input type="checkbox" checked={form.sendConfirmation} onChange={(event) => setForm((current) => ({ ...current, sendConfirmation: event.target.checked }))} /> Send the standard booking-confirmation email and QR code to this guest.</label>
              {error ? <p className="booking-error">{error}</p> : null}
              </fieldset>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
