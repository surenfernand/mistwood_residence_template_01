import { useEffect, useState } from "react";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { addDays, isoDay } from "../utils/adminDates.js";

export default function AdminBookingCreate() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "2",
    checkIn: addDays(isoDay(), 7),
    checkOut: addDays(isoDay(), 10),
  });

  useSiteTitle("Create booking ");

  const update = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <div className="booking-requests-page" style={{ maxWidth: 640 }}>
          <section className="booking-list-card" style={{ padding: 24 }}>
            <p>
              <Link to="/admin/booking-requests">← Back to booking requests</Link>
            </p>
            <form className="booking-filters" style={{ gridTemplateColumns: "1fr", gap: 14 }} onSubmit={submit}>
              <label>
                Guest name
                <input required value={form.name} onChange={update("name")} />
              </label>
              <label>
                Email
                <input required type="email" value={form.email} onChange={update("email")} />
              </label>
              <label>
                Phone
                <input value={form.phone} onChange={update("phone")} />
              </label>
              <label>
                Guests
                <input inputMode="numeric" value={form.guests} onChange={update("guests")} />
              </label>
              <label>
                Check-in
                <input required type="date" value={form.checkIn} onChange={update("checkIn")} />
              </label>
              <label>
                Check-out
                <input required type="date" value={form.checkOut} onChange={update("checkOut")} />
              </label>
              {error ? <p className="booking-error">{error}</p> : null}
              <button type="submit" className="mh-btn" disabled={busy} style={{ width: "fit-content" }}>
                {busy ? "Saving…" : "Create confirmed stay"}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
