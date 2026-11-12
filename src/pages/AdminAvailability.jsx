import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { addDays, isoDay } from "../utils/adminDates.js";
import {
  addMonths,
  buildCalendar,
  countNightsByType,
  currentMonthKey,
  dayKey,
  readableMonth,
} from "../utils/adminAvailabilityCalendar.js";

const icon = (symbol) => <span className="availability-icon" aria-hidden="true">{symbol}</span>;

function defaultBlockForm() {
  const start = isoDay();
  return { startDate: start, endDate: addDays(start, 2), reason: "Maintenance" };
}

export default function AdminAvailability() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [month, setMonth] = useState(currentMonthKey);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockForm, setBlockForm] = useState(defaultBlockForm);
  const [blockBusy, setBlockBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useSiteTitle("Availability & Calendar");

  const loadAvailability = useCallback(() => {
    setRefreshing(true);
    return fetch(`/api/admin/availability?month=${month}`)
      .then((r) => {
        if (r.status === 401) {
          navigate("/admin/login", { replace: true });
          return null;
        }
        return r.json();
      })
      .then((x) => {
        if (!x) return;
        if (x.error) throw Error(x.error);
        setData(x);
        setError("");
      })
      .catch((e) => setError(e.message || "Could not load availability."))
      .finally(() => setRefreshing(false));
  }, [month, navigate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const calendar = useMemo(() => buildCalendar(month, data), [month, data]);
  const counts = countNightsByType(calendar);

  const openBlockDialog = () => {
    setBlockForm(defaultBlockForm());
    setNotice("");
    setBlockOpen(true);
  };

  const saveBlock = async (event) => {
    event.preventDefault();
    setBlockBusy(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/admin/availability/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockForm),
      });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }
      if (!response.ok) throw new Error(body.error || "Could not block dates.");
      setBlockOpen(false);
      setNotice("Dates blocked on the calendar.");
      await loadAvailability();
    } catch (err) {
      setError(err.message || "Could not block dates.");
    } finally {
      setBlockBusy(false);
    }
  };

  const removeBlock = async (id) => {
    if (!window.confirm("Remove this blocked period? Those dates will be open to book again.")) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/availability/blocks/${id}`, { method: "DELETE" });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) {
        navigate("/admin/login", { replace: true });
        return;
      }
      if (!response.ok) throw new Error(body.error || "Could not remove block.");
      setNotice("Block removed.");
      await loadAvailability();
    } catch (err) {
      setError(err.message || "Could not remove block.");
    }
  };

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
              <button type="button" className="outline" onClick={openBlockDialog}>
                ＋ Block Dates
              </button>
              <button type="button" className="primary" onClick={() => navigate("/admin/bookings/new")}>
                ＋ Add Booking
              </button>
            </header>
            {error ? <p className="booking-error">{error}</p> : null}
            {notice ? <p className="settings-notice">{notice}</p> : null}
            {refreshing ? <p className="settings-notice">Refreshing calendar…</p> : null}
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
                  <h2>Blocked periods</h2>
                  {(data?.blocks || []).length ? (
                    data.blocks.map((block) => (
                      <div className="upcoming" key={block.id}>
                        {icon("▣")}
                        <div>
                          <strong>{block.reason || "Blocked"}</strong>
                          <span>
                            {block.startDate} – {block.endDate}
                          </span>
                        </div>
                        <button type="button" className="text-btn" onClick={() => removeBlock(block.id)}>
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No blocks this month.</p>
                  )}
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
              <button type="button" onClick={openBlockDialog}>
                ▣ &nbsp; Block Dates
              </button>
              <button type="button" onClick={() => navigate("/admin/bookings/new")}>
                ▰ &nbsp; Add Booking
              </button>
              <button type="button" onClick={() => loadAvailability()}>
                ⟳ &nbsp; Sync Bookings
              </button>
            </footer>
          </section>
        </div>
      </section>

      {blockOpen ? (
        <div className="booking-drawer-backdrop" role="presentation" onClick={() => !blockBusy && setBlockOpen(false)}>
          <form
            className="booking-drawer"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveBlock}
            aria-labelledby="block-dates-title"
          >
            <header>
              <div>
                <p className="admin-dashboard-kicker">Availability</p>
                <h2 id="block-dates-title">Block dates</h2>
                <p className="booking-page-intro">Guests cannot book these nights on the website.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setBlockOpen(false)} disabled={blockBusy}>
                ×
              </button>
            </header>
            <label>
              Start date (first blocked night)
              <input
                type="date"
                required
                value={blockForm.startDate}
                onChange={(e) => setBlockForm((v) => ({ ...v, startDate: e.target.value }))}
              />
            </label>
            <label>
              End date (check-out — first available night)
              <input
                type="date"
                required
                value={blockForm.endDate}
                min={addDays(blockForm.startDate, 1)}
                onChange={(e) => setBlockForm((v) => ({ ...v, endDate: e.target.value }))}
              />
            </label>
            <label>
              Reason (shown on admin calendar)
              <input
                value={blockForm.reason}
                maxLength={200}
                onChange={(e) => setBlockForm((v) => ({ ...v, reason: e.target.value }))}
                placeholder="Maintenance, owner stay, etc."
              />
            </label>
            <p style={{ fontSize: 13, color: "#65706a", marginTop: 8 }}>
              Blocks cannot overlap confirmed stays, active holds, or other blocks.
            </p>
            <div className="booking-drawer-actions">
              <button type="button" onClick={() => setBlockOpen(false)} disabled={blockBusy}>
                Cancel
              </button>
              <button type="submit" className="primary" disabled={blockBusy}>
                {blockBusy ? "Saving…" : "Save block"}
              </button>
            </div>
            <p style={{ marginTop: 16, fontSize: 13 }}>
              <Link to="/admin/bookings/new">Create a booking</Link> instead to reserve dates for a guest.
            </p>
          </form>
        </div>
      ) : null}
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
