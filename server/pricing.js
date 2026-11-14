import { getSiteSettings } from "./site-settings.js";

const COLOMBO_OFFSET = "+05:30";

export function dayKey(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function eachNight(arrive, depart, fn) {
  const start = dayKey(arrive);
  const end = dayKey(depart);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end <= start) return 0;
  let count = 0;
  for (let cursor = new Date(`${start}T12:00:00${COLOMBO_OFFSET}`); dayKey(cursor) < end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    fn(dayKey(cursor));
    count += 1;
  }
  return count;
}

function moneyRound(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function rateForNight(night, baseRate, seasonalRows) {
  const applicable = seasonalRows
    .filter((row) => row.active && night >= dayKey(row.start_date) && night < dayKey(row.end_date))
    .map((row) => Number(row.nightly_rate));
  if (!applicable.length) return Number(baseRate) || 0;
  return Math.max(...applicable);
}

function offerSavings(nightRates, offer) {
  const pct = Number(offer.discount_percent) || 0;
  if (pct <= 0) return 0;
  const start = dayKey(offer.start_date ?? offer.startDate);
  const end = dayKey(offer.end_date ?? offer.endDate);
  let saved = 0;
  for (const [night, rate] of nightRates) {
    if (night >= start && night < end) saved += rate * (pct / 100);
  }
  return saved;
}

export function checkSelectedOfferEligibility(offer, arrive, depart, nights) {
  if (!offer) return { eligible: true, reasons: [] };
  const reasons = [];
  if (!offer.active) reasons.push("This offer is no longer active.");
  const minNights = Number(offer.min_nights ?? offer.minNights) || 1;
  if (nights < minNights) {
    reasons.push(`This offer needs at least ${minNights} nights (your stay is ${nights} night${nights === 1 ? "" : "s"}).`);
  }
  const start = dayKey(offer.start_date ?? offer.startDate);
  const end = dayKey(offer.end_date ?? offer.endDate);
  let overlap = false;
  const arriveDay = dayKey(arrive);
  const departDay = dayKey(depart);
  for (let cursor = new Date(`${arriveDay}T12:00:00${COLOMBO_OFFSET}`); dayKey(cursor) < departDay; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const night = dayKey(cursor);
    if (night >= start && night < end) overlap = true;
  }
  if (!overlap) reasons.push("Your stay must include at least one night inside the offer dates.");
  return { eligible: reasons.length === 0, reasons };
}

/**
 * Full stay quote: per-night seasonal/base rates, special offer discount,
 * then highest applicable long-stay discount on the post-offer subtotal.
 * @param {import("pg").Pool | import("pg").PoolClient} pool
 * @param {string} arrive
 * @param {string} depart
 * @param {{ selectedOfferId?: number | null }} [options]
 */
export async function calculateStayQuote(pool, arrive, depart, options = {}) {
  const arriveDay = dayKey(arrive);
  const departDay = dayKey(depart);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(arriveDay) || !/^\d{4}-\d{2}-\d{2}$/.test(departDay) || departDay <= arriveDay) {
    throw Object.assign(new Error("Invalid stay dates."), { status: 400 });
  }

  const site = await getSiteSettings(pool);
  const requireDeposit = site.requireDeposit !== false;
  const depositPercent = requireDeposit ? Number(site.depositPercent) || 30 : 0;

  const [baseResult, seasonalResult, offersResult, longStayResult] = await Promise.all([
    pool.query("select nightly_rate, currency from property_rates where active order by id desc limit 1"),
    pool.query("select id, name, start_date, end_date, nightly_rate, active from seasonal_rates where active order by start_date"),
    pool.query("select id, name, discount_percent, start_date, end_date, active, min_nights from special_offers where active order by start_date"),
    pool.query("select id, min_nights, discount_percent, active from long_stay_discounts where active order by min_nights"),
  ]);

  const baseRate = Number(baseResult.rows[0]?.nightly_rate) || 0;
  const currency = baseResult.rows[0]?.currency || "LKR";

  const nightRates = [];
  const nights = eachNight(arriveDay, departDay, (night) => {
    const rate = rateForNight(night, baseRate, seasonalResult.rows);
    nightRates.push([night, rate]);
  });

  const subtotal = nightRates.reduce((sum, [, rate]) => sum + rate, 0);

  const selectedOfferId = options.selectedOfferId != null ? Number.parseInt(options.selectedOfferId, 10) : null;
  let selectedOfferRow = null;
  if (Number.isInteger(selectedOfferId) && selectedOfferId > 0) {
    const picked = await pool.query(
      "select id, name, discount_percent, start_date, end_date, active, min_nights from special_offers where id = $1",
      [selectedOfferId],
    );
    selectedOfferRow = picked.rows[0] || null;
  }

  const selectedEligibility = selectedOfferRow
    ? checkSelectedOfferEligibility(selectedOfferRow, arriveDay, departDay, nights)
    : { eligible: true, reasons: [] };

  let offerDiscount = 0;
  let appliedOffer = null;
  if (selectedOfferRow) {
    if (selectedEligibility.eligible) {
      offerDiscount = offerSavings(nightRates, selectedOfferRow);
      if (offerDiscount > 0) {
        appliedOffer = {
          id: selectedOfferRow.id,
          name: selectedOfferRow.name,
          discountPercent: Number(selectedOfferRow.discount_percent),
        };
      }
    }
  } else {
    for (const offer of offersResult.rows) {
      if (!checkSelectedOfferEligibility(offer, arriveDay, departDay, nights).eligible) continue;
      const saved = offerSavings(nightRates, offer);
      if (saved > offerDiscount) {
        offerDiscount = saved;
        appliedOffer = { id: offer.id, name: offer.name, discountPercent: Number(offer.discount_percent) };
      }
    }
  }

  const afterOffer = subtotal - offerDiscount;

  let longStayDiscount = 0;
  let appliedLongStay = null;
  for (const row of longStayResult.rows) {
    const minNights = Number(row.min_nights);
    const pct = Number(row.discount_percent) || 0;
    if (nights >= minNights && pct > 0) {
      const amount = afterOffer * (pct / 100);
      if (amount > longStayDiscount) {
        longStayDiscount = amount;
        appliedLongStay = { id: row.id, minNights, discountPercent: pct };
      }
    }
  }

  const discount = moneyRound(offerDiscount + longStayDiscount);
  const total = moneyRound(Math.max(afterOffer - longStayDiscount, 0));
  const depositAmount = requireDeposit ? moneyRound(total * (depositPercent / 100)) : 0;
  const balanceDue = moneyRound(total - depositAmount);

  return {
    arrive: arriveDay,
    depart: departDay,
    nights,
    currency,
    subtotal: moneyRound(subtotal),
    offerDiscount: moneyRound(offerDiscount),
    longStayDiscount: moneyRound(longStayDiscount),
    discount,
    total,
    depositPercent,
    depositAmount,
    balanceDue,
    requireDeposit,
    minNights: site.minNights,
    maxNights: site.maxNights,
    checkInTime: site.checkInTime,
    checkOutTime: site.checkOutTime,
    appliedOffer,
    appliedLongStay,
    selectedOfferId: selectedOfferRow?.id ?? null,
    selectedOfferEligible: selectedOfferRow ? selectedEligibility.eligible && offerDiscount > 0 : null,
    offerEligibilityReasons: selectedOfferRow && !selectedEligibility.eligible ? selectedEligibility.reasons : [],
    lineItems: nightRates.map(([night, rate]) => ({ night, rate: moneyRound(rate) })),
  };
}

export async function estimateStayTotal(pool, arrive, depart) {
  const quote = await calculateStayQuote(pool, arrive, depart);
  return { nightly: quote.nights ? moneyRound(quote.subtotal / quote.nights) : 0, nights: quote.nights, total: quote.total };
}
