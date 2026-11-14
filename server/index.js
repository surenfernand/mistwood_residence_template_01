import express from "express";
import pg from "pg";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { sendEnquiryConfirmation } from "./email.js";
import { sendAdminEnquiryNotification } from "./admin-enquiry-email.js";
import { sendAdminPasswordReset } from "./admin-password-reset-email.js";
import { sendAdminInvite } from "./admin-invite-email.js";
import { renderBookingConfirmationPreviewHtml } from "./booking-confirmation-email.js";
import { renderBookingAdminNotificationPreviewHtml } from "./booking-admin-notification-email.js";
import { calculateStayQuote, estimateStayTotal } from "./pricing.js";
import { buildPayhereFields, payhereCheckoutUrl, payhereConfigured } from "./payhere.js";
import { createCheckoutRequest, fulfillPayherePayment } from "./booking-payment.js";
import {
  listAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  notifyBookingRequestNew,
  notifyEnquiryNew,
  notifyPaymentReceived,
  notifyBookingConfirmed,
  notifyNeedsAttention,
  notifyUserInvited,
  notifyUserDeactivated,
} from "./admin-notifications.js";
import { scheduleStayLifecycle, runStayLifecycleJob } from "./stay-lifecycle.js";
import {
  currentGuest,
  startGuestSession,
  clearGuestSessionCookie,
  hashPassword as hashGuestPassword,
  verifyPassword as verifyGuestPassword,
  guestTokenHash,
  issueGuestSetupToken,
  GUEST_SESSION_COOKIE,
} from "./guest-auth.js";
import { attachPricingToSettings, setPropertyBaseRate } from "./property-rates.js";
import {
  getSiteSettings,
  getPublicSettings,
  updateSiteSettings,
  validateBookingAgainstSettings,
  contactFromSettings,
} from "./site-settings.js";
import {
  buildIntegrationsAdminView,
  listIntegrationActivity,
  logSettingsIntegrationEvents,
  logPayhereEvent,
} from "./integrations.js";
import { listAdminOffers, listPublicOffers, validateOfferBody } from "./special-offers.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.PORT) || 3000;
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 }) : null;
if (pool) {
  pool.on("error", (error) => {
    console.error("PostgreSQL pool error (connection dropped or reset):", error.message);
  });
}

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
);
create table if not exists admins (
  id bigserial primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null default 'admin' check (role in ('admin')),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists admin_sessions (
  id bigserial primary key,
  admin_id bigint not null references admins(id) on delete cascade,
  token_hash char(64) not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  user_agent text,
  ip_address inet
);
create table if not exists admin_password_reset_tokens (
  id bigserial primary key,
  admin_id bigint not null references admins(id) on delete cascade,
  token_hash char(64) not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  requested_ip inet
);`;

let dbReady = false;
const scrypt = promisify(crypto.scrypt);
const SESSION_COOKIE = "mistwood_admin_session";
const SESSION_SHORT_AGE = 12 * 60 * 60;
const SESSION_REMEMBER_AGE = 30 * 24 * 60 * 60;
const loginAttempts = new Map();
const resetAttempts = new Map();
const RESET_TOKEN_AGE = 30 * 60;
const INVITE_TOKEN_AGE = 7 * 24 * 60 * 60;
const MAX_ACTIVE_ADMINS = 10;

async function migrate() {
  if (!pool) {
    console.warn("DATABASE_URL is not set; enquiry and booking requests will be rejected.");
    return;
  }
  let lastError;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await pool.query(schema);
      await runMigrations();
      await bootstrapAdmin();
      dbReady = true;
      console.log("Database ready");
      scheduleStayLifecycle(pool);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Database not ready (attempt ${attempt}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw new Error(`Database migrations failed after 10 attempts: ${lastError?.message || "unknown error"}`);
}

async function runMigrations() {
  await pool.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())");
  const migrationDirectory = new URL("./migrations/", import.meta.url);
  const migrations = (await fs.readdir(migrationDirectory)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of migrations) {
    const applied = await pool.query("select 1 from schema_migrations where name = $1", [name]);
    if (applied.rowCount) continue;
    const sql = await fs.readFile(new URL(name, migrationDirectory), "utf8");
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into schema_migrations (name) values ($1)", [name]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const normalisedEmail = (value) => text(value, 200).toLowerCase();
const normalisedPhone = (value) => text(value, 50).replace(/[\s().-]/g, "");
const isInternationalPhone = (value) => /^\+[1-9]\d{7,14}$/.test(value);
const tokenHash = (token) => crypto.createHash("sha256").update(token).digest("hex");

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return scrypt(password, salt, 64).then((derived) => `scrypt$${salt}$${Buffer.from(derived).toString("hex")}`);
}

async function verifyPassword(password, stored) {
  const [algorithm, salt, encoded] = String(stored).split("$");
  if (algorithm !== "scrypt" || !salt || !encoded) return false;
  const derived = Buffer.from(await scrypt(password, salt, 64));
  const expected = Buffer.from(encoded, "hex");
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

async function bootstrapAdmin() {
  const email = normalisedEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD || "";
  const name = text(process.env.ADMIN_NAME, 120) || "Mistwood Administrator";
  if (!email || !isEmail(email) || password.length < 12) {
    console.warn("Admin bootstrap skipped. Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters to create the first administrator.");
    return;
  }
  const exists = await pool.query("select id from admins where email = $1", [email]);
  if (exists.rowCount) return;
  const passwordHash = await hashPassword(password);
  const { rows } = await pool.query("insert into admins (email, name, password_hash) values ($1, $2, $3) returning id", [email, name, passwordHash]);
  await ensureOwnerRole(rows[0].id);
  console.log(`Initial administrator created for ${email}`);
}

async function ensureOwnerRole(adminId) {
  const { rows } = await pool.query("select id from roles where name = 'Owner' limit 1");
  if (!rows[0]) return;
  await pool.query(
    "insert into admin_role_assignments (admin_id, role_id) values ($1, $2) on conflict (admin_id) do nothing",
    [adminId, rows[0].id],
  );
}

async function loadAdminContext(adminId) {
  const { rows } = await pool.query(
    `select a.id, a.email, a.name, a.last_login_at as "lastLoginAt", coalesce(r.name, 'Owner') as "roleName", r.id as "roleId"
       from admins a
       left join admin_role_assignments x on x.admin_id = a.id
       left join roles r on r.id = x.role_id
      where a.id = $1 and a.is_active = true`,
    [adminId],
  );
  const admin = rows[0];
  if (!admin) return null;
  let permissions = (
    await pool.query(
      `select p.code
         from permissions p
         join role_permissions rp on rp.permission_id = p.id
         join admin_role_assignments x on x.role_id = rp.role_id
        where x.admin_id = $1
        order by p.code`,
      [adminId],
    )
  ).rows.map((row) => row.code);

  if (!permissions.length) {
    if (!admin.roleId) {
      await ensureOwnerRole(adminId);
      const refreshed = await pool.query(
        `select a.id, a.email, a.name, a.last_login_at as "lastLoginAt", coalesce(r.name, 'Owner') as "roleName", r.id as "roleId"
           from admins a
           left join admin_role_assignments x on x.admin_id = a.id
           left join roles r on r.id = x.role_id
          where a.id = $1 and a.is_active = true`,
        [adminId],
      );
      Object.assign(admin, refreshed.rows[0] || admin);
    }
    const roleName = admin.roleName || "Owner";
    const { rows: rolePermissions } = await pool.query(
      `select p.code
         from permissions p
         join role_permissions rp on rp.permission_id = p.id
         join roles r on r.id = rp.role_id
        where r.name = $1
        order by p.code`,
      [roleName],
    );
    permissions = rolePermissions.map((row) => row.code);
    if (!permissions.length && roleName === "Owner") {
      const { rows: allPermissions } = await pool.query("select code from permissions order by code");
      permissions = allPermissions.map((row) => row.code);
    }
  }

  return { ...admin, permissions };
}

async function sessionFromRequest(request) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token || token.length < 40) return null;
  const { rows } = await pool.query(
    `select admins.id as admin_id, admin_sessions.id as session_id
       from admin_sessions join admins on admins.id = admin_sessions.admin_id
      where admin_sessions.token_hash = $1 and admin_sessions.expires_at > now() and admins.is_active = true`,
    [tokenHash(token)],
  );
  return rows[0] || null;
}

async function logAdminAccess(adminId, action, ip) {
  await pool.query("insert into admin_access_logs (admin_id, action, ip_address) values ($1, $2, $3)", [adminId, action, ip || null]);
}

async function revokeAdminSessions(adminId) {
  await pool.query("delete from admin_sessions where admin_id = $1", [adminId]);
}

async function activeOwnerCount(exceptAdminId = null) {
  const { rows } = await pool.query(
    `select count(*)::int as count
       from admins a
       join admin_role_assignments x on x.admin_id = a.id
       join roles r on r.id = x.role_id
      where a.is_active = true and r.name = 'Owner'${exceptAdminId ? " and a.id <> $1" : ""}`,
    exceptAdminId ? [exceptAdminId] : [],
  );
  return rows[0]?.count || 0;
}

function adminPayload(admin) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.roleName,
    roleName: admin.roleName,
    roleId: admin.roleId ?? null,
    permissions: admin.permissions || [],
    lastLoginAt: admin.lastLoginAt ?? null,
  };
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || "").split(";").map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }).filter((part) => part.length));
}

function setSessionCookie(response, token, maxAge) {
  response.cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: maxAge * 1000, path: "/" });
}

function clearSessionCookie(response) {
  response.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
}

async function currentAdmin(request) {
  const session = await sessionFromRequest(request);
  if (!session) return null;
  const admin = await loadAdminContext(session.admin_id);
  if (!admin) return null;
  return { ...admin, session_id: session.session_id };
}

async function attachAdmin(request, response, next) {
  try {
    const admin = await currentAdmin(request);
    if (!admin) return response.status(401).json({ error: "Please sign in to access the admin panel." });
    request.admin = admin;
    pool.query("update admin_sessions set last_seen_at = now() where id = $1", [admin.session_id]).catch(() => {});
    next();
  } catch (error) {
    next(error);
  }
}

const requireAdmin = attachAdmin;

function requirePermission(...codes) {
  return async (request, response, next) => {
    try {
      const admin = await currentAdmin(request);
      if (!admin) return response.status(401).json({ error: "Please sign in to access the admin panel." });
      const roleName = admin.roleName || "Owner";
      const legacyOwner = !admin.permissions?.length && (roleName === "Owner" || roleName === "admin");
      const allowed = codes.length === 0 || legacyOwner || codes.some((code) => admin.permissions.includes(code));
      if (!allowed) return response.status(403).json({ error: "You do not have permission to access this area." });
      request.admin = admin;
      pool.query("update admin_sessions set last_seen_at = now() where id = $1", [admin.session_id]).catch(() => {});
      next();
    } catch (error) {
      next(error);
    }
  };
}

function loginAllowed(request) {
  const key = request.ip || request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.expires < now) {
    loginAttempts.set(key, { attempts: 0, expires: now + 15 * 60 * 1000 });
    return true;
  }
  return entry.attempts < 10;
}

function recordLoginFailure(request) {
  const key = request.ip || request.socket.remoteAddress || "unknown";
  const entry = loginAttempts.get(key) || { attempts: 0, expires: Date.now() + 15 * 60 * 1000 };
  entry.attempts += 1;
  loginAttempts.set(key, entry);
}

function clearLoginFailures(request) {
  loginAttempts.delete(request.ip || request.socket.remoteAddress || "unknown");
}

function passwordError(password) {
  if (typeof password !== "string" || password.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) return "Include an uppercase letter, lowercase letter, and number.";
  return "";
}

function resetAllowed(request) {
  const key = request.ip || request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = resetAttempts.get(key);
  if (!entry || entry.expires < now) {
    resetAttempts.set(key, { attempts: 0, expires: now + 15 * 60 * 1000 });
    return true;
  }
  return entry.attempts < 5;
}

function recordResetAttempt(request) {
  const key = request.ip || request.socket.remoteAddress || "unknown";
  const entry = resetAttempts.get(key) || { attempts: 0, expires: Date.now() + 15 * 60 * 1000 };
  entry.attempts += 1;
  resetAttempts.set(key, entry);
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));

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

app.post("/api/admin/auth/login", async (req, res) => {
  if (!loginAllowed(req)) return res.status(429).json({ error: "Too many login attempts. Please try again in 15 minutes." });
  const email = normalisedEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const remember = Boolean(req.body?.remember);
  if (!isEmail(email) || !password) {
    recordLoginFailure(req);
    return res.status(401).json({ error: "Invalid email address or password." });
  }
  try {
    const { rows } = await pool.query("select id, email, name, role, password_hash from admins where email = $1 and is_active = true", [email]);
    const admin = rows[0];
    if (!admin || !(await verifyPassword(password, admin.password_hash))) {
      recordLoginFailure(req);
      return res.status(401).json({ error: "Invalid email address or password." });
    }
    const maxAge = remember ? SESSION_REMEMBER_AGE : SESSION_SHORT_AGE;
    const token = crypto.randomBytes(32).toString("base64url");
    await pool.query(
      "insert into admin_sessions (admin_id, token_hash, expires_at, user_agent, ip_address) values ($1, $2, now() + ($3 * interval '1 second'), $4, $5)",
      [admin.id, tokenHash(token), maxAge, text(req.get("user-agent"), 500) || null, req.ip || null],
    );
    await pool.query("update admins set last_login_at = now(), updated_at = now() where id = $1", [admin.id]);
    clearLoginFailures(req);
    setSessionCookie(res, token, maxAge);
    const context = await loadAdminContext(admin.id);
    res.json({ admin: adminPayload(context || { id: admin.id, email: admin.email, name: admin.name, roleName: "Owner", permissions: [] }) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "We could not sign you in. Please try again." });
  }
});

app.post("/api/admin/auth/forgot-password", async (req, res) => {
  if (!resetAllowed(req)) return res.status(429).json({ error: "Too many reset requests. Please try again in 15 minutes." });
  const email = normalisedEmail(req.body?.email);
  recordResetAttempt(req);
  const genericReply = { message: "If an account exists for that email address, we have sent a password-reset link." };
  if (!isEmail(email)) return res.json(genericReply);
  try {
    const { rows } = await pool.query("select id, name, email from admins where email = $1 and is_active = true", [email]);
    const admin = rows[0];
    if (!admin) return res.json(genericReply);
    const token = crypto.randomBytes(32).toString("base64url");
    await pool.query("delete from admin_password_reset_tokens where admin_id = $1 and used_at is null", [admin.id]);
    await pool.query(
      "insert into admin_password_reset_tokens (admin_id, token_hash, expires_at, requested_ip) values ($1, $2, now() + ($3 * interval '1 second'), $4)",
      [admin.id, tokenHash(token), RESET_TOKEN_AGE, req.ip || null],
    );
    const siteUrl = (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
    await sendAdminPasswordReset({ name: admin.name, email: admin.email, resetUrl: `${siteUrl}/admin/reset-password?token=${encodeURIComponent(token)}` });
    res.json(genericReply);
  } catch (error) {
    console.error("Password reset email could not be sent:", error.message);
    res.status(503).json({ error: "We could not send the reset email right now. Please try again shortly." });
  }
});

app.post("/api/admin/auth/reset-password", async (req, res) => {
  const token = typeof req.body?.token === "string" ? req.body.token : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const validationError = passwordError(password);
  if (!token || token.length < 40) return res.status(400).json({ error: "This password-reset link is invalid or has expired." });
  if (validationError) return res.status(400).json({ error: validationError });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query(
      "select id, admin_id from admin_password_reset_tokens where token_hash = $1 and used_at is null and expires_at > now() for update",
      [tokenHash(token)],
    );
    const reset = rows[0];
    if (!reset) {
      await client.query("rollback");
      return res.status(400).json({ error: "This password-reset link is invalid or has expired." });
    }
    await client.query("update admins set password_hash = $1, updated_at = now() where id = $2", [await hashPassword(password), reset.admin_id]);
    await client.query("update admin_password_reset_tokens set used_at = now() where id = $1", [reset.id]);
    await client.query("delete from admin_sessions where admin_id = $1", [reset.admin_id]);
    await client.query("commit");
    clearSessionCookie(res);
    res.json({ message: "Your password has been reset. Please sign in with your new password." });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    console.error("Password reset failed:", error);
    res.status(500).json({ error: "We could not reset your password. Please try again." });
  } finally {
    client.release();
  }
});

app.get("/api/admin/auth/me", requireAdmin, (req, res) => {
  res.json({ admin: adminPayload(req.admin) });
});

app.patch("/api/admin/auth/profile", requireAdmin, async (req, res, next) => {
  const name = text(req.body?.name, 120);
  if (!name) return res.status(400).json({ error: "Name cannot be empty." });
  try {
    await pool.query("update admins set name = $1, updated_at = now() where id = $2", [name, req.admin.id]);
    const context = await loadAdminContext(req.admin.id);
    res.json({ admin: adminPayload(context || { ...req.admin, name }), message: "Profile updated." });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/auth/change-password", requireAdmin, async (req, res, next) => {
  const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  const validationError = passwordError(newPassword);
  if (!currentPassword) return res.status(400).json({ error: "Enter your current password." });
  if (validationError) return res.status(400).json({ error: validationError });
  if (currentPassword === newPassword) return res.status(400).json({ error: "Choose a password that is different from your current one." });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query("select password_hash from admins where id = $1 for update", [req.admin.id]);
    const row = rows[0];
    if (!row || !(await verifyPassword(currentPassword, row.password_hash))) {
      await client.query("rollback");
      return res.status(400).json({ error: "Your current password is incorrect." });
    }
    await client.query("update admins set password_hash = $1, updated_at = now() where id = $2", [
      await hashPassword(newPassword),
      req.admin.id,
    ]);
    const sessionId = req.admin.session_id;
    if (sessionId) {
      await client.query("delete from admin_sessions where admin_id = $1 and id <> $2", [req.admin.id, sessionId]);
    } else {
      await client.query("delete from admin_sessions where admin_id = $1", [req.admin.id]);
    }
    await client.query("commit");
    res.json({ message: "Your password has been updated." });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
});

app.post("/api/admin/auth/logout", async (req, res) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token) await pool.query("delete from admin_sessions where token_hash = $1", [tokenHash(token)]);
  clearSessionCookie(res);
  res.status(204).end();
});

app.get("/api/admin/dashboard", requirePermission("dashboard"), async (_req, res) => {
  const [{ rows: bookings }, { rows: enquiries }, { rows: recentBookingRequests }] = await Promise.all([
    pool.query("select count(*)::int as count from booking_requests where created_at >= date_trunc('month', now())"),
    pool.query("select count(*)::int as count from enquiries where created_at >= date_trunc('month', now())"),
    pool.query("select id, name, guests, arrive, depart, created_at as \"createdAt\" from booking_requests order by created_at desc limit 5"),
  ]);
  res.json({ bookingRequestsThisMonth: bookings[0].count, enquiriesThisMonth: enquiries[0].count, recentBookingRequests });
});

app.get("/api/admin/notifications", requirePermission("dashboard"), async (req, res, next) => {
  try {
    const limit = req.query.limit;
    const offset = req.query.offset;
    res.json(await listAdminNotifications(pool, req.admin, { limit, offset }));
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/notifications/:id/read", requirePermission("dashboard"), async (req, res, next) => {
  try {
    const result = await markNotificationRead(pool, req.admin, req.params.id);
    if (!result.ok) return res.status(result.status || 400).json({ error: "Notification not found." });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/notifications/read-all", requirePermission("dashboard"), async (req, res, next) => {
  try {
    const result = await markAllNotificationsRead(pool, req.admin);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const bookingRequestStatuses = ["new", "contacted", "pending_payment", "confirmed", "checked_in", "checked_out", "cancelled", "declined"];
const bookingStatusTransitions = {
  new: ["contacted", "pending_payment", "confirmed", "declined", "cancelled"], contacted: ["new", "pending_payment", "confirmed", "declined", "cancelled"], pending_payment: ["contacted", "confirmed", "cancelled", "declined"], confirmed: ["checked_in", "cancelled"], checked_in: ["checked_out"], checked_out: [], cancelled: [], declined: [],
};

app.get("/api/admin/booking-requests", requirePermission("bookings"), async (req, res, next) => {
  const query = text(req.query.q, 100), status = text(req.query.status, 30), source = text(req.query.source, 60), from = text(req.query.from, 10), to = text(req.query.to, 10);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100), offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
  if (status && !bookingRequestStatuses.includes(status)) return res.status(400).json({ error: "Invalid booking status." });
  if ((from && !isDay(from)) || (to && !isDay(to)) || (from && to && from > to)) return res.status(400).json({ error: "Invalid submission date range." });
  const clauses = [], values = [];
  const add = (sql, value) => { values.push(value); clauses.push(sql.replace("?", `$${values.length}`)); };
  if (status) add("status = ?", status); if (source) add("source = ?", source); if (from) add("created_at >= ?::date", from); if (to) add("created_at < (?::date + interval '1 day')", to);
  if (query) { values.push(`%${query}%`); const parameter = `$${values.length}`; clauses.push(`(name ilike ${parameter} or email ilike ${parameter} or phone ilike ${parameter} or cast(id as text) ilike ${parameter})`); }
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  try {
    const [list, total, summary, sources] = await Promise.all([
      pool.query(`select id, name, email, phone, note, guests, arrive::text as arrive, depart::text as depart, source, status, created_at as "createdAt", status_changed_at as "statusChangedAt" from booking_requests ${where} order by created_at desc limit $${values.length + 1} offset $${values.length + 2}`, [...values, limit, offset]),
      pool.query(`select count(*)::int as count from booking_requests ${where}`, values), pool.query("select status, count(*)::int as count from booking_requests group by status"), pool.query("select distinct source from booking_requests order by source"),
    ]);
    res.json({ requests: list.rows, total: total.rows[0].count, limit, offset, sources: sources.rows.map((row) => row.source), summary: Object.fromEntries(summary.rows.map((row) => [row.status, row.count])) });
  } catch (error) { next(error); }
});

app.get("/api/admin/booking-requests/:id", requirePermission("bookings"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid request ID." });
  try {
    const [request, history] = await Promise.all([
      pool.query('select id, name, email, phone, note, guests, arrive::text as arrive, depart::text as depart, source, status, created_at as "createdAt", status_changed_at as "statusChangedAt" from booking_requests where id = $1', [id]),
      pool.query('select from_status as "fromStatus", to_status as "toStatus", changed_at as "changedAt" from booking_request_status_history where booking_request_id = $1 order by changed_at desc', [id]),
    ]);
    if (!request.rowCount) return res.status(404).json({ error: "Booking request not found." });
    res.json({ request: request.rows[0], history: history.rows });
  } catch (error) { next(error); }
});

app.get("/api/admin/availability", requirePermission("dashboard", "availability"), async (req, res, next) => {
  const month = text(req.query.month, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return res.status(400).json({ error: "Use a valid month." });
  const start = `${month}-01`;
  try {
    const [requests, blocks] = await Promise.all([
      pool.query("select id, name, arrive::text as arrive, depart::text as depart, status from booking_requests where arrive < ($1::date + interval '1 month') and depart > $1::date and status in ('new', 'contacted', 'pending_payment', 'confirmed') order by arrive", [start]),
      pool.query("select id, start_date::text as \"startDate\", end_date::text as \"endDate\", reason from availability_blocks where start_date < ($1::date + interval '1 month') and end_date > $1::date order by start_date", [start]),
    ]);
    res.json({ month, requests: requests.rows, blocks: blocks.rows });
  } catch (error) { next(error); }
});

async function blockRangeConflict(pool, startDate, endDate, exceptBlockId = null) {
  const blockClause = exceptBlockId
    ? "select 1 from availability_blocks where id <> $3 and daterange(start_date,end_date,'[)') && daterange($1::date,$2::date,'[)')"
    : "select 1 from availability_blocks where daterange(start_date,end_date,'[)') && daterange($1::date,$2::date,'[)')";
  const params = exceptBlockId ? [startDate, endDate, exceptBlockId] : [startDate, endDate];
  const { rowCount } = await pool.query(
    `select 1 from bookings where status in ('confirmed','checked_in') and daterange(check_in,check_out,'[)') && daterange($1::date,$2::date,'[)')
     union all ${blockClause}
     union all select 1 from booking_requests where status in ('new','contacted','pending_payment','confirmed') and daterange(arrive,depart,'[)') && daterange($1::date,$2::date,'[)')
     limit 1`,
    params,
  );
  return Boolean(rowCount);
}

app.post("/api/admin/availability/blocks", requirePermission("dashboard", "availability"), async (req, res, next) => {
  const startDate = text(req.body?.startDate, 10);
  const endDate = text(req.body?.endDate, 10);
  const reason = text(req.body?.reason, 200) || "Blocked";
  if (!isDay(startDate) || !isDay(endDate) || endDate <= startDate) {
    return res.status(400).json({ error: "Choose a valid start and end date (check-out must be after check-in)." });
  }
  try {
    if (await blockRangeConflict(pool, startDate, endDate)) {
      return res.status(409).json({ error: "Those dates overlap a booking, hold, or existing block." });
    }
    const { rows } = await pool.query(
      `insert into availability_blocks (start_date, end_date, reason, created_by_admin_id)
       values ($1::date, $2::date, $3, $4)
       returning id, start_date::text as "startDate", end_date::text as "endDate", reason`,
      [startDate, endDate, reason, req.admin.id],
    );
    await logAdminAccess(req.admin.id, `availability.blocked:${rows[0].id}`, req.ip);
    res.status(201).json({ block: rows[0], message: "Dates blocked." });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/availability/blocks/:id", requirePermission("dashboard", "availability"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid block ID." });
  try {
    const result = await pool.query("delete from availability_blocks where id = $1 returning id", [id]);
    if (!result.rowCount) return res.status(404).json({ error: "Block not found." });
    await logAdminAccess(req.admin.id, `availability.unblocked:${id}`, req.ip);
    res.json({ message: "Block removed." });
  } catch (error) {
    next(error);
  }
});

app.get("/api/availability", async (_req, res, next) => {
  try {
    const [bookings, pendingRequests, blocks] = await Promise.all([
      pool.query("select check_in::text as start, check_out::text as end, 'booked' as type from bookings where status in ('confirmed','checked_in')"),
      pool.query("select arrive::text as start, depart::text as end, 'pending' as type from booking_requests where status = 'pending_payment' and hold_expires_at > now()"),
      pool.query("select start_date::text as start, end_date::text as end, 'blocked' as type from availability_blocks"),
    ]);
    res.json({ unavailable: [...bookings.rows, ...pendingRequests.rows, ...blocks.rows] });
  } catch (error) {
    next(error);
  }
});

app.get("/api/pricing/quote", async (req, res, next) => {
  const arrive = text(req.query.arrive, 10);
  const depart = text(req.query.depart, 10);
  if (!isDay(arrive) || !isDay(depart) || depart <= arrive) {
    return res.status(400).json({ error: "Please provide valid arrival and departure dates." });
  }
  try {
    await validateBookingAgainstSettings(pool, { arrive, depart, guests: "1" });
    const offerId = req.query.offerId ? Number.parseInt(req.query.offerId, 10) : null;
    const quote = await calculateStayQuote(pool, arrive, depart, {
      selectedOfferId: Number.isInteger(offerId) && offerId > 0 ? offerId : null,
    });
    res.json(quote);
  } catch (error) {
    next(error);
  }
});

app.post("/api/payments/payhere/notify", async (req, res) => {
  try {
    await fulfillPayherePayment(pool, req.body || {});
    res.status(200).send("");
  } catch (error) {
    console.error("PayHere notify error:", error.message);
    res.status(error.status || 500).send("");
  }
});

app.get("/api/payments/payhere/return", (_req, res) => {
  res.redirect("/contact?payment=return");
});

app.post("/api/payments/payhere/init", async (req, res, next) => {
  if (!payhereConfigured()) {
    return res.status(503).json({ error: "Online payment is not configured yet. Please contact us on WhatsApp." });
  }
  const orderId = text(req.body?.orderId, 80);
  const purpose = text(req.body?.purpose, 20) || "deposit";
  if (!orderId) return res.status(400).json({ error: "Missing payment order." });
  try {
    const guestSession = await currentGuest(pool, req);
    let query;
    let params;
    if (purpose === "balance" && guestSession) {
      const bookingId = Number.parseInt(req.body?.bookingId, 10);
      query = `select br.payment_order_id, br.pricing_snapshot, b.guest_email, b.guest_name, b.guest_phone, b.id as booking_id
                 from bookings b
                 join booking_requests br on br.id = b.booking_request_id
                where b.id = $1 and b.guest_email = $2 and b.payment_status = 'partial'`;
      params = [bookingId, guestSession.email];
    } else {
      query = `select id, payment_order_id, pricing_snapshot, email, name, phone from booking_requests where payment_order_id = $1 and status = 'pending_payment'`;
      params = [orderId];
    }
    const { rows } = await pool.query(query, params);
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "Payment session not found or already completed." });
    const quote = typeof row.pricing_snapshot === "string" ? JSON.parse(row.pricing_snapshot) : row.pricing_snapshot;
    const amount = purpose === "balance" ? quote.balanceDue : quote.depositAmount;
    const payOrderId = purpose === "balance" ? `${row.payment_order_id}-BAL` : row.payment_order_id;
    const fields = buildPayhereFields({
      orderId: payOrderId,
      amount,
      currency: quote.currency || "LKR",
      items: purpose === "balance" ? "Mistwood balance payment" : "Mistwood reservation deposit",
      firstName: (row.name || row.guest_name || "Guest").split(" ")[0],
      lastName: (row.name || row.guest_name || "Guest").split(" ").slice(1).join(" ") || "Guest",
      email: row.email || row.guest_email,
      phone: row.phone || row.guest_phone,
      custom1: purpose === "balance" ? row.booking_id : row.id,
      custom2: purpose,
    });
    res.json({ checkoutUrl: payhereCheckoutUrl(), fields });
  } catch (error) {
    next(error);
  }
});

app.get("/api/check-in/:token", async (req, res, next) => {
  const token = text(req.params.token, 120);
  if (!token) return res.status(400).json({ error: "Invalid check-in link." });
  try {
    const { rows } = await pool.query(
      `select b.id, b.guest_name as "guestName", b.check_in::text as "checkIn", b.check_out::text as "checkOut",
              b.status, b.guests
         from bookings b
        where b.check_in_token_hash = $1`,
      [tokenHash(token)],
    );
    if (!rows.length) return res.status(404).json({ error: "Check-in link not found." });
    const booking = rows[0];
    res.json({
      booking,
      canCheckIn: booking.status === "confirmed",
      adminSignedIn: Boolean(await currentAdmin(req)),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/check-in/:token", requireAdmin, async (req, res, next) => {
  const token = text(req.params.token, 120);
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query(
      `select b.id, b.status, b.booking_request_id as "requestId"
         from bookings b
        where b.check_in_token_hash = $1 for update`,
      [tokenHash(token)],
    );
    const booking = rows[0];
    if (!booking) {
      await client.query("rollback");
      return res.status(404).json({ error: "Check-in link not found." });
    }
    if (booking.status !== "confirmed") {
      await client.query("rollback");
      return res.status(400).json({ error: `Cannot check in while status is ${booking.status}.` });
    }
    await client.query(
      "update bookings set status = 'checked_in', checked_in_at = now(), updated_at = now() where id = $1",
      [booking.id],
    );
    if (booking.requestId) {
      await client.query(
        "update booking_requests set status = 'checked_in', status_changed_at = now(), updated_at = now() where id = $1",
        [booking.requestId],
      );
    }
    await client.query(
      "insert into booking_audit_log (booking_id, action, details, created_by_admin_id) values ($1, 'check_in_scan', '{}'::jsonb, $2)",
      [booking.id, req.admin.id],
    );
    await client.query("commit");
    res.json({ ok: true, status: "checked_in" });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
});

app.post("/api/guest/auth/register", async (req, res, next) => {
  const token = text(req.body?.token, 200);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const name = text(req.body?.name, 200);
  const pwdError = passwordError(password);
  if (!token || pwdError) return res.status(400).json({ error: pwdError || "Invalid setup link." });
  try {
    const { rows } = await pool.query(
      "select id, email from guest_setup_tokens where token_hash = $1 and expires_at > now() and used_at is null",
      [guestTokenHash(token)],
    );
    const setup = rows[0];
    if (!setup) return res.status(400).json({ error: "This setup link is invalid or has expired." });
    const passwordHash = await hashGuestPassword(password);
    const displayName = name || setup.email.split("@")[0];
    const { rows: users } = await pool.query(
      `insert into guest_users (email, name, password_hash)
       values ($1, $2, $3)
       on conflict (email) do update set password_hash = excluded.password_hash, name = excluded.name, updated_at = now()
       returning id, email, name`,
      [setup.email.toLowerCase(), displayName, passwordHash],
    );
    await pool.query("update guest_setup_tokens set used_at = now(), guest_user_id = $1 where id = $2", [users[0].id, setup.id]);
    await pool.query("update bookings set guest_user_id = $1 where guest_email = $2", [users[0].id, setup.email.toLowerCase()]);
    await startGuestSession(pool, users[0].id, req, res);
    res.status(201).json({ guest: { email: users[0].email, name: users[0].name } });
  } catch (error) {
    next(error);
  }
});

app.post("/api/guest/auth/login", async (req, res, next) => {
  const email = normalisedEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!isEmail(email) || !password) return res.status(401).json({ error: "Invalid email or password." });
  try {
    const { rows } = await pool.query("select id, email, name, password_hash from guest_users where email = $1", [email]);
    const guest = rows[0];
    if (!guest || !(await verifyGuestPassword(password, guest.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    await startGuestSession(pool, guest.id, req, res);
    res.json({ guest: { email: guest.email, name: guest.name } });
  } catch (error) {
    next(error);
  }
});

app.post("/api/guest/auth/logout", async (req, res, next) => {
  const token = parseCookies(req)[GUEST_SESSION_COOKIE];
  try {
    if (token) await pool.query("delete from guest_sessions where token_hash = $1", [guestTokenHash(token)]);
    clearGuestSessionCookie(res);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/guest/me", async (req, res, next) => {
  try {
    const guest = await currentGuest(pool, req);
    if (!guest) return res.status(401).json({ error: "Please sign in." });
    res.json({ guest: { email: guest.email, name: guest.name, phone: guest.phone } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/guest/bookings", async (req, res, next) => {
  try {
    const guest = await currentGuest(pool, req);
    if (!guest) return res.status(401).json({ error: "Please sign in." });
    const { rows } = await pool.query(
      `select b.id, b.check_in::text as "checkIn", b.check_out::text as "checkOut", b.status,
              b.total_amount as "totalAmount", b.deposit_amount as "depositAmount", b.payment_status as "paymentStatus",
              br.payment_order_id as "paymentOrderId", br.pricing_snapshot as "pricingSnapshot"
         from bookings b
         left join booking_requests br on br.id = b.booking_request_id
        where b.guest_email = $1 or b.guest_user_id = $2
        order by b.check_in desc`,
      [guest.email, guest.id],
    );
    res.json({ bookings: rows });
  } catch (error) {
    next(error);
  }
});

app.post("/api/internal/stay-lifecycle", async (req, res, next) => {
  const secret = text(req.headers["x-cron-secret"] || req.body?.secret, 200);
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const result = await runStayLifecycleJob(pool);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/bookings/:id/payments", requirePermission("payments"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  const amount = Number(req.body?.amount);
  const method = text(req.body?.method, 80) || "Manual";
  const reference = text(req.body?.reference, 120);
  const paymentType = text(req.body?.paymentType, 30) || "full_payment";
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid payment." });
  }
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query("select id, total_amount, deposit_amount, payment_status from bookings where id = $1 for update", [id]);
    if (!rows.length) {
      await client.query("rollback");
      return res.status(404).json({ error: "Booking not found." });
    }
    await client.query(
      `insert into booking_payments (booking_id, amount, method, reference, status, paid_at, payment_type, transaction_reference, recorded_by_admin_id)
       values ($1, $2, $3, $4, 'verified', now(), $5, $6, $7)`,
      [id, amount, method, reference || null, paymentType, reference || null, req.admin.id],
    );
    const booking = rows[0];
  const paid = Number(booking.deposit_amount || 0) + amount;
    const nextStatus = paid >= Number(booking.total_amount) ? "paid" : "partial";
    await client.query("update bookings set payment_status = $1, updated_at = now() where id = $2", [nextStatus, id]);
    await client.query("commit");
    const { rows: guestRows } = await pool.query("select guest_name as \"guestName\" from bookings where id = $1", [id]);
    try {
      await notifyPaymentReceived(pool, {
        bookingId: id,
        amount,
        guestName: guestRows[0]?.guestName || "Guest",
      });
    } catch (notifyError) {
      console.error("Payment notification failed:", notifyError.message);
    }
    res.status(201).json({ ok: true, paymentStatus: nextStatus });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
});

async function availabilityConflict(client, arrive, depart, exceptBookingId = null) {
  const bookingClause = exceptBookingId
    ? "select 1 from bookings where status in ('confirmed','checked_in') and id <> $3 and daterange(check_in,check_out,'[)') && daterange($1::date,$2::date,'[)')"
    : "select 1 from bookings where status in ('confirmed','checked_in') and daterange(check_in,check_out,'[)') && daterange($1::date,$2::date,'[)')";
  const params = exceptBookingId ? [arrive, depart, exceptBookingId] : [arrive, depart];
  const { rowCount } = await client.query(
    `${bookingClause} union all select 1 from availability_blocks where daterange(start_date,end_date,'[)') && daterange($1::date,$2::date,'[)') limit 1`,
    params,
  );
  return Boolean(rowCount);
}

function dayValue(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function parseGuestCount(value) {
  const parsed = Number.parseInt(String(value || "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function ensureBookingForRequest(client, requestId) {
  const { rows: existing } = await client.query("select id from bookings where booking_request_id = $1", [requestId]);
  if (existing.length) return existing[0].id;
  const { rows: requests } = await client.query(
    "select id, name, email, phone, source, guests, arrive, depart from booking_requests where id = $1",
    [requestId],
  );
  if (!requests.length) return null;
  const request = requests[0];
  const arrive = dayValue(request.arrive);
  const depart = dayValue(request.depart);
  if (!isDay(arrive) || !isDay(depart) || depart <= arrive) throw Object.assign(new Error("Request has invalid stay dates."), { status: 400 });
  if (await availabilityConflict(client, arrive, depart)) throw Object.assign(new Error("Those dates conflict with an existing stay or block."), { status: 409 });
  const quote = await calculateStayQuote(client, arrive, depart);
  const nightly = quote.nights ? quote.total / quote.nights : quote.total;
  const guests = parseGuestCount(request.guests);
  const { rows } = await client.query(
    `insert into bookings (booking_request_id, guest_name, guest_email, guest_phone, source, check_in, check_out, guests, status, nightly_rate, total_amount, deposit_amount, payment_status)
     values ($1, $2, $3, $4, coalesce($5, 'website'), $6::date, $7::date, $8, 'confirmed', $9, $10, 0, 'unpaid')
     returning id`,
    [requestId, request.name, request.email, request.phone, request.source, arrive, depart, guests, nightly, quote.total],
  );
  return rows[0].id;
}

async function syncBookingStatusForRequest(client, requestId, requestStatus) {
  const map = { confirmed: "confirmed", checked_in: "checked_in", checked_out: "checked_out", cancelled: "cancelled" };
  const bookingStatus = map[requestStatus];
  if (!bookingStatus) return;
  await client.query("update bookings set status = $1, updated_at = now() where booking_request_id = $2", [bookingStatus, requestId]);
}

const bookingRecordStatuses = ["confirmed", "checked_in", "checked_out", "cancelled"];
const bookingRecordTransitions = {
  confirmed: ["checked_in", "cancelled"],
  checked_in: ["checked_out", "cancelled"],
  checked_out: [],
  cancelled: [],
};

app.get("/api/offers", async (_req, res, next) => {
  try {
    res.json({ offers: await listPublicOffers(pool) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/rates", requirePermission("rates"), async (_req, res, next) => {
  try {
    const [base, seasonal, discounts, offers] = await Promise.all([
      pool.query('select nightly_rate as "nightlyRate", currency from property_rates where active order by id desc limit 1'),
      pool.query('select id,name,start_date::text as "startDate",end_date::text as "endDate",nightly_rate as "nightlyRate",active from seasonal_rates order by start_date'),
      pool.query('select id,min_nights as "minNights",discount_percent as "discountPercent",active from long_stay_discounts order by min_nights'),
      listAdminOffers(pool),
    ]);
    res.json({
      base: base.rows[0] || null,
      seasonal: seasonal.rows,
      offers,
      discounts: discounts.rows,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/rates/offers", requirePermission("rates"), async (req, res, next) => {
  const { errors, out } = validateOfferBody(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });
  try {
    if (out.featured) await pool.query("update special_offers set featured = false");
    const { rows } = await pool.query(
      `insert into special_offers (
         name, discount_percent, start_date, end_date, active,
         description, min_nights, image_key, image_alt, featured, badge, sort_order
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       returning id`,
      [
        out.name,
        out.discountPercent,
        out.startDate,
        out.endDate,
        out.active !== false,
        out.description,
        out.minNights,
        out.imageKey,
        out.imageAlt || "",
        Boolean(out.featured),
        out.badge ?? null,
        out.sortOrder ?? 0,
      ],
    );
    res.status(201).json({ id: rows[0].id });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/rates/offers/:id", requirePermission("rates"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid offer." });
  const { errors, out } = validateOfferBody(req.body || {}, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });
  if (!Object.keys(out).length) return res.status(400).json({ error: "Nothing to update." });
  const map = {
    name: "name",
    discountPercent: "discount_percent",
    startDate: "start_date",
    endDate: "end_date",
    active: "active",
    description: "description",
    minNights: "min_nights",
    imageKey: "image_key",
    imageAlt: "image_alt",
    featured: "featured",
    badge: "badge",
    sortOrder: "sort_order",
  };
  const fields = [];
  const values = [];
  for (const [key, col] of Object.entries(map)) {
    if (!(key in out)) continue;
    fields.push(`${col} = $${values.length + 1}`);
    values.push(out[key]);
  }
  try {
    if (out.featured) await pool.query("update special_offers set featured = false where id <> $1", [id]);
    values.push(id);
    const { rowCount } = await pool.query(
      `update special_offers set ${fields.join(", ")} where id = $${values.length}`,
      values,
    );
    if (!rowCount) return res.status(404).json({ error: "Offer not found." });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/rates/offers/:id", requirePermission("rates"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid offer." });
  try {
    const { rowCount } = await pool.query("delete from special_offers where id = $1", [id]);
    if (!rowCount) return res.status(404).json({ error: "Offer not found." });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/payments", requirePermission("payments"), async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'select p.id,p.amount,p.method,p.transaction_reference as "reference",p.status,p.payment_type as "paymentType",p.paid_at as "paidAt",b.id as "bookingId",b.guest_name as "guestName" from booking_payments p join bookings b on b.id=p.booking_id order by p.paid_at desc',
    );
    res.json({ payments: rows });
  } catch (error) {
    next(error);
  }
});
app.get("/api/admin/guests-enquiries", requirePermission("guests"), async (_req, res, next) => {
  try {
    const [enquiries, guests] = await Promise.all([
      pool.query(
        'select id,name,email,phone,subject,message,status,enquiry_type as "enquiryType",created_at as "createdAt" from enquiries order by created_at desc limit 20',
      ),
      pool.query("select distinct on (email) name,email,phone,arrive,depart from booking_requests order by email,created_at desc"),
    ]);
    res.json({ enquiries: enquiries.rows, guests: guests.rows });
  } catch (error) {
    next(error);
  }
});

async function listRolesWithPermissions() {
  const { rows: roles } = await pool.query("select id, name, description from roles order by id");
  const { rows: matrix } = await pool.query(
    `select r.id as "roleId", p.code
       from roles r
       join role_permissions rp on rp.role_id = r.id
       join permissions p on p.id = rp.permission_id
       order by r.id, p.code`,
  );
  const byRole = Object.fromEntries(roles.map((role) => [role.id, []]));
  for (const row of matrix) {
    byRole[row.roleId]?.push(row.code);
  }
  return roles.map((role) => ({ ...role, permissions: byRole[role.id] || [] }));
}

app.get("/api/admin/roles", requirePermission("users"), async (_req, res, next) => {
  try {
    res.json({ roles: await listRolesWithPermissions() });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/users", requirePermission("users"), async (_req, res, next) => {
  try {
    const [users, roles] = await Promise.all([
      pool.query(
        'select a.id, a.name, a.email, a.is_active as "isActive", a.last_login_at as "lastLogin", r.id as "roleId", coalesce(r.name, \'Owner\') as role from admins a left join admin_role_assignments x on x.admin_id = a.id left join roles r on r.id = x.role_id order by a.created_at',
      ),
      listRolesWithPermissions(),
    ]);
    res.json({ users: users.rows, roles });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/users", requirePermission("users"), async (req, res, next) => {
  const name = text(req.body?.name, 120);
  const email = normalisedEmail(req.body?.email);
  const roleId = Number.parseInt(req.body?.roleId, 10);
  if (!name || !isEmail(email) || !Number.isSafeInteger(roleId) || roleId < 1) {
    return res.status(400).json({ error: "Provide a name, valid email, and role." });
  }
  try {
    const { rows: roles } = await pool.query("select id, name from roles where id = $1", [roleId]);
    const role = roles[0];
    if (!role) return res.status(400).json({ error: "Invalid role." });
    if (role.name === "Owner" && req.admin.roleName !== "Owner") {
      return res.status(403).json({ error: "Only an Owner can assign the Owner role." });
    }
    const { rows: activeCount } = await pool.query("select count(*)::int as count from admins where is_active = true");
    if (activeCount[0].count >= MAX_ACTIVE_ADMINS) {
      return res.status(409).json({ error: `You can have at most ${MAX_ACTIVE_ADMINS} active admin users.` });
    }
    const existing = await pool.query("select id from admins where email = $1", [email]);
    if (existing.rowCount) return res.status(409).json({ error: "An account with that email already exists." });
    const placeholderPassword = crypto.randomBytes(32).toString("base64url");
    const passwordHash = await hashPassword(placeholderPassword);
    const client = await pool.connect();
    let adminId;
    try {
      await client.query("begin");
      const inserted = await client.query(
        "insert into admins (email, name, password_hash) values ($1, $2, $3) returning id",
        [email, name, passwordHash],
      );
      adminId = inserted.rows[0].id;
      await client.query(
        "insert into admin_role_assignments (admin_id, role_id) values ($1, $2) on conflict (admin_id) do update set role_id = excluded.role_id, assigned_at = now()",
        [adminId, roleId],
      );
      const token = crypto.randomBytes(32).toString("base64url");
      await client.query("delete from admin_password_reset_tokens where admin_id = $1 and used_at is null", [adminId]);
      await client.query(
        "insert into admin_password_reset_tokens (admin_id, token_hash, expires_at, requested_ip) values ($1, $2, now() + ($3 * interval '1 second'), $4)",
        [adminId, tokenHash(token), INVITE_TOKEN_AGE, req.ip || null],
      );
      await client.query("commit");
      const siteUrl = (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
      try {
        await sendAdminInvite({
          name,
          email,
          roleName: role.name,
          setupUrl: `${siteUrl}/admin/reset-password?token=${encodeURIComponent(token)}`,
          invitedBy: req.admin.name,
        });
      } catch (emailError) {
        console.error("Admin invite email could not be sent:", emailError.message);
        return res.status(503).json({ error: "The account was created but the invitation email could not be sent. Try resending the invite." });
      }
      await logAdminAccess(req.admin.id, `user.invited:${adminId}`, req.ip);
      try {
        await notifyUserInvited(pool, { adminId, name, roleName: role.name });
      } catch (notifyError) {
        console.error("User invited notification failed:", notifyError.message);
      }
      res.status(201).json({ id: adminId, message: "Invitation sent." });
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/users/:id/resend-invite", requirePermission("users"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid user ID." });
  try {
    const { rows } = await pool.query(
      `select a.id, a.name, a.email, a.last_login_at as "lastLogin", coalesce(r.name, 'Owner') as "roleName"
         from admins a
         left join admin_role_assignments x on x.admin_id = a.id
         left join roles r on r.id = x.role_id
        where a.id = $1 and a.is_active = true`,
      [id],
    );
    const target = rows[0];
    if (!target) return res.status(404).json({ error: "User not found." });
    if (target.lastLogin) return res.status(400).json({ error: "This user has already signed in. Use forgot password if they need access." });
    const token = crypto.randomBytes(32).toString("base64url");
    await pool.query("delete from admin_password_reset_tokens where admin_id = $1 and used_at is null", [id]);
    await pool.query(
      "insert into admin_password_reset_tokens (admin_id, token_hash, expires_at, requested_ip) values ($1, $2, now() + ($3 * interval '1 second'), $4)",
      [id, tokenHash(token), INVITE_TOKEN_AGE, req.ip || null],
    );
    const siteUrl = (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
    await sendAdminInvite({
      name: target.name,
      email: target.email,
      roleName: target.roleName,
      setupUrl: `${siteUrl}/admin/reset-password?token=${encodeURIComponent(token)}`,
      invitedBy: req.admin.name,
    });
    await logAdminAccess(req.admin.id, `user.invite_resent:${id}`, req.ip);
    res.json({ message: "Invitation resent." });
  } catch (error) {
    if (error.message === "Email delivery is not configured.") {
      return res.status(503).json({ error: "Email is not configured. Set SMTP variables to send invitations." });
    }
    next(error);
  }
});

app.patch("/api/admin/users/:id", requirePermission("users"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid user ID." });
  const name = req.body?.name === undefined ? undefined : text(req.body.name, 120);
  const roleId = req.body?.roleId === undefined ? undefined : Number.parseInt(req.body.roleId, 10);
  const isActive = req.body?.isActive === undefined ? undefined : Boolean(req.body.isActive);
  if (name !== undefined && !name) return res.status(400).json({ error: "Name cannot be empty." });
  if (roleId !== undefined && (!Number.isSafeInteger(roleId) || roleId < 1)) return res.status(400).json({ error: "Invalid role." });
  try {
    const { rows: targets } = await pool.query(
      `select a.id, a.is_active as "isActive", coalesce(r.name, 'Owner') as "roleName", r.id as "roleId"
         from admins a
         left join admin_role_assignments x on x.admin_id = a.id
         left join roles r on r.id = x.role_id
        where a.id = $1`,
      [id],
    );
    const target = targets[0];
    if (!target) return res.status(404).json({ error: "User not found." });
    if (isActive === false && id === req.admin.id) return res.status(400).json({ error: "You cannot deactivate your own account." });

    let nextRoleName = target.roleName;
    if (roleId !== undefined) {
      const { rows: roles } = await pool.query("select id, name from roles where id = $1", [roleId]);
      if (!roles[0]) return res.status(400).json({ error: "Invalid role." });
      nextRoleName = roles[0].name;
      if (roles[0].name === "Owner" && req.admin.roleName !== "Owner") {
        return res.status(403).json({ error: "Only an Owner can assign the Owner role." });
      }
    }

    const demotingOwner = target.roleName === "Owner" && nextRoleName !== "Owner";
    const deactivatingOwner = target.roleName === "Owner" && isActive === false;
    if (demotingOwner || deactivatingOwner) {
      const ownersLeft = await activeOwnerCount(id);
      if (ownersLeft < 1) return res.status(400).json({ error: "At least one active Owner must remain." });
    }

    if (isActive === true && target.isActive === false) {
      const { rows: activeCount } = await pool.query("select count(*)::int as count from admins where is_active = true");
      if (activeCount[0].count >= MAX_ACTIVE_ADMINS) {
        return res.status(409).json({ error: `You can have at most ${MAX_ACTIVE_ADMINS} active admin users.` });
      }
    }

    const client = await pool.connect();
    try {
      await client.query("begin");
      if (name !== undefined) await client.query("update admins set name = $1, updated_at = now() where id = $2", [name, id]);
      if (isActive !== undefined) await client.query("update admins set is_active = $1, updated_at = now() where id = $2", [isActive, id]);
      if (roleId !== undefined) {
        await client.query(
          "insert into admin_role_assignments (admin_id, role_id) values ($1, $2) on conflict (admin_id) do update set role_id = excluded.role_id, assigned_at = now()",
          [id, roleId],
        );
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }

    if (isActive === false || roleId !== undefined) await revokeAdminSessions(id);
    const actions = [];
    if (name !== undefined) actions.push("name");
    if (roleId !== undefined) actions.push("role");
    if (isActive !== undefined) actions.push(isActive ? "activated" : "deactivated");
    if (actions.length) await logAdminAccess(req.admin.id, `user.updated:${id}:${actions.join(",")}`, req.ip);
    if (isActive === false) {
      let displayName = name;
      if (displayName === undefined) {
        const { rows: nameRows } = await pool.query("select name from admins where id = $1", [id]);
        displayName = nameRows[0]?.name || "User";
      }
      try {
        await notifyUserDeactivated(pool, { adminId: id, name: displayName });
      } catch (notifyError) {
        console.error("User deactivated notification failed:", notifyError.message);
      }
    }
    res.json({ message: "User updated." });
  } catch (error) {
    next(error);
  }
});

app.get("/api/settings/public", async (_req, res, next) => {
  try {
    res.json({ settings: await getPublicSettings(pool) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/settings", requirePermission("settings"), async (_req, res, next) => {
  try {
    const [baseSettings, integrations, integrationActivity] = await Promise.all([
      getSiteSettings(pool),
      buildIntegrationsAdminView(pool),
      listIntegrationActivity(pool),
    ]);
    const settings = await attachPricingToSettings(pool, baseSettings);
    res.json({ settings, integrations, integrationActivity });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/settings", requirePermission("settings"), async (req, res, next) => {
  try {
    const body = req.body || {};
    const sitePatch = { ...body };
    const hasNightlyRate = "nightlyRate" in sitePatch;
    const nightlyRate = sitePatch.nightlyRate;
    delete sitePatch.nightlyRate;

    let settings;
    if (Object.keys(sitePatch).length) {
      settings = await updateSiteSettings(pool, sitePatch, req.admin.id);
      await logSettingsIntegrationEvents(pool, sitePatch).catch((err) => {
        console.error("Integration activity log failed:", err.message);
      });
    } else {
      settings = await getSiteSettings(pool);
    }

    if (hasNightlyRate) {
      const rate = await setPropertyBaseRate(pool, nightlyRate);
      settings = { ...settings, nightlyRate: rate.nightlyRate, rateCurrency: rate.currency };
    } else {
      settings = await attachPricingToSettings(pool, settings);
    }

    const [integrations, integrationActivity] = await Promise.all([
      buildIntegrationsAdminView(pool),
      listIntegrationActivity(pool),
    ]);
    res.json({ settings, integrations, integrationActivity });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message, details: error.details });
    next(error);
  }
});

app.get("/api/social", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'select id,author_name as "authorName",author_photo_url as "authorPhotoUrl",entry_type as type,rating,body,featured,published_at as "publishedAt" from social_entries where status=\'published\' order by featured desc,published_at desc',
    );
    res.json({ entries: rows });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/social", requirePermission("settings"), async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select id, author_name as "authorName", author_photo_url as "authorPhotoUrl", entry_type as "entryType",
              rating, body, source, status, featured, published_at as "publishedAt", created_at as "createdAt"
         from social_entries order by created_at desc`,
    );
    res.json({ entries: rows });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/social", requirePermission("settings"), async (req, res, next) => {
  const body = req.body || {};
  const authorName = text(body.authorName, 120);
  const entryType = text(body.entryType, 20) || "review";
  const rating = body.rating != null ? Number(body.rating) : null;
  const entryBody = text(body.body, 4000);
  const status = text(body.status, 20) || "draft";
  const featured = Boolean(body.featured);
  const socialStatuses = ["draft", "published", "hidden"];
  const socialTypes = ["review", "comment"];
  if (!authorName || !entryBody || !socialTypes.includes(entryType) || !socialStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid review entry." });
  }
  try {
    const { rows } = await pool.query(
      `insert into social_entries (author_name, entry_type, rating, body, status, featured, published_at, created_by_admin_id)
       values ($1, $2, $3, $4, $5, $6, case when $5 = 'published' then now() else null end, $7)
       returning id`,
      [authorName, entryType, rating, entryBody, status, featured, req.admin.id],
    );
    res.status(201).json({ id: rows[0].id });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/social/:id", requirePermission("settings"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid entry." });
  const body = req.body || {};
  const fields = [];
  const values = [];
  const map = {
    authorName: "author_name",
    authorPhotoUrl: "author_photo_url",
    entryType: "entry_type",
    body: "body",
    status: "status",
    featured: "featured",
    rating: "rating",
  };
  for (const [key, col] of Object.entries(map)) {
    if (!(key in body)) continue;
    fields.push(`${col} = $${values.length + 1}`);
    values.push(key === "featured" ? Boolean(body[key]) : body[key]);
  }
  if (body.status === "published") {
    fields.push(`published_at = coalesce(published_at, now())`);
  }
  if (!fields.length) return res.status(400).json({ error: "Nothing to update." });
  values.push(id);
  try {
    const { rowCount } = await pool.query(
      `update social_entries set ${fields.join(", ")}, updated_at = now() where id = $${values.length}`,
      values,
    );
    if (!rowCount) return res.status(404).json({ error: "Entry not found." });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/social/:id", requirePermission("settings"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid entry." });
  try {
    const { rowCount } = await pool.query("delete from social_entries where id = $1", [id]);
    if (!rowCount) return res.status(404).json({ error: "Entry not found." });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/booking-requests/:id/status", requirePermission("bookings"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  const status = text(req.body?.status, 30);
  if (!Number.isSafeInteger(id) || id < 1 || !bookingRequestStatuses.includes(status)) return res.status(400).json({ error: "Invalid booking request update." });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const current = await client.query("select status from booking_requests where id = $1 for update", [id]);
    if (!current.rowCount) {
      await client.query("rollback");
      return res.status(404).json({ error: "Booking request not found." });
    }
    const fromStatus = current.rows[0].status;
    if (fromStatus !== status && !bookingStatusTransitions[fromStatus]?.includes(status)) {
      await client.query("rollback");
      return res.status(400).json({ error: `Cannot change a ${fromStatus.replaceAll("_", " ")} request to ${status.replaceAll("_", " ")}.` });
    }
    if (status === "confirmed") await ensureBookingForRequest(client, id);
    const updated = await client.query(
      'update booking_requests set status = $1, status_changed_at = now(), updated_at = now() where id = $2 returning id, status, status_changed_at as "statusChangedAt"',
      [status, id],
    );
    if (fromStatus !== status) {
      await client.query(
        "insert into booking_request_status_history (booking_request_id, from_status, to_status, changed_by_admin_id) values ($1, $2, $3, $4)",
        [id, fromStatus, status, req.admin.id],
      );
    }
    if (fromStatus !== status) await syncBookingStatusForRequest(client, id, status);
    await client.query("commit");
    if (fromStatus !== status && status === "confirmed") {
      const { rows: info } = await pool.query(
        "select name, arrive::text as arrive, depart::text as depart from booking_requests where id = $1",
        [id],
      );
      const row = info[0];
      if (row) {
        try {
          await notifyBookingConfirmed(pool, {
            requestId: id,
            guestName: row.name,
            arrive: row.arrive,
            depart: row.depart,
          });
        } catch (notifyError) {
          console.error("Booking confirmed notification failed:", notifyError.message);
        }
      }
    }
    res.json({ request: updated.rows[0] });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  } finally {
    client.release();
  }
});

app.get("/api/admin/bookings", requirePermission("bookings"), async (req, res, next) => {
  const query = text(req.query.q, 100);
  const status = text(req.query.status, 30);
  const from = text(req.query.from, 10);
  const to = text(req.query.to, 10);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
  const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
  if (status && !bookingRecordStatuses.includes(status)) return res.status(400).json({ error: "Invalid booking status." });
  if ((from && !isDay(from)) || (to && !isDay(to)) || (from && to && from > to)) return res.status(400).json({ error: "Invalid stay date range." });
  const clauses = [];
  const values = [];
  const add = (sql, value) => {
    values.push(value);
    clauses.push(sql.replace("?", `$${values.length}`));
  };
  if (status) add("b.status = ?", status);
  if (from) add("b.check_out > ?::date", from);
  if (to) add("b.check_in <= ?::date", to);
  if (query) {
    values.push(`%${query}%`);
    const parameter = `$${values.length}`;
    clauses.push(`(b.guest_name ilike ${parameter} or b.guest_email ilike ${parameter} or b.guest_phone ilike ${parameter} or cast(b.id as text) ilike ${parameter})`);
  }
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  try {
    const [list, total] = await Promise.all([
      pool.query(
        `select b.id, b.booking_request_id as "bookingRequestId", b.guest_name as "guestName", b.guest_email as "guestEmail", b.guest_phone as "guestPhone",
                b.source, b.check_in::text as "checkIn", b.check_out::text as "checkOut", b.guests, b.status, b.payment_status as "paymentStatus",
                b.total_amount as "totalAmount", b.created_at as "createdAt"
           from bookings b ${where}
           order by b.check_in desc
           limit $${values.length + 1} offset $${values.length + 2}`,
        [...values, limit, offset],
      ),
      pool.query(`select count(*)::int as count from bookings b ${where}`, values),
    ]);
    res.json({ bookings: list.rows, total: total.rows[0].count, limit, offset });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/bookings/movements", requirePermission("bookings"), async (req, res, next) => {
  const from = text(req.query.from, 10) || dayValue(new Date());
  const to = text(req.query.to, 10);
  if (!isDay(from)) return res.status(400).json({ error: "Invalid from date." });
  const toDay = isDay(to) ? to : from;
  try {
    const { rows } = await pool.query(
      `select b.id, b.booking_request_id as "bookingRequestId", b.guest_name as "guestName", b.guest_phone as "guestPhone",
              b.check_in::text as "checkIn", b.check_out::text as "checkOut", b.guests, b.status
         from bookings b
        where b.status in ('confirmed', 'checked_in', 'checked_out')
          and ((b.check_in >= $1::date and b.check_in <= $2::date) or (b.check_out >= $1::date and b.check_out <= $2::date))
        order by b.check_in, b.check_out`,
      [from, toDay],
    );
    const arrivals = rows.filter((row) => row.checkIn >= from && row.checkIn <= toDay);
    const departures = rows.filter((row) => row.checkOut >= from && row.checkOut <= toDay);
    res.json({ from, to: toDay, arrivals, departures });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/bookings", requirePermission("bookings"), async (req, res, next) => {
  const body = req.body || {};
  const entry = {
    name: text(body.name, 200),
    email: text(body.email, 200),
    phone: normalisedPhone(body.phone),
    guests: parseGuestCount(body.guests),
    checkIn: text(body.checkIn, 10),
    checkOut: text(body.checkOut, 10),
    source: text(body.source, 60) || "admin",
  };
  if (!entry.name || !isEmail(entry.email)) return res.status(400).json({ error: "Guest name and a valid email are required." });
  if (!isDay(entry.checkIn) || !isDay(entry.checkOut) || entry.checkOut <= entry.checkIn) return res.status(400).json({ error: "Please provide valid check-in and check-out dates." });
  const client = await pool.connect();
  try {
    await client.query("begin");
    if (await availabilityConflict(client, entry.checkIn, entry.checkOut)) {
      await client.query("rollback");
      return res.status(409).json({ error: "Those dates conflict with an existing stay or block." });
    }
    const { nightly, total } = await estimateStayTotal(client, entry.checkIn, entry.checkOut);
    const { rows } = await client.query(
      `insert into bookings (guest_name, guest_email, guest_phone, source, check_in, check_out, guests, status, nightly_rate, total_amount, payment_status)
       values ($1, $2, $3, $4, $5::date, $6::date, $7, 'confirmed', $8, $9, 'unpaid')
       returning id`,
      [entry.name, entry.email, entry.phone || null, entry.source, entry.checkIn, entry.checkOut, entry.guests, nightly, total],
    );
    await client.query("commit");
    res.status(201).json({ id: rows[0].id });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
});

app.patch("/api/admin/bookings/:id/status", requirePermission("bookings"), async (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  const status = text(req.body?.status, 30);
  if (!Number.isSafeInteger(id) || id < 1 || !bookingRecordStatuses.includes(status)) return res.status(400).json({ error: "Invalid booking update." });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const current = await client.query('select status, booking_request_id as "requestId" from bookings where id = $1 for update', [id]);
    if (!current.rowCount) {
      await client.query("rollback");
      return res.status(404).json({ error: "Booking not found." });
    }
    const fromStatus = current.rows[0].status;
    if (fromStatus !== status && !bookingRecordTransitions[fromStatus]?.includes(status)) {
      await client.query("rollback");
      return res.status(400).json({ error: `Cannot change booking from ${fromStatus} to ${status}.` });
    }
    const statusExtra = status === "checked_in" ? ", checked_in_at = coalesce(checked_in_at, now())" : "";
    const updated = await client.query(
      `update bookings set status = $1, updated_at = now()${statusExtra} where id = $2 returning id, status, booking_request_id as "bookingRequestId"`,
      [status, id],
    );
    const requestId = current.rows[0].requestId;
    const requestMap = { checked_in: "checked_in", checked_out: "checked_out", cancelled: "cancelled", confirmed: "confirmed" };
    if (requestId && requestMap[status]) {
      await client.query("update booking_requests set status = $1, status_changed_at = now(), updated_at = now() where id = $2", [requestMap[status], requestId]);
    }
    await client.query("commit");
    res.json({ booking: updated.rows[0] });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
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
    let confirmationEmailSent = false;
    let adminNotificationSent = false;
    try {
      await sendEnquiryConfirmation(pool, entry);
      confirmationEmailSent = true;
    } catch (emailError) {
      console.error("Customer enquiry confirmation could not be sent:", emailError.message);
    }
    try {
      await sendAdminEnquiryNotification(pool, { ...entry, id: rows[0].id });
      adminNotificationSent = true;
    } catch (emailError) {
      console.error("Admin enquiry notification could not be sent:", emailError.message);
    }
    try {
      await notifyEnquiryNew(pool, { ...entry, id: rows[0].id });
    } catch (notifyError) {
      console.error("Admin enquiry in-app notification failed:", notifyError.message);
    }
    res.status(201).json({ id: rows[0].id, confirmationEmailSent, adminNotificationSent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "We could not save your message. Please try again." });
  }
});

app.post("/api/bookings", async (req, res) => {
  const body = req.body || {};
  const offerIdRaw = body.offerId != null ? Number.parseInt(body.offerId, 10) : null;
  const entry = {
    name: text(body.name, 200),
    email: normalisedEmail(body.email),
    phone: text(body.phone, 50),
    note: text(body.note, 2000),
    guests: text(body.guests, 10),
    arrive: text(body.arrive, 10),
    depart: text(body.depart, 10),
    offerId: Number.isInteger(offerIdRaw) && offerIdRaw > 0 ? offerIdRaw : null,
  };
  if (!entry.name || !isEmail(entry.email) || !isInternationalPhone(entry.phone)) return res.status(400).json({ error: "Please add your name, a valid email address, and a phone number with a country code." });
  if (!isDay(entry.arrive) || !isDay(entry.depart) || entry.depart <= entry.arrive) return res.status(400).json({ error: "Please select valid arrival and departure dates." });
  try {
    await validateBookingAgainstSettings(pool, entry);
  } catch (error) {
    return res.status(error.status || 400).json({ error: error.message });
  }
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { request, quote } = await createCheckoutRequest(client, entry);
    await client.query("commit");
    try {
      await notifyBookingRequestNew(pool, {
        id: request.id,
        arrive: entry.arrive,
        depart: entry.depart,
      });
    } catch (notifyError) {
      console.error("Booking request in-app notification failed:", notifyError.message);
    }
    res.status(201).json({
      id: request.id,
      paymentOrderId: request.paymentOrderId,
      quote,
      payhereReady: payhereConfigured(),
    });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    if (error.status === 400 || error.status === 409) {
      return res.status(error.status).json({ error: error.message, code: error.code || "bad_request" });
    }
    console.error(error);
    res.status(500).json({ error: "We could not start your booking. Please try again." });
  } finally {
    client.release();
  }
});

app.post("/api/guest/setup-token", async (req, res, next) => {
  const email = normalisedEmail(req.body?.email);
  if (!isEmail(email)) return res.status(400).json({ error: "Enter a valid email." });
  try {
    const { rowCount } = await pool.query(
      "select 1 from bookings where guest_email = $1 and payment_status in ('partial', 'paid') limit 1",
      [email],
    );
    if (!rowCount) return res.status(404).json({ error: "No confirmed booking found for this email." });
    const token = await issueGuestSetupToken(pool, email);
    res.json({ ok: true, setupPath: `/account/setup?token=${encodeURIComponent(token)}` });
  } catch (error) {
    next(error);
  }
});

if (process.env.NODE_ENV !== "production") {
  app.get("/api/dev/email-previews/booking-guest", async (_req, res, next) => {
    try {
      let ctx = contactFromSettings(await getSiteSettings(pool));
      const booking = {
        guestName: "Priya Mendis",
        guestEmail: "priya.mendis@example.com",
        checkIn: "14 March 2026",
        checkOut: "17 March 2026",
        guests: "6 guests",
        total: 285000,
        depositPaid: 85500,
        balanceDue: 199500,
        accountUrl: `${(process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "")}/account/setup?token=preview`,
        checkInUrl: `${(process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "")}/check-in/preview-token`,
      };
      let html = renderBookingConfirmationPreviewHtml(booking, ctx);
      html = html.replace(
        'src="cid:booking-qr"',
        'src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=preview-check-in"',
      );
      res.type("html").send(html);
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/dev/email-previews/booking-admin", (_req, res) => {
    const site = (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
    const html = renderBookingAdminNotificationPreviewHtml({
      requestId: 1042,
      bookingId: 88,
      guestName: "Priya Mendis",
      guestEmail: "priya.mendis@example.com",
      guestPhone: "+94 77 123 4567",
      checkIn: "14 Mar 2026",
      checkOut: "17 Mar 2026",
      total: 285000,
      depositPaid: 85500,
      checkInUrl: `${site}/check-in/preview-token`,
    });
    res.type("html").send(html);
  });
}

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

app.use((error, req, res, _next) => {
  console.error(`[API ERROR] ${req.method} ${req.originalUrl}`, error.stack || error);
  if (!res.headersSent) res.status(500).json({ error: "Unexpected server error. Check the API terminal output." });
});

const hashed = /-[A-Za-z0-9_-]{8}\.(js|css)$/;
app.use(express.static(root, {
  index: false,
  setHeaders(res, file) {
    res.setHeader("Cache-Control", hashed.test(file) ? "public, max-age=31536000, immutable" : "no-cache");
  },
}));
app.get("/{*path}", (_req, res) => res.sendFile(path.join(root, "index.html")));

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception — API will exit:", error);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("SIGTERM", () => console.warn("API received SIGTERM and is shutting down."));
process.on("SIGINT", () => console.warn("API received SIGINT and is shutting down."));
process.on("exit", (code) => console.warn(`API process exited with code ${code}.`));

const server = app.listen(port, () => console.log(`Mistwood Residence listening on ${port}`));
server.on("error", (error) => { console.error("API server failed to listen:", error); process.exit(1); });
migrate().catch((error) => { console.error("FATAL: database startup failed:", error.stack || error); process.exit(1); });
