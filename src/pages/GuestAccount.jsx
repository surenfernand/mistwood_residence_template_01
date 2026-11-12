import { useCallback, useEffect, useMemo, useState } from "react";
import { useSiteTitle } from "../hooks/useSiteTitle.js";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { HighlandFooter, HighlandHeader } from "../components/Highland.jsx";

function money(amount) {
  return `LKR ${Number(amount || 0).toLocaleString("en-LK")}`;
}

function submitPayhereForm(checkoutUrl, fields) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export function GuestLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useSiteTitle("Guest account ");

  const login = async (event) => {
    event.preventDefault();
    setError("");
    const r = await fetch("/api/guest/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) return setError(data.error || "Sign-in failed.");
    navigate("/account", { replace: true });
  };

  return (
    <>
      <HighlandHeader />
      <main className="ct-page" style={{ padding: "48px 24px", maxWidth: 420, margin: "0 auto" }}>
        <h1>Guest account</h1>
        <p>View your stay and pay any remaining balance online.</p>
        <form onSubmit={login} className="ct-card" style={{ padding: 20 }}>
          <label className="ct-field"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="ct-field"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error ? <p className="notice" role="alert">{error}</p> : null}
          <button className="ct-send" type="submit">Sign in</button>
        </form>
        <p><Link to="/account/setup">Create account from your confirmation email</Link></p>
      </main>
      <HighlandFooter />
    </>
  );
}

export function GuestSetup() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { document.title = "Create guest account | Mistwood Residence"; }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const r = await fetch("/api/guest/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, password, name }),
    });
    const data = await r.json();
    if (!r.ok) return setError(data.error || "Could not create account.");
    navigate("/account", { replace: true });
  };

  if (!token) {
    return (
      <>
        <HighlandHeader />
        <main className="ct-page" style={{ padding: 48, maxWidth: 480, margin: "0 auto" }}>
          <p>Use the link from your booking confirmation email, or <Link to="/account/login">sign in</Link>.</p>
        </main>
        <HighlandFooter />
      </>
    );
  }

  return (
    <>
      <HighlandHeader />
      <main className="ct-page" style={{ padding: "48px 24px", maxWidth: 420, margin: "0 auto" }}>
        <h1>Create your guest account</h1>
        <form onSubmit={submit} className="ct-card" style={{ padding: 20 }}>
          <label className="ct-field"><span>Your name</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="ct-field"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <p style={{ fontSize: 13 }}>Use at least 8 characters with upper, lower, and a number.</p>
          {error ? <p className="notice" role="alert">{error}</p> : null}
          <button className="ct-send" type="submit">Create account</button>
        </form>
      </main>
      <HighlandFooter />
    </>
  );
}

export default function GuestAccount() {
  const navigate = useNavigate();
  const [guest, setGuest] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  const load = useCallback(() => {
    fetch("/api/guest/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setGuest(data.guest);
        return fetch("/api/guest/bookings", { credentials: "include" });
      })
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .catch(() => navigate("/account/login", { replace: true }));
  }, [navigate]);

  useEffect(() => {
    document.title = "My stays | Mistwood Residence";
    load();
  }, [load]);

  const payable = useMemo(
    () => bookings.filter((b) => b.paymentStatus === "partial" && b.status !== "cancelled"),
    [bookings],
  );

  const payBalance = async (booking) => {
    setPayingId(booking.id);
    setError("");
    try {
      const r = await fetch("/api/payments/payhere/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: booking.paymentOrderId, purpose: "balance", bookingId: booking.id }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Could not start payment.");
      submitPayhereForm(data.checkoutUrl, data.fields);
    } catch (e) {
      setError(e.message);
      setPayingId(null);
    }
  };

  const logout = async () => {
    await fetch("/api/guest/auth/logout", { method: "POST", credentials: "include" });
    navigate("/account/login", { replace: true });
  };

  return (
    <>
      <HighlandHeader />
      <main className="ct-page" style={{ padding: "48px 24px", maxWidth: 720, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h1>Hello, {guest?.name || "guest"}</h1>
          <button type="button" className="pay-back" onClick={logout}>Sign out</button>
        </header>
        {error ? <p className="notice" role="alert">{error}</p> : null}
        <h2>Your stays</h2>
        {!bookings.length ? <p>No bookings yet.</p> : null}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {bookings.map((b) => {
            const snap = typeof b.pricingSnapshot === "object" ? b.pricingSnapshot : null;
            const balance = snap?.balanceDue ?? (Number(b.totalAmount) - Number(b.depositAmount));
            return (
              <li key={b.id} className="ct-card" style={{ padding: 16, marginBottom: 12 }}>
                <strong>{b.checkIn} → {b.checkOut}</strong>
                <p>Status: {b.status} · Payment: {b.paymentStatus}</p>
                <p>Total {money(b.totalAmount)} · Deposit {money(b.depositAmount)} · Balance {money(balance)}</p>
                {b.paymentStatus === "partial" ? (
                  <button className="btn" type="button" disabled={payingId === b.id} onClick={() => payBalance(b)}>
                    Pay balance {money(balance)}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
        {payable.length ? null : <p>All balances are settled for now.</p>}
      </main>
      <HighlandFooter />
    </>
  );
}
