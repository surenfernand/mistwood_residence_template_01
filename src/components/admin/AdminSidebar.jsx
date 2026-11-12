import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import AdminIcon from "./AdminIcon.jsx";
import { ADMIN_NAV_ITEMS } from "./adminNavConfig.js";
import { isNavGroupActive, parentNavEnd } from "./adminNavGroups.js";
import { useAdminSession } from "../../utils/adminSession.js";
import { applyAdminAppearance } from "../../hooks/useAdminAppearance.js";
import { useAdminNotifications } from "../../hooks/useAdminNotifications.js";
import { usePublicSettings } from "../../hooks/usePublicSettings.js";

function navLinkClass({ isActive }) {
  return isActive ? "is-active" : undefined;
}

export function AdminMenuToggle({ onOpen }) {
  return (
    <button className="admin-menu-toggle" type="button" aria-label="Open menu" onClick={onOpen}>
      ☰
    </button>
  );
}

/**
 * @param {{ open?: boolean, onClose?: () => void, badges?: { newBookings?: number } }} props
 */
export default function AdminSidebar({ open = false, onClose, badges = {} }) {
  const pub = usePublicSettings();
  const { pathname } = useLocation();
  const { can, loading, permissions, admin } = useAdminSession();
  const { unreadCount } = useAdminNotifications({ limit: 1, pollMs: 60000 });
  const [expandedGroups, setExpandedGroups] = useState({});

  const canSeeItem = (item) => {
    if (loading) return true;
    if (!item.permission) return true;
    const roleName = admin?.roleName || admin?.role;
    if (!permissions.length && (roleName === "Owner" || roleName === "admin" || !admin?.roleId)) return true;
    return can(item.permission);
  };

  useEffect(() => {
    applyAdminAppearance();
  }, []);

  useEffect(() => {
    ADMIN_NAV_ITEMS.forEach((item) => {
      if (item.children?.length && isNavGroupActive(pathname, item)) {
        setExpandedGroups((prev) => ({ ...prev, [item.label]: true }));
      }
    });
  }, [pathname]);

  const closeIfMobile = () => {
    onClose?.();
  };

  const badgeFor = (key) => {
    if (key === "unreadNotifications") return unreadCount > 0 ? unreadCount : null;
    if (key === "newBookings" && badges.newBookings > 0) return badges.newBookings;
    return null;
  };

  return (
    <>
      <aside className={open ? "admin-sidebar is-open" : "admin-sidebar"}>
        <div className="admin-side-brand">
          <img src={pub.logoUrl || "/assets/mistwood/branding/logo.png"} alt={pub.propertyName} />
          <span>Nuwara Eliya</span>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {ADMIN_NAV_ITEMS.filter(canSeeItem).map((item) => {
            if (item.children?.length) {
              const groupActive = isNavGroupActive(pathname, item);
              const groupOpen = expandedGroups[item.label] ?? groupActive;

              return (
                <div
                  key={item.label}
                  className={`admin-nav-group${groupActive ? " is-active" : ""}${groupOpen ? " is-expanded" : ""}`}
                >
                  <div className="admin-nav-row">
                    <NavLink
                      to={item.path}
                      className={navLinkClass}
                      onClick={closeIfMobile}
                      end={parentNavEnd(pathname, item.path, item.label)}
                    >
                      <AdminIcon name={item.icon} />
                      <span>{item.label}</span>
                    </NavLink>
                    <button
                      type="button"
                      className="admin-nav-chevron"
                      aria-expanded={groupOpen}
                      aria-label={`${groupOpen ? "Collapse" : "Expand"} ${item.label} menu`}
                      onClick={() => setExpandedGroups((prev) => ({ ...prev, [item.label]: !groupOpen }))}
                    >
                      <span className="admin-chevron-icon" aria-hidden="true">
                        <AdminIcon name="chevron" size={18} />
                      </span>
                    </button>
                  </div>
                  <div className={`booking-subnav${groupOpen ? " is-open" : ""}`} aria-hidden={!groupOpen}>
                    {item.children.map((child) => {
                      if (child.disabled || !child.path) {
                        return (
                          <span key={child.label} className="nav-soon" title="Coming soon">
                            {child.label}
                          </span>
                        );
                      }
                      const badge = child.badgeKey ? badgeFor(child.badgeKey) : null;
                      return (
                        <NavLink
                          key={child.label}
                          to={child.path}
                          className={navLinkClass}
                          onClick={closeIfMobile}
                          tabIndex={groupOpen ? 0 : -1}
                          end
                        >
                          {child.label}
                          {badge != null ? <i>{badge}</i> : null}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (item.disabled || !item.path) {
              return (
                <button key={item.label} type="button" className="nav-soon" disabled title="Coming soon">
                  <AdminIcon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              );
            }

            const badge = item.badgeKey ? badgeFor(item.badgeKey) : null;
            const exactEnd = item.path === "/admin/dashboard" || item.path === "/admin/notifications";

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={navLinkClass}
                onClick={closeIfMobile}
                end={exactEnd}
              >
                <AdminIcon name={item.icon} />
                <span className="admin-nav-label">{item.label}</span>
                {badge != null ? <i className="admin-nav-badge">{badge}</i> : null}
              </NavLink>
            );
          })}
        </nav>
        <div className="admin-side-landscape" aria-hidden="true" />
      </aside>
      {open ? (
        <button className="admin-side-scrim" type="button" aria-label="Close menu" onClick={onClose} />
      ) : null}
    </>
  );
}
