import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const stamp = (v) => (v ? new Date(v).toLocaleString("en-GB") : "—");

export default function AdminReviews() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  useSiteTitle("Guest Reviews");

  const load = useCallback(() => {
    setError("");
    fetch("/api/admin/social")
      .then((r) => {
        if (r.status === 401) {
          navigate("/admin/login", { replace: true });
          return null;
        }
        return r.json();
      })
      .then((x) => {
        if (!x) return;
        setEntries((x.entries || []).filter((e) => e.entryType === "review"));
      })
      .catch(() => setError("Could not load reviews."));
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id, body) => {
    setBusyId(id);
    setNotice("");
    setError("");
    try {
      const r = await fetch(`/api/admin/social/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const x = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(x.error || "Update failed.");
      setNotice(body.status === "published" ? "Review published on the website." : "Review updated.");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    setBusyId(id);
    setError("");
    try {
      const r = await fetch(`/api/admin/social/${id}`, { method: "DELETE" });
      const x = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(x.error || "Delete failed.");
      setNotice("Review deleted.");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const pending = entries.filter((e) => e.status === "draft").length;

  return (
    <main className="admin-app guests-page">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Guest reviews</h1>
            <span>Approve guest submissions before they appear on the website.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="guests-content">
          {error ? <p className="booking-error">{error}</p> : null}
          {notice ? <p className="settings-notice">{notice}</p> : null}
          <section className="guests-metrics">
            <Metric label="Total reviews" value={entries.length} />
            <Metric label="Awaiting approval" value={pending} />
            <Metric label="Published" value={entries.filter((e) => e.status === "published").length} />
            <Metric label="Hidden" value={entries.filter((e) => e.status === "hidden").length} />
          </section>
          <article className="booking-list-card">
            <header>
              <div>
                <h2>All reviews</h2>
                <p>Guest submissions are saved as draft until you publish them.</p>
              </div>
              <button type="button" className="text-btn" onClick={load}>
                Refresh
              </button>
            </header>
            <div className="booking-table-wrap">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Rating</th>
                    <th>Title &amp; review</th>
                    <th>Contact</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length ? (
                    entries.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.authorName}</strong>
                          {row.bookingId ? <small>Booking #{row.bookingId}</small> : null}
                        </td>
                        <td>{row.rating != null ? `${row.rating} ★` : "—"}</td>
                        <td>
                          <strong>{row.title || "—"}</strong>
                          <small>{row.body}</small>
                        </td>
                        <td>
                          <small>{row.guestEmail || "—"}</small>
                          <small>{row.guestPhone || ""}</small>
                        </td>
                        <td>{row.source || "—"}</td>
                        <td>
                          <span className={`booking-status status-${row.status}`}>{row.status}</span>
                        </td>
                        <td>{stamp(row.createdAt)}</td>
                        <td>
                          <div className="booking-actions">
                            {row.status !== "published" ? (
                              <button
                                type="button"
                                disabled={busyId === row.id}
                                onClick={() => patch(row.id, { status: "published" })}
                              >
                                Publish
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busyId === row.id}
                                onClick={() => patch(row.id, { status: "hidden" })}
                              >
                                Hide
                              </button>
                            )}
                            <button type="button" disabled={busyId === row.id} onClick={() => remove(row.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="booking-empty">
                        No reviews yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article className="booking-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}