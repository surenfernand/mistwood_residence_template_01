import { formatOfferPeriod } from "./offerPeriod.js";

export function countStayNights(arrive, depart) {
  const start = String(arrive || "").slice(0, 10);
  const end = String(depart || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end <= start) return 0;
  let nights = 0;
  for (let cursor = new Date(`${start}T12:00:00+05:30`); cursor.toISOString().slice(0, 10) < end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    nights += 1;
  }
  return nights;
}

/** @param {{ active?: boolean, minNights?: number, startDate?: string, endDate?: string }} offer */
export function getOfferEligibility(offer, arrive, depart) {
  if (!offer) return { eligible: true, reasons: [] };
  const reasons = [];
  const nights = countStayNights(arrive, depart);
  const start = String(offer.startDate || "").slice(0, 10);
  const end = String(offer.endDate || "").slice(0, 10);

  if (offer.active === false) reasons.push("This offer is no longer active.");
  if (nights < 1) reasons.push("Choose arrival and departure dates to use this offer.");
  if (nights > 0 && Number(offer.minNights) > nights) {
    reasons.push(`This offer needs at least ${offer.minNights} nights (your stay is ${nights} night${nights === 1 ? "" : "s"}).`);
  }

  if (nights > 0 && start && end) {
    let overlap = false;
    for (
      let cursor = new Date(`${String(arrive).slice(0, 10)}T12:00:00+05:30`);
      cursor.toISOString().slice(0, 10) < String(depart).slice(0, 10);
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    ) {
      const night = cursor.toISOString().slice(0, 10);
      if (night >= start && night < end) overlap = true;
    }
    if (!overlap) {
      reasons.push(`Your stay must include at least one night within ${formatOfferPeriod(start, end) || "the offer period"}.`);
    }
  }

  return { eligible: reasons.length === 0, reasons };
}
