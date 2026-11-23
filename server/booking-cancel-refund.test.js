import assert from "node:assert/strict";
import test from "node:test";
import { validateCancelAndRefundEligibility, idempotencyKeyForRequest } from "./booking-cancel-refund.js";
import { payhereRefundConfigured } from "./payhere-refund.js";

test("validateCancelAndRefundEligibility rejects non-website bookings", () => {
  const message = validateCancelAndRefundEligibility({
    requestStatus: "confirmed",
    bookingStatus: "confirmed",
    source: "phone",
    payment: { id: 1 },
    acceptedRefund: null,
  });
  assert.equal(message, "Cancel and refund is only available for website bookings.");
});

test("validateCancelAndRefundEligibility rejects when not confirmed", () => {
  const message = validateCancelAndRefundEligibility({
    requestStatus: "checked_in",
    bookingStatus: "checked_in",
    source: "website",
    payment: { id: 1 },
    acceptedRefund: null,
  });
  assert.match(message, /confirmed/);
});

test("validateCancelAndRefundEligibility rejects missing PayHere deposit", () => {
  const message = validateCancelAndRefundEligibility({
    requestStatus: "confirmed",
    bookingStatus: "confirmed",
    source: "website",
    payment: null,
    acceptedRefund: null,
  });
  assert.equal(message, "No verified PayHere deposit was found for this booking.");
});

test("validateCancelAndRefundEligibility rejects duplicate refunds", () => {
  const message = validateCancelAndRefundEligibility({
    requestStatus: "confirmed",
    bookingStatus: "confirmed",
    source: "website",
    payment: { id: 1 },
    acceptedRefund: { id: 9 },
  });
  assert.equal(message, "A refund has already been recorded for this payment.");
});

test("validateCancelAndRefundEligibility accepts eligible paid website booking", () => {
  const message = validateCancelAndRefundEligibility({
    requestStatus: "confirmed",
    bookingStatus: "confirmed",
    source: "website",
    payment: { id: 1 },
    acceptedRefund: null,
  });
  assert.equal(message, null);
});

test("idempotency key is stable per booking request", () => {
  assert.equal(idempotencyKeyForRequest(12), "br-12-cancel-refund");
});

test("payhereRefundConfigured follows env presence", () => {
  const priorId = process.env.PAYHERE_APP_ID;
  const priorSecret = process.env.PAYHERE_APP_SECRET;
  delete process.env.PAYHERE_APP_ID;
  delete process.env.PAYHERE_APP_SECRET;
  assert.equal(payhereRefundConfigured(), false);
  process.env.PAYHERE_APP_ID = priorId;
  process.env.PAYHERE_APP_SECRET = priorSecret;
});