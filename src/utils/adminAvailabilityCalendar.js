const COLOMBO = "Asia/Colombo";

export function dayKey(date) {
  return date.toISOString().slice(0, 10);
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
  }).format(new Date(`${month}-01T00:00:00+05:30`));
}

function eachNightInRange(from, to, fn) {
  const start = dateOnly(from);
  const end = dateOnly(to);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return;
  for (let d = new Date(`${start}T00:00:00+05:30`); dayKey(d) < end; d.setUTCDate(d.getUTCDate() + 1)) {
    fn(dayKey(d));
  }
}

/** @param {string} month YYYY-MM */
export function buildCalendar(month, data) {
  const result = {};
  const start = new Date(`${month}-01T00:00:00+05:30`);
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));

  for (let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    result[dayKey(d)] = { type: "available" };
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
  const first = new Date(`${month}-01T00:00:00+05:30`);
  const offset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const d = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1 - offset + index));
    const key = dayKey(d);
    return { key, day: d.getUTCDate(), inMonth: key.slice(0, 7) === month };
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
