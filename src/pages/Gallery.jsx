import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Gallery() {
  useEffect(() => { document.title = "Photographs | Mistwood Residence"; }, []);
  return (
    <>
      <section className="hero short">
        <div className="hero-bg" style={{ backgroundImage: 'url("/assets/hills.jpg")' }} />
        <div className="container hero-content">
          <span className="eyebrow reveal">PHOTOGRAPHS</span>
          <h1 className="reveal delay1">The pictures live on <em className="gold">one page.</em></h1>
          <p className="reveal delay2">The apartment photographs are sorted by room on the apartment page, so they are not shown twice.</p>
        </div>
        <div className="hero-scroll">SCROLL TO EXPLORE</div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <p className="reveal">Open the photo gallery for the balcony, the living room, the dining table, and the entrance. Bedroom and bathroom photographs are not in the set yet.</p>
          <p className="reveal" style={{ marginTop: 22 }}><Link className="btn" to="/apartments">Open the photo gallery <span>↗</span></Link></p>
        </div>
      </section>
    </>
  );
}
