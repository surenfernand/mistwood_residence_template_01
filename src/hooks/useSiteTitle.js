import { useEffect } from "react";
import { usePublicSettings } from "./usePublicSettings.js";

/** Sets `document.title` to `{page} | {property name}` (or property name alone). */
export function useSiteTitle(pageTitle) {
  const { propertyName } = usePublicSettings();
  useEffect(() => {
    const name = propertyName || "Mistwood Residence";
    document.title = pageTitle ? `${pageTitle} | ${name}` : name;
  }, [pageTitle, propertyName]);
}
