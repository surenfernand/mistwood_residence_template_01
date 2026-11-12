import { useEffect, useState } from "react";

let cachedSession = null;
let inflight = null;

export function clearAdminSessionCache() {
  cachedSession = null;
  inflight = null;
}

export function patchAdminSessionCache(patch) {
  if (!cachedSession || !patch) return;
  cachedSession = { ...cachedSession, ...patch };
}

export function notifyAdminSessionUpdated(admin) {
  if (admin) {
    cachedSession = admin;
    window.dispatchEvent(new CustomEvent("mistwood-admin-session", { detail: admin }));
  }
}

export async function refreshAdminSession() {
  cachedSession = null;
  inflight = null;
  return fetchAdminSession();
}

export async function fetchAdminSession() {
  if (cachedSession) return cachedSession;
  if (inflight) return inflight;
  inflight = fetch("/api/admin/auth/me")
    .then(async (response) => {
      if (!response.ok) {
        cachedSession = null;
        return null;
      }
      const data = await response.json();
      cachedSession = data.admin || null;
      return cachedSession;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useAdminSession() {
  const [admin, setAdmin] = useState(cachedSession);
  const [loading, setLoading] = useState(!cachedSession);

  useEffect(() => {
    let active = true;
    fetchAdminSession().then((session) => {
      if (active) {
        setAdmin(session);
        setLoading(false);
      }
    });
    const onSession = (event) => {
      if (event.detail) setAdmin(event.detail);
    };
    window.addEventListener("mistwood-admin-session", onSession);
    return () => {
      active = false;
      window.removeEventListener("mistwood-admin-session", onSession);
    };
  }, []);

  const permissions = admin?.permissions || [];
  const can = (code) => permissions.includes(code);

  return { admin, loading, permissions, can };
}
