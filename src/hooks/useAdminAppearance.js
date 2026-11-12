import { useCallback, useEffect, useState } from "react";

export const ADMIN_APPEARANCE_KEY = "mistwood_admin_appearance";

const defaults = {
  compactSidebar: false,
  reduceMotion: false,
};

export function readAdminAppearance() {
  try {
    const raw = localStorage.getItem(ADMIN_APPEARANCE_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function writeAdminAppearance(prefs) {
  const next = { ...readAdminAppearance(), ...prefs };
  localStorage.setItem(ADMIN_APPEARANCE_KEY, JSON.stringify(next));
  applyAdminAppearance(next);
  window.dispatchEvent(new CustomEvent("mistwood-admin-appearance", { detail: next }));
  return next;
}

export function applyAdminAppearance(prefs = readAdminAppearance()) {
  const root = document.documentElement;
  root.classList.toggle("admin-reduce-motion", Boolean(prefs.reduceMotion));
  root.classList.toggle("admin-compact-sidebar", Boolean(prefs.compactSidebar));
}

export function useAdminAppearance() {
  const [prefs, setPrefs] = useState(readAdminAppearance);

  useEffect(() => {
    applyAdminAppearance(readAdminAppearance());
    const onStorage = (event) => {
      if (event.key === ADMIN_APPEARANCE_KEY) setPrefs(readAdminAppearance());
    };
    const onCustom = (event) => {
      if (event.detail) setPrefs(event.detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("mistwood-admin-appearance", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mistwood-admin-appearance", onCustom);
    };
  }, []);

  const update = useCallback((patch) => {
    setPrefs(writeAdminAppearance(patch));
  }, []);

  return { prefs, update };
}
