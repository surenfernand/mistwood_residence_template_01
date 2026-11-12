import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { addDays, formatAdminDate, isoDay } from "../utils/adminDates.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

export default function AdminBookingsToday() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const from = addDays(isoDay(), -7);
  const to = addDays(isoDay(), 7);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/bookings/movements?from=${from}&to=${to}`);
      if (r.status === 401) return navigate("/admin/login", { replace: true });
      const x = await r.json();
      if (!r.ok) throw Error(x.error);
      setData(x);
      setError("");
    } catch (e) {
      setError(e.message || "Could not load movements.");
    }
  }, [from, navigate, to]);

  useSiteTitle("Today's movements");
  useEffect(() => {
    load();
  }, [load]);

  const patchStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      const r = await fetch(`/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const x = await r.json();
      if (!r.ok) throw Error(x.error);
      await load();
    } catch (e) {
      setError(e.message || "Could not update booking.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="admin-app booking-admin">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Today&apos;s movements</h1>
            <span>Arrivals and departures from {formatAdminDate(from)} to {formatAdminDate(to)}.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="booking-requests-page">
          <p>
            <Link to="/admin/booking-requests">← Booking requests</Link>
          </p>
          {error ? <p className="booking-error">{error}</p> : null}
          <div className="admin-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <MovementColumn
              title="Arrivals"
              rows={data?.arrivals || []}
              actionLabel="Check in"
              actionStatus="checked_in"
              canAct={(row) => row.status === "confirmed"}
              busyId={busyId}
              onAction={patchStatus}
            />
            <MovementColumn
              title="Departures"
              rows={data?.departures || []}
              actionLabel="Check out"
              actionStatus="checked_out"
              canAct={(row) => row.status === "checked_in"}
              busyId={busyId}
              onAction={patchStatus}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function MovementColumn({ title, rows, actionLabel, actionStatus, canAct, busyId, onAction }) {
  return (
    <section className="booking-list-card" style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {!rows.length ? <p className="booking-empty">None in this window.</p> : null}
      <ul className="booking-history" style={{ listStyle: "none", padding: 0 }}>
        {rows.map((row) => (
          <li key={`${title}-${row.id}`} style={{ display: "block", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #ece8df" }}>
            <strong>{row.guestName}</strong>
            <div>
              {title === "Arrivals" ? formatAdminDate(row.checkIn) : formatAdminDate(row.checkOut)} · {row.guests} guests
            </div>
            {row.guestPhone ? (
              <a href={`tel:${row.guestPhone}`}>{row.guestPhone}</a>
            ) : null}
            {canAct(row) ? (
              <div style={{ marginTop: 8 }}>
                <button type="button" className="mh-btn" disabled={busyId === row.id} onClick={() => onAction(row.id, actionStatus)}>
                  {busyId === row.id ? "Updating…" : actionLabel}
                </button>
              </div>
            ) : (
              <small>Status: {row.status.replaceAll("_", " ")}</small>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
