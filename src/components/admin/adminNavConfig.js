/** @typedef {{ label: string, path?: string, disabled?: boolean, badgeKey?: string, permission?: string }} AdminNavChild */
/** @typedef {{ icon: string, label: string, path?: string, disabled?: boolean, permission?: string, badgeKey?: string, children?: AdminNavChild[] }} AdminNavItem */

/** @type {AdminNavItem[]} */
export const ADMIN_NAV_ITEMS = [
  { icon: "home", label: "Dashboard", path: "/admin/dashboard", permission: "dashboard" },
  { icon: "bell", label: "Notifications", path: "/admin/notifications", permission: "dashboard", badgeKey: "unreadNotifications" },
  {
    icon: "user",
    label: "Account",
    path: "/admin/profile",
    permission: "dashboard",
    children: [
      { label: "Account", path: "/admin/profile" },
      { label: "Account settings", path: "/admin/account" },
    ],
  },
  {
    icon: "calendar",
    label: "Bookings",
    path: "/admin/booking-requests",
    permission: "bookings",
    children: [
      { label: "Booking Requests", path: "/admin/booking-requests", badgeKey: "newBookings" },
      { label: "Create booking", path: "/admin/bookings/new" },
      { label: "Today's movements", path: "/admin/bookings/today" },
      { label: "QR check-in", path: "/admin/check-in" },
    ],
  },
  { icon: "calendar", label: "Availability & Calendar", path: "/admin/availability", permission: "availability" },
  { icon: "tag", label: "Offers", path: "/admin/offers", permission: "rates" },
  { icon: "card", label: "Payments", path: "/admin/payments", permission: "payments" },
  { icon: "users", label: "Guests & Enquiries", path: "/admin/guests-enquiries", permission: "guests" },
  { icon: "user", label: "Users & Permissions", path: "/admin/users", permission: "users" },
  { icon: "settings", label: "Settings", path: "/admin/settings", permission: "settings" },
];
