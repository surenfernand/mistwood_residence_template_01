import { useEffect, useId, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminIcon from "./AdminIcon.jsx";
import { formatLastLogin } from "../../utils/formatLastLogin.js";
import { clearAdminSessionCache, useAdminSession } from "../../utils/adminSession.js";

/**
 * @param {{ open?: boolean, onOpenChange?: (open: boolean) => void, onLogout?: () => void | Promise<void> }} props
 */
export default function AdminProfileMenu({ open = false, onOpenChange, onLogout }) {
  const navigate = useNavigate();
  const menuId = useId();
  const rootRef = useRef(null);
  const { admin } = useAdminSession();
  const name = admin?.name || "Admin";
  const roleName = admin?.roleName || admin?.role || "Admin";

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) onOpenChange?.(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const close = () => onOpenChange?.(false);

  const logout = async () => {
    close();
    if (onLogout) {
      await onLogout();
      return;
    }
    await fetch("/api/admin/auth/logout", { method: "POST" });
    clearAdminSessionCache();
    navigate("/admin/login", { replace: true });
  };

  const items = [
    { to: "/admin/profile", icon: "user", label: "My profile" },
    { to: "/admin/account", icon: "settings", label: "Account settings" },
    { to: "/admin/help", icon: "help", label: "Help & support" },
  ];

  return (
    <div className="admin-profile-wrap" ref={rootRef}>
      <button
        type="button"
        className={`admin-profile${open ? " is-open" : ""}`}
        aria-label="Account menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => onOpenChange?.(!open)}
      >
        <strong>{name.charAt(0).toUpperCase()}</strong>
        <span className="admin-profile-copy">
          {name}
          <small>{roleName}</small>
        </span>
        <span className="admin-profile-chevron" aria-hidden="true"><AdminIcon name="chevron" size={15} /></span>
      </button>
      {open ? (
        <div className="admin-profile-panel" id={menuId} role="menu" aria-label="Account">
          <header className="admin-profile-panel-head">
            <strong>{name}</strong>
            <span>{roleName}</span>
          </header>
          <ul className="admin-profile-menu">
            {items.map((item) => (
              <li key={item.to}>
                <Link to={item.to} role="menuitem" onClick={close}>
                  <AdminIcon name={item.icon} size={18} />
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button type="button" className="admin-profile-signout" role="menuitem" onClick={logout}>
                <AdminIcon name="logout" size={18} />
                Sign out
              </button>
            </li>
          </ul>
          <footer className="admin-profile-panel-foot">{formatLastLogin(admin?.lastLoginAt)}</footer>
        </div>
      ) : null}
    </div>
  );
}
