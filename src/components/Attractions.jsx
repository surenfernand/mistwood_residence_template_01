import { useEffect, useMemo, useRef, useState } from "react";
import {
  ATTRACTIONS,
  ATTRACTION_CATEGORIES,
  PLACEHOLDER_IMAGE,
} from "../data/attractions.js";

const INITIAL_COUNT = 6;

function CategoryIcon({ category }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (category) {
    case "All Attractions":
      return (
        <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1.4" /><rect x="14" y="4" width="6" height="6" rx="1.4" /><rect x="4" y="14" width="6" height="6" rx="1.4" /><rect x="14" y="14" width="6" height="6" rx="1.4" /></svg>
      );
    case "Lakes & Parks":
      return (
        <svg {...common}><path d="M3 15q2.5-3 5 0t5 0 5 0 3 0" /><path d="M3 19q2.5-3 5 0t5 0 5 0 3 0" /><path d="M9 11V5m0 0 3 2M9 5 6 7" /></svg>
      );
    case "Tea Estates":
      return (
        <svg {...common}><path d="M12 21C10 13 13 6 21 3c0 9-4 15-9 15" /><path d="M12 18C5 18 3 12 3 6c6 3 9 7 9 12Z" /></svg>
      );
    case "Waterfalls":
      return (
        <svg {...common}><path d="M7 3v13M12 3v13M17 3v13" /><path d="M4 20q2-2 4 0t4 0 4 0 4 0" /></svg>
      );
    case "Gardens":
      return (
        <svg {...common}><circle cx="12" cy="9" r="2.4" /><path d="M12 11.4V21M9.6 7.2 7 5m7.4 2.2L17 5m-5 1.6V3m-4 9c-2 0-3.5-1.5-3.5-3.5C7 9 8 10.4 8 12Zm8 0c2 0 3.5-1.5 3.5-3.5C17 9 16 10.4 16 12Z" /></svg>
      );
    case "Farms":
      return (
        <svg {...common}><path d="M4 10 12 5l8 5v10H4V10Z" /><path d="M9 20v-6h6v6" /><path d="M9 14h6" /></svg>
      );
    case "Nature & Hiking":
      return (
        <svg {...common}><path d="M3 19 9 8l4 6 2-3 6 8H3Z" /><path d="m9 8 1.8 3" /></svg>
      );
    case "Cultural Sites":
      return (
        <svg {...common}><path d="M12 3 4 7h16L12 3Z" /><path d="M6 9v8m4-8v8m4-8v8m4-8v8M4 20h16" /></svg>
      );
    default:
      return null;
  }
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" /><circle cx="12" cy="11" r="1.8" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 13l1.8-5.2A2 2 0 0 1 6.7 6.5h10.6a2 2 0 0 1 1.9 1.3L21 13v5h-2.5M3 13v5h2.5M3 13h18" /><circle cx="7" cy="17.5" r="1.4" /><circle cx="17" cy="17.5" r="1.4" />
    </svg>
  );
}

function handleImageError(event) {
  if (event.target.dataset.fallback) return;
  event.target.dataset.fallback = "1";
  event.target.src = PLACEHOLDER_IMAGE;
}

function AttractionCard({ attraction, onOpen }) {
  const { name, category, description, image, alt, distance, travelTime } = attraction;
  const showMeta = Boolean(distance || travelTime);
  return (
    <article className="attraction-card">
      <div className="attraction-card-media">
        <img
          src={image}
          alt={alt || name}
          loading="lazy"
          width="640"
          height="360"
          onError={handleImageError}
        />
        <span className="attraction-badge">
          <CategoryIcon category={category} />
          {category}
        </span>
      </div>
      <div className="attraction-card-body">
        <h3>{name}</h3>
        <p className="attraction-card-text">{description}</p>
        {showMeta ? (
          <div className="attraction-meta">
            {distance ? (
              <span><PinIcon /> {distance}</span>
            ) : null}
            {travelTime ? (
              <span><CarIcon /> {travelTime}</span>
            ) : null}
          </div>
        ) : null}
        <button type="button" className="attraction-details-btn" onClick={() => onOpen(attraction)}>
          View Details <ArrowIcon />
        </button>
      </div>
    </article>
  );
}

function AttractionModal({ attraction, onClose }) {
  const closeRef = useRef(null);
  const titleId = "attraction-modal-title";

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  if (!attraction) return null;
  const { name, category, description, image, alt, distance, travelTime, maps } = attraction;

  return (
    <div className="attraction-modal-overlay" onClick={onClose}>
      <div
        className="attraction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="attraction-modal-close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div className="attraction-modal-media">
          <img src={image} alt={alt || name} onError={handleImageError} />
          <span className="attraction-badge">
            <CategoryIcon category={category} />
            {category}
          </span>
        </div>
        <div className="attraction-modal-body">
          <h3 id={titleId}>{name}</h3>
          <p>{description}</p>
          {(distance || travelTime) ? (
            <div className="attraction-meta">
              {distance ? <span><PinIcon /> {distance}</span> : null}
              {travelTime ? <span><CarIcon /> {travelTime}</span> : null}
            </div>
          ) : null}
          {maps ? (
            <a className="mh-btn" href={maps} target="_blank" rel="noopener noreferrer">
              Open in Google Maps <ArrowIcon />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function Attractions() {
  const [active, setActive] = useState("All Attractions");
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(null);

  // Only show category filters that actually contain attractions.
  const categories = useMemo(() => {
    return ATTRACTION_CATEGORIES.filter(
      (category) =>
        category === "All Attractions" ||
        ATTRACTIONS.some((item) => item.category === category),
    );
  }, []);

  const filtered = useMemo(() => {
    if (active === "All Attractions") return ATTRACTIONS;
    return ATTRACTIONS.filter((item) => item.category === active);
  }, [active]);

  const isAll = active === "All Attractions";
  const visible = isAll && !expanded ? filtered.slice(0, INITIAL_COUNT) : filtered;
  const canExpand = isAll && filtered.length > INITIAL_COUNT;

  return (
    <section
      className="attractions-section"
      aria-labelledby="attractions-title"
      style={{
        backgroundImage: "url('/images/explore/pexels-tomfisk-5718331.jpg?v=10')",
      }}
    >
      <div className="attractions-overlay" aria-hidden="true" />
      <div className="mh-wrap attractions-inner">
        <header className="attractions-head">
          <p className="mh-kicker gold">Explore Nuwara Eliya</p>
          <h2 id="attractions-title">Discover Nearby Attractions</h2>
          <p className="attractions-sub">
            From serene lakes and lush tea estates to breathtaking waterfalls and gardens,
            explore the best of Nuwara Eliya.
          </p>
        </header>

        <div className="attractions-filters" role="group" aria-label="Filter attractions by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={category === active ? "attraction-filter is-active" : "attraction-filter"}
              aria-pressed={category === active}
              onClick={() => setActive(category)}
            >
              <CategoryIcon category={category} />
              {category}
            </button>
          ))}
        </div>

        <div className="attractions-grid">
          {visible.map((attraction) => (
            <AttractionCard key={attraction.id} attraction={attraction} onOpen={setSelected} />
          ))}
        </div>

        {canExpand ? (
          <div className="attractions-more">
            <button
              type="button"
              className="mh-btn attractions-more-btn"
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Show Less" : `Load More`}
            </button>
          </div>
        ) : null}
      </div>

      {selected ? <AttractionModal attraction={selected} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}
