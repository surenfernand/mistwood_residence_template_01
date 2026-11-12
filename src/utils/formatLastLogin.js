import { addDays, isoDay } from "./adminDates.js";

export function formatLastLogin(iso) {
  if (!iso) return "Last signed in —";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "Last signed in —";

  const today = isoDay();
  const loginDay = isoDay(parsed);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Colombo",
  }).format(parsed);

  if (loginDay === today) return `Last signed in today, ${time}`;
  if (loginDay === addDays(today, -1)) return `Last signed in yesterday, ${time}`;

  const dayLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Colombo",
  }).format(parsed);
  return `Last signed in ${dayLabel}, ${time}`;
}
