import { useEffect, useState } from "react";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { Link } from "react-router-dom";

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>;
}

export default function AdminForgotPassword() {
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);

  useSiteTitle("Forgot password ");

  const submit = async (event) => {
    event.preventDefault();
    setNotice("");
    setSending(true);
    const email = new FormData(event.currentTarget).get("email");
    try {
      const response = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not send the reset email.");
      setNotice(data.message || "If an account exists for that email address, we have sent a password-reset link.");
    } catch (error) {
      setNotice(error.message || "We could not send the reset email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return <main className="admin-login-page"><div className="admin-login-backdrop" aria-hidden="true" /><section className="admin-reset-card" aria-labelledby="forgot-password-title"><aside className="admin-login-brand"><div className="admin-brand-shade" aria-hidden="true" /><Link to="/" className="admin-brand-link" aria-label="Return to Mistwood Residence home"><img src="/assets/mistwood/branding/logo.png" alt="Mistwood Residence" /></Link><p className="admin-brand-place">Nuwara Eliya</p><div className="admin-brand-hills" aria-hidden="true" /></aside><div className="admin-login-form-wrap"><img className="admin-login-leaf" src="/assets/mistwood/decorations/leaf-branch.png" alt="" /><div className="admin-login-content"><p className="admin-login-kicker">Account security</p><h1 id="forgot-password-title">Forgot password?</h1><p className="admin-login-intro">Enter your administrator email address and we’ll send you a password-reset link.</p><form className="admin-login-form" onSubmit={submit}><label className="admin-field"><span className="sr-only">Email address</span><MailIcon /><input type="email" name="email" autoComplete="email" placeholder="Email Address" required autoFocus /></label><button className="admin-login-submit" type="submit" disabled={sending}>{sending ? "Sending reset link…" : "Send Reset Link"}</button>{notice ? <p className="admin-login-notice" role="status">{notice}</p> : null}<Link className="admin-back-link" to="/admin/login">← Back to login</Link></form></div></div></section></main>;
}
