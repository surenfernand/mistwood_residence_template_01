import { CHECK_IN_OPTIONS, CHECK_OUT_OPTIONS } from "../../../data/settingsUiMock.js";
import { usePublicSettings } from "../../../hooks/usePublicSettings.js";
import { formatSettingsTime } from "../../../utils/formatSettingsTime.js";
import { SettingsCard, SettingsStepper, SettingsToggle } from "./SettingsControls.jsx";
import { IconCalendar, IconCard, IconClock } from "./SettingsPanelIcons.jsx";

export default function SettingsBookingPanel({ data, onPatch }) {
  const { propertyName } = usePublicSettings();
  const setNum = (key) => (value) => onPatch({ [key]: value });
  const setBool = (key) => (value) => onPatch({ [key]: value });
  const setField = (key) => (event) => onPatch({ [key]: event.target.value });

  return (
    <div className="settings-panel settings-panel-booking">
      <p className="settings-callout">
        <span aria-hidden>ⓘ</span>
        These settings apply to <strong>all direct bookings</strong> for {propertyName}. Changes will take effect
        immediately for new bookings.
      </p>

      <div className="settings-booking-grid">
        <SettingsCard title="Base pricing" icon={<IconCard />}>
          <SettingsStepper
            label="Nightly rate"
            description="Default price per night before seasonal rates and offers."
            value={data.nightlyRate}
            unit={data.rateCurrency || "LKR"}
            onChange={setNum("nightlyRate")}
            min={1000}
            max={1000000}
            step={500}
          />
        </SettingsCard>

        <SettingsCard title="Stay requirements" icon={<IconUsersStub />}>
          <SettingsStepper
            label="Minimum nights"
            description="The shortest allowable stay."
            value={data.minNights}
            unit="night"
            onChange={setNum("minNights")}
            min={1}
            max={30}
          />
          <SettingsStepper
            label="Maximum nights"
            description="The longest allowable stay."
            value={data.maxNights}
            unit="nights"
            onChange={setNum("maxNights")}
            min={1}
            max={90}
          />
          <SettingsStepper
            label="Maximum guests"
            description="Maximum number of guests per booking."
            value={data.maxGuests}
            unit="guests"
            onChange={setNum("maxGuests")}
            min={1}
            max={20}
          />
        </SettingsCard>

        <SettingsCard title="Booking window" icon={<IconCalendar />}>
          <SettingsStepper
            label="Advance booking days"
            description="How far in advance guests can book."
            value={data.advanceBookingDays}
            unit="days"
            onChange={setNum("advanceBookingDays")}
            min={1}
            max={730}
          />
          <SettingsToggle
            label="Allow same-day booking"
            description="Let guests book for arrival today."
            checked={data.sameDayBooking}
            onChange={setBool("sameDayBooking")}
          />
          <SettingsStepper
            label="Lead time"
            description="Minimum time between booking and check-in."
            value={data.leadTimeHours}
            unit="hours"
            onChange={setNum("leadTimeHours")}
            min={0}
            max={72}
          />
        </SettingsCard>

        <SettingsCard title="Check-in & check-out" icon={<IconClock />}>
          <label className="settings-field">
            <span className="settings-field-label">Check-in time</span>
            <div className="settings-field-control">
              <select value={data.checkInTime} onChange={setField("checkInTime")}>
                {CHECK_IN_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatSettingsTime(t)}
                  </option>
                ))}
              </select>
            </div>
            <small className="settings-field-help">When guests can start checking in.</small>
          </label>
          <label className="settings-field">
            <span className="settings-field-label">Check-out time</span>
            <div className="settings-field-control">
              <select value={data.checkOutTime} onChange={setField("checkOutTime")}>
                {CHECK_OUT_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatSettingsTime(t)}
                  </option>
                ))}
              </select>
            </div>
            <small className="settings-field-help">When guests must check out.</small>
          </label>
        </SettingsCard>

        <SettingsCard title="Deposit & payment" icon={<IconCard />}>
          <SettingsToggle
            label="Require deposit"
            description="Collect a deposit at the time of booking."
            checked={data.requireDeposit}
            onChange={setBool("requireDeposit")}
          />
          <SettingsStepper
            label="Deposit percentage"
            description="Percentage of the total stay amount."
            value={data.depositPercent}
            unit="%"
            onChange={setNum("depositPercent")}
            min={1}
            max={100}
          />
        </SettingsCard>
      </div>

      <SettingsCard title="Cancellation policy" icon={<IconCalendar />} className="settings-policy-card">
        <label className="settings-field">
          <span className="settings-field-label">Policy text</span>
          <div className="settings-field-control">
            <textarea
              rows={5}
              value={data.cancellationPolicy}
              onChange={setField("cancellationPolicy")}
              aria-label="Cancellation policy"
            />
          </div>
          <small className="settings-field-help">Shown on the guest policies page and linked from the booking form.</small>
        </label>
      </SettingsCard>
    </div>
  );
}

function IconUsersStub() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-2a5 5 0 0 1 10 0v2" />
    </svg>
  );
}
