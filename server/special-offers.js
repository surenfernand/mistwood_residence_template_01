import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OFFERS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets", "mistwood", "offers");

const FALLBACK_OFFER_IMAGE_KEYS = [
  "highland-escape",
  "long-stay",
  "family-getaway",
  "romantic-retreat",
  "festive-holiday",
];

function readOfferImageCatalog() {
  const manifest = join(OFFERS_DIR, "sources.json");
  if (!existsSync(manifest)) {
    return FALLBACK_OFFER_IMAGE_KEYS.map((key) => ({ key, file: `${key}.jpg` }));
  }
  try {
    const data = JSON.parse(readFileSync(manifest, "utf8"));
    const photos = Array.isArray(data.photos) ? data.photos : [];
    const rows = photos
      .map((photo) => {
        const file = String(photo.file || "").trim();
        if (!file) return null;
        const key = String(photo.key || file.replace(/\.(jpg|jpeg|png|webp)$/i, "")).trim();
        return { key, file };
      })
      .filter(Boolean);
    return rows.length ? rows : FALLBACK_OFFER_IMAGE_KEYS.map((key) => ({ key, file: `${key}.jpg` }));
  } catch {
    return FALLBACK_OFFER_IMAGE_KEYS.map((key) => ({ key, file: `${key}.jpg` }));
  }
}

let catalogCache = null;

function getOfferImageCatalog() {
  if (!catalogCache) catalogCache = readOfferImageCatalog();
  return catalogCache;
}

export function getOfferImageKeys() {
  return getOfferImageCatalog().map((row) => row.key);
}

const OFFER_SELECT = `
  select id,
         name,
         description,
         discount_percent as "discountPercent",
         start_date::text as "startDate",
         end_date::text as "endDate",
         min_nights as "minNights",
         image_key as "imageKey",
         image_alt as "imageAlt",
         featured,
         badge,
         sort_order as "sortOrder",
         active
    from special_offers
`;

export function offerImageUrl(imageKey) {
  const catalog = getOfferImageCatalog();
  const hit = catalog.find((row) => row.key === imageKey);
  const fallback = catalog[0] || { file: "highland-escape.jpg" };
  const file = hit?.file || fallback.file;
  return `/assets/mistwood/offers/${file}`;
}

export function mapOfferRow(row) {
  return {
    ...row,
    discountPercent: Number(row.discountPercent),
    minNights: Number(row.minNights),
    sortOrder: Number(row.sortOrder),
    imageUrl: offerImageUrl(row.imageKey),
  };
}

export async function listPublicOffers(pool) {
  const { rows } = await pool.query(
    `${OFFER_SELECT} where active order by featured desc, sort_order asc, start_date asc`,
  );
  return rows.map(mapOfferRow);
}

export async function listAdminOffers(pool) {
  const { rows } = await pool.query(`${OFFER_SELECT} order by sort_order asc, start_date asc`);
  return rows.map(mapOfferRow);
}

export function validateOfferBody(body, { partial = false } = {}) {
  const errors = [];
  const out = {};

  if (!partial || "name" in body) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 120) errors.push("Offer name is required (max 120 characters).");
    else out.name = name;
  }

  if (!partial || "discountPercent" in body) {
    const pct = Number(body.discountPercent);
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) errors.push("Discount must be between 1 and 100.");
    else out.discountPercent = pct;
  }

  if (!partial || "startDate" in body || "endDate" in body) {
    const startDate = String(body.startDate || "").slice(0, 10);
    const endDate = String(body.endDate || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      errors.push("Valid start and end dates are required (YYYY-MM-DD).");
    } else if (endDate <= startDate) {
      errors.push("End date must be after start date.");
    } else {
      out.startDate = startDate;
      out.endDate = endDate;
    }
  }

  if (!partial || "minNights" in body) {
    const minNights = Number.parseInt(body.minNights, 10);
    if (!Number.isInteger(minNights) || minNights < 1 || minNights > 60) {
      errors.push("Minimum nights must be between 1 and 60.");
    } else out.minNights = minNights;
  }

  if (!partial || "imageKey" in body) {
    const imageKey = typeof body.imageKey === "string" ? body.imageKey.trim() : "";
    if (!getOfferImageKeys().includes(imageKey)) errors.push("Choose a valid offer image.");
    else out.imageKey = imageKey;
  }

  if (!partial || "description" in body) {
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 2000) : "";
    if (!description) errors.push("Description is required.");
    else out.description = description;
  }

  if (!partial || "imageAlt" in body) {
    out.imageAlt = typeof body.imageAlt === "string" ? body.imageAlt.trim().slice(0, 240) : "";
  }

  if (!partial || "featured" in body) out.featured = Boolean(body.featured);
  if (!partial || "active" in body) out.active = body.active !== false;

  if (!partial || "badge" in body) {
    const badge = body.badge == null || body.badge === "" ? null : String(body.badge).trim().slice(0, 80);
    out.badge = badge;
  }

  if (!partial || "sortOrder" in body) {
    const sortOrder = Number.parseInt(body.sortOrder, 10);
    out.sortOrder = Number.isFinite(sortOrder) ? sortOrder : 0;
  }

  return { errors, out };
}
