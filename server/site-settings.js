const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

function isHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const CAMEL_MAP = {
  property_name: "propertyName",
  logo_url: "logoUrl",
  tagline: "tagline",
  property_description: "propertyDescription",
  contact_email: "contactEmail",
  contact_phone: "contactPhone",
  whatsapp_url: "whatsappUrl",
  public_address: "publicAddress",
  footer_tagline: "footerTagline",
  deposit_percent: "depositPercent",
  min_nights: "minNights",
  max_nights: "maxNights",
  max_guests: "maxGuests",
  advance_booking_days: "advanceBookingDays",
  check_in_time: "checkInTime",
  check_out_time: "checkOutTime",
  same_day_booking: "sameDayBooking",
  lead_time_hours: "leadTimeHours",
  require_deposit: "requireDeposit",
  cancellation_policy: "cancellationPolicy",
  admin_alert_email: "adminAlertEmail",
  send_customer_booking_email: "sendCustomerBookingEmail",
  send_admin_booking_email: "sendAdminBookingEmail",
  mail_from_name: "mailFromName",
  facebook_url: "facebookUrl",
  instagram_url: "instagramUrl",
  youtube_url: "youtubeUrl",
  telegram_url: "telegramUrl",
  updated_at: "updatedAt",
  updated_by_admin_id: "updatedByAdminId",
};

function rowToCamel(row) {
  if (!row) return null;
  const out = { id: row.id };
  for (const [snake, camel] of Object.entries(CAMEL_MAP)) {
    if (snake in row) {
      const val = row[snake];
      out[camel] = typeof val === "number" ? val : val;
    }
  }
  if (out.depositPercent != null) out.depositPercent = Number(out.depositPercent);
  if (out.leadTimeHours != null) out.leadTimeHours = Number(out.leadTimeHours);
  if (out.sameDayBooking != null) out.sameDayBooking = Boolean(out.sameDayBooking);
  if (out.requireDeposit != null) out.requireDeposit = Boolean(out.requireDeposit);
  return out;
}

const PUBLIC_KEYS = [
  "propertyName", "logoUrl", "tagline", "propertyDescription", "contactEmail", "contactPhone", "whatsappUrl",
  "publicAddress", "footerTagline",
  "depositPercent", "minNights", "maxNights", "maxGuests", "advanceBookingDays", "checkInTime", "checkOutTime",
  "sameDayBooking", "leadTimeHours", "requireDeposit", "cancellationPolicy",
  "facebookUrl", "instagramUrl", "youtubeUrl", "telegramUrl",
];

let cache = { value: null, expires: 0 };
const CACHE_MS = 30_000;

export function invalidateSiteSettingsCache() {
  cache = { value: null, expires: 0 };
}

export async function getSiteSettings(pool) {
  const now = Date.now();
  if (cache.value && cache.expires > now) return cache.value;
  const { rows } = await pool.query("select * from site_settings where id = 1");
  const settings = rowToCamel(rows[0]);
  if (!settings) throw new Error("site_settings row missing");
  cache = { value: settings, expires: now + CACHE_MS };
  return settings;
}

export function getPublicSettingsFrom(settings) {
  const out = {};
  for (const key of PUBLIC_KEYS) out[key] = settings[key] ?? null;
  return out;
}

export async function getPublicSettings(pool) {
  const settings = await getSiteSettings(pool);
  return getPublicSettingsFrom(settings);
}

const PATCH_MAP = {
  propertyName: "property_name",
  logoUrl: "logo_url",
  tagline: "tagline",
  propertyDescription: "property_description",
  contactEmail: "contact_email",
  contactPhone: "contact_phone",
  whatsappUrl: "whatsapp_url",
  publicAddress: "public_address",
  footerTagline: "footer_tagline",
  depositPercent: "deposit_percent",
  minNights: "min_nights",
  maxNights: "max_nights",
  maxGuests: "max_guests",
  advanceBookingDays: "advance_booking_days",
  checkInTime: "check_in_time",
  checkOutTime: "check_out_time",
  sameDayBooking: "same_day_booking",
  leadTimeHours: "lead_time_hours",
  requireDeposit: "require_deposit",
  cancellationPolicy: "cancellation_policy",
  adminAlertEmail: "admin_alert_email",
  sendCustomerBookingEmail: "send_customer_booking_email",
  sendAdminBookingEmail: "send_admin_booking_email",
  mailFromName: "mail_from_name",
  facebookUrl: "facebook_url",
  instagramUrl: "instagram_url",
  youtubeUrl: "youtube_url",
  telegramUrl: "telegram_url",
};

export function validateSettingsPatch(patch) {
  const errors = [];
  const next = {};

  for (const [camel, snake] of Object.entries(PATCH_MAP)) {
    if (!(camel in patch)) continue;
    let value = patch[camel];

    if (["sendCustomerBookingEmail", "sendAdminBookingEmail", "sameDayBooking", "requireDeposit"].includes(camel)) {
      next[snake] = Boolean(value);
      continue;
    }

    if (camel === "leadTimeHours") {
      const n = Number.parseInt(value, 10);
      if (!Number.isFinite(n) || n < 0 || n > 168) errors.push("Lead time must be between 0 and 168 hours.");
      else next[snake] = n;
      continue;
    }

    if (camel === "depositPercent") {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 1 || n > 100) {
        errors.push("Deposit percent must be between 1 and 100.");
      } else next[snake] = n;
      continue;
    }

    if (["minNights", "maxGuests"].includes(camel)) {
      const n = Number.parseInt(value, 10);
      if (!Number.isFinite(n) || n < 1) errors.push(`${camel} must be at least 1.`);
      else next[snake] = n;
      continue;
    }

    if (["maxNights", "advanceBookingDays"].includes(camel)) {
      if (value === null || value === "" || value === undefined) {
        next[snake] = null;
        continue;
      }
      const n = Number.parseInt(value, 10);
      if (!Number.isFinite(n) || n < 1) errors.push(`${camel} must be at least 1 or empty.`);
      else next[snake] = n;
      continue;
    }

    if (camel === "contactEmail" || camel === "adminAlertEmail") {
      const s = String(value || "").trim().toLowerCase();
      if (!isEmail(s)) errors.push(`Invalid ${camel}.`);
      else next[snake] = s;
      continue;
    }

    if (camel === "logoUrl") {
      const s = String(value || "").trim();
      if (!s) errors.push("Logo URL is required.");
      else if (!s.startsWith("/") && !isHttpUrl(s)) errors.push("Invalid logo URL.");
      else next[snake] = s.slice(0, 500);
      continue;
    }

    if (camel.endsWith("Url")) {
      const s = value ? String(value).trim() : null;
      if (s && !isHttpUrl(s)) errors.push(`Invalid URL for ${camel}.`);
      else next[snake] = s;
      continue;
    }

    if (typeof value === "string") {
      const maxLen = camel === "propertyDescription" || camel === "cancellationPolicy" ? 4000
        : camel.includes("tagline") || camel.includes("Address") || camel.includes("Description") ? 2000
          : camel === "checkInTime" || camel === "checkOutTime" ? 8
            : 200;
      next[snake] = value.trim().slice(0, maxLen);
    } else if (value != null) {
      errors.push(`Invalid type for ${camel}.`);
    }
  }

  if (next.min_nights != null && next.max_nights != null && next.max_nights < next.min_nights) {
    errors.push("maxNights cannot be less than minNights.");
  }

  return { errors, fields: next };
}

export async function updateSiteSettings(pool, patch, adminId) {
  const siteOnly = { ...(patch || {}) };
  delete siteOnly.nightlyRate;
  delete siteOnly.rateCurrency;
  const { errors, fields } = validateSettingsPatch(siteOnly);
  if (errors.length) {
    throw Object.assign(new Error(errors[0]), { status: 400, details: errors });
  }
  if (!Object.keys(fields).length) {
    throw Object.assign(new Error("No valid fields to update."), { status: 400 });
  }

  const keys = Object.keys(fields);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  sets.push(`updated_at = now()`, `updated_by_admin_id = $${keys.length + 1}`);
  const values = [...keys.map((k) => fields[k]), adminId];

  try {
    await pool.query(`update site_settings set ${sets.join(", ")} where id = 1`, values);
  } catch (err) {
    if (err.code === "23514") {
      throw Object.assign(
        new Error("One or more values are outside allowed limits (e.g. deposit % must be 1–100)."),
        { status: 400 },
      );
    }
    if (err.code === "23503") {
      throw Object.assign(new Error("Could not save settings. Sign in again and retry."), { status: 400 });
    }
    throw err;
  }
  invalidateSiteSettingsCache();
  return getSiteSettings(pool);
}

function colomboTodayIso() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
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

export async function validateBookingAgainstSettings(pool, { arrive, depart, guests }) {
  const s = await getSiteSettings(pool);
  const nights = Math.round((new Date(`${depart}T12:00:00Z`) - new Date(`${arrive}T12:00:00Z`)) / 86400000);
  if (nights < s.minNights) {
    throw Object.assign(new Error(`Minimum stay is ${s.minNights} night(s).`), { status: 400 });
  }
  if (s.maxNights != null && nights > s.maxNights) {
    throw Object.assign(new Error(`Maximum stay is ${s.maxNights} night(s).`), { status: 400 });
  }
  const guestCount = Number.parseInt(String(guests || "1"), 10) || 1;
  if (guestCount > s.maxGuests) {
    throw Object.assign(new Error(`Maximum ${s.maxGuests} guest(s) per booking.`), { status: 400 });
  }

  const today = colomboTodayIso();
  if (arrive < today) {
    throw Object.assign(new Error("Arrival date cannot be in the past."), { status: 400 });
  }
  if (!s.sameDayBooking && arrive === today) {
    throw Object.assign(new Error("Same-day bookings are not available. Please choose a later arrival date."), { status: 400 });
  }
  if (s.advanceBookingDays != null) {
    const latest = addDaysIso(today, s.advanceBookingDays);
    if (arrive > latest) {
      throw Object.assign(new Error(`Bookings are only accepted up to ${s.advanceBookingDays} days in advance.`), { status: 400 });
    }
  }
  const lead = Number(s.leadTimeHours) || 0;
  if (lead > 0) {
    const [h, min] = String(s.checkInTime || "14:00").split(":").map(Number);
    const checkIn = new Date(`${arrive}T${String(h).padStart(2, "0")}:${String(min || 0).padStart(2, "0")}:00+05:30`);
    if (checkIn.getTime() < Date.now() + lead * 3600000) {
      throw Object.assign(
        new Error(`Bookings must be made at least ${lead} hour(s) before check-in.`),
        { status: 400 },
      );
    }
  }
}

/** Snapshot for email modules (sync call after await getSiteSettings). */
export function contactFromSettings(settings) {
  return {
    propertyName: settings.propertyName,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    whatsappUrl: settings.whatsappUrl,
    mailFrom: `${settings.mailFromName} <${settings.contactEmail}>`,
    adminAlertEmail: settings.adminAlertEmail,
    sendCustomerBookingEmail: settings.sendCustomerBookingEmail,
    sendAdminBookingEmail: settings.sendAdminBookingEmail,
  };
}
