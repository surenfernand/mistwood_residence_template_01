import AdminAccountLayout from "../components/admin/AdminAccountLayout.jsx";
import { useAdminAppearance } from "../hooks/useAdminAppearance.js";

export default function AdminAppearance() {
  const { prefs, update } = useAdminAppearance();

  return (
    <AdminAccountLayout
      title="Appearance"
      subtitle="Personalise the admin panel on this device."
      documentTitle="Appearance | Mistwood Residence"
    >
      <section className="admin-account-card">
        <label className="check" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <input
            type="checkbox"
            checked={prefs.compactSidebar}
            onChange={(e) => update({ compactSidebar: e.target.checked })}
          />
          Compact sidebar (narrower navigation)
        </label>
        <label className="check" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={prefs.reduceMotion}
            onChange={(e) => update({ reduceMotion: e.target.checked })}
          />
          Reduce motion (fewer animations in the admin panel)
        </label>
        <p style={{ marginTop: 16, color: "#666", fontSize: 13 }}>
          Preferences are saved in this browser only and do not affect other team members.
        </p>
      </section>
    </AdminAccountLayout>
  );
}
