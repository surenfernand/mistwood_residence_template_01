import { useEffect, useMemo, useState } from "react";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { Link, useNavigate } from "react-router-dom";
import AdminIcon from "../components/admin/AdminIcon.jsx";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useAdminNotifications } from "../hooks/useAdminNotifications.js";
import DashboardAvailabilityCalendar from "../components/admin/DashboardAvailabilityCalendar.jsx";

const dashboardIcons = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  block: <circle cx="12" cy="12" r="8" />,
  megaphone: (
    <>
      <path d="m4 13 11-5v8L4 11Z" />
      <path d="M15 10h3a2 2 0 0 1 0 4h-3M7 13l1 5h3l-1-6" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
    </>
  ),
  bed: (
    <>
      <path d="M3 19V9M3 14h18v5M7 14v-4h5a3 3 0 0 1 3 3v1M3 19v2M21 19v2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
};

function Icon({ name, size = 20 }) {
  const extra = dashboardIcons[name];
  if (extra) {
    const props = {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
    };
    return <svg {...props}>{extra}</svg>;
  }
  return <AdminIcon name={name} size={size} />;
}

function displayDate(value) {
  if (!value) return "—";
  const date = typeof value === "string" && value.includes("T")
    ? new Date(value)
    : new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function displayMoney(value) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function AdminDashboard() {
  const pub = usePublicSettings();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [summary, setSummary] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  useSiteTitle("Dashboard");
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/auth/me").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/admin/dashboard").then((r) => (r.ok ? r.json() : Promise.reject())),
    ]).then(([identity, data]) => {
      if (active) {
        setAdmin(identity.admin);
        setSummary(data);
      }
    }).catch(() => navigate("/admin/login", { replace: true }));
    return () => { active = false; };
  }, [navigate]);
  const requests = useMemo(() => summary?.recentBookingRequests || [], [summary]);
  const { notifications: alertFeed, markRead } = useAdminNotifications({ limit: 6, pollMs: 60000 });
  const openAlert = async (item) => {
    if (!item.read) await markRead(item.id);
    const href = item.metadata?.href;
    if (href) navigate(href);
  };
  const name = admin?.name || "Admin";
  const stays = summary?.upcomingStays || [];
  return <main className="admin-app"><AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} badges={{ newBookings: summary?.newBookingRequests }} /><section className="admin-main"><header className="admin-topbar"><AdminMenuToggle onOpen={() => setNavOpen(true)} /><div><p>Admin Panel</p><h1>Dashboard</h1><span>{pub.propertyName} Management</span></div><img src="/assets/mistwood/decorations/leaf-branch.png" alt="" /><AdminUserTools /></header><div className="admin-dashboard-content"><section className="admin-welcome"><img src="/assets/mistwood/backgrounds/tea-sunrise.jpg" alt="" /><div><p>Welcome back, {name}</p><span>Here’s what’s happening at {pub.propertyName} today.</span></div></section><section className="admin-metrics"><Metric icon="calendar" label="New Booking Requests" value={summary?.newBookingRequests ?? "—"} /><Metric icon="mail" label="Unanswered Enquiries" value={summary?.unansweredEnquiries ?? "—"} /><Metric icon="bed" label="Arrivals Today" value={summary?.arrivalsToday ?? "—"} /><Metric icon="bed" label="Departures Today" value={summary?.departuresToday ?? "—"} /><Metric icon="calendar" label="Confirmed Bookings" sub="(This Month)" value={summary?.confirmedBookingsThisMonth ?? "—"} /><Metric icon="coins" label="Estimated Revenue" sub="(This Month)" value={summary ? displayMoney(summary.estimatedRevenueThisMonth) : "—"} /></section><section className="admin-grid admin-operation-grid"><DashboardAvailabilityCalendar /><article className="admin-panel"><PanelTitle icon="spark" title="Quick Actions" /><div className="admin-quick-actions"><QuickAction icon="calendar" label="Create Booking" /><QuickAction icon="block" label="Block Dates" /><QuickAction icon="tag" label="Add Offer" /><QuickAction icon="megaphone" label="Publish Announcement" /></div></article><article className="admin-panel"><PanelTitle icon="bell" title="Alerts & Reminders" /><div className="admin-alerts">{alertFeed.length ? alertFeed.map((item) => <Alert key={item.id} icon={item.icon || "bell"} label={item.body} unread={!item.read} onOpen={() => openAlert(item)} />) : <p className="admin-empty" style={{ margin: "8px 0" }}>No alerts for your role right now.</p>}</div></article></section><section className="admin-grid admin-table-grid"><article className="admin-panel admin-table-panel"><PanelTitle icon="calendar" title="Recent Booking Requests" action="View All Requests" actionTo="/admin/booking-requests" />{requests.length ? <table><thead><tr><th>#</th><th>Guest Name</th><th>Arrival</th><th>Departure</th><th>Guests</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{requests.map((item) => <tr key={item.id}><td>BR-{item.id}</td><td>{item.name}</td><td>{displayDate(item.arrive)}</td><td>{displayDate(item.depart)}</td><td>{item.guests || "—"}</td><td>{displayDate(item.createdAt)}</td><td><em>{item.status?.replaceAll("_", " ") || "—"}</em></td></tr>)}</tbody></table> : <p className="admin-empty">No booking requests have been received yet.</p>}</article><article className="admin-panel admin-stays"><PanelTitle icon="bed" title="Upcoming Stays" action="Next 7 Days" />{stays.length ? <ul className="booking-history">{stays.map((stay) => <li key={stay.id}><span><strong>{stay.guestName}</strong> · {stay.guests} guests</span><span>{displayDate(stay.checkIn)} – {displayDate(stay.checkOut)}</span></li>)}</ul> : <p className="admin-empty">No confirmed arrivals in the next seven days.</p>}</article></section></div></section></main>;
}

function PanelTitle({ icon, title, action, actionTo }) {
  const actionControl = action ? (
    actionTo ? (
      <Link to={actionTo}>
        {action} <Icon name="arrow" size={17} />
      </Link>
    ) : (
      <button type="button">
        {action} <Icon name="arrow" size={17} />
      </button>
    )
  ) : null;
  return (
    <header className="admin-panel-title">
      <span>
        <Icon name={icon} /> <h2>{title}</h2>
      </span>
      {actionControl}
    </header>
  );
}
function Metric({ icon, label, sub, value }) { return <article className="admin-metric"><Icon name={icon} /><div><span>{label} {sub ? <small>{sub}</small> : null}</span><strong>{value}</strong></div></article>; }
function QuickAction({ icon, label }) { return <button type="button"><Icon name={icon} size={29} /><span>{label}</span></button>; }
function Alert({ icon, label, onOpen, unread = true }) {
  return (
    <button type="button" className={unread ? "" : "is-read"} onClick={onOpen}>
      <Icon name={icon} />
      <span>{label}</span>
      <Icon name="arrow" size={16} />
    </button>
  );
}
