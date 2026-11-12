import crypto from "node:crypto";

const SANDBOX = "https://sandbox.payhere.lk/pay/checkout";
const LIVE = "https://www.payhere.lk/pay/checkout";

export function payhereCheckoutUrl() {
  return process.env.PAYHERE_MODE === "live" ? LIVE : SANDBOX;
}

export function payhereConfigured() {
  return Boolean(process.env.PAYHERE_MERCHANT_ID && process.env.PAYHERE_MERCHANT_SECRET);
}

function siteUrl() {
  return (process.env.PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
}

export function payhereHash({ merchantId, orderId, amount, currency, merchantSecret }) {
  const inner = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const payload = `${merchantId}${orderId}${amount}${currency}${inner}`;
  return crypto.createHash("md5").update(payload).digest("hex").toUpperCase();
}

export function verifyPayhereNotify(body, merchantSecret) {
  const received = String(body.md5sig || "").toUpperCase();
  const inner = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const payload = [
    body.merchant_id,
    body.order_id,
    body.payhere_amount,
    body.payhere_currency,
    body.status_code,
    inner,
  ].join("");
  const expected = crypto.createHash("md5").update(payload).digest("hex").toUpperCase();
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export function buildPayhereFields({
  orderId,
  amount,
  currency,
  items,
  firstName,
  lastName,
  email,
  phone,
  custom1,
  custom2,
  returnPath = "/contact?payment=return",
  cancelPath = "/contact?payment=cancel",
}) {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  const base = siteUrl();
  const formattedAmount = Number(amount).toFixed(2);
  const hash = payhereHash({
    merchantId,
    orderId,
    amount: formattedAmount,
    currency,
    merchantSecret,
  });
  return {
    sandbox: process.env.PAYHERE_MODE !== "live",
    merchant_id: merchantId,
    return_url: `${base}${returnPath}`,
    cancel_url: `${base}${cancelPath}`,
    notify_url: `${base}/api/payments/payhere/notify`,
    order_id: orderId,
    items: items || "Mistwood Residence stay",
    currency,
    amount: formattedAmount,
    first_name: firstName || "Guest",
    last_name: lastName || "Stay",
    email,
    phone: phone || "",
    address: "Nuwara Eliya",
    city: "Nuwara Eliya",
    country: "Sri Lanka",
    custom_1: String(custom1 || ""),
    custom_2: String(custom2 || ""),
    hash,
  };
}
