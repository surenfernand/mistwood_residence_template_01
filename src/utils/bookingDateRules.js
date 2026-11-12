const COLOMBO = "Asia/Colombo";

export function colomboTodayIso() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: COLOMBO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDaysIso(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function nightCount(arriveIso, departIso) {
  if (!arriveIso || !departIso || departIso <= arriveIso) return 0;
  const a = new Date(`${arriveIso}T12:00:00Z`);
  const b = new Date(`${departIso}T12:00:00Z`);
  return Math.round((b - a) / 86400000);
}

/** Whether a calendar day can be chosen as arrival (public booking rules). */
export function isArrivalDateAllowed(iso, rules) {
  const today = colomboTodayIso();
  if (iso < today) return false;
  if (!rules.sameDayBooking && iso === today) return false;
  if (rules.advanceBookingDays != null && rules.advanceBookingDays > 0) {
    const latest = addDaysIso(today, rules.advanceBookingDays);
    if (iso > latest) return false;
  }
  const lead = Number(rules.leadTimeHours) || 0;
  if (lead > 0) {
    const [h, min] = String(rules.checkInTime || "14:00").split(":").map(Number);
    const checkIn = new Date(`${iso}T${String(h).padStart(2, "0")}:${String(min || 0).padStart(2, "0")}:00+05:30`);
    if (checkIn.getTime() < Date.now() + lead * 3600000) return false;
  }
  return true;
}

export function validateStayRange(arriveIso, departIso, rules) {
  const nights = nightCount(arriveIso, departIso);
  const min = Number(rules.minNights) || 1;
  const max = rules.maxNights != null ? Number(rules.maxNights) : null;
  if (nights < min) {
    return `Minimum stay is ${min} night${min === 1 ? "" : "s"}.`;
  }
  if (max != null && nights > max) {
    return `Maximum stay is ${max} night${max === 1 ? "" : "s"}.`;
  }
  if (!isArrivalDateAllowed(arriveIso, rules)) {
    return "Those arrival dates are outside the booking window.";
  }
  return null;
}
