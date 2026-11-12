/** @param {string} pathname @param {import("./adminNavConfig.js").AdminNavItem} item */
export function isNavGroupActive(pathname, item) {
  if (!item.children?.length) return false;
  if (item.label === "Bookings") {
    return pathname.startsWith("/admin/booking") || pathname === "/admin/check-in";
  }
  if (item.label === "Account") {
    return pathname === "/admin/profile" || pathname.startsWith("/admin/account") || pathname === "/admin/help";
  }
  return item.children.some((child) => child.path && (pathname === child.path || pathname.startsWith(`${child.path}/`)));
}

/** @param {string} pathname @param {string} parentPath */
export function parentNavEnd(pathname, parentPath, label) {
  if (label === "Bookings") return pathname === "/admin/booking-requests";
  if (label === "Account") return pathname === "/admin/profile";
  return pathname === parentPath;
}
