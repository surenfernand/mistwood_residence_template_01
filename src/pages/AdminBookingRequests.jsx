import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const labels = {
  new: "New",
  contacted: "Contacted",
  pending_payment: "Pending Payment",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
  declined: "Declined",
};

const nextActions = {
  new: [
    ["contacted", "Mark contacted"],
    ["pending_payment", "Pending payment"],
    ["confirmed", "Confirm stay"],
    ["declined", "Decline"],
  ],
  contacted: [
    ["pending_payment", "Pending payment"],
    ["confirmed", "Confirm stay"],
    ["declined", "Decline"],
  ],
  pending_payment: [
    ["contacted", "Mark contacted"],
    ["confirmed", "Confirm stay"],
    ["declined", "Decline"],
    ["cancelled", "Cancel"],
  ],
  confirmed: [
    ["checked_in", "Mark checked in"],
    ["cancelled", "Cancel stay"],
  ],
  checked_in: [["checked_out", "Mark checked out"]],
};

const date = (value, withTime = false) => {
  if (!value) return "—";
  const raw = String(value);
  const parsed = withTime
    ? new Date(value)
    : /^\d{4}-\d{2}-\d{2}$/.test(raw.slice(0, 10))
      ? new Date(`${raw.slice(0, 10)}T00:00:00+05:30`)
      : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat(
    "en-GB",
    withTime
      ? { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" }
      : { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Colombo" },
  ).format(parsed);
};

function Icon({ name = "calendar", size = 21 }) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3Z" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    phone: (
      <path d="M5 4h3l1.5 4-2 1.4a14 14 0 0 0 7 7l1.4-2L20 16v3c0 1.1-.9 2-2 2C10.3 21 3 13.7 3 6c0-1.1.9-2 2-2Z" />
    ),
    eye: (
      <>
        <path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    user: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-2a5 5 0 0 1 10 0v2M16 8a3 3 0 0 1 0 6" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.calendar}
    </svg>
  );
}

const Badge = ({ status }) => <span className={`booking-status status-${status}`}>{labels[status] || status}</span>;

export default function AdminBookingRequests() {
  const nav = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", status: "", source: "" });
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/booking-requests?${new URLSearchParams(Object.entries(filters).filter(([, v]) => v))}`);
      if (r.status === 401) return nav("/admin/login", { replace: true });
      const x = await r.json();
      if (!r.ok) throw Error(x.error);
      setData(x);
      setError("");
    } catch (e) {
      setError(e.message || "Could not load requests.");
    } finally {
      setLoading(false);
    }
  }, [filters, nav]);

  const loadDetail = useCallback(async (id) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const r = await fetch(`/api/admin/booking-requests/${id}`);
      if (r.status === 401) return nav("/admin/login", { replace: true });
      const x = await r.json();
      if (!r.ok) throw Error(x.error);
      setDetail(x);
    } catch (e) {
      setDetailError(e.message || "Could not load this request.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [nav]);

  useSiteTitle("Booking requests");
  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => {
        if (!r.ok) nav("/admin/login", { replace: true });
      })
      .catch(() => nav("/admin/login", { replace: true }));
  }, [nav]);

  useEffect(() => {
    const id = setTimeout(load, 150);
    return () => clearTimeout(id);
  }, [load]);

  useEffect(() => {
    if (detailId) loadDetail(detailId);
    else setDetail(null);
  }, [detailId, loadDetail]);

  const total = (s) => data?.summary?.[s] || 0;
  const set = (k) => (e) => setFilters((v) => ({ ...v, [k]: e.target.value }));
  const reset = () => setFilters({ q: "", status: "", source: "" });
  const csvUrl = `/api/admin/booking-requests.csv?${new URLSearchParams(Object.entries(filters).filter(([, value]) => value))}`;

  const applyStatus = async (id, status) => {
    setStatusBusy(true);
    setDetailError("");
    try {
      const r = await fetch(`/api/admin/booking-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const x = await r.json();
      if (!r.ok) throw Error(x.error);
      await load();
      if (detailId === id) await loadDetail(id);
    } catch (e) {
      setDetailError(e.message || "Could not update status.");
    } finally {
      setStatusBusy(false);
    }
  };

  const request = detail?.request;

  return (
    <main className="admin-app booking-admin booking-reference">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} badges={{ newBookings: total("new") }} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Booking Requests</h1>
            <span>Review and manage booking requests from your website.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="booking-requests-page">
         
          <section className="booking-summary booking-reference-summary">
            <Card icon="calendar" label="Total Requests" value={data?.total ?? "—"} />
            <Card icon="mail" label="New Requests" value={total("new")} />
            <Card icon="phone" label="Contacted" value={total("contacted")} />
            <Card icon="layers" label="Pending Payment" value={total("pending_payment")} />
            <Card icon="calendar" label="Confirmed" value={total("confirmed")} />
          </section>
          <section className="booking-list-card">
            <div className="booking-status-tabs">
              <button type="button" className={!filters.status ? "is-active" : ""} onClick={() => setFilters((v) => ({ ...v, status: "" }))}>
                All Requests ({data?.total || 0})
              </button>
              {["new", "contacted", "pending_payment", "confirmed", "declined", "cancelled"].map((s) => (
                <button key={s} type="button" className={filters.status === s ? "is-active" : ""} onClick={() => setFilters((v) => ({ ...v, status: s }))}>
                  {labels[s]} ({total(s)})
                </button>
              ))}
            </div>
            <div className="booking-filters booking-reference-filters">
              <label className="booking-search">
                <Icon name="search" />
                <input value={filters.q} onChange={set("q")} placeholder="Search by guest name, email or phone..." />
              </label>
              <select value={filters.status} onChange={set("status")}>
                <option value="">Status</option>
                {Object.entries(labels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <select value={filters.source} onChange={set("source")}>
                <option value="">Source</option>
                {(data?.sources || ["website"]).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button type="button" className="booking-reset" onClick={reset}>
                ↻ Reset
              </button>
              <a className="booking-reset" href={csvUrl}>
                Export CSV
              </a>
            </div>
            {error ? <p className="booking-error">{error}</p> : null}
            <div className="booking-table-wrap">
              <table className="booking-table booking-reference-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Guest Name</th>
                    <th>Contact Details</th>
                    <th>Stay Dates</th>
                    <th>Guests</th>
                    <th>Source</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="booking-empty">
                        Loading booking requests…
                      </td>
                    </tr>
                  ) : data?.requests.length ? (
                    data.requests.map((r) => (
                      <tr key={r.id}>
                        <td>BR-{r.id}</td>
                        <td>
                          <strong>{r.name}</strong>
                        </td>
                        <td>
                          <a href={`mailto:${r.email}`}>
                            <Icon name="mail" size={16} />
                            {r.email}
                          </a>
                          <a href={`tel:${r.phone}`}>
                            <Icon name="phone" size={16} />
                            {r.phone}
                          </a>
                        </td>
                        <td>
                          <span className="stay-dates">
                            <Icon size={16} />
                            {date(r.arrive)} – {date(r.depart)}
                          </span>
                        </td>
                        <td>
                          <span className="guest-count">
                            <Icon name="user" size={16} />
                            {r.guests || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="source-chip">{r.source}</span>
                        </td>
                        <td>{date(r.createdAt, true)}</td>
                        <td>
                          <Badge status={r.status} />
                        </td>
                        <td>
                          <div className="booking-actions">
                            <button type="button" title="View request" onClick={() => setDetailId(r.id)}>
                              <Icon name="eye" size={18} />
                            </button>
                            <a href={`tel:${r.phone}`} title="Call guest">
                              <Icon name="phone" size={18} />
                            </a>
                            <a href={`mailto:${r.email}`} title="Email guest">
                              <Icon name="mail" size={18} />
                            </a>
                            {nextActions[r.status]?.some(([s]) => s === "confirmed") ? (
                              <button type="button" title="Confirm request" onClick={() => applyStatus(r.id, "confirmed")}>
                                <Icon name="check" size={18} />
                              </button>
                            ) : null}
                            {nextActions[r.status]?.some(([s]) => s === "declined") ? (
                              <button type="button" className="danger" title="Decline request" onClick={() => applyStatus(r.id, "declined")}>
                                <Icon name="close" size={18} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="booking-empty">
                        No booking requests match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="booking-pagination">
              <span>{data?.total ? `Showing 1 – ${data.requests.length} of ${data.total} requests` : "No requests to show"}</span>
              <div>
                <button type="button" disabled>
                  ‹
                </button>
                <button type="button" className="is-active">
                  1
                </button>
                <button type="button" disabled>
                  ›
                </button>
              </div>
            </footer>
          </section>
        </div>
      </section>
      {detailId ? (
        <div className="booking-drawer-backdrop" onClick={() => setDetailId(null)} role="presentation">
          <aside className="booking-drawer" onClick={(e) => e.stopPropagation()} aria-labelledby="booking-request-detail">
            <header>
              <div>
                <h2 id="booking-request-detail">BR-{detailId}</h2>
                {request ? <Badge status={request.status} /> : null}
              </div>
              <button type="button" aria-label="Close" onClick={() => setDetailId(null)}>
                <Icon name="close" size={18} />
              </button>
            </header>
            {detailLoading ? <p className="booking-empty">Loading request…</p> : null}
            {detailError ? <p className="booking-error">{detailError}</p> : null}
            {request ? (
              <>
                <div className="booking-detail-grid">
                  <div>
                    <span>Guest</span>
                    <strong>{request.name}</strong>
                  </div>
                  <div>
                    <span>Guests</span>
                    <strong>{request.guests || "—"}</strong>
                  </div>
                  <div>
                    <span>Arrival</span>
                    <strong>{date(request.arrive)}</strong>
                  </div>
                  <div>
                    <span>Departure</span>
                    <strong>{date(request.depart)}</strong>
                  </div>
                  <div>
                    <span>Submitted</span>
                    <strong>{date(request.createdAt, true)}</strong>
                  </div>
                  <div>
                    <span>Source</span>
                    <strong>{request.source}</strong>
                  </div>
                </div>
                <section>
                  <h3>Contact</h3>
                  <p>
                    <a href={`mailto:${request.email}`}>{request.email}</a>
                  </p>
                  <p>
                    <a href={`tel:${request.phone}`}>{request.phone}</a>
                  </p>
                </section>
                {request.note ? (
                  <section>
                    <h3>Guest note</h3>
                    <p>{request.note}</p>
                  </section>
                ) : null}
                <section>
                  <h3>Status history</h3>
                  <ul className="booking-history">
                    {detail.history?.length ? (
                      detail.history.map((item) => (
                        <li key={`${item.changedAt}-${item.toStatus}`}>
                          <span>
                            {(item.fromStatus ? labels[item.fromStatus] : "—") + " → " + (labels[item.toStatus] || item.toStatus)}
                          </span>
                          <span>{date(item.changedAt, true)}</span>
                        </li>
                      ))
                    ) : (
                      <li>
                        <span>No status changes recorded yet.</span>
                      </li>
                    )}
                  </ul>
                </section>
                <div className="booking-drawer-actions">
                  {(nextActions[request.status] || []).map(([status, label]) => (
                    <button key={status} type="button" disabled={statusBusy} onClick={() => applyStatus(detailId, status)}>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </aside>
        </div>
      ) : null}
    </main>
  );
}

function Card({ icon, label, value }) {
  return (
    <article className="booking-summary-card">
      <Icon name={icon} size={34} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
