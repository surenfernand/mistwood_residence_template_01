import { addDays } from "./adminDates.js";

const COLOMBO = "Asia/Colombo";

/** Calendar night key (YYYY-MM-DD) in Asia/Colombo — never use `toISOString().slice(0, 10)`. */
export function dayKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: COLOMBO,
  }).format(date);
}

export function dateOnly(value) {
  return String(value || "").slice(0, 10);
}

export function addMonths(month, delta) {
  const [y, m] = month.split("-").map(Number);
  const nextIndex = m - 1 + delta;
  const year = y + Math.floor(nextIndex / 12);
  const monthNum = ((nextIndex % 12) + 12) % 12 + 1;
  return `${year}-${String(monthNum).padStart(2, "0")}`;
}

export function currentMonthKey() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    timeZone: COLOMBO,
  }).format(new Date());
}

export function todayKeyColombo() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: COLOMBO,
  }).format(new Date());
}

export function readableMonth(month) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: COLOMBO,
  }).format(new Date(`${month}-01T12:00:00+05:30`));
}

function weekdayColombo(iso) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: COLOMBO, weekday: "short" }).format(
    new Date(`${iso}T12:00:00+05:30`),
  );
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[name] ?? 0;
}

function eachNightInRange(from, to, fn) {
  const start = dateOnly(from);
  const end = dateOnly(to);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return;
  if (end <= start) return;
  for (let cur = start; cur < end; cur = addDays(cur, 1)) {
    fn(cur);
  }
}

/** @param {string} month YYYY-MM */
export function buildCalendar(month, data) {
  const result = {};
  const monthEnd = `${addMonths(month, 1)}-01`;

  for (let cur = `${month}-01`; cur < monthEnd; cur = addDays(cur, 1)) {
    result[cur] = { type: "available" };
  }

  for (const block of data?.blocks || []) {
    eachNightInRange(block.startDate, block.endDate, (key) => {
      if (result[key]) result[key] = { type: "blocked", name: block.reason || "Blocked" };
    });
  }

  for (const row of data?.requests || []) {
    const type = row.status === "confirmed" ? "booked" : "pending";
    eachNightInRange(row.arrive, row.depart, (key) => {
      if (result[key] && result[key].type !== "blocked") {
        result[key] = { type, name: `BR-${row.id} · ${row.name}` };
      }
    });
  }

  return result;
}

/** 42 cells for a Mon-start month grid (dashboard mini calendar). */
export function monthGridCells(month) {
  const firstIso = `${month}-01`;
  const offset = (weekdayColombo(firstIso) + 6) % 7;
  const gridStart = addDays(firstIso, -offset);

  return Array.from({ length: 42 }, (_, index) => {
    const key = addDays(gridStart, index);
    return { key, day: Number(key.slice(8, 10)), inMonth: key.startsWith(month) };
  });
}

export function dayStatusClass(entry, inMonth, isToday) {
  const classes = [];
  if (!inMonth) classes.push("is-outside");
  else if (entry?.type === "booked") classes.push("is-booked");
  else if (entry?.type === "pending") classes.push("is-pending");
  else if (entry?.type === "blocked") classes.push("is-blocked");
  else classes.push("is-available");
  if (isToday) classes.push("is-today");
  return classes.join(" ");
}

export function countNightsByType(calendar) {
  return Object.values(calendar).reduce((acc, entry) => {
    const type = entry?.type || "available";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
}

/** Six Mon–Sun rows for a month grid. */
export function monthWeeks(month) {
  const cells = monthGridCells(month);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function paymentLabelForStatus(status) {
  if (status === "confirmed") return "Paid";
  if (status === "pending_payment") return "Payment pending";
  if (status === "contacted") return "Contacted";
  if (status === "new") return "New request";
  return "—";
}

export function statusBadgeLabel(status) {
  if (status === "confirmed") return "Confirmed";
  if (status === "blocked") return "Blocked";
  if (status === "pending_payment" || status === "new" || status === "contacted") return "Pending";
  return status || "—";
}

/** Bookings and blocks as bar events for the month calendar. */
export function buildCalendarEvents(data) {
  const events = [];
  for (const block of data?.blocks || []) {
    events.push({
      kind: "block",
      id: block.id,
      type: "blocked",
      label: block.reason || "Blocked",
      headline: block.reason || "Blocked",
      guest: null,
      arrive: dateOnly(block.startDate),
      depart: dateOnly(block.endDate),
      status: "blocked",
      payment: null,
      raw: block,
    });
  }
  for (const row of data?.requests || []) {
    const type = row.status === "confirmed" ? "booked" : "pending";
    const first = String(row.name || "").trim().split(/\s+/)[0] || row.name;
    events.push({
      kind: "request",
      id: row.id,
      type,
      label: type === "pending" ? `BR-${row.id} Pending` : `BR-${row.id} ${first}`,
      headline: `BR-${row.id} ${first}`,
      guest: row.name,
      arrive: dateOnly(row.arrive),
      depart: dateOnly(row.depart),
      status: row.status,
      payment: paymentLabelForStatus(row.status),
      raw: row,
    });
  }
  return events.sort((a, b) => a.arrive.localeCompare(b.arrive) || a.id - b.id);
}

function lastOccupiedNight(depart) {
  return addDays(dateOnly(depart), -1);
}

/** Bar segments for one calendar week row (column indices are 1-based for CSS grid). */
export function segmentsForWeek(week, events) {
  const weekKeys = week.map((c) => c.key);
  const weekStart = weekKeys[0];
  const weekEnd = weekKeys[6];
  const segs = [];

  for (const ev of events) {
    const nightStart = ev.arrive;
    const nightEnd = lastOccupiedNight(ev.depart);
    if (nightEnd < weekStart || nightStart > weekEnd) continue;

    const clipStart = nightStart < weekStart ? weekStart : nightStart;
    const clipEnd = nightEnd > weekEnd ? weekEnd : nightEnd;
    const colStart = weekKeys.indexOf(clipStart) + 1;
    const colEnd = weekKeys.indexOf(clipEnd) + 2;

    segs.push({
      ...ev,
      colStart,
      colEnd,
      clipStart,
      clipEnd,
      continuesPrior: nightStart < weekStart,
      continuesAfter: nightEnd > weekEnd,
    });
  }

  segs.sort((a, b) => a.colStart - b.colStart || b.colEnd - b.colStart - (a.colEnd - a.colStart));
  const lanes = [];
  for (const seg of segs) {
    let lane = 0;
    while (true) {
      const conflicts = lanes[lane] || [];
      const hit = conflicts.some((c) => !(seg.colEnd <= c.colStart || seg.colStart >= c.colEnd));
      if (!hit) break;
      lane += 1;
    }
    if (!lanes[lane]) lanes[lane] = [];
    lanes[lane].push(seg);
    seg.lane = lane + 1;
  }

  const laneCount = segs.reduce((m, s) => Math.max(m, s.lane), 1);
  return { segments: segs, laneCount };
}

export function eventCoveringNight(dayKey, events) {
  for (const ev of events) {
    if (dayKey >= ev.arrive && dayKey < ev.depart) return ev;
  }
  return null;
}

export function readableRange(arrive, depart) {
  const fmt = (iso) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: COLOMBO,
    }).format(new Date(`${iso}T12:00:00+05:30`));
  return `${fmt(arrive)} – ${fmt(dateOnly(depart))}`;
}

export function weekContainingDay(month, dayKey) {
  const weeks = monthWeeks(month);
  return weeks.find((week) => week.some((c) => c.key === dayKey)) || weeks[0];
}
