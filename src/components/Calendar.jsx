import { useEffect, useMemo, useState } from "react";
import { colomboTodayIso, isArrivalDateAllowed, validateStayRange } from "../utils/bookingDateRules.js";

const weekday = ["M", "T", "W", "T", "F", "S", "S"];

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDate(date) {
  return date ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
}

function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= days; day += 1) cells.push(new Date(year, month, day));
  return cells;
}

const DEFAULT_RULES = {
  minNights: 1,
  maxNights: null,
  sameDayBooking: true,
  advanceBookingDays: null,
  leadTimeHours: 0,
  checkInTime: "14:00",
};

export default function Calendar({
  onChange,
  initialStart = null,
  initialEnd = null,
  bookingRules = DEFAULT_RULES,
  onRuleNotice,
}) {
  const rules = { ...DEFAULT_RULES, ...bookingRules };
  const today = useMemo(() => startOfDay(new Date()), []);
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState(initialStart && !initialEnd ? "end" : "start");
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [unavailable, setUnavailable] = useState([]);

  useEffect(() => { fetch("/api/availability").then((response) => response.ok ? response.json() : { unavailable: [] }).then((data) => setUnavailable(data.unavailable || [])).catch(() => setUnavailable([])); }, []);

  useEffect(() => {
    if (!initialStart) return;
    setStart(initialStart);
    setEnd(initialEnd);
    setPhase(initialEnd ? "start" : "end");
    onChange?.({ start: initialStart, end: initialEnd || null });
  }, [initialStart, initialEnd]);

  useEffect(() => {
    const close = (event) => {
      if (!event.target.closest(".calendar-anchor") && !event.target.closest("[data-calendar-open]")) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const iso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  /** Nights where guests occupy the apartment: [arrive, depart) — matches server `daterange(..., '[)')`. */
  const stayOverlapsUnavailable = (arriveIso, departIso) => {
    if (!arriveIso || !departIso || departIso <= arriveIso) return false;
    return unavailable.some((range) => {
      const blockStart = range.start.slice(0, 10);
      const blockEnd = range.end.slice(0, 10);
      return arriveIso < blockEnd && blockStart < departIso;
    });
  };

  const availabilityType = (date) => {
    const day = iso(date);
    const matches = unavailable.filter((range) => day >= range.start.slice(0, 10) && day < range.end.slice(0, 10));
    if (matches.some((range) => range.type === "blocked")) return "blocked";
    if (matches.some((range) => range.type === "booked")) return "booked";
    if (matches.some((range) => range.type === "pending")) return "pending";
    return "";
  };

  const isUnavailable = (date) => Boolean(availabilityType(date));

  const arrivalDisabled = (date) => {
    if (date < today) return true;
    if (isUnavailable(date)) return true;
    return !isArrivalDateAllowed(iso(date), rules);
  };

  const choose = (date) => {
    if (phase === "start" || (start && date <= start)) {
      if (arrivalDisabled(date)) {
        onRuleNotice?.("That arrival date is not available for booking.");
        return;
      }
      setStart(date);
      setEnd(null);
      setPhase("end");
      onChange?.({ start: date, end: null });
      onRuleNotice?.("");
      return;
    }
    if (isUnavailable(date)) return;
    const arriveIso = iso(start);
    const departIso = iso(date);
    const err = validateStayRange(arriveIso, departIso, rules);
    if (err) {
      onRuleNotice?.(err);
      return;
    }
    if (stayOverlapsUnavailable(arriveIso, departIso)) {
      onRuleNotice?.("Your stay includes nights that are already booked. Pick different dates.");
      return;
    }
    setEnd(date);
    setPhase("start");
    setOpen(false);
    onChange?.({ start, end: date });
    onRuleNotice?.("");
  };

  const resetDates = () => {
    setStart(null);
    setEnd(null);
    setPhase("start");
    onChange?.({ start: null, end: null });
    onRuleNotice?.("");
  };

  const months = [0, 1].map((step) => {
    const point = new Date(today.getFullYear(), today.getMonth() + offset + step, 1);
    return { label: point.toLocaleDateString("en-GB", { month: "long", year: "numeric" }), cells: monthGrid(point.getFullYear(), point.getMonth()) };
  });

  const summary = start ? `${formatDate(start)}${end ? ` — ${formatDate(end)}` : " — Select departure"}` : "Select your stay dates";
  const bookingHints = [
    "Departure must be after arrival.",
    rules.minNights > 1 ? `Minimum stay: ${rules.minNights} nights.` : null,
    rules.maxNights != null ? `Maximum stay: ${rules.maxNights} nights.` : null,
    rules.advanceBookingDays != null ? `Bookings open up to ${rules.advanceBookingDays} days ahead.` : null,
  ].filter(Boolean);

  return (
    <>
      <div className="field calendar-anchor">
        <label htmlFor="arrival">Arrival date</label>
        <input id="arrival" aria-label="Choose arrival date" placeholder="Choose your arrival date" readOnly value={formatDate(start)} onClick={() => setOpen((value) => !value)} data-calendar-open="" />
        <div className={open ? "calendar-pop open" : "calendar-pop"}>
          <div className="calendar-head">
            <button aria-label="Previous month" className="cal-prev" type="button" onClick={() => setOffset((value) => Math.max(0, value - 1))}>‹</button>
            <strong>Select your stay</strong>
            <button aria-label="Next month" className="cal-next" type="button" onClick={() => setOffset((value) => Math.min(18, value + 1))}>›</button>
          </div>
          <div className="calendar-months">
            {months.map((month) => (
              <div className="cal-month" key={month.label}>
                <h4>{month.label}</h4>
                <div className="cal-grid">
                  {weekday.map((name, index) => <span className="weekday" key={`${month.label}-${name}-${index}`}>{name}</span>)}
                  {month.cells.map((date, index) => date ? (() => {
                    const type = availabilityType(date);
                    const disabled = phase === "end" && start
                      ? date <= start || Boolean(type) || stayOverlapsUnavailable(iso(start), iso(date))
                      : arrivalDisabled(date);
                    const availabilityLabel = type ? `, ${type === "booked" ? "booked" : type === "pending" ? "pending confirmation" : "owner blocked"}` : ", available";
                    return <button
                      key={date.toISOString()}
                      type="button"
                      className={`cal-day${type ? ` is-${type}` : ""}${(start && +date === +start) || (end && +date === +end) ? " selected" : ""}${start && end && date > start && date < end ? " range" : ""}${+date === +today ? " today" : ""}`}
                      disabled={disabled}
                      aria-label={`${formatDate(date)}${availabilityLabel}`}
                      onClick={() => choose(date)}
                    >{date.getDate()}</button>;
                  })() : <span key={`pad-${month.label}-${index}`} />)}
                </div>
              </div>
            ))}
          </div>
          <div className="cal-legend" aria-label="Calendar availability legend">
            <span><i className="available" />Available</span>
            <span><i className="booked" />Booked</span>
            <span><i className="pending" />Pending</span>
            <span><i className="blocked" />Owner blocked</span>
          </div>
          <div className="cal-foot">
            <div>
              <small className="cal-hint">{phase === "start" ? "Choose your arrival date" : "Now choose your departure date"}</small>
              <div className="cal-summary">{summary}</div>
              <div className="cal-rules" aria-label="Booking date rules">
                {bookingHints.map((hint) => <small className="cal-hint" key={hint}>{hint}</small>)}
              </div>
            </div>
            <div className="cal-foot-actions">
              <button
                className="cal-reset"
                type="button"
                disabled={!start && !end}
                onClick={resetDates}
              >
                Reset dates
              </button>
              <button className="cal-done" type="button" onClick={() => setOpen(false)}>Done ✓</button>
            </div>
          </div>
        </div>
      </div>
      <div className="field">
        <label htmlFor="departure">Departure date</label>
        <input id="departure" aria-label="Choose departure date" placeholder="Choose your departure date" readOnly value={formatDate(end)} onClick={() => setOpen(true)} data-calendar-open="" />
      </div>
    </>
  );
}

export { colomboTodayIso };
