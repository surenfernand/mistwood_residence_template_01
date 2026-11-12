import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const money = (v) => `LKR ${Math.abs(Number(v)).toLocaleString("en-LK")}`;

export default function AdminPayments() {
  const n = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [p, setP] = useState([]);
  useSiteTitle("Payments");
  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => (r.status === 401 ? (n("/admin/login", { replace: true }), null) : r.json()))
      .then((x) => x && setP(x.payments || []));
  }, [n]);
  const sums = useMemo(
    () => ({
      received: p.filter((x) => x.status === "verified").reduce((a, x) => a + Number(x.amount), 0),
      pending: p.filter((x) => x.status === "pending").reduce((a, x) => a + Number(x.amount), 0),
      refunds: Math.abs(p.filter((x) => x.status === "refunded").reduce((a, x) => a + Number(x.amount), 0)),
    }),
    [p],
  );
  return (
    <main className="admin-app payments-page">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Payments</h1>
            <span>Track and manage all booking payments, deposits, and refunds.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <main className="payments-content">
        
          <section className="payments-metrics">
            <Metric label="Total Revenue" value={money(sums.received - sums.refunds)} />
            <Metric label="Received Payments" value={money(sums.received)} />
            <Metric label="Pending Payments" value={money(sums.pending)} />
            <Metric label="Refunds" value={money(sums.refunds)} />
            <Metric label="Payments (This Month)" value={p.length} />
          </section>
          <section className="payments-card">
            <nav>
              <button type="button" className="is-active">
                All Payments ({p.length})
              </button>
              <button type="button">Pending ({p.filter((x) => x.status === "pending").length})</button>
              <button type="button">Received ({p.filter((x) => x.status === "verified").length})</button>
              <button type="button">Refunds ({p.filter((x) => x.status === "refunded").length})</button>
            </nav>
            <div className="payment-filters">
              <input placeholder="Search by booking ID, guest name, or transaction ID..." />
              <select>
                <option>Payment Status</option>
              </select>
              <select>
                <option>Payment Method</option>
              </select>
              <button type="button">↻ Reset</button>
            </div>
            <div className="booking-table-wrap">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Booking ID</th>
                    <th>Guest Name</th>
                    <th>Payment Type</th>
                    <th>Amount (LKR)</th>
                    <th>Payment Method</th>
                    <th>Transaction Ref.</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {p.map((x, i) => (
                    <tr key={x.id}>
                      <td>{i + 1}</td>
                      <td>BR-{x.bookingId}</td>
                      <td>
                        <strong>{x.guestName}</strong>
                      </td>
                      <td>{x.paymentType.replace("_", " ")}</td>
                      <td className={x.amount < 0 ? "refund" : ""}>
                        {x.amount < 0 ? "- " : ""}
                        {money(x.amount)}
                      </td>
                      <td>{x.method}</td>
                      <td>{x.reference}</td>
                      <td>{new Date(x.paidAt).toLocaleString("en-GB")}</td>
                      <td>
                        <em className={x.status}>{x.status}</em>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
