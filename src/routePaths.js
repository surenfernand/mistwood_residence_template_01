/** Paths registered in App.jsx (excluding splat 404). */
const EXACT_PATHS = new Set([
  "/",
  "/about",
  "/apartments",
  "/explore",
  "/deals",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
  "/review",
  "/gallery",
  "/policies",
  "/credits",
  "/admin/login",
  "/admin",
  "/admin/forgot-password",
  "/admin/dashboard",
  "/admin/notifications",
  "/admin/profile",
  "/admin/account",
  "/admin/account/appearance",
  "/admin/help",
  "/admin/booking-requests",
  "/admin/bookings/today",
  "/admin/bookings/new",
  "/admin/bookings",
  "/admin/availability",
  "/admin/offers",
  "/admin/rates",
  "/admin/payments",
  "/admin/guests-enquiries",
  "/admin/users",
  "/admin/check-in",
  "/admin/settings",
  "/admin/reviews",
  "/admin/reset-password",
]);

export function isKnownAppRoute(pathname) {
  if (EXACT_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/review/") && pathname.length > 8) return true;
  if (pathname.startsWith("/check-in/") && pathname.length > 10) return true;
  return false;
}
