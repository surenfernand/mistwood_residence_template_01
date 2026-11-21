import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import {
  deleteGalleryFileIfUploaded,
  galleryUploadDir,
  isGalleryUuid,
  parseOptionalBoolean,
} from "./apartment-gallery.js";

export const galleryVideoUploadDir = path.join(galleryUploadDir, "videos");
export const galleryPosterUploadDir = path.join(galleryUploadDir, "posters");

const VIDEO_MIME = new Set(["video/mp4", "video/webm"]);
const POSTER_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_EXT = { "video/mp4": ".mp4", "video/webm": ".webm" };
const POSTER_EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" };

const DURATION_PATTERN = /^\d{1,2}:\d{2}$/;

export async function ensureGalleryVideoUploadDirs() {
  await fs.mkdir(galleryVideoUploadDir, { recursive: true });
  await fs.mkdir(galleryPosterUploadDir, { recursive: true });
}

function uniqueName(mimetype, extMap) {
  const ext = extMap[mimetype];
  if (!ext) return null;
  return `${crypto.randomUUID()}${ext}`;
}

export const galleryVideoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const dir = _file.fieldname === "poster" ? galleryPosterUploadDir : galleryVideoUploadDir;
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const map = file.fieldname === "poster" ? POSTER_EXT : VIDEO_EXT;
      const name = uniqueName(file.mimetype, map);
      if (!name) return cb(new Error(`Unsupported ${file.fieldname} type.`));
      cb(null, name);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "video" && VIDEO_MIME.has(file.mimetype)) return cb(null, true);
    if (file.fieldname === "poster" && POSTER_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error("Invalid upload field or file type."));
  },
});

export function handleGalleryVideoUpload(req, res, next) {
  galleryVideoUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "poster", maxCount: 1 },
  ])(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Video must be 100 MB or smaller." });
    }
    return res.status(400).json({ error: error.message || "Upload failed." });
  });
}

function parseDuration(value) {
  const duration = typeof value === "string" ? value.trim() : "";
  return DURATION_PATTERN.test(duration) ? duration : null;
}

function publicPathForUpload(fieldname, filename) {
  const folder = fieldname === "poster" ? "posters" : "videos";
  return `/uploads/apartment-gallery/${folder}/${filename}`;
}

export function rowToPublicVideo(row) {
  return {
    id: row.id,
    src: row.video_url,
    poster: row.poster_url,
    alt: row.alt_text,
    title: row.title,
    duration: row.duration,
    sortOrder: row.sort_order,
  };
}

export function rowToAdminVideo(row) {
  return {
    ...rowToPublicVideo(row),
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function rollbackUploads(paths) {
  for (const url of paths) {
    await deleteGalleryFileIfUploaded(url);
  }
}

export function registerApartmentGalleryVideoRoutes(app, { pool, requirePermission, text }) {
  app.get("/api/apartment-gallery/videos", async (_req, res, next) => {
    try {
      const { rows } = await pool.query(
        `select id, video_url, poster_url, alt_text, title, duration, sort_order, created_at
           from apartment_gallery_videos
          where is_published = true
          order by sort_order asc, created_at asc`,
      );
      res.json({ videos: rows.map(rowToPublicVideo) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/apartment-gallery/videos", requirePermission("settings"), async (_req, res, next) => {
    try {
      const { rows } = await pool.query(
        `select id, video_url, poster_url, alt_text, title, duration, sort_order, is_published, created_at, updated_at
           from apartment_gallery_videos
          order by sort_order asc, created_at asc`,
      );
      res.json({ videos: rows.map(rowToAdminVideo) });
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/admin/apartment-gallery/videos",
    requirePermission("settings"),
    handleGalleryVideoUpload,
    async (req, res, next) => {
      const videoFile = req.files?.video?.[0];
      if (!videoFile) return res.status(400).json({ error: "Choose a video file to upload." });
      const posterFile = req.files?.poster?.[0];
      const posterUrlField = text(req.body?.posterUrl, 500);
      const altText = text(req.body?.altText, 500);
      const title = text(req.body?.title, 160);
      const duration = parseDuration(req.body?.duration);
      const sortOrder = Number.parseInt(req.body?.sortOrder, 10);
      const isPublished = parseOptionalBoolean(req.body?.isPublished);
      const published = isPublished == null ? true : isPublished;
      const created = [];
      if (!altText) return res.status(400).json({ error: "Alt text is required." });
      if (!title) return res.status(400).json({ error: "Title is required." });
      if (!duration) return res.status(400).json({ error: "Duration must be in M:SS format (for example 01:48)." });
      if (!Number.isFinite(sortOrder)) return res.status(400).json({ error: "Sort order must be a number." });

      const videoUrl = publicPathForUpload("video", videoFile.filename);
      created.push(videoUrl);
      let posterUrl = "";
      if (posterFile) {
        posterUrl = publicPathForUpload("poster", posterFile.filename);
        created.push(posterUrl);
      } else if (posterUrlField && posterUrlField.startsWith("/")) {
        posterUrl = posterUrlField;
      } else {
        await rollbackUploads(created);
        return res.status(400).json({ error: "Upload a poster image or provide a poster path starting with /." });
      }

      try {
        const { rows } = await pool.query(
          `insert into apartment_gallery_videos
             (video_url, poster_url, alt_text, title, duration, sort_order, is_published, created_by_admin_id)
           values ($1, $2, $3, $4, $5, $6, $7, $8)
           returning id, video_url, poster_url, alt_text, title, duration, sort_order, is_published, created_at, updated_at`,
          [videoUrl, posterUrl, altText, title, duration, sortOrder, published, req.admin.id],
        );
        res.status(201).json({ video: rowToAdminVideo(rows[0]) });
      } catch (error) {
        await rollbackUploads(created);
        next(error);
      }
    },
  );

  app.patch("/api/admin/apartment-gallery/videos/:id", requirePermission("settings"), async (req, res, next) => {
    const id = req.params.id;
    if (!isGalleryUuid(id)) return res.status(400).json({ error: "Invalid gallery video." });
    const body = req.body || {};
    const fields = [];
    const values = [];

    if ("altText" in body) {
      const altText = text(body.altText, 500);
      if (!altText) return res.status(400).json({ error: "Alt text is required." });
      fields.push(`alt_text = $${values.length + 1}`);
      values.push(altText);
    }
    if ("title" in body) {
      const videoTitle = text(body.title, 160);
      if (!videoTitle) return res.status(400).json({ error: "Title is required." });
      fields.push(`title = $${values.length + 1}`);
      values.push(videoTitle);
    }
    if ("duration" in body) {
      const duration = parseDuration(body.duration);
      if (!duration) return res.status(400).json({ error: "Duration must be in M:SS format (for example 01:48)." });
      fields.push(`duration = $${values.length + 1}`);
      values.push(duration);
    }
    if ("posterUrl" in body) {
      const posterUrl = text(body.posterUrl, 500);
      if (!posterUrl.startsWith("/")) return res.status(400).json({ error: "Poster path must start with /." });
      fields.push(`poster_url = $${values.length + 1}`);
      values.push(posterUrl);
    }
    if ("sortOrder" in body) {
      const sortOrder = Number.parseInt(body.sortOrder, 10);
      if (!Number.isFinite(sortOrder)) return res.status(400).json({ error: "Sort order must be a number." });
      fields.push(`sort_order = $${values.length + 1}`);
      values.push(sortOrder);
    }
    if ("isPublished" in body) {
      const isPublished = parseOptionalBoolean(body.isPublished);
      if (isPublished == null) return res.status(400).json({ error: "Publication status must be true or false." });
      fields.push(`is_published = $${values.length + 1}`);
      values.push(isPublished);
    }
    if (!fields.length) return res.status(400).json({ error: "Nothing to update." });
    values.push(id);
    try {
      const { rows, rowCount } = await pool.query(
        `update apartment_gallery_videos
            set ${fields.join(", ")}, updated_at = now()
          where id = $${values.length}
          returning id, video_url, poster_url, alt_text, title, duration, sort_order, is_published, created_at, updated_at`,
        values,
      );
      if (!rowCount) return res.status(404).json({ error: "Gallery video not found." });
      res.json({ video: rowToAdminVideo(rows[0]) });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/apartment-gallery/videos/:id", requirePermission("settings"), async (req, res, next) => {
    const id = req.params.id;
    if (!isGalleryUuid(id)) return res.status(400).json({ error: "Invalid gallery video." });
    try {
      const existing = await pool.query(
        "select video_url, poster_url from apartment_gallery_videos where id = $1",
        [id],
      );
      if (!existing.rowCount) return res.status(404).json({ error: "Gallery video not found." });
      const { video_url: videoUrl, poster_url: posterUrl } = existing.rows[0];
      const { rowCount } = await pool.query("delete from apartment_gallery_videos where id = $1", [id]);
      if (!rowCount) return res.status(404).json({ error: "Gallery video not found." });
      await deleteGalleryFileIfUploaded(videoUrl);
      await deleteGalleryFileIfUploaded(posterUrl);
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
}