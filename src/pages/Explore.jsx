import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";
import Attractions from "../components/Attractions.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const experiences = [
  { title: "Lake Gregory", text: "Enjoy a peaceful lakeside setting, perfect for walking, boating, and relaxing in the cool mountain air.", image: "03-lake-gregory.jpg", alt: "Boats and a flower-lined boardwalk beside Gregory Lake", icon: "water" },
  { title: "Tea Plantations", text: "Explore the lush tea estates and discover Sri Lanka's rich tea heritage.", video: "/assets/mistwood/videos/mistwood-tea-valley.mp4", poster: "/images/explore/04-tea-plantations.jpg", alt: "Green tea fields winding through the hills at sunset", icon: "tea" },
  { title: "Scenic Train Journeys", text: "Experience scenic railway journeys through misty hills, tea estates, and picturesque villages.", image: "05-scenic-train.jpg", alt: "A blue train crossing a stone railway viaduct in Sri Lanka's hill country", icon: "train" },
];

function ExperienceIcon({ type }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === "water" ? <path d="M3 8q3-4 6 0t6 0 6 0 6 0M3 16q3-4 6 0t6 0 6 0 6 0M3 24q3-4 6 0t6 0 6 0 6 0" /> : type === "tea" ? <><path d="M16 28C14 16 18 7 29 3c0 13-5 20-13 20M16 23 26 7M15 21C6 21 3 14 3 6c8 4 12 9 12 15Z" /></> : <><rect x="7" y="5" width="18" height="21" rx="4" /><path d="M12 5V2h8v3M8 17h16M8 11h16M16 11v6M10 26l-4 4m16-4 4 4M10 29h12" /><circle cx="12" cy="22" r="1" /><circle cx="20" cy="22" r="1" /></>}
    </svg>
  );
}

const mapAttractions = [
  { name: "Gregory Lake", category: "Lake & Leisure", coords: [6.9609, 80.7780], image: "/assets/mistwood/explore/gregory-lake-card.jpg", detail: "Lake walks and pedal boats beside the town.", query: "Gregory Lake, Nuwara Eliya, Sri Lanka" },
  { name: "Horton Plains National Park", category: "Nature & Hiking", coords: [6.8030, 80.7915], image: "/assets/mistwood/explore/horton-plains.jpg", detail: "Highland grasslands, cloud forest, and walking trails.", query: "Horton Plains National Park, Sri Lanka" },
  { name: "Hakgala Botanical Garden", category: "Botanical Garden", coords: [6.9248, 80.8194], image: "/assets/places/hakgala.jpg", detail: "A cool-climate garden of roses, ferns, and orchids.", query: "Hakgala Botanical Garden, Nuwara Eliya, Sri Lanka" },
  { name: "Moon Plains (Sandathenna)", category: "Mountain Viewpoint", coords: [6.94308, 80.82015], detail: "Open highland scenery and views of the surrounding mountains.", query: "Moon Plains, Sandathenna, Nuwara Eliya, Sri Lanka" },
  { name: "Ambewela Farm", category: "Dairy Farm", coords: [6.8898, 80.8008], detail: "Dairy farming amid the green pastures of Ambewela.", query: "Ambewela Farm, Sri Lanka" },
  { name: "Seetha Amman Temple", category: "Cultural & Religious Site", coords: [6.9286, 80.8047], detail: "A colourful temple near Hakgala in the Nuwara Eliya hills.", query: "Seetha Amman Temple, Nuwara Eliya, Sri Lanka" },
  { name: "Lover's Leap Waterfall", category: "Waterfall", coords: [6.97827, 80.78661], image: "/assets/places/leap.jpg", detail: "A scenic waterfall reached from the tea hills above town.", query: "Lover's Leap Waterfall, Nuwara Eliya, Sri Lanka" },
  { name: "Pedro Tea Estate", category: "Tea Plantation", coords: [6.9636, 80.7907], image: "/assets/mistwood/explore/tea-plantations-card.jpg", detail: "A working tea estate close to Nuwara Eliya.", query: "Pedro Tea Estate, Nuwara Eliya, Sri Lanka" },
  { name: "Victoria Park", category: "Garden & Recreation", coords: [6.96917, 80.76806], image: "/assets/mistwood/explore/victoria-park.jpg", detail: "A peaceful town-centre park with seasonal flowers and birds.", query: "Victoria Park, Nuwara Eliya, Sri Lanka" },
  { name: "Ramboda Falls", category: "Waterfall", coords: [7.05587, 80.69907], detail: "Waterfall views along the Ramboda stretch of the hill-country road.", query: "Ramboda Falls, Sri Lanka" },
  { name: "Nanu Oya Falls", category: "Waterfall", coords: [6.94515, 80.73878], image: "/images/attractions/nanuoya-falls.jpg", detail: "Tiered falls beside Nanu Oya, with scenic trains on the viaduct overhead.", query: "Nanu Oya Falls, Nanu Oya, Sri Lanka" },
  { name: "Single Tree Hill", category: "Mountain Viewpoint", coords: [6.9578, 80.7625], detail: "A hilltop overlooking Nuwara Eliya and the surrounding highlands.", query: "Single Tree Hill, Nuwara Eliya, Sri Lanka" },
  { name: "Damro Labookellie Tea Centre", category: "Tea Plantation & Factory", coords: [7.024147, 80.719254], detail: "Tea estates and a tea centre in Labookellie.", query: "Damro Labookellie Tea Centre, Sri Lanka" },
  { name: "Bomburu Ella Waterfall", category: "Waterfall", coords: [6.94706, 80.83077], detail: "A broad waterfall in the forest near Perawella.", query: "Bomburu Ella Waterfall, Sri Lanka" },
  { name: "Kande Ela Reservoir", category: "Lake & Nature", coords: [6.91619, 80.78960], detail: "A reservoir surrounded by highland woodland near the Ambewela road.", query: "Kande Ela Reservoir, Sri Lanka" },
  { name: "Galway's Land National Park", category: "Forest & Wildlife", coords: [6.96579, 80.77802], detail: "A pocket of montane forest within Nuwara Eliya.", query: "Galway's Land National Park, Nuwara Eliya, Sri Lanka" },
  { name: "New Zealand Farm (Ambewela)", category: "Dairy Farm", coords: [6.87113, 80.79798], detail: "A separate dairy farm in the Ambewela farming area.", query: "New Zealand Farm, Ambewela, Sri Lanka" },
  { name: "Devon Falls", category: "Waterfall", coords: [6.9515, 80.63011], detail: "A waterfall set among tea-covered hills near Talawakele.", query: "Devon Falls, Sri Lanka" },
  { name: "St. Clair's Falls", category: "Waterfall", coords: [6.95111, 80.64778], detail: "A wide cascade on the Kotmale Oya near Talawakele.", query: "St. Clair's Falls, Talawakele, Sri Lanka" },
  { name: "Nuwara Eliya Old Post Office", category: "Historical Landmark", coords: [6.97158, 80.76627], detail: "The distinctive red-brick post office in the centre of town.", query: "Nuwara Eliya Post Office, Sri Lanka" },
  // Area marker: the user's entry refers to several farms, rather than one business.
  { name: "Strawberry Farms (Ambewela Area)", category: "Farm Experience", coords: [6.90597, 80.7903], detail: "Strawberry-growing area near Kande Ela and Ambewela. This pin indicates the area; individual farms have separate entrances.", query: "Strawberry farms near Ambewela, Sri Lanka" },
];

export default function Explore() {
  const pub = usePublicSettings();
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(false);
  useSiteTitle("Explore");
  useEffect(() => {
    if (!mapRef.current) return undefined;
    let cancelled = false;
    let map;
    let resizeObserver;
    let rafId;
    let fitTimer;
    try {
      if (cancelled || !mapRef.current) return;
      map = L.map(mapRef.current, { scrollWheelZoom: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(map);
      const pin = L.icon({
        iconUrl: "/assets/mistwood/icons/forest-gold-map-pin.png",
        className: "attraction-map-pin",
        iconSize: [34, 46],
        iconAnchor: [17, 44],
        popupAnchor: [0, -42],
      });
      // Group nearby pins so the dense town-centre attractions don't overlap;
      // a cluster shows a count and expands (or spiderfies) when selected.
      const cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 48,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: (c) =>
          L.divIcon({
            html: `<span>${c.getChildCount()}</span>`,
            className: "attraction-cluster-icon",
            iconSize: [40, 40],
          }),
      });
      mapAttractions.forEach((place) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query)}`;
        const photo = place.image ? `<img src="${place.image}" alt="">` : "";
        const card = `<article class="attraction-popup-card">${photo}<div><h3>${place.name}</h3><p><strong>${place.category}</strong></p><p>${place.detail}</p><a href="${url}" target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a></div></article>`;
        cluster.addLayer(L.marker(place.coords, { icon: pin, title: place.name, alt: place.name, keyboard: true }).bindPopup(card, { maxWidth: 270, minWidth: 240 }));
      });
      map.addLayer(cluster);

      const bounds = L.latLngBounds(mapAttractions.map((place) => place.coords));
      // Fit once the container has its real size, so the markers spread out
      // across the viewport instead of collapsing into one overlapping blob.
      const fit = () => {
        if (!map) return;
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
      };
      fit();
      rafId = requestAnimationFrame(fit);

      // Keep the map correctly sized and framed across desktop/tablet/mobile.
      resizeObserver = new ResizeObserver(() => {
        if (!map) return;
        map.invalidateSize();
        clearTimeout(fitTimer);
        fitTimer = setTimeout(() => map && map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 }), 200);
      });
      resizeObserver.observe(mapRef.current);
    } catch {
      if (!cancelled) setMapError(true);
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(fitTimer);
      resizeObserver?.disconnect();
      map?.remove();
    };
  }, []);

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker="Explore Nuwara Eliya" title="Discover the Highlands" lede="Attractions, nature, and how long to allow." crumb="Explore" />
        <Attractions />
        <section className="explore-experiences" id="more" aria-labelledby="experiences-title">
          <div className="mh-wrap experiences-wrap">
            <header className="experiences-heading" data-reveal="up">
              <p className="mh-kicker">Explore Nuwara Eliya</p>
              <h2 id="experiences-title">A Day Trip, a Round of Golf, or the Train</h2>
              <p className="experiences-lead">Discover unforgettable experiences around {pub.propertyName}. From historic golf courses to scenic train journeys, Nuwara Eliya offers something for everyone.</p>
            </header>
            <div className="experiences-grid">
              <article className="experience-feature" data-reveal="up">
                <img alt="The Nuwara Eliya Golf Club clubhouse beside its green lawn and flower beds" src="/images/explore/02-nuwara-eliya-golf-club.jpg" loading="lazy" width="1024" height="576" />
                <div className="experience-feature-copy">
                  <h3>Nuwara Eliya Golf Club</h3>
                  <p>Play at one of Sri Lanka's historic golf courses, surrounded by beautiful highland scenery.</p>
                  <Link className="mh-btn ghost" to="/about#practical" aria-label="Learn more in our practical notes">Learn More <span aria-hidden="true">→</span></Link>
                </div>
              </article>
              <div className="experience-list">
                {experiences.map(({ title, text, image, video, poster, alt, icon }) => (
                  <article className="experience-card" key={title} data-reveal="up">
                    <div className="experience-card-photo">{video ? <video src={video} poster={poster} autoPlay muted loop playsInline preload="metadata" aria-label={`${title} scenery`} /> : <img src={`/images/explore/${image}`} alt={alt} loading="lazy" width="1600" height="1067" />}</div>
                    <div className="experience-card-copy">
                      <ExperienceIcon type={icon} />
                      <div><h3>{title}</h3><p>{text}</p></div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
     
          </div>
        </section>
        <section className="ab-location" id="map">
          <div className="mh-wrap">
            <p className="mh-kicker gold ab-kicker">Explore the area</p>
            <h2>Places to Visit Around Nuwara Eliya</h2>
            <p className="map-intro">Select a landmark to open its location in Google Maps.</p>
            <div className="map-card attraction-map">
              {mapError ? <p className="attraction-map-fallback" role="alert">The interactive map is unavailable right now. Use the link below to view Nuwara Eliya in Google Maps.</p> : <div className="attraction-map-canvas" ref={mapRef} aria-label="Interactive map of attractions around Nuwara Eliya" />}
              <div className="map-note"><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Nuwara+Eliya+Sri+Lanka" rel="noopener noreferrer" target="_blank">Open the Nuwara Eliya map ↗</a></div>
            </div>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
