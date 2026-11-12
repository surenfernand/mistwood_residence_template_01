import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);
export const GUEST_SESSION_COOKIE = "mistwood_guest_session";
const GUEST_SESSION_AGE = 30 * 24 * 60 * 60;
const SETUP_TOKEN_AGE = 7 * 24 * 60 * 60;

const tokenHash = (token) => crypto.createHash("sha256").update(token).digest("hex");

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return scrypt(password, salt, 64).then((derived) => `scrypt$${salt}$${Buffer.from(derived).toString("hex")}`);
}

export async function verifyPassword(password, stored) {
  const [algorithm, salt, encoded] = String(stored).split("$");
  if (algorithm !== "scrypt" || !salt || !encoded) return false;
  const derived = Buffer.from(await scrypt(password, salt, 64));
  const expected = Buffer.from(encoded, "hex");
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

export function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || "").split(";").map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }).filter((part) => part.length));
}

export function setGuestSessionCookie(response, token, maxAge = GUEST_SESSION_AGE) {
  response.cookie(GUEST_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAge * 1000,
    path: "/",
  });
}

export function clearGuestSessionCookie(response) {
  response.clearCookie(GUEST_SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function currentGuest(pool, request) {
  const token = parseCookies(request)[GUEST_SESSION_COOKIE];
  if (!token || token.length < 40) return null;
  const { rows } = await pool.query(
    `select g.id, g.email, g.name, g.phone, s.id as session_id
       from guest_sessions s
       join guest_users g on g.id = s.guest_user_id
      where s.token_hash = $1 and s.expires_at > now()`,
    [tokenHash(token)],
  );
  return rows[0] || null;
}

export async function startGuestSession(pool, guestId, request, response) {
  const token = crypto.randomBytes(32).toString("base64url");
  await pool.query(
    "insert into guest_sessions (guest_user_id, token_hash, expires_at, user_agent, ip_address) values ($1, $2, now() + ($3 * interval '1 second'), $4, $5)",
    [guestId, tokenHash(token), GUEST_SESSION_AGE, request.get("user-agent")?.slice(0, 500) || null, request.ip || null],
  );
  setGuestSessionCookie(response, token);
  return token;
}

export async function issueGuestSetupToken(pool, email) {
  const token = crypto.randomBytes(32).toString("base64url");
  await pool.query(
    "insert into guest_setup_tokens (email, token_hash, expires_at) values ($1, $2, now() + ($3 * interval '1 second'))",
    [email.toLowerCase(), tokenHash(token), SETUP_TOKEN_AGE],
  );
  return token;
}

export { tokenHash as guestTokenHash, SETUP_TOKEN_AGE, GUEST_SESSION_AGE };
