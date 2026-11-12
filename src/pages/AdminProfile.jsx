import { useEffect, useState } from "react";
import AdminAccountLayout from "../components/admin/AdminAccountLayout.jsx";
import { notifyAdminSessionUpdated, useAdminSession } from "../utils/adminSession.js";

export default function AdminProfile() {
  const { admin } = useAdminSession();
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (admin?.name) setName(admin.name);
  }, [admin?.name]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/admin/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save profile.");
      if (data.admin) notifyAdminSessionUpdated(data.admin);
      setNotice(data.message || "Profile updated.");
    } catch (e) {
      setError(e.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminAccountLayout
      title="My profile"
      subtitle="Your name and sign-in details for the admin panel."
      documentTitle="My profile | Mistwood Residence"
    >
      <form className="admin-account-card" onSubmit={submit}>
        <label>
          Display name
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
        </label>
        <label>
          Email address
          <input value={admin?.email || ""} disabled readOnly />
        </label>
        <label>
          Role
          <input value={admin?.roleName || admin?.role || ""} disabled readOnly />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {notice ? <p className="admin-form-notice">{notice}</p> : null}
        {error ? <p className="admin-form-error">{error}</p> : null}
      </form>
    </AdminAccountLayout>
  );
}
