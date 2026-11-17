import { useLayoutEffect } from "react";

/** Pin admin header popovers below their trigger on narrow viewports. */
export function useAdminMobilePopover(rootRef, open) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const mq = window.matchMedia("(max-width: 1024px)");

    const place = () => {
      if (!mq.matches || !open) {
        root.style.removeProperty("--admin-popover-top");
        return;
      }
      const rect = root.getBoundingClientRect();
      root.style.setProperty("--admin-popover-top", `${Math.round(rect.bottom + 12)}px`);
    };

    place();
    if (!open) return undefined;

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [rootRef, open]);
}