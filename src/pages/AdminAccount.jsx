import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminAccountLayout from "../components/admin/AdminAccountLayout.jsx";

const rules = [
  ["length", "At least 8 characters"],
  ["upper", "One uppercase letter"],
  ["lower", "One lowercase letter"],
  ["number", "One number"],
];

export default function AdminAccount() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const checks = useMemo(
    () => ({
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
    }),
    [newPassword],
  );

  const submit = async (event) => {
    event.preventDefault();
    if (!Object.values(checks).every(Boolean)) {
      setError("Your new password does not meet every requirement.");
      return;
    }
    if (newPassword !== confirmation) {
      setError("The password confirmation does not match.");
      return;
    }
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setNotice(data.message || "Password updated.");
    } catch (e) {
      setError(e.message || "Could not update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminAccountLayout
      title="Account settings"
      subtitle="Manage your password and account security."
      documentTitle="Account settings | Mistwood Residence"
    >
      <form className="admin-account-card" onSubmit={submit}>
        <label>
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <ul className="admin-password-rules">
          {rules.map(([key, label]) => (
            <li className={checks[key] ? "is-valid" : ""} key={key}>
              {checks[key] ? "✓" : "○"} {label}
            </li>
          ))}
        </ul>
        <button type="submit" disabled={saving}>
          {saving ? "Updating…" : "Update password"}
        </button>
        <p style={{ marginTop: 14, fontSize: 13 }}>
          <Link to="/admin/forgot-password">Forgot your password?</Link>
        </p>
        {notice ? <p className="admin-form-notice">{notice}</p> : null}
        {error ? <p className="admin-form-error">{error}</p> : null}
      </form>
    </AdminAccountLayout>
  );
}
