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
