import { useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";

export default function AdminCheckIn() {
  const [navOpen, setNavOpen] = useState(false);
  const [token, setToken] = useState("");

  const open = () => {
    const trimmed = token.trim().replace(/^.*\/check-in\//, "");
    if (!trimmed) return;
    window.location.href = `/check-in/${encodeURIComponent(trimmed)}`;
  };

  return (
    <main className="admin-app booking-admin">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Check-in</h1>
            <span>Paste a check-in token or path from a guest QR code.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="booking-requests-page" style={{ maxWidth: 520, padding: 24 }}>
          <Link to="/admin/booking-requests">← Booking requests</Link>
          <label className="booking-search" style={{ display: "block", marginTop: 16 }}>
            <span style={{ display: "block", marginBottom: 6 }}>Check-in token or URL</span>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="/check-in/…" style={{ width: "100%" }} />
          </label>
          <button className="mh-btn" type="button" onClick={open} style={{ marginTop: 12 }}>Open check-in page</button>
          <p style={{ marginTop: 16, fontSize: 13 }}>You must stay signed in on this phone. The guest QR opens the same page.</p>
        </div>
      </section>
    </main>
  );
}
