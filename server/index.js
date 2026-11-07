import express from "express";
import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.PORT) || 3000;
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 }) : null;

const schema = `
create table if not exists enquiries (
  id serial primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);
create table if not exists booking_requests (
  id serial primary key,
  name text not null,
  email text not null,
  phone text not null,
  note text,
  guests text,
  arrive date not null,
  depart date not null,
  created_at timestamptz not null default now()
);`;

let dbReady = false;

async function migrate() {
  if (!pool) {
    console.warn("DATABASE_URL is not set; enquiry and booking requests will be rejected.");
    return;
  }
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await pool.query(schema);
      dbReady = true;
      console.log("Database ready");
      return;
    } catch (error) {
      console.error(`Database not ready (attempt ${attempt}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.get("/api/health", async (_req, res) => {
  if (!pool) return res.json({ ok: true, database: "not configured" });
  try {
    await pool.query("select 1");
    res.json({ ok: true, database: dbReady ? "ready" : "connected" });
  } catch {
    res.status(503).json({ ok: false, database: "unreachable" });
  }
});

app.use("/api", (_req, res, next) => {
  if (!dbReady) return res.status(503).json({ error: "The database is not available right now. Please contact us on WhatsApp." });
  next();
});

app.post("/api/enquiries", async (req, res) => {
  const body = req.body || {};
  const entry = {
    name: text(body.name, 200),
    email: text(body.email, 200),
    phone: text(body.phone, 50),
    subject: text(body.subject, 100),
    message: text(body.message, 5000),
  };
  if (!entry.name || !entry.message || !isEmail(entry.email)) return res.status(400).json({ error: "Please add your name, a valid email address, and a message." });
  try {
    const { rows } = await pool.query(
      "insert into enquiries (name, email, phone, subject, message) values ($1, $2, $3, $4, $5) returning id",
      [entry.name, entry.email, entry.phone || null, entry.subject || null, entry.message],
    );
    res.status(201).json({ id: rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "We could not save your message. Please try again." });
  }
});

app.post("/api/bookings", async (req, res) => {
  const body = req.body || {};
  const entry = {
    name: text(body.name, 200),
    email: text(body.email, 200),
    phone: text(body.phone, 50),
    note: text(body.note, 2000),
    guests: text(body.guests, 10),
    arrive: text(body.arrive, 10),
    depart: text(body.depart, 10),
  };
  if (!entry.name || !entry.phone || !isEmail(entry.email)) return res.status(400).json({ error: "Please add your name, email address, and phone number." });
  if (!isDay(entry.arrive) || !isDay(entry.depart) || entry.depart <= entry.arrive) return res.status(400).json({ error: "Please select valid arrival and departure dates." });
  try {
    const { rows } = await pool.query(
      "insert into booking_requests (name, email, phone, note, guests, arrive, depart) values ($1, $2, $3, $4, $5, $6, $7) returning id",
      [entry.name, entry.email, entry.phone, entry.note || null, entry.guests || null, entry.arrive, entry.depart],
    );
    res.status(201).json({ id: rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "We could not save your booking request. Please try again." });
  }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

app.use("/assets", express.static(path.join(root, "assets"), { maxAge: "7d" }));
app.use(express.static(root, { maxAge: "1h", index: false }));
app.get("/{*path}", (_req, res) => res.sendFile(path.join(root, "index.html")));

app.listen(port, () => console.log(`Mistwood Residence listening on ${port}`));
migrate();
