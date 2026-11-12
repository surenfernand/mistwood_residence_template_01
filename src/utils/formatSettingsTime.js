/** "14:00" → "2:00 PM" */
export function formatSettingsTime(value) {
  const [h, m] = String(value || "14:00").split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m || 0).padStart(2, "0")} ${period}`;
}
