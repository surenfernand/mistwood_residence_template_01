import { createSettingsUiState } from "../data/settingsUiMock.js";

function phoneFromWhatsappUrl(url) {
  if (!url) return "";
  const match = String(url).match(/wa\.me\/(\d+)/i);
  if (match) return `+${match[1]}`;
  return String(url);
}

export function whatsappUrlFromPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

/** Map API `settings` object into admin Settings UI state. */
export function apiSettingsToUiState(api) {
  const base = createSettingsUiState();
  if (!api) return base;

  return {
    ...base,
    general: {
      ...base.general,
      logoUrl: api.logoUrl || base.general.logoUrl,
      propertyName: api.propertyName ?? base.general.propertyName,
      tagline: api.tagline ?? base.general.tagline,
      description: api.propertyDescription ?? base.general.description,
      email: api.contactEmail ?? base.general.email,
      phone: api.contactPhone ?? base.general.phone,
      whatsapp: phoneFromWhatsappUrl(api.whatsappUrl) || base.general.whatsapp,
      address: api.publicAddress ?? base.general.address,
    },
    booking: {
      ...base.booking,
      nightlyRate: api.nightlyRate ?? base.booking.nightlyRate,
      rateCurrency: api.rateCurrency ?? base.booking.rateCurrency,
      minNights: api.minNights ?? base.booking.minNights,
      maxNights: api.maxNights ?? base.booking.maxNights,
      maxGuests: api.maxGuests ?? base.booking.maxGuests,
      advanceBookingDays: api.advanceBookingDays ?? base.booking.advanceBookingDays,
      checkInTime: api.checkInTime ?? base.booking.checkInTime,
      checkOutTime: api.checkOutTime ?? base.booking.checkOutTime,
      depositPercent: api.depositPercent ?? base.booking.depositPercent,
      sameDayBooking: api.sameDayBooking ?? base.booking.sameDayBooking,
      leadTimeHours: api.leadTimeHours ?? base.booking.leadTimeHours,
      requireDeposit: api.requireDeposit ?? base.booking.requireDeposit,
      cancellationPolicy: api.cancellationPolicy ?? base.booking.cancellationPolicy,
    },
    notifications: {
      ...base.notifications,
      adminAlertEmail: api.adminAlertEmail ?? base.notifications.adminAlertEmail,
      senderName: api.mailFromName ?? base.notifications.senderName,
      guestBookingConfirmation: api.sendCustomerBookingEmail ?? base.notifications.guestBookingConfirmation,
      adminNewBooking: api.sendAdminBookingEmail ?? base.notifications.adminNewBooking,
    },
    website: {
      ...base.website,
      facebook: api.facebookUrl || "",
      instagram: api.instagramUrl || "",
      youtube: api.youtubeUrl || "",
      telegram: api.telegramUrl || "",
    },
  };
}

/** Flatten persisted UI draft into API camelCase fields. */
export function uiDraftToApiFields(draft) {
  const g = draft.general;
  const b = draft.booking;
  const n = draft.notifications;
  const w = draft.website;

  return {
    logoUrl: g.logoUrl,
    propertyName: g.propertyName,
    tagline: g.tagline,
    propertyDescription: g.description,
    contactEmail: g.email,
    contactPhone: g.phone,
    whatsappUrl: whatsappUrlFromPhone(g.whatsapp),
    publicAddress: g.address,
    nightlyRate: b.nightlyRate,
    minNights: b.minNights,
    maxNights: b.maxNights,
    maxGuests: b.maxGuests,
    advanceBookingDays: b.advanceBookingDays,
    checkInTime: b.checkInTime,
    checkOutTime: b.checkOutTime,
    depositPercent: b.depositPercent,
    sameDayBooking: b.sameDayBooking,
    leadTimeHours: b.leadTimeHours,
    requireDeposit: b.requireDeposit,
    cancellationPolicy: b.cancellationPolicy,
    adminAlertEmail: n.adminAlertEmail,
    mailFromName: n.senderName,
    sendCustomerBookingEmail: n.guestBookingConfirmation,
    sendAdminBookingEmail: n.adminNewBooking,
    facebookUrl: w.facebook || null,
    instagramUrl: w.instagram || null,
    youtubeUrl: w.youtube || null,
    telegramUrl: w.telegram || null,
  };
}

function settingsValuesEqual(key, a, b) {
  if (key === "nightlyRate" || key === "depositPercent") {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na === nb;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

export function diffApiSettings(baselineApi, draftUi) {
  const next = uiDraftToApiFields(draftUi);
  const patch = {};
  for (const [key, value] of Object.entries(next)) {
    if (key === "nightlyRate" && !Number.isFinite(Number(value))) continue;
    if (!settingsValuesEqual(key, baselineApi?.[key], value)) {
      patch[key] = value;
    }
  }
  return patch;
}
