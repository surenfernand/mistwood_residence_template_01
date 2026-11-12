const BASE = "/assets/mistwood/offers";

/** @typedef {{ key: string, label: string, defaultAlt: string, url: string, file: string }} OfferImageOption */

const FALLBACK = [
  { key: "highland-escape", label: "Highland escape (tea hills)", defaultAlt: "", file: "highland-escape.jpg" },
  { key: "long-stay", label: "Long stay (reading by window)", defaultAlt: "", file: "long-stay.jpg" },
  { key: "family-getaway", label: "Family getaway", defaultAlt: "", file: "family-getaway.jpg" },
  { key: "romantic-retreat", label: "Romantic retreat", defaultAlt: "", file: "romantic-retreat.jpg" },
  { key: "festive-holiday", label: "Festive holiday", defaultAlt: "", file: "festive-holiday.jpg" },
].map((row) => ({ ...row, url: `${BASE}/${row.file}` }));

/**
 * @param {unknown} data
 * @returns {OfferImageOption[]}
 */
function parseCatalog(data) {
  const photos = data?.photos;
  if (!Array.isArray(photos) || !photos.length) return FALLBACK;
  const options = photos
    .map((photo) => {
      const file = String(photo.file || "").trim();
      if (!file) return null;
      const key = String(photo.key || file.replace(/\.(jpg|jpeg|png|webp)$/i, "")).trim();
      return {
        key,
        label: String(photo.label || key.replace(/-/g, " ")).trim(),
        defaultAlt: String(photo.defaultAlt || photo.alt || "").trim(),
        file,
        url: `${BASE}/${file}`,
      };
    })
    .filter(Boolean);
  return options.length ? options : FALLBACK;
}

let cachedOptions = null;
let inflight = null;

/** @returns {Promise<OfferImageOption[]>} */
export async function loadOfferImageOptions() {
  if (cachedOptions) return cachedOptions;
  if (!inflight) {
    inflight = fetch(`${BASE}/sources.json`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        cachedOptions = parseCatalog(data);
        return cachedOptions;
      })
      .catch(() => {
        cachedOptions = FALLBACK;
        return cachedOptions;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function offerImageUrlForKey(key, options) {
  const list = options || cachedOptions || FALLBACK;
  const hit = list.find((o) => o.key === key);
  return hit?.url || `${BASE}/highland-escape.jpg`;
}
