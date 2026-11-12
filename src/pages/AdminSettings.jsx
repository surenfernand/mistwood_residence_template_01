import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import SettingsBookingPanel from "../components/admin/settings/SettingsBookingPanel.jsx";
import { SettingsSaveBar } from "../components/admin/settings/SettingsControls.jsx";
import SettingsGeneralPanel from "../components/admin/settings/SettingsGeneralPanel.jsx";
import SettingsIntegrationsPanel from "../components/admin/settings/SettingsIntegrationsPanel.jsx";
import SettingsNotificationsPanel from "../components/admin/settings/SettingsNotificationsPanel.jsx";
import SettingsWebsitePanel from "../components/admin/settings/SettingsWebsitePanel.jsx";
import {
  SETTINGS_TABS,
  createSettingsUiState,
} from "../data/settingsUiMock.js";
import { apiSettingsToUiState, diffApiSettings } from "../lib/adminSettingsApi.js";
import { clearPublicSettingsCache } from "../hooks/usePublicSettings.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [tab, setTab] = useState("general");
  const [baselineApi, setBaselineApi] = useState(null);
  const [baseline, setBaseline] = useState(() => createSettingsUiState());
  const [draft, setDraft] = useState(() => createSettingsUiState());
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [integrations, setIntegrations] = useState(null);
  const [integrationActivity, setIntegrationActivity] = useState([]);

  useSiteTitle("Settings");

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => {
        if (!r.ok) navigate("/admin/login", { replace: true });
      })
      .catch(() => navigate("/admin/login", { replace: true }));
  }, [navigate]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (r.status === 401) {
          navigate("/admin/login", { replace: true });
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data?.settings) return;
        const ui = apiSettingsToUiState(data.settings);
        setBaselineApi(data.settings);
        setBaseline(ui);
        setDraft(JSON.parse(JSON.stringify(ui)));
        setIntegrations(data.integrations || null);
        setIntegrationActivity(data.integrationActivity || []);
      })
      .catch(() => setLoadError("Could not load settings. Try refreshing the page."));
  }, [navigate]);

  const dirty = useMemo(() => JSON.stringify(baseline) !== JSON.stringify(draft), [baseline, draft]);

  const patchSection = useCallback((section) => (patch) => {
    setDraft((current) => ({
      ...current,
      [section]: { ...current[section], ...patch },
    }));
    setNotice("");
  }, []);

  const save = () => {
    if (!baselineApi) return;
    const patch = diffApiSettings(baselineApi, draft);
    if (!Object.keys(patch).length) {
      setNotice("No changes to save.");
      return;
    }
    setSaving(true);
    setNotice("");
    fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.error || "Save failed");
        return body;
      })
      .then((data) => {
        const ui = apiSettingsToUiState(data.settings);
        setBaselineApi(data.settings);
        setBaseline(ui);
        setDraft(JSON.parse(JSON.stringify(ui)));
        setIntegrations(data.integrations || null);
        setIntegrationActivity(data.integrationActivity || []);
        clearPublicSettingsCache();
        setNotice("Settings saved. The public website will show your updates shortly.");
      })
      .catch((err) => setNotice(err.message || "Could not save settings."))
      .finally(() => setSaving(false));
  };

  const showSaveBar = tab !== "integrations";

  return (
    <main className="admin-app settings-page">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Settings</h1>
            <span>Property details, booking rules, notifications, and integrations.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>

        <div className="settings-shell">
          <nav className="settings-tabs" aria-label="Settings sections">
            {SETTINGS_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? "is-active" : ""}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {loadError ? <p className="settings-notice settings-notice-error">{loadError}</p> : null}
          {notice ? <p className="settings-notice">{notice}</p> : null}

          <div className="settings-tab-panel">
            {tab === "general" ? (
              <SettingsGeneralPanel data={draft.general} onPatch={patchSection("general")} />
            ) : null}
            {tab === "booking" ? (
              <SettingsBookingPanel data={draft.booking} onPatch={patchSection("booking")} />
            ) : null}
            {tab === "notifications" ? (
              <SettingsNotificationsPanel data={draft.notifications} onPatch={patchSection("notifications")} />
            ) : null}
            {tab === "website" ? (
              <SettingsWebsitePanel data={draft.website} onPatch={patchSection("website")} />
            ) : null}
            {tab === "integrations" ? (
              <SettingsIntegrationsPanel
                integrations={integrations}
                activity={integrationActivity}
                data={draft.integrations}
                onPatch={patchSection("integrations")}
                onManageSocial={(targetTab) => setTab(targetTab || "website")}
              />
            ) : null}
          </div>

          {showSaveBar ? <SettingsSaveBar dirty={dirty} saving={saving} onSave={save} /> : null}
        </div>
      </section>
    </main>
  );
}
