import { useMemo, useState } from "react";
import { usePhotos } from "../photos.jsx";
import { GALLERY_FILTERS, GALLERY_PHOTOS } from "../data/galleryPhotos.js";

function FilterIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "All Photos":
      return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.6" /><path d="m5 17 5-4 4 3 2-2 3 3" /></svg>);
    case "Bedrooms":
      return (<svg {...common}><path d="M3 17v-4a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v3" /><path d="M3 11V7h6v4M21 17v2M3 17v2" /></svg>);
    case "Living Room":
      return (<svg {...common}><path d="M5 11V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" /><path d="M4 11a2 2 0 0 1 2 2v3h12v-3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5H2v-5a2 2 0 0 1 2-2Z" /></svg>);
    case "Kitchen":
      return (<svg {...common}><path d="M5 3v7a3 3 0 0 0 6 0V3M8 3v18M16 3c-1.5 0-2.5 1.8-2.5 4s1 4 2.5 4m0-8c1.5 0 2.5 1.8 2.5 4s-1 4-2.5 4m0 0v6" /></svg>);
    case "Bathroom":
      return (<svg {...common}><path d="M4 12h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2Z" /><path d="M6 12V6a2 2 0 0 1 2-2c1 0 1.6.6 2 1.4M7 18l-1 2M18 18l1 2" /></svg>);
    case "Balcony & Views":
      return (<svg {...common}><path d="M3 20h18M4 20V9l8-5 8 5v11M9 20v-5h6v5" /><path d="M4 9h16" /></svg>);
    case "Details":
      return (<svg {...common}><path d="M12 3c2.5 3 5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 2.5-6 5-9Z" /></svg>);
    default:
      return null;
  }
}

export default function ApartmentGallery() {
  const { openPhoto } = usePhotos();
  const [active, setActive] = useState("All Photos");

  // Only show filters that actually have photos (plus the virtual "All Photos").
  const filters = useMemo(
    () =>
      GALLERY_FILTERS.filter(
        (name) => name === "All Photos" || GALLERY_PHOTOS.some((p) => p.category === name),
      ),
    [],
  );

  // For "All Photos" interleave the categories so the collage stays varied
  // instead of showing every bedroom first. Other filters keep data order.
  const visible = useMemo(() => {
    if (active !== "All Photos") return GALLERY_PHOTOS.filter((p) => p.category === active);

    const buckets = new Map();
    for (const photo of GALLERY_PHOTOS) {
      if (!buckets.has(photo.category)) buckets.set(photo.category, []);
      buckets.get(photo.category).push(photo);
    }
    const order = filters.filter((name) => name !== "All Photos");
    const mixed = [];
    let added = true;
    while (added) {
      added = false;
      for (const name of order) {
        const list = buckets.get(name);
        if (list && list.length) {
          mixed.push(list.shift());
          added = true;
        }
      }
    }
    return mixed;
  }, [active, filters]);

  const open = (photo) => {
    const index = visible.indexOf(photo);
    openPhoto({ ...photo, gallery: visible, index });
  };

  return (
    <section className="apt-gallery" aria-labelledby="apt-gallery-title">
      <div className="container apt-gallery-inner">
        <header className="apt-gallery-head">
          <span className="eyebrow apt-gallery-eyebrow">The apartment gallery</span>
          <h2 id="apt-gallery-title">A closer look at Mistwood</h2>
          <p className="apt-gallery-sub">
            See every room in detail with a complete set of photos, so you know what to expect before booking.
          </p>
        </header>

        <div className="apt-gallery-filters" role="tablist" aria-label="Filter photos by room">
          {filters.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={active === name}
              aria-pressed={active === name}
              className={active === name ? "apt-filter is-on" : "apt-filter"}
              onClick={() => setActive(name)}
            >
              <FilterIcon name={name} />
              <span>{name}</span>
            </button>
          ))}
        </div>

        <div className="apt-gallery-grid">
          {visible.map((photo) => (
            <button
              type="button"
              className="apt-tile"
              key={photo.src}
              onClick={() => open(photo)}
              aria-label={`Open photo: ${photo.alt}`}
            >
              <img src={photo.src} alt={photo.alt} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
