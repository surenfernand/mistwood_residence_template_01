import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminIcon from "./AdminIcon.jsx";
import { formatNotificationTime, useAdminNotifications } from "../../hooks/useAdminNotifications.js";
import { useAdminMobilePopover } from "../../hooks/useAdminMobilePopover.js";

const NOTIFICATION_SOUND_SEEN_KEY = "mistwood-admin-notification-sound-seen";

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
  const knownNotificationIdsRef = useRef(null);
  const notificationAudioRef = useRef(null);
  const setOpen = (value) => {
    if (isControlled) onOpenChange?.(value);
    else setInternalOpen(value);
  };
  const { notifications, unreadCount, loading, refresh, markRead, markAllRead } = useAdminNotifications({
    limit: 8,
    pollMs: 60000,
  });

  useEffect(() => {
    const audio = new Audio("/assets/sounds/audio-editor-output.mp3");
    audio.preload = "auto";
    audio.volume = 0.45;
    notificationAudioRef.current = audio;

    return () => {
      audio.pause();
      notificationAudioRef.current = null;
    };
  }, []);


  useEffect(() => {
    // Wait for the first notification request before creating the silent baseline.
    if (loading) return;

    const currentIds = notifications.map((item) => item.id);

    if (knownNotificationIdsRef.current === null) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(NOTIFICATION_SOUND_SEEN_KEY) || "[]");
        knownNotificationIdsRef.current = new Set(Array.isArray(saved) ? saved : []);
      } catch {
        knownNotificationIdsRef.current = new Set();
      }

      // The first visit in a tab establishes a baseline without playing audio.
      if (!sessionStorage.getItem(NOTIFICATION_SOUND_SEEN_KEY)) {
        knownNotificationIdsRef.current = new Set(currentIds);
        sessionStorage.setItem(NOTIFICATION_SOUND_SEEN_KEY, JSON.stringify(currentIds.slice(0, 100)));
        return;
      }
    }

    const hasNewUnreadNotification = notifications.some(
      (item) => !item.read && !knownNotificationIdsRef.current.has(item.id),
    );

    if (hasNewUnreadNotification) {
      notificationAudioRef.current?.play().catch(() => {
        // Browsers can block audio until the admin first interacts with the page.
      });
    }

    currentIds.forEach((id) => knownNotificationIdsRef.current.add(id));
    sessionStorage.setItem(
      NOTIFICATION_SOUND_SEEN_KEY,
      JSON.stringify(Array.from(knownNotificationIdsRef.current).slice(-100)),
    );
  }, [loading, notifications]);

  useAdminMobilePopover(rootRef, open);

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
