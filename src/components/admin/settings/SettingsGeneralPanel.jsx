import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "../../../data/settingsUiMock.js";
import { SettingsCard, SettingsField } from "./SettingsControls.jsx";
import { IconBuilding, IconGlobe, IconMail } from "./SettingsPanelIcons.jsx";

export default function SettingsGeneralPanel({ data, onPatch }) {
  const set = (key) => (event) => {
    onPatch({ [key]: event.target.value });
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
              <button type="button" className="settings-btn-outline">
                ↑ Upload new logo
              </button>
              <button type="button" className="settings-btn-icon" aria-label="Remove logo">
                🗑
              </button>
            </div>
            <small>PNG, JPG or WEBP (max 5 MB)</small>
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

     
      </div>
    </div>
  );
}
