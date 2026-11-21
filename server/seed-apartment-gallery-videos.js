import pg from "pg";
import { FEATURED_VIDEOS, GALLERY_VIDEOS } from "../src/data/galleryPhotos.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const featuredBySrc = new Map(FEATURED_VIDEOS.map((item) => [item.src, item]));
const seedRows = [];
const seen = new Set();

for (const [index, item] of FEATURED_VIDEOS.entries()) {
  seedRows.push({
    videoUrl: item.src,
    posterUrl: item.poster,
    altText: item.alt,
    title: item.title,
    duration: item.duration,
    sortOrder: index,
  });
  seen.add(item.src);
}

for (const item of GALLERY_VIDEOS) {
  if (seen.has(item.src)) continue;
  const featured = featuredBySrc.get(item.src);
  seedRows.push({
    videoUrl: item.src,
    posterUrl: item.poster,
    altText: item.alt,
    title: featured?.title || item.label || item.alt,
    duration: featured?.duration || "00:00",
    sortOrder: seedRows.length,
  });
  seen.add(item.src);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query("begin");
  let inserted = 0;
  for (const row of seedRows) {
    const result = await client.query(
      `insert into apartment_gallery_videos
         (video_url, poster_url, alt_text, title, duration, sort_order, is_published)
       values ($1, $2, $3, $4, $5, $6, true)
       on conflict (video_url) do nothing`,
      [row.videoUrl, row.posterUrl, row.altText, row.title, row.duration, row.sortOrder],
    );
    inserted += result.rowCount;
  }
  await client.query("commit");
  console.log(`Apartment gallery videos seed complete: ${inserted} new row(s), ${seedRows.length} total in source list.`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}