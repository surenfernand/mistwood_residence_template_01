export function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Build E.164-style +number from a dial prefix and local number (no country code in local). */
export function buildInternationalPhone(dialCode, nationalNumber) {
  const dial = phoneDigits(dialCode);
  let local = phoneDigits(nationalNumber);
  if (!dial || !local) return "";
  if (local.startsWith("0")) local = local.replace(/^0+/, "");
  return `+${dial}${local}`;
}

export function isInternationalPhone(value) {
  return /^\+[1-9]\d{7,14}$/.test(String(value || "").replace(/[\s().-]/g, ""));
}