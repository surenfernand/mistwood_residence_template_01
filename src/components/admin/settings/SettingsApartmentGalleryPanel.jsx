import { useCallback, useEffect, useMemo, useState } from "react";
import { GALLERY_FILTERS } from "../../../data/galleryPhotos.js";
import { SettingsCard, SettingsField } from "./SettingsControls.jsx";
import SettingsApartmentGalleryVideosPanel from "./SettingsApartmentGalleryVideosPanel.jsx";

const CATEGORY_OPTIONS = GALLERY_FILTERS.filter((name) => name !== "All Photos" && name !== "Overview");

const emptyUpload = () => ({
  altText: "",
  category: "Bedrooms",
  sortOrder: 0,
  isPublished: true,
  file: null,
});

function badgeClass(published) {
  return published ? "settings-gallery-badge is-live" : "settings-gallery-badge is-hidden";
}

export default function SettingsApartmentGalleryPanel() {
  const [section, setSection] = useState("photos");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [upload, setUpload] = useState(emptyUpload);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");
    return fetch("/api/admin/apartment-gallery")
      .then((r) => {
        if (r.status === 401) throw new Error("Please sign in again.");
        return r.json();
      })
      .then((data) => {
        setPhotos(Array.isArray(data.photos) ? data.photos : []);
      })
      .catch((err) => setLoadError(err.message || "Could not load gallery images."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(
    () => [...photos].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.src).localeCompare(String(b.src))),
    [photos],
  );

  const nextSortOrder = useMemo(() => {
    if (!photos.length) return 0;
    return Math.max(...photos.map((p) => Number(p.sortOrder) || 0)) + 1;
  }, [photos]);

  useEffect(() => {
    setUpload((current) => ({ ...current, sortOrder: nextSortOrder }));
  }, [nextSortOrder]);

  const resetUpload = () => setUpload({ ...emptyUpload(), sortOrder: nextSortOrder, file: null });

  const submitUpload = async (event) => {
    event.preventDefault();
    if (!upload.file) {
      setError("Choose an image file (JPEG, PNG, WebP, or AVIF).");
      return;
    }
    if (!upload.altText.trim()) {
      setError("Alt text is required for accessibility.");
      return;
    }
    setUploading(true);
    setError("");
    setNotice("");
    const body = new FormData();
    body.append("image", upload.file);
    body.append("altText", upload.altText.trim());
    body.append("category", upload.category);
    body.append("sortOrder", String(Number(upload.sortOrder) || 0));
    body.append("isPublished", upload.isPublished ? "true" : "false");
    try {
      const r = await fetch("/api/admin/apartment-gallery", { method: "POST", body });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Upload failed.");
      setNotice("Photo uploaded. It appears on the apartment page when published.");
      resetUpload();
      await load();
    } catch (err) {
      setError(err.message || "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (photo) => {
    setError("");
    setEditingId(photo.id);
    setEditDraft({
      altText: photo.alt,
      category: photo.category,
      sortOrder: photo.sortOrder ?? 0,
      isPublished: photo.isPublished !== false,
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editingId || !editDraft) return;
    setSavingEdit(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch(`/api/admin/apartment-gallery/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: editDraft.altText.trim(),
          category: editDraft.category,
          sortOrder: Number(editDraft.sortOrder) || 0,
          isPublished: Boolean(editDraft.isPublished),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Could not save changes.");
      setNotice("Gallery photo updated.");
      setEditingId(null);
      setEditDraft(null);
      await load();
    } catch (err) {
      setError(err.message || "Could not save changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  const remove = async (photo) => {
    const legacy = !String(photo.src || "").startsWith("/uploads/apartment-gallery/");
    const message = legacy
      ? "Remove this photo from the public gallery? The original file under /assets/ will not be deleted."
      : "Delete this upload? The image file will be removed from the server.";
    if (!window.confirm(message)) return;
    setError("");
    setNotice("");
    try {
      const r = await fetch(`/api/admin/apartment-gallery/${photo.id}`, { method: "DELETE" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Could not delete image.");
      setNotice(legacy ? "Photo removed from the gallery." : "Uploaded photo deleted.");
      if (editingId === photo.id) {
        setEditingId(null);
        setEditDraft(null);
      }
      await load();
    } catch (err) {
      setError(err.message || "Could not delete image.");
    }
  };

  if (section === "videos") {
    return (
      <div className="settings-gallery-shell">
        <div className="settings-gallery-subnav" role="tablist" aria-label="Gallery media type">
          <button type="button" role="tab" aria-selected={false} onClick={() => setSection("photos")}>
            Photos
          </button>
          <button type="button" role="tab" aria-selected className="is-active" onClick={() => setSection("videos")}>
            Videos
          </button>
        </div>
        <SettingsApartmentGalleryVideosPanel />
      </div>
    );
  }

  return (
    <div className="settings-gallery-shell">
      <div className="settings-gallery-subnav" role="tablist" aria-label="Gallery media type">
        <button type="button" role="tab" aria-selected className="is-active" onClick={() => setSection("photos")}>
          Photos
        </button>
        <button type="button" role="tab" aria-selected={false} onClick={() => setSection("videos")}>
          Videos
        </button>
      </div>
    <div className="settings-gallery-panel">
      <header className="settings-gallery-intro">
        <h2>Apartment gallery photos</h2>
        <p>Manage photos shown in the apartment gallery on the public site. Legacy images in <code>/assets/</code> stay in the repo; new uploads are stored under <code>/uploads/apartment-gallery/</code>.</p>
      </header>

      {loadError ? <p className="settings-notice settings-notice-error">{loadError}</p> : null}
      {error ? <p className="settings-notice settings-notice-error">{error}</p> : null}
      {notice ? <p className="settings-notice">{notice}</p> : null}

      <SettingsCard title="Upload a photo" className="settings-gallery-upload-card">
        <form className="settings-gallery-upload-form" onSubmit={submitUpload}>
          <SettingsField label="Image file" required>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setUpload((current) => ({ ...current, file: e.target.files?.[0] || null }))}
            />
          </SettingsField>
          <SettingsField label="Alt text" required>
            <input
              type="text"
              maxLength={500}
              value={upload.altText}
              onChange={(e) => setUpload((current) => ({ ...current, altText: e.target.value }))}
              placeholder="Describe the room or detail in the photo"
            />
          </SettingsField>
          <SettingsField label="Category" required>
            <select
              value={upload.category}
              onChange={(e) => setUpload((current) => ({ ...current, category: e.target.value }))}
            >
              {CATEGORY_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </SettingsField>
          <SettingsField label="Display order" hint="Lower numbers appear first within a category.">
            <input
              type="number"
              value={upload.sortOrder}
              onChange={(e) => setUpload((current) => ({ ...current, sortOrder: e.target.value }))}
            />
          </SettingsField>
          <label className="settings-gallery-checkbox">
            <input
              type="checkbox"
              checked={upload.isPublished}
              onChange={(e) => setUpload((current) => ({ ...current, isPublished: e.target.checked }))}
            />
            Published on the apartment page
          </label>
          <div className="settings-gallery-form-actions">
            <button type="submit" className="settings-btn-primary" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload photo"}
            </button>
          </div>
        </form>
      </SettingsCard>

      <SettingsCard title={`Gallery images (${sorted.length})`}>
        {loading ? <p className="settings-gallery-muted">Loading gallery…</p> : null}
        {!loading && !sorted.length ? <p className="settings-gallery-muted">No gallery images yet. Run the seed script or upload a photo.</p> : null}
        <ul className="settings-gallery-grid">
          {sorted.map((photo) => {
            const isUpload = String(photo.src).startsWith("/uploads/apartment-gallery/");
            const editing = editingId === photo.id;
            return (
              <li key={photo.id} className={editing ? "is-editing" : ""}>
                <figure className="settings-gallery-thumb">
                  <img src={photo.src} alt="" loading="lazy" />
                  <figcaption>
                    <span className={badgeClass(photo.isPublished !== false)}>
                      {photo.isPublished !== false ? "Published" : "Hidden"}
                    </span>
                    {isUpload ? <span className="settings-gallery-badge is-upload">Uploaded</span> : <span className="settings-gallery-badge is-legacy">Legacy asset</span>}
                  </figcaption>
                </figure>
                {editing && editDraft ? (
                  <form className="settings-gallery-edit-form" onSubmit={saveEdit}>
                    <SettingsField label="Alt text" required>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={editDraft.altText}
                        onChange={(e) => setEditDraft((d) => ({ ...d, altText: e.target.value }))}
                      />
                    </SettingsField>
                    <SettingsField label="Category" required>
                      <select
                        value={editDraft.category}
                        onChange={(e) => setEditDraft((d) => ({ ...d, category: e.target.value }))}
                      >
                        {CATEGORY_OPTIONS.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </SettingsField>
                    <SettingsField label="Display order">
                      <input
                        type="number"
                        value={editDraft.sortOrder}
                        onChange={(e) => setEditDraft((d) => ({ ...d, sortOrder: e.target.value }))}
                      />
                    </SettingsField>
                    <label className="settings-gallery-checkbox">
                      <input
                        type="checkbox"
                        checked={editDraft.isPublished}
                        onChange={(e) => setEditDraft((d) => ({ ...d, isPublished: e.target.checked }))}
                      />
                      Published
                    </label>
                    <div className="settings-gallery-form-actions">
                      <button type="submit" className="settings-btn-primary" disabled={savingEdit}>
                        {savingEdit ? "Saving…" : "Save"}
                      </button>
                      <button type="button" className="settings-btn-ghost" onClick={() => { setEditingId(null); setEditDraft(null); }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="settings-gallery-meta">
                    <strong title={photo.alt}>{photo.alt}</strong>
                    <p>
                      {photo.category} · Order {photo.sortOrder ?? 0}
                    </p>
                    <div className="settings-gallery-form-actions">
                      <button type="button" className="settings-btn-ghost" onClick={() => startEdit(photo)}>
                        Edit
                      </button>
                      <button type="button" className="settings-btn-danger" onClick={() => remove(photo)}>
                        {isUpload ? "Delete" : "Remove"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </SettingsCard>
    </div>
    </div>
  );
}