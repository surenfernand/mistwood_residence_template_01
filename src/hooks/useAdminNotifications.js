import { useCallback, useEffect, useState } from "react";

export function formatNotificationTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Colombo",
  }).format(new Date(iso));
}

/**
 * @param {{ limit?: number, offset?: number, pollMs?: number, enabled?: boolean }} options
 */
export function useAdminNotifications(options = {}) {
  const { limit = 20, offset = 0, pollMs = 60000, enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!enabled) return null;
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      const response = await fetch(`/api/admin/notifications?${params}`);
      if (response.status === 401) {
        setData(null);
        return null;
      }
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not load notifications.");
      setData(json);
      setError("");
      return json;
    } catch (e) {
      setError(e.message || "Could not load notifications.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, limit, offset]);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    refresh().then((json) => {
      if (!active) return;
      if (json) setData(json);
    });
    return () => {
      active = false;
    };
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || !pollMs) return undefined;
    const timer = window.setInterval(() => {
      refresh();
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [enabled, pollMs, refresh]);

  const markRead = useCallback(
    async (id) => {
      const response = await fetch(`/api/admin/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
      if (response.ok) await refresh();
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    const response = await fetch("/api/admin/notifications/read-all", { method: "POST" });
    if (response.ok) await refresh();
  }, [refresh]);

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    total: data?.total ?? 0,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  };
}
