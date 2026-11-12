/** Active base nightly rate used by pricing quotes and bookings. */

export async function getActivePropertyRate(pool) {
  const { rows } = await pool.query(
    'select nightly_rate as "nightlyRate", currency from property_rates where active order by id desc limit 1',
  );
  if (!rows[0]) return { nightlyRate: 45000, currency: "LKR" };
  return {
    nightlyRate: Number(rows[0].nightlyRate) || 0,
    currency: rows[0].currency || "LKR",
  };
}

export async function setPropertyBaseRate(pool, nightlyRate) {
  const n = Number(nightlyRate);
  if (!Number.isFinite(n) || n < 100 || n > 10_000_000) {
    throw Object.assign(new Error("Nightly rate must be between 100 and 10,000,000."), { status: 400 });
  }

  const active = await getActivePropertyRate(pool);
  const { rowCount } = await pool.query(
    `update property_rates set nightly_rate = $1
       where id = (select id from property_rates where active order by id desc limit 1)`,
    [n],
  );
  if (!rowCount) {
    await pool.query("insert into property_rates (nightly_rate, currency) values ($1, $2)", [
      n,
      active.currency || "LKR",
    ]);
  }
  return getActivePropertyRate(pool);
}

export async function attachPricingToSettings(pool, settings) {
  const rate = await getActivePropertyRate(pool);
  return {
    ...settings,
    nightlyRate: rate.nightlyRate,
    rateCurrency: rate.currency,
  };
}
