/**
 * PayHere Merchant Refund API (OAuth + POST /merchant/v1/payment/refund).
 * @see https://support.payhere.lk/api-&-mobile-sdk/refund-api
 */

let cachedAccessToken = null;
let accessTokenExpiresAt = 0;

function merchantApiBase() {
  return process.env.PAYHERE_MODE === "live" ? "https://www.payhere.lk" : "https://sandbox.payhere.lk";
}

function appId() {
  return String(process.env.PAYHERE_APP_ID || "").trim();
}

function appSecret() {
  return String(process.env.PAYHERE_APP_SECRET || "").trim();
}

export function payhereRefundConfigured() {
  return Boolean(appId() && appSecret());
}

async function fetchAccessToken() {
  const now = Date.now();
  if (cachedAccessToken && now < accessTokenExpiresAt - 30_000) {
    return cachedAccessToken;
  }
  const basic = Buffer.from(`${appId()}:${appSecret()}`, "utf8").toString("base64");
  const response = await fetch(`${merchantApiBase()}/merchant/v1/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw Object.assign(new Error(data.error_description || data.error || "Could not obtain PayHere access token."), {
      status: 503,
    });
  }
  cachedAccessToken = data.access_token;
  accessTokenExpiresAt = now + (Number(data.expires_in) || 300) * 1000;
  return cachedAccessToken;
}

/**
 * @param {{ paymentId: string, description: string, amount?: number }} input
 * @returns {Promise<{ status: number, msg: string, data: string | number | null, test?: boolean }>}
 */
export async function issuePayhereRefund({ paymentId, description, amount }) {
  const testBypass = process.env.PAYHERE_TEST_BYPASS === "true";
  if (!payhereRefundConfigured()) {
    if (testBypass) {
      return {
        status: 1,
        msg: "Successfully processed the refund",
        data: `test-refund-${paymentId}`,
        test: true,
      };
    }
    throw Object.assign(new Error("PayHere refund API is not configured (PAYHERE_APP_ID / PAYHERE_APP_SECRET)."), {
      status: 503,
    });
  }

  const attempt = async (retry) => {
    const token = await fetchAccessToken();
    const body = { payment_id: String(paymentId), description: String(description || "Booking cancelled") };
    if (amount != null && Number.isFinite(Number(amount))) {
      body.amount = Number(amount).toFixed(2);
    }
    const response = await fetch(`${merchantApiBase()}/merchant/v1/payment/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (data.error === "invalid_token" && retry) {
      cachedAccessToken = null;
      accessTokenExpiresAt = 0;
      return attempt(false);
    }
    if (!response.ok || Number(data.status) !== 1) {
      throw Object.assign(
        new Error(data.msg || data.error_description || "PayHere rejected the refund request."),
        { status: 502, payhere: data },
      );
    }
    return data;
  };

  return attempt(true);
}

export function clearPayhereRefundTokenCache() {
  cachedAccessToken = null;
  accessTokenExpiresAt = 0;
}