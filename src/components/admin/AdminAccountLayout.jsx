import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "./AdminSidebar.jsx";
import AdminUserTools from "./AdminUserTools.jsx";
import { useSiteTitle } from "../../hooks/useSiteTitle.js";

/**
 * @param {{ title: string, subtitle: string, documentTitle: string, children: React.ReactNode }} props
 */
export default function AdminAccountLayout({ title, subtitle, documentTitle, children }) {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const pageTitle = (documentTitle || title || "").split("|")[0].trim();
  useSiteTitle(pageTitle);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((r) => {
        if (!r.ok) navigate("/admin/login", { replace: true });
      })
      .catch(() => navigate("/admin/login", { replace: true }));
  }, [navigate]);

  return (
    <main className="admin-app">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin Panel</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="admin-account-page">{children}</div>
      </section>
    </main>
  );
}
