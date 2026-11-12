import { useEffect, useMemo, useState } from "react";
import { formatOfferPeriod } from "../../utils/offerPeriod.js";
import { loadOfferImageOptions, offerImageUrlForKey } from "../../utils/offerImages.js";

const emptyForm = () => ({
  name: "",
  description: "",
  discountPercent: 10,
  startDate: "",
  endDate: "",
  minNights: 2,
  imageKey: "highland-escape",
  imageAlt: "",
  featured: false,
  badge: "",
  active: true,
  sortOrder: 0,
});

function Status({ active }) {
  return <em className={active ? "active" : "inactive"}>{active ? "Active" : "Inactive"}</em>;
}

function pickImageKey(setForm, key, defaultAlt) {
  setForm((current) => {
    const next = { ...current, imageKey: key };
    if (defaultAlt && !String(current.imageAlt || "").trim()) {
      next.imageAlt = defaultAlt;
    }
    return next;
  });
}

export default function AdminSpecialOffersPanel({ offers, onReload, error, setError, notice, setNotice }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageOptions, setImageOptions] = useState([]);

  useEffect(() => {
    loadOfferImageOptions().then(setImageOptions);
  }, []);

  const sorted = useMemo(
    () => [...(offers || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [offers],
  );

  const openNew = () => {
    setError("");
    setForm(emptyForm());
  };

  const openEdit = (offer) => {
    setError("");
    setForm({
      id: offer.id,
      name: offer.name,
      description: offer.description || "",
      discountPercent: offer.discountPercent,
      startDate: offer.startDate?.slice(0, 10) || "",
      endDate: offer.endDate?.slice(0, 10) || "",
      minNights: offer.minNights ?? 2,
      imageKey: offer.imageKey || "highland-escape",
      imageAlt: offer.imageAlt || "",
      featured: Boolean(offer.featured),
      badge: offer.badge || "",
      active: offer.active !== false,
      sortOrder: offer.sortOrder ?? 0,
    });
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...form,
      badge: form.badge?.trim() || null,
      discountPercent: Number(form.discountPercent),
      minNights: Number(form.minNights),
      sortOrder: Number(form.sortOrder) || 0,
    };
    delete payload.id;
    const url = form.id ? `/api/admin/rates/offers/${form.id}` : "/api/admin/rates/offers";
    const method = form.id ? "PATCH" : "POST";
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Could not save offer.");
      setForm(null);
      setNotice(form.id ? "Offer updated. Changes appear on the public Offers page when active." : "Offer created.");
      onReload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (offer) => {
    if (!window.confirm(`Delete “${offer.name}”? This removes it from the website.`)) return;
    setError("");
    try {
      const r = await fetch(`/api/admin/rates/offers/${offer.id}`, { method: "DELETE" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Could not delete offer.");
      setNotice("Offer deleted.");
      onReload();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="rates-panel admin-offers-panel">
      <header>
        <h2>Special Offers</h2>
        <button type="button" onClick={openNew}>
          ＋ Add Offer
        </button>
      </header>
      <p className="admin-offers-hint">
        Active offers appear on the public <strong>/deals</strong> page and apply their discount % during booking quotes
        when stay dates overlap.
      </p>
      {error ? <p className="admin-users-error">{error}</p> : null}
      {notice ? <p className="admin-users-notice">{notice}</p> : null}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Offer</th>
            <th>Discount</th>
            <th>Valid period</th>
            <th>Min nights</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length ? (
            sorted.map((offer, i) => (
              <tr key={offer.id}>
                <td>{i + 1}</td>
                <td>
                  <img
                    className="admin-offer-thumb"
                    src={offer.imageUrl}
                    alt=""
                    width={56}
                    height={42}
                  />
                </td>
                <td>
                  <strong>{offer.name}</strong>
                  {offer.featured ? <small className="admin-offers-featured">Featured on /deals</small> : null}
                </td>
                <td>{offer.discountPercent}% OFF</td>
                <td>{formatOfferPeriod(offer.startDate, offer.endDate)}</td>
                <td>{offer.minNights}</td>
                <td>
                  <Status active={offer.active} />
                </td>
                <td className="admin-users-actions">
                  <button type="button" onClick={() => openEdit(offer)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(offer)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="booking-empty">
                No offers yet — add one to populate the website.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {form ? (
        <div className="booking-drawer-backdrop" role="presentation" onClick={() => setForm(null)}>
          <form className="booking-drawer admin-offer-form" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <header>
              <h2>{form.id ? "Edit offer" : "New offer"}</h2>
              <button type="button" aria-label="Close" onClick={() => setForm(null)}>
                ×
              </button>
            </header>
            <label>
              Offer name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Description (shown on /deals)
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <div className="admin-offer-form-row">
              <label>
                Discount %
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  required
                  value={form.discountPercent}
                  onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                />
              </label>
              <label>
                Minimum nights
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={form.minNights}
                  onChange={(e) => setForm({ ...form, minNights: e.target.value })}
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </label>
            </div>
            <div className="admin-offer-form-row">
              <label>
                Start date
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </label>
            </div>
            <fieldset className="admin-offer-images">
              <legend>Offer image (same photos as /deals)</legend>
              <p className="admin-offer-images-hint">
                Add a new photo under <code>public/assets/mistwood/offers/</code> and list it in{" "}
                <code>sources.json</code>.
              </p>
              <div className="admin-offer-image-grid" role="listbox" aria-label="Offer image">
                {imageOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    role="option"
                    aria-selected={form.imageKey === opt.key}
                    className={form.imageKey === opt.key ? "is-selected" : ""}
                    onClick={() => pickImageKey(setForm, opt.key, opt.defaultAlt)}
                  >
                    <img src={opt.url} alt="" loading="lazy" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
              {form.imageKey ? (
                <div className="admin-offer-image-preview">
                  <img
                    src={imageOptions.find((o) => o.key === form.imageKey)?.url || offerImageUrlForKey(form.imageKey, imageOptions)}
                    alt={form.imageAlt || form.name || "Preview"}
                  />
                  <p>Preview as shown on the Offers page</p>
                </div>
              ) : null}
            </fieldset>
            <label>
              Image description (accessibility)
              <input
                value={form.imageAlt}
                onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                placeholder="Describe the photo for screen readers"
              />
            </label>
            <label>
              Badge (optional, e.g. “Most popular”)
              <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured hero on Offers page
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active (visible on website &amp; pricing)
            </label>
            <div className="booking-dialog-actions">
              <button type="button" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Saving…" : "Save offer"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
