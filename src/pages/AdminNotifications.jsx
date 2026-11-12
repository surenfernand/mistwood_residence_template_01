import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import AdminIcon from "../components/admin/AdminIcon.jsx";
import { formatNotificationTime, useAdminNotifications } from "../hooks/useAdminNotifications.js";
import { usePublicSettings } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const PAGE_SIZE = 50;

export default function AdminNotifications() {
  const pub = usePublicSettings();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { notifications, unreadCount, total, loading, markRead, markAllRead } = useAdminNotifications({
    limit,
    offset: 0,
    pollMs: 0,
  });

  useSiteTitle("Notifications");
  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => {
        if (!r.ok) navigate("/admin/login", { replace: true });
      })
      .catch(() => navigate("/admin/login", { replace: true }));
  }, [navigate]);

  const onItemClick = async (item) => {
    if (!item.read) await markRead(item.id);
    const href = item.metadata?.href;
    if (href) navigate(href);
  };

  return (
    <main className="admin-app">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin Panel</p>
            <h1>Notifications</h1>
            <span>Alerts and reminders for your role at {pub.propertyName}.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="admin-notifications-page">
          <div className="admin-notification-page-toolbar">
            <button type="button" onClick={() => markAllRead()} disabled={!unreadCount}>
              Mark all as read
            </button>
          </div>
          <ul className="admin-notification-page-list">
            {loading && !notifications.length ? <li className="admin-notification-empty">Loading…</li> : null}
            {!loading && !notifications.length ? <li className="admin-notification-empty">No notifications yet.</li> : null}
            {notifications.map((item) => (
              <li key={item.id}>
                <button type="button" className={item.read ? "is-read" : "is-unread"} onClick={() => onItemClick(item)}>
                  <span className="admin-notification-icon">
                    <AdminIcon name={item.icon || "bell"} size={18} />
                  </span>
                  <span className="admin-notification-copy">
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                    <time dateTime={item.createdAt}>{formatNotificationTime(item.createdAt)}</time>
                  </span>
                  {!item.read ? <em aria-hidden="true" /> : null}
                </button>
              </li>
            ))}
          </ul>
          {notifications.length < total ? (
            <div className="admin-notification-page-toolbar">
              <button type="button" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
                Load more
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
