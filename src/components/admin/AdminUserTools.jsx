import { useState } from "react";
import AdminNotificationBell from "./AdminNotificationBell.jsx";
import AdminProfileMenu from "./AdminProfileMenu.jsx";

/**
 * @param {{ onLogout?: () => void | Promise<void> }} props
 */
export default function AdminUserTools({ onLogout }) {
  const [openPanel, setOpenPanel] = useState(null);

  return (
    <div className="admin-user-tools">
      <time>
        {new Intl.DateTimeFormat("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Colombo",
        }).format(new Date())}
      </time>
      <AdminNotificationBell
        open={openPanel === "notifications"}
        onOpenChange={(next) => setOpenPanel(next ? "notifications" : null)}
      />
      <AdminProfileMenu
        open={openPanel === "profile"}
        onOpenChange={(next) => setOpenPanel(next ? "profile" : null)}
        onLogout={onLogout}
      />
    </div>
  );
}
