import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { usePhotos } from "../photos.jsx";

const shots = [
  { src: "/assets/hills.jpg", alt: "Highland view from the Mistwood balcony", name: "The view", on: "the hills outside", under: "from the balcony", frame: "wide" },
  { src: "/assets/stay-balcony.jpg", alt: "Living room opening onto the balcony", on: "the glass opens", under: "a balcony over the hills", frame: "tall" },
];

function Shot({ shot }) {
  const { openPhoto } = usePhotos();
  return (
    <div className={`tour-frame ${shot.frame}`}>
      <figure className="tour-shot" role="button" tabIndex={0} onClick={() => openPhoto(shot)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPhoto(shot); } }}>
        <img alt={shot.alt} src={shot.src} />
        {shot.name ? <p className="tour-name">{shot.name}</p> : null}
        <figcaption className="tour-cap on">{shot.on}</figcaption>
      </figure>
      <p className="tour-cap under">{shot.under}</p>
    </div>
  );
}

export default function Photos() {
  const tourRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => { document.title = "Hotel photos | Mistwood Residence"; }, []);

  useEffect(() => {
    const tour = tourRef.current;
    const track = trackRef.current;
    if (!tour || !track) return undefined;
    const narrow = matchMedia("(max-width: 860px)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const pin = () => !(narrow.matches || reduce.matches);
    const layout = () => {
      if (!pin()) {
        tour.style.height = "";
        track.style.transform = "";
        return;
      }
      const extra = Math.max(0, track.scrollWidth - innerWidth);
      tour.style.height = `${innerHeight + extra}px`;
    };
    const move = () => {
      if (!pin()) return;
      const start = tour.offsetTop;
      const span = Math.max(1, tour.offsetHeight - innerHeight);
      const progress = Math.min(1, Math.max(0, (scrollY - start) / span));
      const extra = Math.max(0, track.scrollWidth - innerWidth);
      track.style.transform = `translate3d(${-progress * extra}px,0,0)`;
    };
    const onResize = () => { layout(); move(); };
    addEventListener("scroll", move, { passive: true });
    addEventListener("resize", onResize);
    narrow.addEventListener?.("change", onResize);
    layout();
    move();
    return () => {
      removeEventListener("scroll", move);
      removeEventListener("resize", onResize);
      narrow.removeEventListener?.("change", onResize);
    };
  }, []);

  return (
    <>
      <section className="hero short">
        <div className="hero-bg" style={{ backgroundImage: "url('/assets/hills.jpg')" }} />
        <div className="container hero-content">
          <span className="eyebrow reveal">MISTWOOD RESIDENCE · NUWARA ELIYA</span>
          <h1 className="reveal delay1">The residence,<br /><em className="gold">as it is.</em></h1>
          <p className="reveal delay2">Scroll to move through the apartment. Each photograph has a short label for what is in the frame.</p>
        </div>
        <div className="hero-meta">PROPERTY PHOTOS</div>
      </section>
      <section className="tour" aria-label="A scroll through the apartment" ref={tourRef}>
        <div className="tour-sticky">
          <p className="tour-hint tour-cap">scroll to move through the apartment</p>
          <div className="tour-track" ref={trackRef}>
            <div className="tour-panel">
              <Shot shot={shots[0]} />
              <Shot shot={shots[1]} />
            </div>
            <div className="tour-panel">
              <Shot shot={{ src: "/assets/entry-hall.jpg", alt: "Entry console and sitting bench", on: "come inside", under: "a bench by the door", frame: "tall" }} />
              <div className="tour-copy">
                <span className="eyebrow">The entrance</span>
                <h2>A small hall, <em className="gold">then the room.</em></h2>
                <p>A bench and a console as you come in. The living room opens just beyond, with the hills through the glass.</p>
              </div>
              <Shot shot={{ src: "/assets/living-wide.jpg", alt: "Open living and dining area", name: "The living room", on: "one open room", under: "living and dining together", frame: "wide" }} />
              <Shot shot={{ src: "/assets/living-view.jpg", alt: "Living room with the hills beyond the curtains", on: "hills beyond the glass", under: "the curtains part", frame: "slim" }} />
            </div>
            <div className="tour-panel">
              <Shot shot={{ src: "/assets/living-sofa.jpg", alt: "Sofa facing the window", on: "the long sofa", under: "facing the window", frame: "tall" }} />
              <Shot shot={{ src: "/assets/lounge-chairs.jpg", alt: "Lounge chairs in the living room", on: "room to sit", under: "daylight on the chairs", frame: "slim" }} />
              <Shot shot={{ src: "/assets/living-doors.jpg", alt: "Seating beside the balcony doors", on: "beside the doors", under: "toward the balcony", frame: "tall" }} />
              <Shot shot={{ src: "/assets/open-plan.jpg", alt: "Open-plan living and dining space", on: "the whole room", under: "sofas through to the table", frame: "wide" }} />
            </div>
            <div className="tour-panel">
              <div className="tour-copy">
                <span className="eyebrow">The table</span>
                <h2>Chairs, a sideboard, <em className="gold">a refrigerator.</em></h2>
                <p>The dining table sits in the same room as the sofas. A kitchen counter is just in frame. The rest of the kitchen equipment is still with the owner.</p>
              </div>
              <Shot shot={{ src: "/assets/dining-table.jpg", alt: "Dining table set for a stay", name: "The table", on: "set for the group", under: "a wooden table and chairs", frame: "wide" }} />
              <Shot shot={{ src: "/assets/dining-kitchen.jpg", alt: "Dining area beside the kitchen", on: "the refrigerator", under: "the kitchen is just in frame", frame: "tall" }} />
              <Shot shot={{ src: "/assets/dining-living.jpg", alt: "Dining area looking through to the living room", on: "through to the sofas", under: "one room, two uses", frame: "slim" }} />
              <Shot shot={{ src: "/assets/dining-open.jpg", alt: "Dining area and kitchen", on: "dining and kitchen", under: "the counter at the side", frame: "tall" }} />
              <Shot shot={{ src: "/assets/dining-side.jpg", alt: "Dining table and doorway", on: "the doorway", under: "chairs along the table", frame: "slim" }} />
            </div>
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container" style={{ maxWidth: 860 }}>
          <span className="eyebrow">Still to come</span>
          <h2>Where you <em className="gold">sleep.</em></h2>
          <p>These photographs show the balcony, the living room, the dining table, the kitchen side, and the entrance. They do not show a bedroom or a bathroom. Bed sizes are not listed until the owner provides those pictures.</p>
          <p style={{ marginTop: 18 }}><Link className="text-link" to="/about">Read the apartment, room by room ↗</Link></p>
        </div>
      </section>
    </>
  );
}
