import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import AdminIcon from "../components/admin/AdminIcon.jsx";
import AvailabilityMonthCalendar from "../components/admin/AvailabilityMonthCalendar.jsx";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { addDays, isoDay } from "../utils/adminDates.js";
import {
  addMonths,
  buildCalendar,
  buildCalendarEvents,
  countNightsByType,
  currentMonthKey,
  eventCoveringNight,
  monthGridCells,
  readableMonth,
  readableRange,
  statusBadgeLabel,
  todayKeyColombo,
} from "../utils/adminAvailabilityCalendar.js";

function defaultBlockForm() {
  const start = isoDay();
  return { startDate: start, endDate: addDays(start, 2), reason: "Maintenance" };
}

export default function AdminAvailability() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [month, setMonth] = useState(currentMonthKey);
  const [view, setView] = useState("month");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockForm, setBlockForm] = useState(defaultBlockForm);
  const [blockBusy, setBlockBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(todayKeyColombo);

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
  const events = useMemo(() => buildCalendarEvents(data), [data]);
  const gridCells = useMemo(() => monthGridCells(month), [month]);
  const counts = countNightsByType(calendar);
  const todayKey = todayKeyColombo();

  useEffect(() => {
    setSelectedDay((prev) => {
      const inMonth = gridCells.some((c) => c.inMonth && c.key === prev);
      if (inMonth) return prev;
      return (
        gridCells.find((c) => c.inMonth && c.key === todayKey)?.key
        || gridCells.find((c) => c.inMonth)?.key
        || prev
      );
    });
  }, [month, gridCells, todayKey]);

  const selection = useMemo(() => {
    if (!selectedDay) return { kind: "empty" };
    const event = eventCoveringNight(selectedDay, events);
    if (event) return { kind: event.kind, event, dayKey: selectedDay };
    return { kind: "available", dayKey: selectedDay };
  }, [selectedDay, events]);

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

  const handleSelectEvent = (ev, dayKey) => {
    setSelectedDay(dayKey);
    setView("month");
  };

  return (
    <main className="admin-app availability-page">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>
              <AdminIcon name="calendar" size={28} />
              Availability & Calendar
            </h1>
            <span>Manage property availability, bookings, and blocked dates.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="availability-content">
          <section className="availability-metrics" aria-label="Month summary">
            <MetricCard tone="available" label="Available" value={counts.available || 0} suffix="nights" />
            <MetricCard tone="booked" label="Confirmed" value={counts.booked || 0} suffix="nights" />
            <MetricCard tone="pending" label="Pending" value={counts.pending || 0} suffix="nights" />
            <MetricCard tone="blocked" label="Blocked" value={counts.blocked || 0} suffix="nights" />
          </section>
          <section className="availability-card">
            <header className="calendar-controls">
              <div className="cal-nav-month">
                <button type="button" className="cal-nav-btn" aria-label="Previous month" onClick={() => setMonth((v) => addMonths(v, -1))}>
                  ‹
                </button>
                <strong>{readableMonth(month)}</strong>
                <button type="button" className="cal-nav-btn" aria-label="Next month" onClick={() => setMonth((v) => addMonths(v, 1))}>
                  ›
                </button>
              </div>
              <div className="cal-view-tabs" role="tablist" aria-label="Calendar view">
                {["month", "week", "list"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={view === mode}
                    className={view === mode ? "is-active" : ""}
                    onClick={() => setView(mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              <div className="cal-toolbar-actions">
                <button type="button" className="cal-btn" onClick={() => { setMonth(currentMonthKey()); setSelectedDay(todayKey); }}>
                  Today
                </button>
                <button type="button" className="cal-btn outline" onClick={openBlockDialog}>
                  Block dates
                </button>
                <button type="button" className="cal-btn primary" onClick={() => navigate("/admin/bookings/new")}>
                  + Add booking
                </button>
              </div>
            </header>
            {error ? <p className="booking-error">{error}</p> : null}
            {notice ? <p className="settings-notice">{notice}</p> : null}
            {refreshing ? <p className="settings-notice">Refreshing calendar…</p> : null}
            <div className="calendar-layout">
              <div className="calendar-main">
                {view === "list" ? (
                  <AvailabilityList events={events} onPick={(ev) => handleSelectEvent(ev, ev.arrive)} />
                ) : (
                  <AvailabilityMonthCalendar
                    month={month}
                    data={data}
                    calendar={calendar}
                    todayKey={todayKey}
                    selectedDay={selectedDay}
                    view={view}
                    onSelectDay={setSelectedDay}
                    onSelectEvent={handleSelectEvent}
                  />
                )}
              </div>
              <aside className="calendar-selected" aria-labelledby="selected-day-title">
                <SelectedDayPanel
                  selection={selection}
                  onBlock={openBlockDialog}
                  onAddBooking={() => navigate("/admin/bookings/new")}
                  onEditBooking={() => navigate("/admin/booking-requests")}
                  onRemoveBlock={removeBlock}
                />
              </aside>
            </div>
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
            <p className="availability-block-hint">
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
            <p className="availability-drawer-link">
              <Link to="/admin/bookings/new">Create a booking</Link> instead to reserve dates for a guest.
            </p>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function MetricCard({ tone, label, value, suffix }) {
  return (
    <article className={`availability-metric availability-metric--${tone}`}>
      <span className="availability-metric-icon" aria-hidden="true" />
      <div>
        <span className="availability-metric-label">{label}</span>
        <strong>
          {value} <small>{suffix}</small>
        </strong>
      </div>
    </article>
  );
}

function AvailabilityList({ events, onPick }) {
  if (!events.length) {
    return <p className="cal-list-empty">No bookings or blocks this month.</p>;
  }
  return (
    <ul className="cal-list">
      {events.map((ev) => (
        <li key={`${ev.kind}-${ev.id}`}>
          <button type="button" onClick={() => onPick(ev)} className={`cal-list-item cal-list-item--${ev.type}`}>
            <strong>{ev.headline || ev.label}</strong>
            <span>{readableRange(ev.arrive, ev.depart)}</span>
            <em>{statusBadgeLabel(ev.status)}</em>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SelectedDayPanel({ selection, onBlock, onAddBooking, onEditBooking, onRemoveBlock }) {
  if (selection.kind === "empty") {
    return (
      <div className="calendar-selected-inner">
        <h2 id="selected-day-title">Selected day</h2>
        <p className="cal-selected-empty">Choose a date on the calendar.</p>
      </div>
    );
  }

  if (selection.kind === "available") {
    return (
      <div className="calendar-selected-inner">
        <h2 id="selected-day-title">Selected day</h2>
        <p className="cal-selected-kicker">Open date</p>
        <p className="cal-selected-lead">This night is available to book.</p>
        <div className="cal-selected-actions">
          <button type="button" className="cal-btn primary" onClick={onAddBooking}>
            Add booking
          </button>
          <button type="button" className="cal-btn outline" onClick={onBlock}>
            Block dates
          </button>
        </div>
      </div>
    );
  }

  const { event } = selection;
  const badge = statusBadgeLabel(event.status);
  const isBlock = event.kind === "block";

  return (
    <div className="calendar-selected-inner">
      <header className="cal-selected-head">
        <div>
          <h2 id="selected-day-title">{isBlock ? event.headline : event.headline}</h2>
          <span className={`cal-status-pill cal-status-pill--${event.type}`}>{badge}</span>
        </div>
      </header>
      <dl className="cal-selected-meta">
        {!isBlock ? (
          <div>
            <dt>Guest</dt>
            <dd>{event.guest}</dd>
          </div>
        ) : null}
        <div>
          <dt>Dates</dt>
          <dd>{readableRange(event.arrive, event.depart)}</dd>
        </div>
        {!isBlock ? (
          <div>
            <dt>Payment</dt>
            <dd>
              <span className={`cal-pay-pill cal-pay-pill--${event.status === "confirmed" ? "paid" : "pending"}`}>
                {event.payment}
              </span>
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="cal-selected-actions">
        {!isBlock ? (
          <button type="button" className="cal-btn primary" onClick={onEditBooking}>
            Edit booking
          </button>
        ) : (
          <button type="button" className="cal-btn primary" onClick={() => onRemoveBlock(event.id)}>
            Remove block
          </button>
        )}
        <button type="button" className="cal-btn outline" onClick={onAddBooking}>
          Add booking
        </button>
        <button type="button" className="cal-btn outline cal-btn-icon" onClick={onBlock}>
          <span aria-hidden="true">⊘</span> Block dates
        </button>
      </div>
    </div>
  );
}