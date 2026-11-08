import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HighlandFooter, HighlandHeader, PageHero } from "../components/Highland.jsx";

const qualities = [
  {
    label: "Peaceful & Scenic Location",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40c.2-8 3.2-13 8.2-16.2 1.6 5.2.4 10.2-2.2 14.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M24 40c-.4-9-4-14.5-10-18 1.2 6.2 2.6 11 5.4 15.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M24 41V16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    label: "Comfortable & Modern Living",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 22 24 10l16 12v16H8V22Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M20 38V26h8v12" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>,
  },
  {
    label: "Close to Top Attractions",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 36 18 18l8 10 6-7 10 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M6 36h36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    label: "Ideal for Families & Groups",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="32" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M7 34c.8-5 4-7.5 9-7.5s8.2 2.5 9 7.5M26 34c.6-3.6 3-5.6 6.2-5.6 3.4 0 5.8 2 6.6 5.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
];

const guestNotes = [
    {
      id: "amaya",
      name: "Amaya Perera",
      when: "3 days ago",
      kind: "review",
      stars: 5,
      color: "#163628",
      text: "Came up from Colombo for three nights and wished we had booked five. The living room stays warm in the evening, and you can hear almost nothing except the wind in the trees.",
      likes: 46,
      comments: 8,
      tilt: -4.2,
      shift: 22,
      tape: -8,
      bob: "0s",
      sink: false,
      replies: [{ name: "Kavindi", color: "#8a6a32", text: "That balcony view at breakfast was the best part." }],
    },
    {
      id: "james",
      name: "James Whitfield",
      when: "1 week ago",
      kind: "post",
      color: "#1b4f8a",
      text: "First morning in Nuwara Eliya. Coffee at the dining table, mist still sitting on the hills. This apartment feels more like a home than a hotel room.",
      image: "/assets/living-wide.jpg",
      imageAlt: "The living room at Mistwood Residence in the morning light",
      likes: 62,
      comments: 4,
      tilt: 3.1,
      shift: 0,
      tape: 7,
      bob: "-1.4s",
      sink: true,
      replies: [{ name: "Elena Whitfield", color: "#6b3a4a", text: "Already planning to come back in April." }],
    },
    {
      id: "nethmi",
      name: "Nethmi Fernando",
      when: "5 days ago",
      kind: "comment",
      color: "#6b3a4a",
      text: "Booked it for my parents’ anniversary. They said the kitchen was easy to use and the walk into town was short. Thank you for looking after them.",
      likes: 19,
      comments: 3,
      tilt: -1.8,
      shift: 34,
      tape: -14,
      bob: "-2.6s",
      sink: false,
    },
    {
      id: "hiroshi",
      name: "Hiroshi Tanaka",
      when: "2 weeks ago",
      kind: "review",
      stars: 5,
      color: "#3d5c45",
      text: "Clean, quiet, and exactly as the photographs show. We walked to the lake after breakfast and were back before the rain.",
      likes: 31,
      comments: 2,
      tilt: 5.2,
      shift: 8,
      tape: 11,
      bob: "-3.8s",
      sink: true,
      replies: [{ name: "Yuna Tanaka", color: "#2f4f6f", text: "The kettle and the good blankets were a relief after the train." }],
    },
    {
      id: "sanduni",
      name: "Sanduni Jayawardena",
      when: "6 days ago",
      kind: "post",
      color: "#8b4518",
      text: "Family weekend sorted. The children took the sofa, we took the balcony, and nobody argued about it.",
      image: "/assets/stay-balcony.jpg",
      imageAlt: "The balcony at Mistwood Residence looking out over the hills",
      likes: 54,
      comments: 6,
      tilt: -3.6,
      shift: 26,
      tape: -6,
      bob: "-0.7s",
      sink: false,
      replies: [{ name: "Ravi", color: "#163628", text: "The parking made the drive up much easier." }],
    },
    {
      id: "claire",
      name: "Claire Moreau",
      when: "4 days ago",
      kind: "review",
      stars: 5,
      color: "#2f4f6f",
      text: "A calm apartment in the middle of the hills. We cooked one night and ate in town the next. Both felt easy from here.",
      image: "/assets/dining-table.jpg",
      imageAlt: "The dining table set beside the kitchen",
      likes: 27,
      comments: 1,
      tilt: 2.8,
      shift: 10,
      tape: 9,
      bob: "-1.1s",
      sink: true,
    },
    {
      id: "ruwan",
      name: "Ruwan Silva",
      when: "1 day ago",
      kind: "comment",
      color: "#1b4f8a",
      text: "Stayed with two friends from Kandy. The bedrooms were comfortable and the hot water never ran out. We will send the next group here.",
      likes: 22,
      comments: 5,
      tilt: -5.1,
      shift: 30,
      tape: -10,
      bob: "-2.2s",
      sink: false,
      replies: [{ name: "Dilan", color: "#8a6a32", text: "Adding this to the Kandy weekend list." }],
    },
    {
      id: "omar",
      name: "Omar Haddad",
      when: "8 days ago",
      kind: "post",
      color: "#6b3a4a",
      text: "Shared this with my sisters before we drove down. Long table, late dinner, rain on the windows. Nuwara Eliya did what it always does.",
      image: "/assets/lounge-chairs.jpg",
      imageAlt: "Lounge chairs in the living room",
      likes: 41,
      comments: 7,
      tilt: 4.4,
      shift: 0,
      tape: 6,
      bob: "-3.3s",
      sink: true,
      replies: [{ name: "Leila", color: "#3d5c45", text: "Save me a seat next time." }],
    },
    {
      id: "priya",
      name: "Priya Menon",
      when: "3 weeks ago",
      kind: "review",
      stars: 5,
      color: "#8a6a32",
      text: "We came for Gregory Lake and stayed in for the weather. The apartment was warm, the Wi-Fi held for a morning of work, and the hills were right outside.",
      likes: 38,
      comments: 4,
      tilt: -2.4,
      shift: 24,
      tape: -12,
      bob: "-4.4s",
      sink: false,
    },
    {
      id: "lukas",
      name: "Lukas Berger",
      when: "2 days ago",
      kind: "post",
      color: "#163628",
      text: "Last light on the tea fields, from the road just above the apartment. This is the Nuwara Eliya I wanted to show my parents.",
      image: "/assets/mistwood/backgrounds/tea-sunset.jpg",
      imageAlt: "Sunset over the tea hills near Nuwara Eliya",
      likes: 73,
      comments: 9,
      tilt: 5.6,
      shift: 14,
      tape: 13,
      bob: "-0.4s",
      sink: true,
      replies: [{ name: "Anja Berger", color: "#6b3a4a", text: "They have not stopped talking about the train ride." }],
    },
];

function FacebookGlyph() {
  return (
    <svg className="fb-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M15.4 12.5h-2.1V20h-2.6v-7.5H9.2v-2.2h1.5V8.7c0-1.8 1-2.8 2.6-2.8.8 0 1.5.1 1.5.1v1.9h-.9c-.9 0-1.1.5-1.1 1.1v1.3h2.2l-.3 2.2z" />
    </svg>
  );
}

function FacebookCard({ item, hidden }) {
  const initials = item.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return (
    <article
      className={item.sink ? "fb-card sink" : "fb-card"}
      style={{ "--tilt": `${item.tilt}deg`, "--shift": `${item.shift}px`, "--tape": `${item.tape}deg`, "--bob": item.bob }}
      aria-hidden={hidden || undefined}
    >
      <header className="fb-top">
        <span className="fb-avatar" style={{ background: item.color }} aria-hidden="true">{initials}</span>
        <div>
          <p className="fb-name">
            <strong>{item.name}</strong>
            {item.kind === "review" ? <span> recommends Mistwood Residence</span> : null}
            {item.kind === "comment" ? <span> commented on Mistwood Residence</span> : null}
          </p>
          <p className="fb-meta">{item.when} <FacebookGlyph /></p>
        </div>
      </header>
      {item.stars ? (
        <p className="fb-stars" aria-label={`${item.stars} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={index < item.stars ? "on" : ""}>★</span>
          ))}
        </p>
      ) : null}
      <p className="fb-text">{item.text}</p>
      {item.image ? <img className="fb-photo" src={item.image} alt={hidden ? "" : item.imageAlt} /> : null}
      <p className="fb-counts"><span>♥ {item.likes}</span><span>{item.comments} {item.comments === 1 ? "comment" : "comments"}</span></p>
      <p className="fb-actions"><span>Like</span><span>Comment</span><span>Share</span></p>
      {item.replies?.map((reply) => (
        <div className="fb-reply" key={reply.name}>
          <span className="fb-avatar sm" style={{ background: reply.color }} aria-hidden="true">{reply.name[0]}</span>
          <p><strong>{reply.name}</strong> {reply.text}</p>
        </div>
      ))}
    </article>
  );
}

function VoiceRow({ items, direction }) {
  const cards = [...items, ...items];
  return (
    <div className={`fb-row ${direction}`}>
      <div className="fb-track">
        {cards.map((item, index) => (
          <FacebookCard key={`${item.id}-${index}`} item={item} hidden={index >= items.length} />
        ))}
      </div>
    </div>
  );
}

const facilities = [
  {
    label: "Spacious Living Area",
    image: "/assets/living-sofa.jpg",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 26V20c0-3 2-5 5-5h14c3 0 5 2 5 5v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M8 26h32v7a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-7Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14 37v3M34 37v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  },
  {
    label: "Comfortable Bedrooms",
    image: "/assets/lounge.jpg",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 30v8h32v-8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M8 30h20c5 0 8-3 12-8v-2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14 30V18h8v12" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M8 38v3M40 38v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  },
  {
    label: "Fully Equipped Kitchen",
    image: "/assets/dining-kitchen.jpg",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18 8v9c0 2.4 1.6 3.6 3.2 3.6V40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M15.5 8v7M20.5 8v7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M31 8c2.4 3.2 3.4 6.2 3.4 9.2 0 2.6-1.4 4-3.4 4V40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  },
  {
    label: "Free Wi-Fi",
    image: "/assets/living-wide.jpg",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 22c8-8 24-8 32 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M14 28c5-5 15-5 20 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="24" cy="34" r="2" fill="currentColor" /></svg>,
  },
  {
    label: "Private Parking",
    image: "/assets/entry.jpg",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 28h28l-2.5-7-4-4.5H16.5L12.5 21 10 28Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M8 28h32v6H8v-6Z" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="16" cy="34" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="32" cy="34" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>,
  },
  {
    label: "Scenic Balcony",
    image: "/assets/stay-balcony.jpg",
    icon: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 16h28v18H10V16Z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M10 22h28M17 22v12M24 22v12M31 22v12" stroke="currentColor" strokeWidth="1.6" /></svg>,
  },
];

export default function About() {
  useEffect(() => { document.title = "About Us | Mistwood Residence"; }, []);

  return (
    <>
      <HighlandHeader />
      <main>
        <PageHero kicker="About Us" title="The Story of Mistwood Residence" lede="A Boutique Apartment Stay in the Heart of Nuwara Eliya" crumb="About Us" />

        <section className="ab-story">
          <div className="mh-sprig sprig-left" aria-hidden="true" />
          <div className="mh-sprig sprig-right soft" aria-hidden="true" />
          <div className="mh-wrap ab-story-grid">
            <figure className="ab-photo" data-reveal="left">
              <img alt="The living room at Mistwood Residence, with warm light and the dining table beyond" src="/assets/living-wide.jpg" />
            </figure>
            <div className="ab-story-copy" data-reveal="right">
              <p className="mh-kicker gold ab-kicker">Our Story</p>
              <h2>A Home in the Highlands</h2>
              <p>Mistwood Residence was created to offer travellers a peaceful and comfortable retreat in the heart of Nuwara Eliya. Surrounded by tea-covered hills, cool mountain air, and serene natural beauty, our apartment combines modern living with the charm of the highlands.</p>
            </div>
          </div>
          <ul className="mh-wrap ab-qualities" data-reveal="stagger">
            {qualities.map((item) => (
              <li key={item.label}>{item.icon}<span>{item.label}</span></li>
            ))}
          </ul>
        </section>

        <section className="ab-facilities" aria-label="Our facilities">
          <div className="mh-wrap">
            <p className="mh-kicker light">Our Facilities</p>
            <h2>Everything You Need for a Relaxing Stay</h2>
            <svg className="ab-swoosh" viewBox="0 0 88 16" aria-hidden="true"><path d="M4 11c16-9 30-9 42-2 8 5 20 6 38-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <p className="ab-facilities-lead">Thoughtfully equipped amenities to make your time at Mistwood Residence comfortable and hassle-free.</p>
            <ul data-reveal="stagger">
              {facilities.map((item) => (
                <li key={item.label} tabIndex={0}>
                  <img alt="" src={item.image} />
                  {item.icon}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ab-location" id="practical">
          <div className="mh-wrap ab-location-grid">
            <div data-reveal="left">
              <p className="mh-kicker gold ab-kicker">The Location</p>
              <h2>In the Heart of Nuwara Eliya</h2>
              <p>Mistwood Residence is conveniently located close to Nuwara Eliya’s key attractions, tea estates, gardens, and lakes, making it the ideal base to explore the beauty of the highlands.</p>
              <Link className="ab-outline" to="/explore">Explore Nearby Attractions <span aria-hidden="true">→</span></Link>
              <p className="ab-note">The street address is sent when a stay is confirmed. From Colombo, the drive climbs into the hill country. By train, the scenic ride ends at Nanu Oya, then a short drive into town. Nuwara Eliya evenings are cool, so bring a warm layer.</p>
            </div>
            <figure className="ab-photo ab-collage" data-reveal="image">
              <img alt="Collage of Nuwara Eliya landscapes, gardens, tea country, and landmarks" src="/assets/mistwood/explore/nuwara-eliya-collage.png" loading="lazy" />
            </figure>
          </div>
        </section>

        <section className="ab-quote" aria-label="A note on the stay">
          <div className="mh-wrap" data-reveal="up">
            <span className="ab-mark" aria-hidden="true">“</span>
            <p>A peaceful highland escape, where modern comfort meets the natural beauty of Nuwara Eliya.</p>
          </div>
        </section>

        <section className="ab-voices" id="voices" aria-label="Guest posts and reviews from Facebook">
          <div className="mh-wrap ab-voices-head">
            <p className="mh-kicker gold">From Social</p>
            <h2>What guests have been sharing</h2>
            <p>Reviews, posts, and comments from people who have stayed.</p>
          </div>
          <VoiceRow items={guestNotes} direction="to-left" />
        </section>

        <section className="ab-stay-showcase" id="meals" aria-label="Meals and apartment photographs">
          <svg className="ab-stay-hills" viewBox="0 0 1600 360" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 245C164 155 300 172 440 236c147 67 260 50 392-13 192-92 360-39 501 43 102 59 193 43 267-7v156H0Z" fill="currentColor" opacity=".34" />
            <path d="M0 290c156-63 269-54 421 13 129 57 262 55 386-20 144-87 316-62 464 20 133 74 232 49 329-5v110H0Z" fill="currentColor" opacity=".6" />
            <path d="M720 345c164-91 308-103 498-31 116 44 248 30 382-17v33H720Z" fill="none" stroke="#75a26f" strokeWidth="2" opacity=".32" />
            <path d="M754 324c160-69 303-76 481-18 121 39 238 30 365-11M824 346c134-54 267-53 423-7 116 34 235 25 347-10" fill="none" stroke="#83b177" strokeWidth="1.5" opacity=".25" />
          </svg>
          <div className="mh-wrap ab-stay-grid">
            <section className="ab-stay-meals" aria-labelledby="meals-heading">
              <p className="ab-stay-label"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 7v16c0 2.7 1.7 4 4 4v14M29 7c3 3 4 5.8 4 8.5 0 2.7-1.3 4-4 4V41" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg><span>Meals &amp; Dining</span></p>
              <h2 id="meals-heading">Cook, Dine, or Explore <em>Local Flavors</em></h2>
              <span className="ab-stay-underline" aria-hidden="true" />
              <p className="ab-stay-lead">The apartment includes a fully equipped kitchen with a refrigerator and counter beside the dining table. Breakfast, a cook, and groceries are not included unless arranged by the owner. Enjoy a relaxed meal or try the local cafés in town.</p>
              <ul className="ab-stay-features">
                <li><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 19h24v18H12zM16 19v-4c0-4.4 3.6-8 8-8s8 3.6 8 8v4M8 23h4M36 23h4M18 37v4M30 37v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Equipped Kitchen</span></li>
                <li><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M11 26h26M14 26v14M34 26v14M18 26V14h12v12M10 21h8M30 21h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Dining Area</span></li>
                <li><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 41s12-11.5 12-21a12 12 0 1 0-24 0c0 9.5 12 21 12 21Z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="24" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="2" /></svg><span>Local Dining Nearby</span></li>
              </ul>
            </section>

            <section className="ab-stay-photos" aria-labelledby="photos-heading">
              <div className="ab-stay-photo-copy">
                <p className="ab-stay-label"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 16h9l3-5h8l3 5h9v22H8Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="24" cy="27" r="6" fill="none" stroke="currentColor" strokeWidth="2" /></svg><span>Photographs</span></p>
                <h2 id="photos-heading">Explore the Residence Through <em>Our Gallery</em></h2>
                <p className="ab-stay-lead">Get a closer look at the living room, dining area, balcony, and entrance—each designed for a relaxed and comfortable highland stay.</p>
                <Link className="ab-stay-gallery" to="/apartments"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 16h9l3-5h8l3 5h9v22H8Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="24" cy="27" r="6" fill="none" stroke="currentColor" strokeWidth="2" /></svg><span>Open the Photo Gallery</span><b aria-hidden="true">→</b></Link>
              </div>
              <div className="ab-stay-collage" aria-label="Apartment photographs">
                <img className="ab-stay-photo-one" alt="The balcony looking over the hills" src="/assets/stay-balcony.jpg" loading="lazy" />
                <img className="ab-stay-photo-two" alt="The living room with blue chairs and a sofa" src="/assets/room.jpg" loading="lazy" />
                <img className="ab-stay-photo-three" alt="The dining table beside the kitchen" src="/assets/dining-table.jpg" loading="lazy" />
              </div>
            </section>
          </div>
        </section>
      </main>
      <HighlandFooter />
    </>
  );
}
