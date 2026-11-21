import { useCallback, useEffect, useMemo, useState } from "react";
import { SettingsCard, SettingsField } from "./SettingsControls.jsx";

const emptyUpload = () => ({
  title: "",
  altText: "",
  duration: "01:00",
  sortOrder: 0,
  isPublished: true,
  posterUrl: "",
  videoFile: null,
  posterFile: null,
});

function badgeClass(published) {
  return published ? "settings-gallery-badge is-live" : "settings-gallery-badge is-hidden";
}

function isUploadedPath(url) {
  return String(url || "").startsWith("/uploads/apartment-gallery/");
}

export default function SettingsApartmentGalleryVideosPanel() {
  const [videos, setVideos] = useState([]);
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
    return fetch("/api/admin/apartment-gallery/videos")
      .then((r) => {
        if (r.status === 401) throw new Error("Please sign in again.");
        return r.json();
      })
      .then((data) => {
        setVideos(Array.isArray(data.videos) ? data.videos : []);
      })
      .catch((err) => setLoadError(err.message || "Could not load gallery videos."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(
    () => [...videos].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.src).localeCompare(String(b.src))),
    [videos],
  );

  const nextSortOrder = useMemo(() => {
    if (!videos.length) return 0;
    return Math.max(...videos.map((v) => Number(v.sortOrder) || 0)) + 1;
  }, [videos]);

  useEffect(() => {
    setUpload((current) => ({ ...current, sortOrder: nextSortOrder }));
  }, [nextSortOrder]);

  const resetUpload = () => setUpload({ ...emptyUpload(), sortOrder: nextSortOrder, videoFile: null, posterFile: null });

  const submitUpload = async (event) => {
    event.preventDefault();
    if (!upload.videoFile) {
      setError("Choose an MP4 or WebM video file.");
      return;
    }
    if (!upload.title.trim() || !upload.altText.trim()) {
      setError("Title and alt text are required.");
      return;
    }
    if (!/^\d{1,2}:\d{2}$/.test(String(upload.duration).trim())) {
      setError("Duration must look like 01:48 or 0:56.");
      return;
    }
    if (!upload.posterFile && !upload.posterUrl.trim().startsWith("/")) {
      setError("Upload a poster image or enter a poster path starting with /.");
      return;
    }
    setUploading(true);
    setError("");
    setNotice("");
    const body = new FormData();
    body.append("video", upload.videoFile);
    if (upload.posterFile) body.append("poster", upload.posterFile);
    else body.append("posterUrl", upload.posterUrl.trim());
    body.append("title", upload.title.trim());
    body.append("altText", upload.altText.trim());
    body.append("duration", upload.duration.trim());
    body.append("sortOrder", String(Number(upload.sortOrder) || 0));
    body.append("isPublished", upload.isPublished ? "true" : "false");
    try {
      const r = await fetch("/api/admin/apartment-gallery/videos", { method: "POST", body });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Upload failed.");
      setNotice("Video uploaded. It appears in the apartment gallery when published.");
      resetUpload();
      await load();
    } catch (err) {
      setError(err.message || "Could not upload video.");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (video) => {
    setError("");
    setEditingId(video.id);
    setEditDraft({
      title: video.title,
      altText: video.alt,
      duration: video.duration,
      sortOrder: video.sortOrder ?? 0,
      isPublished: video.isPublished !== false,
      posterUrl: video.poster,
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editingId || !editDraft) return;
    setSavingEdit(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch(`/api/admin/apartment-gallery/videos/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editDraft.title.trim(),
          altText: editDraft.altText.trim(),
          duration: editDraft.duration.trim(),
          posterUrl: editDraft.posterUrl.trim(),
          sortOrder: Number(editDraft.sortOrder) || 0,
          isPublished: Boolean(editDraft.isPublished),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Could not save changes.");
      setNotice("Gallery video updated.");
      setEditingId(null);
      setEditDraft(null);
      await load();
    } catch (err) {
      setError(err.message || "Could not save changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  const remove = async (video) => {
    const legacy = !isUploadedPath(video.src);
    const message = legacy
      ? "Remove this video from the gallery? Files under /assets/ are kept on disk."
      : "Delete this upload? The video and poster files will be removed from the server.";
    if (!window.confirm(message)) return;
    setError("");
    setNotice("");
    try {
      const r = await fetch(`/api/admin/apartment-gallery/videos/${video.id}`, { method: "DELETE" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Could not delete video.");
      setNotice(legacy ? "Video removed from the gallery." : "Uploaded video deleted.");
      if (editingId === video.id) {
        setEditingId(null);
        setEditDraft(null);
      }
      await load();
    } catch (err) {
      setError(err.message || "Could not delete video.");
    }
  };

  return (
    <div className="settings-gallery-panel">
      <header className="settings-gallery-intro">
        <h2>Apartment gallery videos</h2>
        <p>
          Clips shown beside the photo grid on the Apartment page. Legacy files stay under <code>/assets/</code>; uploads
          go to <code>/uploads/apartment-gallery/videos/</code> with posters in <code>posters/</code>.
        </p>
      </header>

      {loadError ? <p className="settings-notice settings-notice-error">{loadError}</p> : null}
      {error ? <p className="settings-notice settings-notice-error">{error}</p> : null}
      {notice ? <p className="settings-notice">{notice}</p> : null}

      <SettingsCard title="Upload a video" className="settings-gallery-upload-card">
        <form className="settings-gallery-upload-form" onSubmit={submitUpload}>
          <SettingsField label="Video file" required>
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={(e) => setUpload((current) => ({ ...current, videoFile: e.target.files?.[0] || null }))}
            />
          </SettingsField>
          <SettingsField label="Poster image (upload)" hint="Optional if you provide a poster path below.">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setUpload((current) => ({ ...current, posterFile: e.target.files?.[0] || null }))}
            />
          </SettingsField>
          <SettingsField label="Poster path" hint="e.g. /assets/room.jpg — required if no poster file is uploaded.">
            <input
              type="text"
              maxLength={500}
              value={upload.posterUrl}
              onChange={(e) => setUpload((current) => ({ ...current, posterUrl: e.target.value }))}
              placeholder="/assets/room.jpg"
            />
          </SettingsField>
          <SettingsField label="Title" required>
            <input
              type="text"
              maxLength={160}
              value={upload.title}
              onChange={(e) => setUpload((current) => ({ ...current, title: e.target.value }))}
            />
          </SettingsField>
          <SettingsField label="Alt text" required>
            <input
              type="text"
              maxLength={500}
              value={upload.altText}
              onChange={(e) => setUpload((current) => ({ ...current, altText: e.target.value }))}
            />
          </SettingsField>
          <SettingsField label="Duration (M:SS)" required>
            <input
              type="text"
              value={upload.duration}
              onChange={(e) => setUpload((current) => ({ ...current, duration: e.target.value }))}
              placeholder="01:48"
            />
          </SettingsField>
          <SettingsField label="Display order">
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
              {uploading ? "Uploading…" : "Upload video"}
            </button>
          </div>
        </form>
      </SettingsCard>

      <SettingsCard title={`Gallery videos (${sorted.length})`}>
        {loading ? <p className="settings-gallery-muted">Loading videos…</p> : null}
        {!loading && !sorted.length ? <p className="settings-gallery-muted">No videos yet. Run the seed script or upload a clip.</p> : null}
        <ul className="settings-gallery-grid settings-gallery-grid-videos">
          {sorted.map((video) => {
            const uploaded = isUploadedPath(video.src);
            const editing = editingId === video.id;
            return (
              <li key={video.id} className={editing ? "is-editing" : ""}>
                <figure className="settings-gallery-thumb settings-gallery-thumb-video">
                  <img src={video.poster} alt="" loading="lazy" />
                  <figcaption>
                    <span className={badgeClass(video.isPublished !== false)}>
                      {video.isPublished !== false ? "Published" : "Hidden"}
                    </span>
                    {uploaded ? <span className="settings-gallery-badge is-upload">Uploaded</span> : <span className="settings-gallery-badge is-legacy">Legacy asset</span>}
                  </figcaption>
                </figure>
                {editing && editDraft ? (
                  <form className="settings-gallery-edit-form" onSubmit={saveEdit}>
                    <SettingsField label="Title" required>
                      <input
                        type="text"
                        value={editDraft.title}
                        onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                      />
                    </SettingsField>
                    <SettingsField label="Alt text" required>
                      <textarea
                        rows={2}
                        value={editDraft.altText}
                        onChange={(e) => setEditDraft((d) => ({ ...d, altText: e.target.value }))}
                      />
                    </SettingsField>
                    <SettingsField label="Poster path">
                      <input
                        type="text"
                        value={editDraft.posterUrl}
                        onChange={(e) => setEditDraft((d) => ({ ...d, posterUrl: e.target.value }))}
                      />
                    </SettingsField>
                    <SettingsField label="Duration">
                      <input
                        type="text"
                        value={editDraft.duration}
                        onChange={(e) => setEditDraft((d) => ({ ...d, duration: e.target.value }))}
                      />
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
                    <strong title={video.title}>{video.title}</strong>
                    <p>
                      {video.duration} · Order {video.sortOrder ?? 0}
                    </p>
                    <div className="settings-gallery-form-actions">
                      <button type="button" className="settings-btn-ghost" onClick={() => startEdit(video)}>
                        Edit
                      </button>
                      <button type="button" className="settings-btn-danger" onClick={() => remove(video)}>
                        {uploaded ? "Delete" : "Remove"}
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
  );
}