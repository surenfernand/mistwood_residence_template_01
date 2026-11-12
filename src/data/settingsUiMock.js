/** UI-only defaults for admin Settings screens (not persisted until wired). */

export const SETTINGS_TABS = [
  { id: "general", label: "General" },
  { id: "booking", label: "Booking" },
  { id: "notifications", label: "Notifications" },
  { id: "website", label: "Website & reviews" },
  { id: "integrations", label: "Integrations" },
];

export const SETTINGS_TAB_INTROS = {
  general: {
    kicker: "Settings",
    title: "General Settings",
    subtitle: "Manage your property details, contact information, and regional preferences.",
    hero: "/assets/mistwood/backgrounds/tea-sunrise.jpg",
  },
  booking: {
    kicker: "Settings",
    title: "Booking Settings",
    subtitle: "Control availability, stay rules, and guest booking requirements.",
    hero: "/assets/mistwood/backgrounds/tea-sunrise.jpg",
  },
  notifications: {
    kicker: "Settings",
    title: "Notification Settings",
    subtitle: "Choose which messages are sent and where they are delivered.",
    hero: "/assets/mistwood/decorations/leaf-branch.png",
    heroFit: "contain",
  },
  website: {
    kicker: "Settings",
    title: "Website & Reviews",
    subtitle: "Manage your website links, social proof, and guest feedback.",
    hero: "/assets/mistwood/backgrounds/tea-sunrise.jpg",
  },
  integrations: {
    kicker: "Settings",
    title: "Integrations",
    subtitle: "Connect the services that keep Mistwood Residence running.",
    hero: "/assets/mistwood/decorations/leaf-branch.png",
    heroFit: "contain",
  },
};

export function createSettingsUiState() {
  return {
    general: {
      logoUrl: "/assets/mistwood/branding/logo.png",
      propertyName: "Mistwood Residence",
      tagline: "A Boutique Retreat in the Tea Hills",
      description:
        "Set in the cool highlands of Nuwara Eliya, Mistwood Residence offers a peaceful stay surrounded by tea estates, forest trails, and lake walks.",
      email: "stay@mistwoodresidence.com",
      phone: "+94 81 234 5678",
      whatsapp: "+94 77 987 6543",
      address: "No. 12, Tea Hill Road, Haputale, Sri Lanka 90160",
      timezone: "Asia/Colombo",
      dateFormat: "DD MMM YYYY",
      currency: "LKR",
      language: "en",
    },
    booking: {
      minNights: 1,
      maxNights: 30,
      maxGuests: 6,
      advanceBookingDays: 365,
      sameDayBooking: true,
      leadTimeHours: 2,
      checkInTime: "15:00",
      checkOutTime: "11:00",
      requireDeposit: true,
      depositPercent: 30,
      cancellationPolicy:
        "Free cancellation up to 3 days before check-in. Cancellations made within 3 days of check-in are charged 100% of the first night.",
    },
    notifications: {
      adminAlertEmail: "admin@mistwoodresidence.com",
      replyToEmail: "replies@mistwoodresidence.com",
      senderName: "Mistwood Residence",
      guestBookingConfirmation: true,
      paymentReceipt: true,
      checkInReminder: true,
      adminNewBooking: true,
      adminPaymentPending: true,
      adminGuestEnquiry: true,
      inAppBell: true,
      digestFrequency: "daily",
    },
    website: {
      facebook: "https://facebook.com/mistwoodresidence",
      instagram: "https://instagram.com/mistwoodresidence",
      youtube: "https://youtube.com/@mistwoodresidence",
      telegram: "https://t.me/mistwoodresidence",
      reviewsStats: { average: 4.9, published: 128, featured: 24, draft: 6 },
      reviewSearch: "",
      reviewStatus: "all",
      reviewRating: "all",
      reviewFeatured: "all",
      reviews: [
        {
          id: 1,
          guest: "Emma Carter",
          initials: "EC",
          date: "Oct 20, 2024",
          rating: 5,
          excerpt: "A truly peaceful stay. The rooms are beautiful, and the staff were incredibly warm and attentive. We'll definitely be back!",
          status: "published",
          featured: true,
        },
        {
          id: 2,
          guest: "James Rodriguez",
          initials: "JR",
          date: "Sep 12, 2024",
          rating: 5,
          excerpt: "Loved the tea-country views and the easy walk to Gregory Lake. Breakfast was a highlight every morning.",
          status: "published",
          featured: true,
        },
        {
          id: 3,
          guest: "Sanjaya Perera",
          initials: "SP",
          date: "Aug 3, 2024",
          rating: 4.5,
          excerpt: "Quiet, comfortable, and spotless. Perfect base for Horton Plains and nearby waterfalls.",
          status: "draft",
          featured: false,
        },
      ],
      previewIndex: 0,
    },
    integrations: {
      activityFilter: "all",
    },
  };
}

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Colombo", label: "(GMT+05:30) Sri Lanka Standard Time" },
];

export const DATE_FORMAT_OPTIONS = [
  { value: "DD MMM YYYY", label: "DD MMM YYYY (e.g., 26 Jan 2025)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (e.g., 2025-01-26)" },
];

export const CURRENCY_OPTIONS = [
  { value: "LKR", label: "LKR — Sri Lankan Rupee (Rs)" },
  { value: "USD", label: "USD — US Dollar ($)" },
];

export const LANGUAGE_OPTIONS = [{ value: "en", label: "English" }];

export const CHECK_IN_OPTIONS = [
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

export const CHECK_OUT_OPTIONS = ["10:00", "10:30", "11:00", "11:30", "12:00"];

export const DIGEST_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "daily", label: "Daily digest" },
  { value: "weekly", label: "Weekly digest" },
];
