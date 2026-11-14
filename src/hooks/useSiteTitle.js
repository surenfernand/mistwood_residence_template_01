import { useEffect } from "react";
import { usePublicSettings } from "./usePublicSettings.js";

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
  const { propertyName } = usePublicSettings();
  useEffect(() => {
    const name = propertyName || "Mistwood Residence";
    document.title = pageTitle ? `${pageTitle} | ${name}` : name;
    const description = DESCRIPTIONS[pageTitle] || `Mistwood Residence — a private apartment stay in Nuwara Eliya, Sri Lanka.`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [pageTitle, propertyName]);
}
