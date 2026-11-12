import pg from "pg";

if (process.env.DEMO_BOOKINGS !== "true") throw new Error("Set DEMO_BOOKINGS=true to add demo booking requests.");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const samples = [
  ["Ruwan Silva", "ruwan.silva@example.com", "+94 77 123 4567", "4", "2026-11-14", "2026-11-16", "website", "new"],
  ["Priya Mendis", "priya.mendis@example.com", "+94 76 987 6543", "2", "2026-11-20", "2026-11-23", "website", "contacted"],
  ["Dilshan Perera", "dilshan.perera@example.com", "+94 77 456 7890", "4", "2026-11-28", "2026-11-30", "whatsapp", "pending_payment"],
  ["Saman Jayasuriya", "saman.jayasuriya@example.com", "+94 71 234 5678", "3", "2026-12-06", "2026-12-09", "phone", "confirmed"],
  ["Nimali Fernando", "nimali.fernando@example.com", "+94 77 654 3210", "4", "2026-12-11", "2026-12-14", "website", "contacted"],
];
const client = await pool.connect();
try {
  await client.query("begin");
  await client.query("delete from booking_requests where note = '[DEMO] Sample booking request'");
  for (const [name, email, phone, guests, arrive, depart, source, status] of samples) {
    const { rows } = await client.query("insert into booking_requests (name, email, phone, guests, arrive, depart, note, source, status, status_changed_at) values ($1,$2,$3,$4,$5,$6,'[DEMO] Sample booking request',$7,$8,now()) returning id", [name, email, phone, guests, arrive, depart, source, status]);
    await client.query("insert into booking_request_status_history (booking_request_id, to_status) values ($1,$2)", [rows[0].id, status]);
  }
  await client.query("commit");
  console.log(`Added ${samples.length} demo booking requests.`);
} catch (error) { await client.query("rollback"); throw error; } finally { client.release(); await pool.end(); }
