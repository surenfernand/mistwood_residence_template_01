import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

export const GALLERY_CATEGORIES = [
  "Bedrooms",
  "Living Room",
  "Kitchen",
  "Bathroom",
  "Balcony & Views",
  "Details",
];

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, "..");
export const publicRoot = path.join(projectRoot, "public");
export const galleryUploadDir = path.join(publicRoot, "uploads", "apartment-gallery");

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

export async function ensureGalleryUploadDir() {
  await fs.mkdir(galleryUploadDir, { recursive: true });
}

function safeUniqueFilename(mimetype) {
  const ext = EXT_BY_MIME[mimetype];
  if (!ext) return null;
  return `${crypto.randomUUID()}${ext}`;
}

export const galleryImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, galleryUploadDir),
    filename: (_req, file, cb) => {
      const name = safeUniqueFilename(file.mimetype);
      if (!name) return cb(new Error("Unsupported image type."));
      cb(null, name);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed."));
  },
});

export function handleGalleryUpload(req, res, next) {
  galleryImageUpload.single("image")(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image must be 10 MB or smaller." });
    }
    return res.status(400).json({ error: error.message || "Upload failed." });
  });
}

export function isGalleryUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function rowToPublicPhoto(row) {
  return {
    id: row.id,
    src: row.image_url,
    alt: row.alt_text,
    category: row.category,
    sortOrder: row.sort_order,
  };
}

export function rowToAdminPhoto(row) {
  return {
    ...rowToPublicPhoto(row),
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isAdminUploadPath(imageUrl) {
  return typeof imageUrl === "string" && imageUrl.startsWith("/uploads/apartment-gallery/");
}

export async function deleteGalleryFileIfUploaded(imageUrl) {
  if (!isAdminUploadPath(imageUrl)) return;
  const relative = imageUrl.slice("/uploads/apartment-gallery/".length);
  if (!relative || relative.includes("..")) return;
  const full = path.normalize(path.join(galleryUploadDir, relative));
  if (!full.startsWith(galleryUploadDir)) return;
  await fs.unlink(full).catch(() => {});
}

export function parseOptionalBoolean(value) {
  if (value === true || value === false) return value;
  if (typeof value === "string") {
    const normalised = value.trim().toLowerCase();
    if (normalised === "true" || normalised === "1") return true;
    if (normalised === "false" || normalised === "0") return false;
  }
  return null;
}

export function registerApartmentGalleryRoutes(app, { pool, requirePermission, text }) {
  app.get("/api/apartment-gallery", async (_req, res, next) => {
    try {
      const { rows } = await pool.query(
        `select id, image_url, alt_text, category, sort_order, created_at
           from apartment_gallery_images
          where is_published = true
          order by sort_order asc, created_at asc`,
      );
      res.json({ photos: rows.map(rowToPublicPhoto) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/apartment-gallery", requirePermission("settings"), async (_req, res, next) => {
    try {
      const { rows } = await pool.query(
        `select id, image_url, alt_text, category, sort_order, is_published, created_at, updated_at
           from apartment_gallery_images
          order by sort_order asc, created_at asc`,
      );
      res.json({ photos: rows.map(rowToAdminPhoto) });
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/admin/apartment-gallery",
    requirePermission("settings"),
    handleGalleryUpload,
    async (req, res, next) => {
      if (!req.file) return res.status(400).json({ error: "Choose an image file to upload." });
      const altText = text(req.body?.altText, 500);
      const category = text(req.body?.category, 80);
      const sortOrder = Number.parseInt(req.body?.sortOrder, 10);
      const isPublished = parseOptionalBoolean(req.body?.isPublished);
      const published = isPublished == null ? true : isPublished;
      if (!altText) return res.status(400).json({ error: "Alt text is required." });
      if (!GALLERY_CATEGORIES.includes(category)) return res.status(400).json({ error: "Choose a valid gallery category." });
      if (!Number.isFinite(sortOrder)) return res.status(400).json({ error: "Sort order must be a number." });
      const imageUrl = `/uploads/apartment-gallery/${req.file.filename}`;
      try {
        const { rows } = await pool.query(
          `insert into apartment_gallery_images
             (image_url, alt_text, category, sort_order, is_published, created_by_admin_id)
           values ($1, $2, $3, $4, $5, $6)
           returning id, image_url, alt_text, category, sort_order, is_published, created_at, updated_at`,
          [imageUrl, altText, category, sortOrder, published, req.admin.id],
        );
        res.status(201).json({ photo: rowToAdminPhoto(rows[0]) });
      } catch (error) {
        await deleteGalleryFileIfUploaded(imageUrl);
        next(error);
      }
    },
  );

  app.patch("/api/admin/apartment-gallery/:id", requirePermission("settings"), async (req, res, next) => {
    const id = req.params.id;
    if (!isGalleryUuid(id)) return res.status(400).json({ error: "Invalid gallery image." });
    const body = req.body || {};
    const fields = [];
    const values = [];

    if ("altText" in body) {
      const altText = text(body.altText, 500);
      if (!altText) return res.status(400).json({ error: "Alt text is required." });
      fields.push(`alt_text = $${values.length + 1}`);
      values.push(altText);
    }
    if ("category" in body) {
      const category = text(body.category, 80);
      if (!GALLERY_CATEGORIES.includes(category)) return res.status(400).json({ error: "Choose a valid gallery category." });
      fields.push(`category = $${values.length + 1}`);
      values.push(category);
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
        `update apartment_gallery_images
            set ${fields.join(", ")}, updated_at = now()
          where id = $${values.length}
          returning id, image_url, alt_text, category, sort_order, is_published, created_at, updated_at`,
        values,
      );
      if (!rowCount) return res.status(404).json({ error: "Gallery image not found." });
      res.json({ photo: rowToAdminPhoto(rows[0]) });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/apartment-gallery/:id", requirePermission("settings"), async (req, res, next) => {
    const id = req.params.id;
    if (!isGalleryUuid(id)) return res.status(400).json({ error: "Invalid gallery image." });
    try {
      const existing = await pool.query("select image_url from apartment_gallery_images where id = $1", [id]);
      if (!existing.rowCount) return res.status(404).json({ error: "Gallery image not found." });
      const imageUrl = existing.rows[0].image_url;
      const { rowCount } = await pool.query("delete from apartment_gallery_images where id = $1", [id]);
      if (!rowCount) return res.status(404).json({ error: "Gallery image not found." });
      await deleteGalleryFileIfUploaded(imageUrl);
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
}