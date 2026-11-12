const TZ = "Asia/Colombo";

function parseDateOnly(value) {
  const day = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  return new Date(`${day}T12:00:00+05:30`);
}

/** Human-readable validity line for offer cards (matches public Offers page style). */
export function formatOfferPeriod(startDate, endDate) {
  const start = String(startDate || "").slice(0, 10);
  const end = String(endDate || "").slice(0, 10);
  if (!start || !end) return "";

  if (end >= "2030-01-01" && start <= "2027-06-01") {
    return "All year round";
  }

  const startD = parseDateOnly(start);
  const endD = parseDateOnly(end);
  if (!startD || !endD) return "";

  if (start.slice(0, 7) === end.slice(0, 7)) {
    const monthYear = new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: TZ,
    }).format(startD);
    const fromDay = Number(start.slice(8, 10));
    const toDay = Number(end.slice(8, 10));
    return `${fromDay} – ${toDay} ${monthYear}`;
  }

  const short = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
  return `${short.format(startD)} – ${short.format(endD)}`;
}

export function offerPeriodLabel(a, b) {
  return formatOfferPeriod(a, b);
}
