import { useRef, useState } from "react";
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "../../../data/settingsUiMock.js";
import { SettingsCard, SettingsField } from "./SettingsControls.jsx";
import { IconBuilding, IconGlobe, IconMail } from "./SettingsPanelIcons.jsx";

export default function SettingsGeneralPanel({ data, website, onPatch, onWebsitePatch }) {
  const logoInputRef = useRef(null);
  const [logoError, setLogoError] = useState("");
  const set = (key) => (event) => {
    onPatch({ [key]: event.target.value });
  };
  const setWebsite = (key) => (event) => {
    onWebsitePatch?.({ [key]: event.target.value });
  };

  const uploadLogo = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setLogoError("");
    const form = new FormData();
    form.append("logo", file);
    try {
      const response = await fetch("/api/admin/settings/logo", { method: "POST", body: form });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Logo upload failed.");
      onPatch({ logoUrl: body.logoUrl });
    } catch (error) {
      setLogoError(error.message || "Logo upload failed.");
    }
  };

  return (
    <div className="settings-panel settings-panel-general">
      <SettingsCard title="Property identity" icon={<IconBuilding />} className="settings-card-wide">
        <div className="settings-identity-grid">
          <div className="settings-logo-block">
            <div aria-hidden className="settings-logo-preview">
              <img src={data.logoUrl} alt="" />
            </div>
            <div className="settings-logo-actions">
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadLogo} hidden />
              <button type="button" className="settings-btn-outline" onClick={() => logoInputRef.current?.click()}>
                ↑ Upload new logo
              </button>
              <button type="button" className="settings-btn-icon" aria-label="Remove logo" onClick={() => onPatch({ logoUrl: "/assets/mistwood/branding/logo.png" })}>
                🗑
              </button>
            </div>
            <small>PNG, JPG or WEBP (max 5 MB)</small>
            {logoError ? <small role="alert" style={{ color: "#b42318" }}>{logoError}</small> : null}
          </div>
          <div className="settings-identity-fields">
            <SettingsField label="Property name" required>
              <input value={data.propertyName} onChange={set("propertyName")} />
            </SettingsField>
            <SettingsField label="Tagline">
              <input value={data.tagline} onChange={set("tagline")} />
            </SettingsField>
            <SettingsField label="Description">
              <textarea rows={4} value={data.description} onChange={set("description")} />
            </SettingsField>
          </div>
        </div>
      </SettingsCard>

      <div className="settings-identity-fields">
        <SettingsCard title="Contact information" icon={<IconMail />}>
          <SettingsField label="Email" required icon="✉">
            <input type="email" value={data.email} onChange={set("email")} />
          </SettingsField>
          <SettingsField label="Phone" icon="☎">
            <input value={data.phone} onChange={set("phone")} />
          </SettingsField>
          <SettingsField label="WhatsApp" icon="◎">
            <input value={data.whatsapp} onChange={set("whatsapp")} />
          </SettingsField>
          <SettingsField label="Address" icon="⌖">
            <textarea rows={3} value={data.address} onChange={set("address")} />
          </SettingsField>
        </SettingsCard>

        <SettingsCard title="Social &amp; booking links" icon={<IconGlobe />} className="settings-card-wide">
          <p className="settings-toggle-desc-block" style={{ marginTop: 0 }}>
            Shown in the floating social dock on the public website. Leave a field empty to hide that icon.
          </p>
          <SettingsField label="Facebook">
            <input type="url" placeholder="https://www.facebook.com/..." value={website?.facebook || ""} onChange={setWebsite("facebook")} />
          </SettingsField>
          <SettingsField label="Booking.com">
            <input type="url" placeholder="https://www.booking.com/..." value={website?.bookingCom || ""} onChange={setWebsite("bookingCom")} />
          </SettingsField>
          <SettingsField label="Instagram">
            <input type="url" placeholder="https://www.instagram.com/..." value={website?.instagram || ""} onChange={setWebsite("instagram")} />
          </SettingsField>
          <SettingsField label="YouTube">
            <input type="url" placeholder="https://www.youtube.com/..." value={website?.youtube || ""} onChange={setWebsite("youtube")} />
          </SettingsField>
          <SettingsField label="Telegram">
            <input type="url" placeholder="https://t.me/..." value={website?.telegram || ""} onChange={setWebsite("telegram")} />
          </SettingsField>
        </SettingsCard>
      </div>
    </div>
  );
}
