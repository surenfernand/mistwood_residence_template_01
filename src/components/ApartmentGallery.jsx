import { useMemo, useRef, useState } from "react";
import { usePhotos } from "../photos.jsx";
import {
  FEATURED_VIDEOS,
  GALLERY_FILTERS,
  GALLERY_PHOTOS,
} from "../data/galleryPhotos.js";

const PREVIEW_COUNT = 8;

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
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.6" />
          <path d="m5 17 5-4 4 3 2-2 3 3" />
        </svg>
      );
    case "Bedrooms":
      return (
        <svg {...common}>
          <path d="M3 17v-4a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v3" />
          <path d="M3 11V7h6v4M21 17v2M3 17v2" />
        </svg>
      );
    case "Living Room":
      return (
        <svg {...common}>
          <path d="M5 11V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
          <path d="M4 11a2 2 0 0 1 2 2v3h12v-3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5H2v-5a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "Kitchen":
      return (
        <svg {...common}>
          <path d="M5 3v7a3 3 0 0 0 6 0V3M8 3v18M16 3c-1.5 0-2.5 1.8-2.5 4s1 4 2.5 4m0-8c1.5 0 2.5 1.8 2.5 4s-1 4-2.5 4m0 0v6" />
        </svg>
      );
    case "Bathroom":
      return (
        <svg {...common}>
          <path d="M4 12h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2Z" />
          <path d="M6 12V6a2 2 0 0 1 2-2c1 0 1.6.6 2 1.4M7 18l-1 2M18 18l1 2" />
        </svg>
      );
    case "Balcony & Views":
      return (
        <svg {...common}>
          <path d="M3 20h18M4 20V9l8-5 8 5v11M9 20v-5h6v5" />
          <path d="M4 9h16" />
        </svg>
      );
    default:
      return null;
  }
}

function VideoKickerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2" y="5" width="15" height="14" rx="2" />
      <path d="m17 9 5-2.5v11L17 15V9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,.22)" stroke="#fff" strokeWidth="1.5" />
      <path d="m10 8.5 7 3.5-7 3.5Z" fill="#fff" />
    </svg>
  );
}

function FeaturedVideoCard({ item }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    setPlaying(true);
    requestAnimationFrame(() => {
      const el = videoRef.current;
      if (!el) return;
      el.play().catch(() => {});
    });
  };

  return (
    <article className="apt-video-card">
      {playing ? (
        <video
          ref={videoRef}
          className="apt-video-card-player"
          src={item.src}
          poster={item.poster}
          controls
          playsInline
          preload="metadata"
          aria-label={item.alt}
        />
      ) : (
        <button type="button" className="apt-video-card-hit" onClick={start} aria-label={`Play video: ${item.title}`}>
          <img src={item.poster} alt="" loading="lazy" />
          <span className="apt-video-card-play">
            <PlayIcon />
          </span>
        </button>
      )}
      <div className="apt-video-card-meta">
        <span className="apt-video-card-meta-icon" aria-hidden="true">
          <VideoKickerIcon />
        </span>
        <span className="apt-video-card-title">{item.title}</span>
        <time className="apt-video-card-duration" dateTime={`PT${item.duration.replace(":", "M")}S`}>
          {item.duration}
        </time>
      </div>
    </article>
  );
}

export default function ApartmentGallery() {
  const { openPhoto } = usePhotos();
  const [active, setActive] = useState("All Photos");
  const totalPhotos = GALLERY_PHOTOS.length;

  const tabFilters = useMemo(
    () =>
      GALLERY_FILTERS.filter((name) => {
        if (name === "Overview" || name === "Details") return false;
        if (name === "All Photos") return true;
        return GALLERY_PHOTOS.some((p) => p.category === name);
      }),
    [],
  );

  const visiblePhotos = useMemo(() => {
    if (active !== "All Photos") return GALLERY_PHOTOS.filter((p) => p.category === active);

    const buckets = new Map();
    for (const photo of GALLERY_PHOTOS) {
      if (!buckets.has(photo.category)) buckets.set(photo.category, []);
      buckets.get(photo.category).push(photo);
    }
    const order = GALLERY_FILTERS.filter((name) => name !== "All Photos" && name !== "Overview");
    const mixed = [];
    let added = true;
    while (added) {
      added = false;
      for (const name of order) {
        const list = buckets.get(name);
        if (list?.length) {
          mixed.push(list.shift());
          added = true;
        }
      }
    }
    return mixed;
  }, [active, tabFilters]);

  const preview = visiblePhotos.slice(0, PREVIEW_COUNT);
  const moreCount = Math.max(0, visiblePhotos.length - PREVIEW_COUNT);
  const moreBackdrop = visiblePhotos[PREVIEW_COUNT] || visiblePhotos[visiblePhotos.length - 1];

  const open = (photo) => {
    const index = visiblePhotos.indexOf(photo);
    openPhoto({ ...photo, gallery: visiblePhotos, index });
  };

  const openFromStart = () => {
    const first = visiblePhotos[0];
    if (!first) return;
    openPhoto({ ...first, gallery: visiblePhotos, index: 0 });
  };

  const filterLabel = (name) => (name === "All Photos" ? `All Photos (${totalPhotos})` : name);

  return (
    <section className="apt-gallery" aria-labelledby="apt-gallery-title">
      <div className="container apt-gallery-inner">
        <header className="apt-gallery-head">
          <span className="eyebrow apt-gallery-eyebrow">The apartment gallery</span>
          <h2 id="apt-gallery-title">A closer look at Mistwood</h2>
          <p className="apt-gallery-sub">
            Browse the rooms, then watch a short walkthrough and highland views before you book.
          </p>
        </header>

        <div className="apt-gallery-layout">
          <div className="apt-gallery-main">
            <div className="apt-gallery-filters" role="tablist" aria-label="Filter photos by room">
              {tabFilters.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={active === name}
                  className={active === name ? "apt-filter is-on" : "apt-filter"}
                  onClick={() => setActive(name)}
                >
                  <FilterIcon name={name} />
                  <span>{filterLabel(name)}</span>
                </button>
              ))}
            </div>

            <div className="apt-gallery-preview-grid">
              {preview.map((photo) => (
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
              {moreCount > 0 ? (
                <button
                  type="button"
                  className="apt-tile apt-tile-more"
                  onClick={openFromStart}
                  aria-label={`View all ${visiblePhotos.length} photos in this set`}
                >
                  <img src={moreBackdrop.src} alt="" loading="lazy" aria-hidden="true" />
                  <span className="apt-tile-more-copy">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <circle cx="8.5" cy="10" r="1.6" />
                      <path d="m5 17 5-4 4 3 2-2 3 3" />
                    </svg>
                    <strong>+{moreCount} More Photos</strong>
                  </span>
                </button>
              ) : null}
            </div>
          </div>

          <aside className="apt-gallery-video-aside" aria-labelledby="apt-gallery-video-title">
            <p className="apt-gallery-video-kicker">
              <VideoKickerIcon />
              <span>In video</span>
            </p>
            <h3 id="apt-gallery-video-title">Experience Mistwood in Motion</h3>
            <p className="apt-gallery-video-lede">
              Get a real feel for the space with our short videos—from a full apartment walkthrough to the beautiful highland surroundings.
            </p>
            <div className="apt-gallery-featured-videos">
              {FEATURED_VIDEOS.map((item) => (
                <FeaturedVideoCard key={item.src} item={item} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
