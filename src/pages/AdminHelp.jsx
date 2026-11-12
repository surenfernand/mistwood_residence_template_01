import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminAccountLayout from "../components/admin/AdminAccountLayout.jsx";

export default function AdminHelp() {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.settings) setContact(data.settings);
      })
      .catch(() => {});
  }, []);

  return (
    <AdminAccountLayout
      title="Help & support"
      subtitle="Guides and contact options for the Mistwood admin team."
      documentTitle="Help & support | Mistwood Residence"
    >
      <section className="admin-account-card">
        <h2 style={{ margin: "0 0 10px", font: '600 20px/1.2 "Playfair Display", Georgia, serif' }}>Quick links</h2>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>
            <Link to="/admin/dashboard">Dashboard overview</Link>
          </li>
          <li>
            <Link to="/policies">Guest policies (public site)</Link>
          </li>
          <li>
            <Link to="/admin/forgot-password">Reset password via email</Link>
          </li>
        </ul>
      </section>
      <section className="admin-account-card">
        <h2 style={{ margin: "0 0 10px", font: '600 20px/1.2 "Playfair Display", Georgia, serif' }}>Property contact</h2>
        {contact?.contactEmail ? (
          <p style={{ margin: 0 }}>
            Email:{" "}
            <a href={`mailto:${contact.contactEmail}`}>{contact.contactEmail}</a>
          </p>
        ) : (
          <p style={{ margin: 0, color: "#666" }}>Contact details are configured under Admin → Settings (Owner).</p>
        )}
        {contact?.contactPhone ? (
          <p style={{ margin: "8px 0 0" }}>
            Phone: <a href={`tel:${contact.contactPhone}`}>{contact.contactPhone}</a>
          </p>
        ) : null}
      </section>
    </AdminAccountLayout>
  );
}
