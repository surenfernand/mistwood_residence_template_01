import { useEffect, useState } from "react";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { Link, useNavigate } from "react-router-dom";
import { clearAdminSessionCache } from "../utils/adminSession.js";
import { usePublicSettings } from "../hooks/usePublicSettings.js";

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>;
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10" width="15" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}

function EyeIcon({ hidden }) {
  return hidden ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.8a2.2 2.2 0 0 0 3 3M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.6 5.1 8.6 7s-1.4 3.8-3.5 5.1M6.2 6.8C3.9 8.2 3.4 10.6 3.4 12c0 1.9 3.4 7 8.6 7 .8 0 1.6-.1 2.3-.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12S6.5 5.5 12 5.5 20.5 12 20.5 12 17.5 18.5 12 18.5 3.5 12 3.5 12Z" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>;
}

function LoginIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M11 8l4 4-4 4M15 12H4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function AdminLogin() {
  const pub = usePublicSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useSiteTitle("Admin login");

  const submit = async (event) => {
    event.preventDefault();
    setNotice("");
    setSubmitting(true);
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fields.get("email"), password: fields.get("password"), remember: fields.get("remember") === "on" }),
      });
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : {};
      if (!response.ok) throw new Error(data.error || "We could not sign you in.");
      clearAdminSessionCache();
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      setNotice(error.message || "We could not sign you in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-backdrop" aria-hidden="true" />
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <aside className="admin-login-brand">
          <div className="admin-brand-shade" aria-hidden="true" />
          <Link to="/" className="admin-brand-link" aria-label={`Return to ${pub.propertyName} home`}>
            <img src={pub.logoUrl || "/assets/mistwood/branding/logo.png"} alt={pub.propertyName} />
          </Link>
          <p className="admin-brand-place">Nuwara Eliya</p>
          <div className="admin-brand-hills" aria-hidden="true" />
        </aside>

        <div className="admin-login-form-wrap">
          <img className="admin-login-leaf" src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <div className="admin-login-content">
            <p className="admin-login-kicker">{pub.propertyName}</p>
            <h1 id="admin-login-title">Admin Login</h1>
            <p className="admin-login-intro">Access the {pub.propertyName} admin panel</p>

            <form className="admin-login-form" onSubmit={submit}>
              <label className="admin-field">
                <span className="sr-only">Email address</span>
                <MailIcon />
                <input type="email" name="email" autoComplete="email" placeholder="Email Address" required />
              </label>
              <label className="admin-field">
                <span className="sr-only">Password</span>
                <LockIcon />
                <input type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" placeholder="Password" required />
                <button className="admin-password-toggle" type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  <EyeIcon hidden={!showPassword} />
                </button>
              </label>
              <div className="admin-login-options">
                <label className="admin-remember"><input type="checkbox" name="remember" /><span>Remember Me</span></label>
                <Link className="admin-forgot-link" to="/admin/forgot-password">Forgot Password?</Link>
              </div>
              <button className="admin-login-submit" type="submit" disabled={submitting}><LoginIcon /> {submitting ? "Logging in…" : "Login"}</button>
              {notice ? <p className="admin-login-notice" role="status">{notice}</p> : null}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
