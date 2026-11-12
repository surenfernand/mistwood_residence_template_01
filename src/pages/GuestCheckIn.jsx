import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HighlandFooter, HighlandHeader } from "../components/Highland.jsx";

export default function GuestCheckIn() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = "Guest check-in | Mistwood Residence";
    fetch(`/api/check-in/${encodeURIComponent(token || "")}`)
      .then((r) => r.json().then((x) => ({ ok: r.ok, x })))
      .then(({ ok, x }) => {
        if (!ok) throw new Error(x.error || "Check-in link invalid.");
        setData(x);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  const checkIn = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/check-in/${encodeURIComponent(token)}`, { method: "POST", credentials: "include" });
      const x = await r.json();
      if (!r.ok) throw new Error(x.error || "Check-in failed.");
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const booking = data?.booking;

  return (
    <>
      <HighlandHeader />
      <main className="ct-page" style={{ padding: "48px 24px", maxWidth: 560, margin: "0 auto" }}>
        <h1>Guest check-in</h1>
        {error ? <p className="notice" role="alert">{error}</p> : null}
        {!booking && !error ? <p>Loading…</p> : null}
        {booking ? (
          <>
            <dl className="booking-dialog-list">
              <div><dt>Guest</dt><dd>{booking.guestName}</dd></div>
              <div><dt>Arrival</dt><dd>{booking.checkIn}</dd></div>
              <div><dt>Departure</dt><dd>{booking.checkOut}</dd></div>
              <div><dt>Status</dt><dd>{done ? "checked_in" : booking.status}</dd></div>
            </dl>
            {done ? (
              <p>Guest checked in successfully.</p>
            ) : data.adminSignedIn && booking.status === "confirmed" ? (
              <button className="btn" type="button" onClick={checkIn} disabled={busy}>
                Confirm check-in
              </button>
            ) : booking.status === "confirmed" ? (
              <p>
                Staff must <Link to="/admin/login">sign in to admin</Link> on this device, then return here to confirm check-in.
              </p>
            ) : (
              <p>This stay is already {booking.status.replace("_", " ")}.</p>
            )}
          </>
        ) : null}
      </main>
      <HighlandFooter />
    </>
  );
}
