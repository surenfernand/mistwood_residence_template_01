import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { useAdminSession } from "../utils/adminSession.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const stamp = (v) => (v ? new Date(v).toLocaleString("en-GB") : "—");
const MAX_USERS = 10;

const PERMISSION_LABELS = {
  dashboard: "Dashboard",
  bookings: "Bookings",
  availability: "Availability",
  rates: "Rates",
  payments: "Payments",
  guests: "Guests",
  reports: "Reports",
  users: "Users",
  settings: "Settings",
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const { can, loading: sessionLoading } = useAdminSession();
  const [navOpen, setNavOpen] = useState(false);
  const [data, setData] = useState({ users: [], roles: [] });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", roleId: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", roleId: "", isActive: true });

  const load = useCallback(() => {
    setError("");
    return fetch("/api/admin/users")
      .then((response) => {
        if (response.status === 401) {
          navigate("/admin/login", { replace: true });
          return null;
        }
        if (response.status === 403) {
          navigate("/admin/dashboard", { replace: true, state: { notice: "You do not have permission to manage users." } });
          return null;
        }
        if (!response.ok) throw new Error("Could not load users.");
        return response.json();
      })
      .then((payload) => payload && setData(payload))
      .catch(() => setError("Could not load team members. Please try again."));
  }, [navigate]);

  useSiteTitle("Users & Permissions");
  useEffect(() => {
    if (!sessionLoading && !can("users")) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    if (!sessionLoading) load();
  }, [sessionLoading, can, load, navigate]);

  const metrics = useMemo(() => {
    const users = data.users || [];
    const active = users.filter((u) => u.isActive).length;
    const invited = users.filter((u) => u.isActive && !u.lastLogin).length;
    const byRole = Object.fromEntries((data.roles || []).map((r) => [r.name, 0]));
    for (const user of users) {
      if (user.role && byRole[user.role] !== undefined) byRole[user.role] += 1;
    }
    return { total: users.length, active, invited, byRole };
  }, [data]);

  const permissionOrder = useMemo(() => {
    const codes = new Set();
    for (const role of data.roles || []) {
      for (const code of role.permissions || []) codes.add(code);
    }
    return [...codes].sort((a, b) => (PERMISSION_LABELS[a] || a).localeCompare(PERMISSION_LABELS[b] || b));
  }, [data.roles]);

  const defaultInviteRoleId = useMemo(() => {
    const roles = data.roles || [];
    return roles.find((r) => r.name === "Manager")?.id || roles[0]?.id || "";
  }, [data.roles]);

  async function inviteUser(event) {
    event.preventDefault();
    setNotice("");
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          roleId: Number(form.roleId),
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not send invite.");
      setForm({ name: "", email: "", roleId: "" });
      setNotice(body.message || "Invitation sent.");
      await load();
    } catch (inviteError) {
      setError(inviteError.message);
    } finally {
      setBusy(false);
    }
  }

  async function resendInvite(id) {
    setNotice("");
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${id}/resend-invite`, { method: "POST" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not resend invite.");
      setNotice(body.message || "Invitation resent.");
    } catch (resendError) {
      setError(resendError.message);
    } finally {
      setBusy(false);
    }
  }

  function openEdit(user) {
    setEditId(user.id);
    setEditForm({ name: user.name, roleId: String(user.roleId || ""), isActive: user.isActive });
    setNotice("");
    setError("");
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editId) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/users/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          roleId: Number(editForm.roleId),
          isActive: editForm.isActive,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not update user.");
      setEditId(null);
      setNotice(body.message || "User updated.");
      await load();
    } catch (patchError) {
      setError(patchError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-app guests-page users-page">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Users &amp; Permissions</h1>
            <span>Invite up to {MAX_USERS} team members and assign predefined roles.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <main className="guests-content">
          {notice ? <p className="admin-users-notice">{notice}</p> : null}
          {error ? <p className="admin-users-error">{error}</p> : null}
          <section className="guests-metrics">
            <M l="Team members" v={metrics.total} />
            <M l="Active" v={metrics.active} />
            <M l="Pending invite" v={metrics.invited} />
            <M l="Slots remaining" v={Math.max(0, MAX_USERS - metrics.active)} />
          </section>
          <Panel title="Invite team member">
            <form className="admin-users-invite" onSubmit={inviteUser}>
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  maxLength={120}
                  disabled={busy || metrics.active >= MAX_USERS}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  disabled={busy || metrics.active >= MAX_USERS}
                />
              </label>
              <label>
                Role
                <select
                  value={form.roleId || defaultInviteRoleId}
                  onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                  required
                  disabled={busy || metrics.active >= MAX_USERS}
                >
                  {(data.roles || []).map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" disabled={busy || metrics.active >= MAX_USERS}>
                Send invitation
              </button>
            </form>
            {metrics.active >= MAX_USERS ? (
              <p className="admin-users-hint">You have reached the maximum of {MAX_USERS} active admin users.</p>
            ) : null}
          </Panel>
          <Panel title="Team">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.users || []).map((user) => {
                  const status = !user.isActive ? "Inactive" : user.lastLogin ? "Active" : "Invited";
                  return (
                    <tr key={user.id}>
                      <td>
                        <b>{user.name}</b>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <em className={status.toLowerCase()}>{status}</em>
                      </td>
                      <td>{stamp(user.lastLogin)}</td>
                      <td className="admin-users-actions">
                        {status === "Invited" ? (
                          <button type="button" disabled={busy} onClick={() => resendInvite(user.id)}>
                            Resend
                          </button>
                        ) : null}
                        <button type="button" disabled={busy} onClick={() => openEdit(user)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
          <Panel title="Role permissions (read-only)">
            <table className="admin-users-matrix">
              <thead>
                <tr>
                  <th>Role</th>
                  {permissionOrder.map((code) => (
                    <th key={code}>{PERMISSION_LABELS[code] || code}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.roles || []).map((role) => (
                  <tr key={role.id}>
                    <td>
                      <b>{role.name}</b>
                      <span className="admin-users-role-desc">{role.description}</span>
                    </td>
                    {permissionOrder.map((code) => (
                      <td key={code}>{role.permissions?.includes(code) ? "✓" : ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </main>
      </section>
      {editId ? (
        <div className="admin-users-modal-backdrop" onClick={() => setEditId(null)} role="presentation">
          <form className="admin-users-modal" onSubmit={saveEdit} onClick={(e) => e.stopPropagation()}>
            <h2>Edit team member</h2>
            <label>
              Name
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                required
                maxLength={120}
              />
            </label>
            <label>
              Role
              <select value={editForm.roleId} onChange={(e) => setEditForm((f) => ({ ...f, roleId: e.target.value }))} required>
                {(data.roles || []).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-users-check">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active account
            </label>
            <div className="admin-users-modal-actions">
              <button type="button" onClick={() => setEditId(null)}>
                Cancel
              </button>
              <button type="submit" disabled={busy}>
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function M({ l, v }) {
  return (
    <article>
      <span>{l}</span>
      <strong>{v}</strong>
    </article>
  );
}

function Panel({ title, children }) {
  return (
    <section className="guests-panel">
      <header>
        <h2>{title}</h2>
      </header>
      <div>{children}</div>
    </section>
  );
}
