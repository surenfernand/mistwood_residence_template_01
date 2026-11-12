import { useEffect } from "react";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { ATTRACTIONS } from "../data/attractions.js";

const files = [
  ["https://commons.wikimedia.org/wiki/File:Tea%20plantations%20near%20Nuwara%20Eliya%2C%20Sri%20Lanka%20-%20panoramio.jpg", "Tea plantations near Nuwara Eliya, Sri Lanka - panoramio.jpg"],
  ["https://commons.wikimedia.org/wiki/File:Nuwara%20Eliya%20Gregory%20Lake.jpg", "Nuwara Eliya Gregory Lake.jpg"],
  ["https://commons.wikimedia.org/wiki/File:Victoria%20park%2C%20Nuwara%20Eliya%20-%20panoramio.jpg", "Victoria park, Nuwara Eliya - panoramio.jpg"],
  ["https://commons.wikimedia.org/wiki/File:Tea%20plantations%20in%20Nuware%20Eliya%2C%20Sri-Lanka%2C%202015-04-06.jpg", "Tea plantations in Nuware Eliya, Sri-Lanka, 2015-04-06.jpg"],
  ["https://commons.wikimedia.org/wiki/File:Lake%20Gregory%2C%20Nuwara%20Eliya%20-%20panoramio.jpg", "Lake Gregory, Nuwara Eliya - panoramio.jpg"],
  ["https://commons.wikimedia.org/wiki/File:Nuwara%20Eliya%20-%20panoramio.jpg", "Nuwara Eliya - panoramio.jpg"],
  ["https://commons.wikimedia.org/wiki/File:Lower%27s%20leap%20Waterfall%20-%20panoramio.jpg", "Lower's leap Waterfall - panoramio.jpg"],
  ["https://commons.wikimedia.org/wiki/File:Hakgala%20Botanical%20Garden.jpg", "Hakgala Botanical Garden.jpg"],
  ["https://commons.wikimedia.org/wiki/File:Nuwara%20Eliya%20Lake%20View.jpg", "Nuwara Eliya Lake View.jpg"],
];

export default function Credits() {
  useSiteTitle("Media credits ");
  return (
    <section className="section page-plain">
      <div className="container credits-page">
        <h1>Media &amp; image credits</h1>
        <p className="muted">Photographs of the apartment were supplied for Mistwood Residence. Pictures of Gregory Lake, Victoria Park, the tea fields, and Lover's Leap, on the town page, are illustrative photographs from Wikimedia Commons. They are not the view from the apartment. License details are on each source page.</p>
        {files.map(([href, label]) => (
          <p key={href}><a href={href} rel="noopener noreferrer" target="_blank">{label}</a></p>
        ))}
        <h2 id="attraction-photos">Attraction photographs</h2>
        {ATTRACTIONS.map(({ id, name, photoCredit }) => photoCredit ? (
          <p key={id}>
            <a href={photoCredit.source} rel="noopener noreferrer" target="_blank">{name} — {photoCredit.title}</a>
            {" by "}{photoCredit.author}{". "}
            <a href={photoCredit.licenseUrl} rel="noopener noreferrer" target="_blank">{photoCredit.license}</a>
            {". "}{photoCredit.changes}
            {photoCredit.note ? <> {photoCredit.note}.</> : null}
          </p>
        ) : null)}
      </div>
    </section>
  );
}
