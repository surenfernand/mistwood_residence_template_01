import { SettingsCard } from "./SettingsControls.jsx";
import { IconBell, IconCard, IconLock, IconMail } from "./SettingsPanelIcons.jsx";
import { formatActivityWhen } from "../../../utils/formatActivityWhen.js";

function IntegrationCard({ icon, title, description, statusNode, actionLabel, onAction, actionPrimary }) {
  return (
    <article className="settings-integration-card">
      <header>
        <span className="settings-card-icon">{icon}</span>
        <h3>{title}</h3>
      </header>
      <p>{description}</p>
      <div className="settings-integration-meta">{statusNode}</div>
      <button
        type="button"
        className={actionPrimary ? "settings-save-btn settings-save-btn-sm" : "settings-btn-outline"}
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </article>
  );
}

export default function SettingsIntegrationsPanel({
  integrations,
  activity = [],
  data,
  onPatch,
  onManageSocial,
}) {
  const view = integrations || {};
  const payhere = view.payhere || {};
  const email = view.email || {};

  const filtered =
    data?.activityFilter === "all"
      ? activity
      : activity.filter((row) => {
          const key = String(data?.activityFilter || "").toLowerCase();
          return String(row.service || "").toLowerCase().includes(key);
        });

  return (
    <div className="settings-panel settings-panel-integrations">
      <div className="settings-integrations-grid">
        <IntegrationCard
          icon={<IconCard />}
          title="PayHere"
          description="Accept secure online payments for bookings and deposits."
          statusNode={
            payhere.configured ? (
              <>
                <span className="settings-badge is-ok">✓ Configured</span>
                <select value={payhere.mode || "Sandbox"} disabled aria-label="PayHere mode">
                  <option>{payhere.mode || "Sandbox"}</option>
                </select>
              </>
            ) : (
              <span className="settings-badge is-warn">● Not configured</span>
            )
          }
          actionLabel="⚙ Manage"
          onAction={() => {
            window.open("https://www.payhere.lk/account/signin", "_blank", "noopener,noreferrer");
          }}
        />

        <IntegrationCard
          icon={<IconMail />}
          title="Email delivery"
          description="Send booking confirmations, updates, and guest messages via SMTP or Resend."
          statusNode={
            email.configured ? (
              <>
                <span className="settings-badge is-ok">✓ Configured</span>
                <select value={email.mode || "SMTP"} disabled aria-label="Email provider">
                  <option>{email.mode}</option>
                </select>
              </>
            ) : (
              <span className="settings-badge is-warn">● Not configured</span>
            )
          }
          actionLabel="⚙ Manage"
          onAction={() => onManageSocial?.("notifications")}
        />
      </div>

      <p className="settings-secure-banner">
        <IconLock />
        <span>
          <strong>Secure environment variables</strong>
          Secret keys (API, SMTP, payment gateways) are stored on the server environment and are not shown in this
          panel. PayHere mode and SMTP/Resend come from <code>.env</code>; footer social links are stored in site
          settings.
        </span>
      </p>

      {view.publicSiteUrl ? (
        <p className="settings-notice" style={{ marginTop: 0 }}>
          Public site URL for webhooks: <strong>{view.publicSiteUrl}</strong>
        </p>
      ) : null}

      <SettingsCard title="Integration activity" icon={<IconBell />} className="settings-activity-card">
        <div className="settings-activity-head">
          <span />
          <select value={data?.activityFilter || "all"} onChange={(e) => onPatch({ activityFilter: e.target.value })}>
            <option value="all">All integrations</option>
            <option value="payhere">PayHere</option>
            <option value="email">Email delivery</option>
          </select>
        </div>
        <ul className="settings-activity-list">
          {filtered.length ? (
            filtered.map((row) => (
              <li key={row.id}>
                <span className={`settings-activity-status is-${row.status}`}>✓ {row.status}</span>
                <strong>{row.service}</strong>
                <span>{row.message}</span>
                <time dateTime={row.createdAt}>{formatActivityWhen(row.createdAt)}</time>
              </li>
            ))
          ) : (
            <li>
              <span className="settings-activity-status is-info">ⓘ info</span>
              <strong>No activity yet</strong>
              <span>Save notification settings or complete a payment to see events here.</span>
            </li>
          )}
        </ul>
      </SettingsCard>
    </div>
  );
}
