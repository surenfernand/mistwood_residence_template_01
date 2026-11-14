import { useCallback, useEffect, useState } from "react";

const blankRate = () => ({ name: "", startDate: "", endDate: "", nightlyRate: "", active: true });

export default function SeasonalRatesPanel({ currency = "LKR" }) {
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/rates");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load seasonal rates.");
      setRates(data.seasonal || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Could not load seasonal rates.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const edit = (rate) => setForm({ ...rate, nightlyRate: String(rate.nightlyRate) });
  const close = () => { setForm(null); setError(""); };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(form.id ? `/api/admin/rates/seasonal/${form.id}` : "/api/admin/rates/seasonal", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, nightlyRate: Number(form.nightlyRate) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save seasonal rate.");
      close();
      await load();
    } catch (saveError) {
      setError(saveError.message || "Could not save seasonal rate.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this seasonal rate override?")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/rates/seasonal/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not remove seasonal rate.");
      await load();
    } catch (removeError) {
      setError(removeError.message || "Could not remove seasonal rate.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="settings-card" style={{ gridColumn: "1 / -1" }}>
      <header className="settings-card-head">
        <div><h2>Seasonal rate overrides</h2><p>Set up to four date-based nightly rates. These take priority over the base rate.</p></div>
        {!form ? <button type="button" disabled={rates.length >= 4} onClick={() => setForm(blankRate())}>Add seasonal rate</button> : null}
      </header>
      {error ? <p className="settings-notice settings-notice-error">{error}</p> : null}
      {rates.length ? <div className="booking-table-wrap"><table className="booking-table"><thead><tr><th>Name</th><th>Dates</th><th>Nightly rate</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rates.map((rate) => <tr key={rate.id}><td>{rate.name}</td><td>{rate.startDate} – {rate.endDate}</td><td>{currency} {Number(rate.nightlyRate).toLocaleString("en-LK")}</td><td>{rate.active ? "Active" : "Inactive"}</td><td><button type="button" disabled={busy} onClick={() => edit(rate)}>Edit</button>{" "}<button type="button" disabled={busy} onClick={() => remove(rate.id)}>Remove</button></td></tr>)}</tbody></table></div> : <p className="booking-empty">No seasonal rate overrides have been added.</p>}
      {form ? <form onSubmit={save} className="settings-booking-grid" style={{ marginTop: 16 }}><label className="settings-field"><span className="settings-field-label">Name</span><div className="settings-field-control"><input required value={form.name} onChange={update("name")} maxLength="100" /></div></label><label className="settings-field"><span className="settings-field-label">Start date</span><div className="settings-field-control"><input required type="date" value={form.startDate} onChange={update("startDate")} /></div></label><label className="settings-field"><span className="settings-field-label">End date</span><div className="settings-field-control"><input required type="date" value={form.endDate} onChange={update("endDate")} /></div></label><label className="settings-field"><span className="settings-field-label">Nightly rate ({currency})</span><div className="settings-field-control"><input required type="number" min="100" step="1" value={form.nightlyRate} onChange={update("nightlyRate")} /></div></label><label className="settings-field"><span className="settings-field-label">Active</span><div className="settings-field-control"><input type="checkbox" checked={Boolean(form.active)} onChange={update("active")} /></div></label><div style={{ alignSelf: "end" }}><button type="submit" disabled={busy}>{busy ? "Saving…" : "Save rate"}</button>{" "}<button type="button" disabled={busy} onClick={close}>Cancel</button></div></form> : null}
    </section>
  );
}
