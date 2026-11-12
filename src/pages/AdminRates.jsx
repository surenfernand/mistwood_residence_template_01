import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminSpecialOffersPanel from "../components/admin/AdminSpecialOffersPanel.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

export default function AdminRates() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/rates")
      .then((r) => (r.status === 401 ? (navigate("/admin/login", { replace: true }), null) : r.json()))
      .then((x) => x && setData(x))
      .catch(() => setError("Could not load pricing."));
  }, [navigate]);

  useSiteTitle("Offers");
  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="admin-app rates-page">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Offers</h1>
            <span>Manage special offers for the website and booking quotes.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <main className="rates-content">
          {error ? <p className="booking-error">{error}</p> : null}

          <div className="rates-grid rates-grid-offers-only">
            <AdminSpecialOffersPanel
              offers={data?.offers}
              onReload={load}
              error={error}
              setError={setError}
              notice={notice}
              setNotice={setNotice}
            />
          </div>
        </main>
      </section>
    </main>
  );
}
