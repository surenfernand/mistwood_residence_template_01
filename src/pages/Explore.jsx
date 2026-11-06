import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";

const cards = [
  ["Gregory Lake", "Walk the path around the water, or take a boat when the boats are running. Allow an hour or two.", "/assets/mistwood/explore/gregory-lake.png", "Gregory Lake in Nuwara Eliya, with boats on the water"],
  ["Pedro Tea Estate", "A working estate where visitors can see the fields and how tea is processed. Allow about half a morning. A tea tour is not included with the apartment.", "/assets/mistwood/explore/tea-plantations.png", "Tea pickers in the plantations near Nuwara Eliya"],
  ["Horton Plains", "A path across the highland grassland. The World's End cliff is further along the walk, when the mist lifts. The drive and the walk take most of a day.", "/assets/mistwood/explore/horton-plains.png", "A path across the highland grassland of Horton Plains"],
  ["Lover's Leap Falls", "A waterfall in the tea hills, a shorter visit than Horton Plains. The path can be wet.", "/assets/places/leap.jpg", "Lover's Leap waterfall near Nuwara Eliya"],
  ["Victoria Park", "A public garden in the middle of town, with flower beds and a lot of birds. Allow about an hour.", "/assets/mistwood/explore/victoria-park.png", "Flower beds and a path in Victoria Park, Nuwara Eliya"],
  ["Hakgala Garden", "Roses, ferns, and orchids, depending on the season. Allow a morning. You pay the entry fee at the garden.", "/assets/places/hakgala.jpg", "The entrance to Hakgala Botanical Garden"],
];

const further = [
  ["Nuwara Eliya Golf Club", "An old course in the town, among the hills. Book a round with the club. This website does not reserve tee times."],
  ["The racecourse", "Race meetings are held in season, traditionally around April. Check the year's dates before you plan a day around a race."],
  ["Pidurutalagala", "The highest mountain in Sri Lanka rises above the town. The summit is a restricted area, so do not plan on walking to the top."],
  ["By train", "The station for the scenic ride is Nanu Oya, then a drive into Nuwara Eliya. The apartment does not sell train tickets."],
];

export default function Explore() {
  useEffect(() => { document.title = "Explore | Mistwood Residence"; }, []);

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker="Explore Nuwara Eliya" title="Discover the Highlands" lede="Attractions, nature, and how long to allow." crumb="Explore" />
        <section className="explore-band">
          <div className="mh-wrap">
            <p className="offer-lead">Photographs of the lake, the tea, the waterfall, and Hakgala are of those places. They are not the view from the apartment. Distances wait until the street address is confirmed.</p>
            <div className="explore-grid">
              {cards.map(([title, text, src, alt]) => (
                <article key={title}>
                  <img alt={alt} src={src} loading="lazy" />
                  <div>
                    <h2>{title}</h2>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="ab-notes" id="more">
          <div className="mh-wrap">
            <p className="mh-kicker gold ab-kicker">Further out</p>
            <h2>A day trip, a round of golf, or the train</h2>
            <div className="explore-notes">
              {further.map(([title, text]) => (
                <article key={title}>
                  {title === "Nuwara Eliya Golf Club" ? <img alt="The golf course and clubhouse in the Nuwara Eliya hills" src="/assets/mistwood/explore/golf-club.png" loading="lazy" /> : null}
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <p><Link className="ab-outline" to="/about#practical">Read the practical notes <span aria-hidden="true">→</span></Link></p>
          </div>
        </section>
        <section className="ab-location" id="map">
          <div className="mh-wrap">
            <p className="mh-kicker gold ab-kicker">The map</p>
            <h2>The town, until the address is confirmed</h2>
            <div className="map-card">
              <iframe className="map-frame" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Nuwara%20Eliya%20Sri%20Lanka&t=&z=11&ie=UTF8&iwloc=&output=embed" title="Map of Nuwara Eliya, Sri Lanka" />
              <div className="map-note"><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Nuwara+Eliya+Sri+Lanka" rel="noopener noreferrer" target="_blank">Open a larger map ↗</a></div>
            </div>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
