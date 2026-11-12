import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import {
  addMonths,
  buildCalendar,
  countNightsByType,
  currentMonthKey,
  dayKey,
  readableMonth,
} from "../utils/adminAvailabilityCalendar.js";

const icon = (symbol) => <span className="availability-icon" aria-hidden="true">{symbol}</span>;

export default function AdminAvailability() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [month, setMonth] = useState(currentMonthKey);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useSiteTitle("Availability & Calendar");

  useEffect(() => {
    fetch(`/api/admin/availability?month=${month}`)
      .then((r) => (r.status === 401 ? (navigate("/admin/login", { replace: true }), null) : r.json()))
      .then((x) => {
        if (x?.error) throw Error(x.error);
        if (x) setData(x);
      })
      .catch((e) => setError(e.message));
  }, [month, navigate]);

  const calendar = useMemo(() => buildCalendar(month, data), [month, data]);
  const counts = countNightsByType(calendar);

  return (
    <main className="admin-app availability-page">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Availability & Calendar</h1>
            <span>Manage property availability, bookings, and blocked dates.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="availability-content">
          <section className="availability-metrics">
            <Metric label="Total Nights" value={Object.keys(calendar).length} />
            <Metric label="Booked Nights" value={counts.booked || 0} />
            <Metric label="Available Nights" value={counts.available || 0} />
            <Metric label="Blocked Nights" value={counts.blocked || 0} />
            <Metric label="Pending / Hold" value={counts.pending || 0} />
          </section>
          <section className="availability-card">
            <header className="calendar-controls">
              <button type="button" onClick={() => setMonth((v) => addMonths(v, -1))}>
                ‹
              </button>
              <strong>▣ &nbsp; {readableMonth(month)}</strong>
              <button type="button" onClick={() => setMonth((v) => addMonths(v, 1))}>
                ›
              </button>
              <span />
              <button type="button" onClick={() => setMonth(currentMonthKey())}>
                Today
              </button>
              <button type="button" className="outline">
                ＋ Block Dates
              </button>
              <button type="button" className="primary">
                ＋ Add Booking
              </button>
            </header>
            {error ? <p className="booking-error">{error}</p> : null}
            <div className="calendar-layout">
              <div className="calendar-grid">
                <div className="calendar-weekdays">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => (
                    <b key={x}>{x}</b>
                  ))}
                </div>
                <div className="calendar-days">
                  {Array.from({ length: 42 }, (_, i) => {
                    const first = new Date(`${month}-01T00:00:00+05:30`);
                    const offset = (first.getUTCDay() + 6) % 7;
                    const d = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1 - offset + i));
                    const key = dayKey(d);
                    const entry = calendar[key];
                    const current = key.startsWith(month);
                    return (
                      <div key={key} className={`calendar-day ${current ? "" : "outside"} ${entry?.type || ""}`}>
                        <b>{d.getUTCDate()}</b>
                        {entry?.name ? (
                          <span>
                            {entry.type === "booked" ? "▰" : "◌"} {entry.name}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              <aside className="calendar-side">
                <section>
                  <h2>Legend</h2>
                  <Legend type="available" label="Available" value={counts.available || 0} />
                  <Legend type="booked" label="Booked (Confirmed)" value={counts.booked || 0} />
                  <Legend type="blocked" label="Blocked / Not Available" value={counts.blocked || 0} />
                  <Legend type="pending" label="Pending / Hold" value={counts.pending || 0} />
                </section>
                <section>
                  <h2>Upcoming Stays</h2>
                  {(data?.requests || []).slice(0, 4).map((r) => (
                    <div className="upcoming" key={r.id}>
                      {icon("▰")}
                      <div>
                        <strong>
                          BR-{r.id} – {r.name}
                        </strong>
                        <span>
                          {r.arrive} – {r.depart}
                        </span>
                      </div>
                      <em>{r.status === "confirmed" ? "Confirmed" : "Hold"}</em>
                    </div>
                  ))}
                  {!data?.requests?.length ? <p>No stays this month.</p> : null}
                </section>
              </aside>
            </div>
            <footer className="availability-actions">
              <div>
                {icon("ⓘ")}
                <span>
                  <strong>Quick Actions</strong>
                  <small>Manage availability with these handy actions.</small>
                </span>
              </div>
              <button type="button">▣ &nbsp; Block Dates</button>
              <button type="button">▰ &nbsp; Add Booking</button>
              <button type="button">⟳ &nbsp; Sync Bookings</button>
            </footer>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Legend({ type, label, value }) {
  return (
    <div className="legend">
      <i className={type} />
      <span>{label}</span>
      <b>{value} nights</b>
    </div>
  );
}
