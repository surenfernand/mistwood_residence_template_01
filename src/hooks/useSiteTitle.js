import { useEffect } from "react";
import { usePublicSettings } from "./usePublicSettings.js";

const SITE_URL = "https://mistwood.lk";
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/mistwood/backgrounds/tea-sunrise.jpg`;
const INDEXABLE_PATHS = new Set([
  "/", "/about", "/apartments", "/gallery", "/explore", "/deals", "/contact",
  "/privacy-policy", "/terms-and-conditions", "/credits",
]);

const DESCRIPTIONS = {
  Home: "Mistwood Residence is a private whole-apartment stay in the tea hills of Nuwara Eliya, Sri Lanka.",
  "About Us": "Learn about Mistwood Residence, a peaceful private apartment stay in Nuwara Eliya.",
  Apartment: "Explore the rooms, facilities, gallery, and sleeping arrangements at Mistwood Residence.",
  Explore: "Discover lakes, gardens, tea estates, and attractions around Nuwara Eliya from Mistwood Residence.",
  Offers: "Browse current stay offers and minimum-night requirements at Mistwood Residence.",
  "Contact us": "Contact Mistwood Residence or check availability for a private stay in Nuwara Eliya.",
  "Guest policies": "Read Mistwood Residence booking, cancellation, and guest policy information.",
  "Media credits ": "View image and media credits used by Mistwood Residence.",
  "Photographs ": "Browse the Mistwood Residence apartment photo gallery.",
  "Page not found": "The requested Mistwood Residence page could not be found.",
};

/** Sets `document.title` to `{page} | {property name}` (or property name alone). */
export function useSiteTitle(pageTitle) {
  const { propertyName, propertyDescription, publicAddress, contactPhone } = usePublicSettings();
  useEffect(() => {
    const name = propertyName || "Mistwood Residence";
    document.title = pageTitle ? `${pageTitle} | ${name}` : name;
    const description = DESCRIPTIONS[pageTitle] || `Mistwood Residence — a private apartment stay in Nuwara Eliya, Sri Lanka.`;
    const pathname = window.location.pathname.replace(/\/$/, "") || "/";
    const canonicalUrl = `${SITE_URL}${pathname}`;
    const indexable = INDEXABLE_PATHS.has(pathname);

    const setMeta = (selector, attributes) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
      }
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    };
    const setLink = (rel, href) => {
      let element = document.head.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[name="robots"]', { name: "robots", content: indexable ? "index, follow" : "noindex, nofollow" });
    setMeta('meta[property="og:title"]', { property: "og:title", content: document.title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    setMeta('meta[property="og:image"]', { property: "og:image", content: DEFAULT_OG_IMAGE });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setLink("canonical", canonicalUrl);

    const existingSchema = document.getElementById("lodging-business-schema");
    if (pathname === "/") {
      const schema = existingSchema || document.createElement("script");
      schema.id = "lodging-business-schema";
      schema.type = "application/ld+json";
      schema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        name,
        url: SITE_URL,
        image: DEFAULT_OG_IMAGE,
        description: propertyDescription || description,
        telephone: contactPhone,
        address: { "@type": "PostalAddress", addressLocality: "Nuwara Eliya", addressCountry: "LK", streetAddress: publicAddress },
      });
      if (!existingSchema) document.head.appendChild(schema);
    } else {
      existingSchema?.remove();
    }
  }, [pageTitle, propertyName, propertyDescription, publicAddress, contactPhone]);
}
