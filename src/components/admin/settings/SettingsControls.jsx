/** Shared form primitives for Settings UI mockups. */

export function SettingsCard({ title, icon, children, className = "" }) {
  return (
    <section className={`settings-card ${className}`.trim()}>
      {title ? (
        <header className="settings-card-head">
          {icon ? <span className="settings-card-icon">{icon}</span> : null}
          <h3>{title}</h3>
        </header>
      ) : null}
      <div className="settings-card-body">{children}</div>
    </section>
  );
}

export function SettingsField({ label, required, hint, icon, children }) {
  return (
    <label className="settings-field">
      <span className="settings-field-label">
        {label}
        {required ? <em>Required</em> : null}
        {hint ? (
          <small className="settings-hint" title={hint}>
            ⓘ
          </small>
        ) : null}
      </span>
      <div className={`settings-field-control${icon ? " has-icon" : ""}`}>
        {icon ? <span className="settings-field-icon">{icon}</span> : null}
        {children}
      </div>
    </label>
  );
}

export function SettingsToggle({ label, description, icon, checked, onChange, disabled }) {
  return (
    <div className="settings-toggle-row">
      {icon ? <span className="settings-toggle-icon">{icon}</span> : null}
      <div className="settings-toggle-copy">
        <strong>{label}</strong>
        {description ? <p>{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`settings-switch${checked ? " is-on" : ""}`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

export function SettingsStepper({ label, description, value, unit, onChange, min = 0, max = 999, step = 1 }) {
  const bump = (delta) => {
    const next = Math.min(max, Math.max(min, Number(value) + delta));
    onChange(next);
  };

  return (
    <div className="settings-stepper">
      <div className="settings-stepper-copy">
        <strong>{label}</strong>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="settings-stepper-control">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => bump(-step)}>
          −
        </button>
        <span>
          {value}
          {unit ? <small>{unit}</small> : null}
        </span>
        <button type="button" aria-label={`Increase ${label}`} onClick={() => bump(step)}>
          +
        </button>
      </div>
    </div>
  );
}

export function SettingsStars({ rating, max = 5 }) {
  const stars = [];
  for (let i = 1; i <= max; i += 1) {
    const filled = rating >= i - 0.25;
    stars.push(
      <span key={i} className={filled ? "is-on" : ""} aria-hidden>
        ★
      </span>,
    );
  }
  return <span className="settings-stars">{stars}</span>;
}

export function SettingsSaveBar({ dirty, saving, onSave }) {
  return (
    <footer className="settings-save-bar">
      <span className={`settings-unsaved${dirty ? " is-visible" : ""}`}>
        <i aria-hidden /> Unsaved changes
      </span>
      <button type="button" className="settings-save-btn" disabled={!dirty || saving} onClick={onSave}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </footer>
  );
}
