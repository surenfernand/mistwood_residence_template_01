import { getSiteSettings } from "./site-settings.js";

/** Legacy env-only snapshot (kept for callers that do not need DB). */
export function integrationStatus() {
  const publicSiteUrl = (process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
  return {
    payhere: Boolean(process.env.PAYHERE_MERCHANT_ID && process.env.PAYHERE_MERCHANT_SECRET),
    smtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
    resend: Boolean(process.env.RESEND_API_KEY),
    publicSiteUrl: publicSiteUrl || null,
    payhereMode: process.env.PAYHERE_MODE === "live" ? "live" : "sandbox",
  };
}

export async function buildIntegrationsAdminView(pool) {
  const env = integrationStatus();
  let settings = null;
  try {
    settings = await getSiteSettings(pool);
  } catch {
    settings = {};
  }

  const socialUrls = [
    settings?.facebookUrl,
    settings?.instagramUrl,
    settings?.youtubeUrl,
    settings?.telegramUrl,
  ].filter(Boolean);

  const emailConfigured = env.smtp || env.resend;
  const emailMode = env.resend ? "Resend" : env.smtp ? "SMTP" : "Not configured";

  const googleConnected = Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID
    && (process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || process.env.GOOGLE_CALENDAR_ACCESS_TOKEN),
  );

  return {
    payhere: {
      configured: env.payhere,
      mode: env.payhereMode === "live" ? "Live" : "Sandbox",
    },
    email: {
      configured: emailConfigured,
      mode: emailMode,
    },
    googleCalendar: {
      connected: googleConnected,
    },
    metaSocial: {
      optional: true,
      configured: socialUrls.length > 0,
      linkedCount: socialUrls.length,
    },
    publicSiteUrl: env.publicSiteUrl,
  };
}

export async function listIntegrationActivity(pool, limit = 50) {
  const { rows } = await pool.query(
    `select id, status, service, message, created_at as "createdAt"
     from integration_activity
     order by created_at desc
     limit $1`,
    [Math.min(Math.max(limit, 1), 100)],
  );
  return rows;
}

export async function recordIntegrationActivity(pool, { status = "info", service, message }) {
  if (!service || !message) return null;
  const allowed = ["success", "warning", "error", "info"];
  const safeStatus = allowed.includes(status) ? status : "info";
  const { rows } = await pool.query(
    `insert into integration_activity (status, service, message)
     values ($1, $2, $3)
     returning id, status, service, message, created_at as "createdAt"`,
    [safeStatus, String(service).slice(0, 120), String(message).slice(0, 500)],
  );
  return rows[0];
}

const SOCIAL_PATCH_KEYS = ["facebookUrl", "instagramUrl", "youtubeUrl", "telegramUrl"];
const NOTIFY_PATCH_KEYS = [
  "sendCustomerBookingEmail",
  "sendAdminBookingEmail",
  "adminAlertEmail",
  "mailFromName",
];

/** Log integration-relevant events after a settings patch (non-blocking for caller). */
export async function logSettingsIntegrationEvents(pool, patch) {
  if (!patch || typeof patch !== "object") return;

  if (SOCIAL_PATCH_KEYS.some((key) => key in patch)) {
    await recordIntegrationActivity(pool, {
      status: "success",
      service: "Meta & social",
      message: "Social channel URLs updated in website settings.",
    });
  }

  if (NOTIFY_PATCH_KEYS.some((key) => key in patch)) {
    await recordIntegrationActivity(pool, {
      status: "success",
      service: "Email delivery",
      message: "Notification / email delivery settings updated.",
    });
  }

  if ("contactEmail" in patch || "contactPhone" in patch) {
    await recordIntegrationActivity(pool, {
      status: "info",
      service: "Email delivery",
      message: "Property contact details updated (used in guest emails).",
    });
  }
}

export async function logPayhereEvent(pool, message, status = "success") {
  await recordIntegrationActivity(pool, {
    status,
    service: "PayHere",
    message,
  });
}
