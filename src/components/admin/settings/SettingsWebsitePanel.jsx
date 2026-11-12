import { SettingsCard, SettingsStars } from "./SettingsControls.jsx";
import { IconEye, IconLink, IconMessage } from "./SettingsPanelIcons.jsx";

const SOCIAL = [
  { key: "facebook", label: "Facebook", glyph: "f", color: "#3b5998" },
  { key: "instagram", label: "Instagram", glyph: "◎", color: "#c13584" },
  { key: "youtube", label: "YouTube", glyph: "▶", color: "#ff0000" },
  { key: "telegram", label: "Telegram", glyph: "✈", color: "#26a4e3" },
];

export default function SettingsWebsitePanel({ data, onPatch }) {
  const setSocial = (key) => (event) => onPatch({ [key]: event.target.value });
  const setTop = (key) => (event) => onPatch({ [key]: event.target.value });

  const filtered = data.reviews.filter((row) => {
    const q = data.reviewSearch.trim().toLowerCase();
    if (q && !`${row.guest} ${row.excerpt}`.toLowerCase().includes(q)) return false;
    if (data.reviewStatus !== "all" && row.status !== data.reviewStatus) return false;
    if (data.reviewRating !== "all" && Math.floor(row.rating) !== Number(data.reviewRating)) return false;
    if (data.reviewFeatured === "yes" && !row.featured) return false;
    if (data.reviewFeatured === "no" && row.featured) return false;
    return true;
  });

  const preview = data.reviews[data.previewIndex] || data.reviews[0];

  const toggleFeatured = (id) => {
    onPatch({
      reviews: data.reviews.map((r) => (r.id === id ? { ...r, featured: !r.featured } : r)),
    });
  };

  return (
    <div className="settings-panel settings-panel-website">
      <div className="settings-website-layout">
        <div className="settings-website-main">
          <SettingsCard title="Social links" icon={<IconLink />}>
            <div className="settings-social-layout">
              <ul className="settings-social-list">
                {SOCIAL.map((item) => (
                  <li key={item.key}>
                    <span className="settings-social-badge" style={{ "--social-color": item.color }}>
                      {item.glyph}
                    </span>
                    <div>
                      <strong>{item.label}</strong>
                      <input value={data[item.key]} onChange={setSocial(item.key)} aria-label={`${item.label} URL`} />
                    </div>
                    <a href={data[item.key]} target="_blank" rel="noreferrer" aria-label={`Open ${item.label}`}>
                      ↗
                    </a>
                  </li>
                ))}
              </ul>
              <div className="settings-footer-preview">
                <p>Footer social icons</p>
                <div className="settings-footer-icons" aria-hidden>
                  {SOCIAL.map((s) => (
                    <span key={s.key}>{s.glyph}</span>
                  ))}
                </div>
                <button type="button" className="settings-btn-outline">
                  <IconEye /> Preview website footer
                </button>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Reviews & testimonials" icon={<IconMessage />} className="settings-reviews-card">
            <div className="settings-review-stats">
              <article>
                <span>Average rating</span>
                <strong>
                  {data.reviewsStats.average} <SettingsStars rating={data.reviewsStats.average} />
                </strong>
              </article>
              <article>
                <span>Published</span>
                <strong>{data.reviewsStats.published}</strong>
              </article>
              <article>
                <span>Featured</span>
                <strong>{data.reviewsStats.featured}</strong>
              </article>
              <article>
                <span>Draft</span>
                <strong>{data.reviewsStats.draft}</strong>
              </article>
              <button type="button" className="settings-save-btn settings-save-btn-sm">
                + Add review
              </button>
            </div>

            <div className="settings-review-filters">
              <label className="settings-search">
                <span aria-hidden>⌕</span>
                <input
                  placeholder="Search reviews (guest, keyword…)"
                  value={data.reviewSearch}
                  onChange={setTop("reviewSearch")}
                />
              </label>
              <select value={data.reviewStatus} onChange={setTop("reviewStatus")}>
                <option value="all">Status: All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <select value={data.reviewRating} onChange={setTop("reviewRating")}>
                <option value="all">Rating: All</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={String(n)}>
                    {n} stars
                  </option>
                ))}
              </select>
              <select value={data.reviewFeatured} onChange={setTop("reviewFeatured")}>
                <option value="all">Featured: All</option>
                <option value="yes">Featured only</option>
                <option value="no">Not featured</option>
              </select>
            </div>

            <div className="settings-review-table-wrap">
              <table className="settings-review-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <span className="settings-guest-cell">
                          <em>{row.initials}</em>
                          <span>
                            <strong>{row.guest}</strong>
                            <small>{row.date}</small>
                          </span>
                        </span>
                      </td>
                      <td>
                        <SettingsStars rating={row.rating} />
                      </td>
                      <td className="settings-review-excerpt">{row.excerpt}</td>
                      <td>
                        <span className={`settings-status-pill is-${row.status}`}>{row.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={row.featured}
                          className={`settings-switch${row.featured ? " is-on" : ""}`}
                          onClick={() => toggleFeatured(row.id)}
                        >
                          <span />
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="settings-kebab"
                          onClick={() => onPatch({ previewIndex: data.reviews.findIndex((r) => r.id === row.id) })}
                        >
                          ⋯
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsCard>
        </div>

        <aside className="settings-testimonial-preview">
          <SettingsCard title="Website testimonial preview" icon={<IconEye />}>
            <p className="settings-preview-note">Live preview of how a review appears on your hotel website.</p>
            {preview ? (
              <div className="settings-testimonial-stage">
                <img src="/assets/mistwood/explore/horton-plains.jpg" alt="" />
                <div className="settings-testimonial-card">
                  <button type="button" aria-label="Previous review" onClick={() => bumpPreview(data, onPatch, -1)}>
                    ‹
                  </button>
                  <article>
                    <span className="settings-guest-avatar">{preview.initials}</span>
                    <SettingsStars rating={preview.rating} />
                    <blockquote>{preview.excerpt}</blockquote>
                    <footer>
                      <strong>{preview.guest}</strong>
                      <span>Stayed {preview.date}</span>
                    </footer>
                  </article>
                  <button type="button" aria-label="Next review" onClick={() => bumpPreview(data, onPatch, 1)}>
                    ›
                  </button>
                </div>
                <div className="settings-testimonial-dots" role="tablist" aria-label="Review slides">
                  {data.reviews.map((r, i) => (
                    <button
                      key={r.id}
                      type="button"
                      className={i === data.previewIndex ? "is-active" : ""}
                      aria-label={`Show review ${i + 1}`}
                      onClick={() => onPatch({ previewIndex: i })}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </SettingsCard>
        </aside>
      </div>
    </div>
  );
}

function bumpPreview(data, onPatch, delta) {
  const len = data.reviews.length;
  if (!len) return;
  const next = (data.previewIndex + delta + len) % len;
  onPatch({ previewIndex: next });
}
