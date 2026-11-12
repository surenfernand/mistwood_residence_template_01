import { useEffect, useMemo, useState } from "react";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const rules = [
  ["length", "At least 8 characters"],
  ["upper", "One uppercase letter"],
  ["lower", "One lowercase letter"],
  ["number", "One number"],
];

export default function AdminResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const checks = useMemo(() => ({ length: password.length >= 8, upper: /[A-Z]/.test(password), lower: /[a-z]/.test(password), number: /\d/.test(password) }), [password]);

  useSiteTitle("Reset password ");
  const submit = async (event) => {
    event.preventDefault();
    if (!Object.values(checks).every(Boolean)) return setNotice("Your new password does not meet every requirement.");
    if (password !== confirmation) return setNotice("The password confirmation does not match.");
    setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/admin/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not reset your password.");
      setNotice(data.message);
      setTimeout(() => navigate("/admin/login", { replace: true }), 1800);
    } catch (error) { setNotice(error.message || "We could not reset your password."); } finally { setSaving(false); }
  };

  return <main className="admin-login-page"><div className="admin-login-backdrop" aria-hidden="true" /><section className="admin-reset-card" aria-labelledby="reset-title"><aside className="admin-login-brand"><div className="admin-brand-shade" aria-hidden="true" /><Link to="/" className="admin-brand-link" aria-label="Return to Mistwood Residence home"><img src="/assets/mistwood/branding/logo.png" alt="Mistwood Residence" /></Link><p className="admin-brand-place">Nuwara Eliya</p><div className="admin-brand-hills" aria-hidden="true" /></aside><div className="admin-login-form-wrap"><img className="admin-login-leaf" src="/assets/mistwood/decorations/leaf-branch.png" alt="" /><div className="admin-login-content"><p className="admin-login-kicker">Account security</p><h1 id="reset-title">Set a new password</h1><p className="admin-login-intro">Choose a strong new password for your Mistwood Residence admin account.</p>{!token ? <p className="admin-login-notice">This password-reset link is invalid. Please request a new one from the login page.</p> : <form className="admin-login-form" onSubmit={submit}><label className="admin-field"><span className="sr-only">New password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="New Password" required /></label><label className="admin-field"><span className="sr-only">Confirm new password</span><input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" placeholder="Confirm New Password" required /></label><ul className="admin-password-rules">{rules.map(([key, label]) => <li className={checks[key] ? "is-valid" : ""} key={key}>{checks[key] ? "✓" : "○"} {label}</li>)}</ul><button className="admin-login-submit" type="submit" disabled={saving}>{saving ? "Saving…" : "Reset Password"}</button>{notice ? <p className="admin-login-notice" role="status">{notice}</p> : null}</form>}</div></div></section></main>;
}
