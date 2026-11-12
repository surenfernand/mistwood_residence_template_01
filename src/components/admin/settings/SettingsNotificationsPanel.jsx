import { DIGEST_OPTIONS } from "../../../data/settingsUiMock.js";
import { usePublicSettings } from "../../../hooks/usePublicSettings.js";
import { SettingsCard, SettingsField, SettingsToggle } from "./SettingsControls.jsx";
import { IconBell, IconMail, IconShield, IconUsers } from "./SettingsPanelIcons.jsx";

export default function SettingsNotificationsPanel({ data, onPatch }) {
  const pub = usePublicSettings();
  const set = (key) => (event) => onPatch({ [key]: event.target.value });
  const setBool = (key) => (value) => onPatch({ [key]: value });

  return (
    <div className="settings-panel settings-panel-notifications">
      <SettingsCard title="Email delivery" icon={<IconMail />}>
        <div className="settings-email-row">
          <SettingsField label="Admin alert email" hint="Where operational alerts are sent.">
            <input type="email" value={data.adminAlertEmail} onChange={set("adminAlertEmail")} />
          </SettingsField>
          <SettingsField label="Reply-to email" hint="Reply address guests see on outbound mail.">
            <input type="email" value={data.replyToEmail} onChange={set("replyToEmail")} />
          </SettingsField>
          <SettingsField label="Sender name" hint="Friendly From name on guest emails.">
            <input value={data.senderName} onChange={set("senderName")} />
          </SettingsField>
        </div>
      </SettingsCard>

      <div className="settings-notifications-grid">
        <SettingsCard title="Guest messages" icon={<IconUsers />}>
          <SettingsToggle
            label="Booking confirmation"
            description="Automatically send a confirmation email to guests after a successful booking."
            checked={data.guestBookingConfirmation}
            onChange={setBool("guestBookingConfirmation")}
          />
          <SettingsToggle
            label="Payment receipt"
            description="Send a receipt email to guests after a successful payment."
            checked={data.paymentReceipt}
            onChange={setBool("paymentReceipt")}
          />
          <SettingsToggle
            label="Check-in reminder"
            description="Send a friendly reminder to guests before their check-in date (e.g., 2 days prior)."
            checked={data.checkInReminder}
            onChange={setBool("checkInReminder")}
          />
        </SettingsCard>

        <SettingsCard title="Admin alerts" icon={<IconShield />}>
          <SettingsToggle
            label="New booking request"
            description="Notify the admin when a new booking request is received (e.g., pending confirmation)."
            checked={data.adminNewBooking}
            onChange={setBool("adminNewBooking")}
          />
          <SettingsToggle
            label="Payment pending"
            description="Notify the admin when a booking has an unpaid or pending payment."
            checked={data.adminPaymentPending}
            onChange={setBool("adminPaymentPending")}
          />
          <SettingsToggle
            label="Guest enquiry"
            description="Notify the admin when a guest sends an enquiry through the website."
            checked={data.adminGuestEnquiry}
            onChange={setBool("adminGuestEnquiry")}
          />
        </SettingsCard>

        <SettingsCard title="In-app notifications" icon={<IconBell />} className="settings-notifications-inapp">
          <div className="settings-inapp-split">
            <SettingsToggle
              label="Bell notifications"
              description="Show real-time notifications in the admin panel (bell icon in the top bar)."
              checked={data.inAppBell}
              onChange={setBool("inAppBell")}
            />
            <label className="settings-field">
              <span className="settings-field-label">
                Digest frequency
                <small className="settings-hint" title="Summary email in your admin inbox.">
                  ⓘ
                </small>
              </span>
              <p className="settings-toggle-desc-block">
                Receive a summary of key activity (bookings, payments, enquiries) in the admin email.
              </p>
              <select value={data.digestFrequency} onChange={set("digestFrequency")}>
                {DIGEST_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
