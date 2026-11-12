import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminIcon from "./AdminIcon.jsx";
import { formatNotificationTime, useAdminNotifications } from "../../hooks/useAdminNotifications.js";

/**
 * @param {{ open?: boolean, onOpenChange?: (open: boolean) => void }} props
 */
export default function AdminNotificationBell({ open: controlledOpen, onOpenChange }) {
  const navigate = useNavigate();
  const listId = useId();
  const rootRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value) => {
    if (isControlled) onOpenChange?.(value);
    else setInternalOpen(value);
  };
  const { notifications, unreadCount, loading, refresh, markRead, markAllRead } = useAdminNotifications({
    limit: 8,
    pollMs: 60000,
  });

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  };

  const openFromHover = () => {
    clearCloseTimer();
    if (!open) setOpen(true);
  };

  const closeFromHover = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 140);
  };

  const toggle = () => {
    clearCloseTimer();
    setOpen(!open);
  };

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  useEffect(() => () => clearCloseTimer(), []);

  const onItemClick = async (item) => {
    if (!item.read) await markRead(item.id);
    setOpen(false);
    const href = item.metadata?.href;
    if (href) navigate(href);
  };

  return (
    <div
      className="admin-notification-wrap"
      ref={rootRef}
      onMouseEnter={openFromHover}
      onMouseLeave={closeFromHover}
    >
      <button
        type="button"
        className={`admin-notification${unreadCount ? " has-unread" : ""}`}
        aria-label="Notifications"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={toggle}
      >
        <AdminIcon name="bell" size={22} />
        {unreadCount > 0 ? <i aria-hidden="true" /> : null}
      </button>
      <div
        className={`admin-notification-panel${open ? " is-open" : ""}`}
        id={listId}
        role="region"
        aria-label="Notifications"
        aria-hidden={!open}
      >
          <header className="admin-notification-panel-head">
            <h2>Notifications</h2>
            <button type="button" onClick={() => markAllRead()} disabled={!unreadCount} tabIndex={open ? 0 : -1}>
              Mark all as read
            </button>
          </header>
          <ul className="admin-notification-list">
            {loading && !notifications.length ? (
              <li className="admin-notification-empty">Loading…</li>
            ) : null}
            {!loading && !notifications.length ? (
              <li className="admin-notification-empty">You&apos;re all caught up.</li>
            ) : null}
            {notifications.map((item) => (
              <li key={item.id}>
                <button type="button" className={item.read ? "is-read" : "is-unread"} onClick={() => onItemClick(item)} tabIndex={open ? 0 : -1}>
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
          <footer>
            <Link to="/admin/notifications" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              View all notifications →
            </Link>
          </footer>
      </div>
    </div>
  );
}
