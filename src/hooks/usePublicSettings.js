import { useEffect, useState } from "react";

let cached = null;
let inflight = null;

const DEFAULTS = {
  propertyName: "Mistwood Residence",
  logoUrl: "/assets/mistwood/branding/logo.png",
  tagline: "Where Tea Hills Meet Modern Comfort",
  propertyDescription:
    "Set in the cool highlands of Nuwara Eliya, Mistwood Residence offers a peaceful stay surrounded by tea estates, forest trails, and lake walks.",
  contactEmail: "fernandosuren6@gmail.com",
  contactPhone: "+94 76 590 0800",
  whatsappUrl: "https://wa.me/94765900800",
  publicAddress: "Nuwara Eliya, Sri Lanka",
  footerTagline: "One apartment in Nuwara Eliya, reserved as a whole for your group.",
  minNights: 1,
  maxNights: 30,
  maxGuests: 8,
  advanceBookingDays: 365,
  checkInTime: "14:00",
  checkOutTime: "11:00",
  depositPercent: 30,
  sameDayBooking: true,
  leadTimeHours: 2,
  requireDeposit: true,
  cancellationPolicy:
    "Free cancellation up to 3 days before check-in. Cancellations made within 3 days of check-in are charged 100% of the first night.",
  facebookUrl: "https://www.facebook.com/share/19u5hKB7DJ/",
};

export function clearPublicSettingsCache() {
  cached = null;
  inflight = null;
}

export function usePublicSettings() {
  const [settings, setSettings] = useState(cached || DEFAULTS);

  useEffect(() => {
    if (cached) {
      setSettings(cached);
      return;
    }
    if (!inflight) {
      inflight = fetch("/api/settings/public")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          cached = { ...DEFAULTS, ...data.settings };
          return cached;
        })
        .catch(() => DEFAULTS)
        .finally(() => {
          inflight = null;
        });
    }
    inflight?.then((value) => {
      setSettings(value);
    });
  }, []);

  return settings;
}
