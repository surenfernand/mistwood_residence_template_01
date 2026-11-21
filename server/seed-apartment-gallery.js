import pg from "pg";
import { GALLERY_PHOTOS } from "../src/data/galleryPhotos.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query("begin");
  let inserted = 0;
  for (let index = 0; index < GALLERY_PHOTOS.length; index += 1) {
    const photo = GALLERY_PHOTOS[index];
    const result = await client.query(
      `insert into apartment_gallery_images (image_url, alt_text, category, sort_order, is_published)
       values ($1, $2, $3, $4, true)
       on conflict (image_url) do nothing`,
      [photo.src, photo.alt, photo.category, index],
    );
    inserted += result.rowCount;
  }
  await client.query("commit");
  console.log(`Apartment gallery seed complete: ${inserted} new row(s), ${GALLERY_PHOTOS.length} total in source list.`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}