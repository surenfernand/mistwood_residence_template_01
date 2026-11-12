import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const stamp = (v) => new Date(v).toLocaleString("en-GB");

export default function AdminGuests() {
  const n = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [d, setD] = useState({ enquiries: [], guests: [] });
  useSiteTitle("Guests & Enquiries");
  useEffect(() => {
    fetch("/api/admin/guests-enquiries")
      .then((r) => (r.status === 401 ? (n("/admin/login", { replace: true }), null) : r.json()))
      .then((x) => x && setD(x));
  }, [n]);
  const c = (s) => d.enquiries.filter((x) => x.status === s).length;
  return (
    <main className="admin-app guests-page">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Guests & Enquiries</h1>
            <span>Manage guest profiles and handle all customer enquiries.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <main className="guests-content">
         
          <section className="guests-metrics">
            <M l="Total Guests" v={d.guests.length} />
            <M l="Total Enquiries" v={d.enquiries.length} />
            <M l="New Enquiries" v={c("new")} />
            <M l="Responded" v={c("responded")} />
            <M l="Converted to Booking" v={c("converted")} />
          </section>
          <Panel title="Enquiries">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject / Enquiry Type</th>
                  <th>Message (Preview)</th>
                  <th>Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.enquiries.map((x, i) => (
                  <tr key={x.id}>
                    <td>ENQ-{x.id}</td>
                    <td>
                      <b>{x.name}</b>
                    </td>
                    <td>{x.email}</td>
                    <td>{x.enquiryType}</td>
                    <td>{x.message}</td>
                    <td>{stamp(x.createdAt)}</td>
                    <td>
                      <em className={x.status}>{x.status.replace("_", " ")}</em>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <Panel title="Guest Directory">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guest Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last Stay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.guests.map((x, i) => (
                  <tr key={x.email}>
                    <td>GST-{i + 1}</td>
                    <td>
                      <b>{x.name}</b>
                    </td>
                    <td>{x.email}</td>
                    <td>{x.phone}</td>
                    <td>
                      {x.arrive} – {x.depart}
                    </td>
                    <td>
                      <em className="active">Active</em>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </main>
      </section>
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
        <input placeholder="Search by name, email or phone..." />
      </header>
      <div>{children}</div>
    </section>
  );
}
