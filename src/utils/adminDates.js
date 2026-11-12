export function formatAdminDate(value, withTime = false) {
  if (!value) return "—";
  const raw = String(value);
  const parsed = withTime
    ? new Date(value)
    : /^\d{4}-\d{2}-\d{2}$/.test(raw.slice(0, 10))
      ? new Date(`${raw.slice(0, 10)}T00:00:00+05:30`)
      : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat(
    "en-GB",
    withTime
      ? { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" }
      : { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Colombo" },
  ).format(parsed);
}

export function isoDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(date);
}

export function addDays(iso, days) {
  const base = new Date(`${iso}T12:00:00+05:30`);
  base.setUTCDate(base.getUTCDate() + days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(base);
}
