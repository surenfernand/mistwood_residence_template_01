const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: 22,
  height: 22,
  "aria-hidden": true,
};

export function IconBuilding() {
  return (
    <svg {...stroke}>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function IconMail() {
  return (
    <svg {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconGlobe() {
  return (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg {...stroke}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </svg>
  );
}

export function IconUsers() {
  return (
    <svg {...stroke}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-2a5 5 0 0 1 10 0v2M16 8a3 3 0 0 1 0 6M19 21v-2a5 5 0 0 0-3-4.6" />
    </svg>
  );
}

export function IconShield() {
  return (
    <svg {...stroke}>
      <path d="M12 3 20 6v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3Z" />
    </svg>
  );
}

export function IconBell() {
  return (
    <svg {...stroke}>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" />
    </svg>
  );
}

export function IconLink() {
  return (
    <svg {...stroke}>
      <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
    </svg>
  );
}

export function IconMessage() {
  return (
    <svg {...stroke}>
      <path d="M21 14a4 4 0 0 1-4 4H8l-5 3V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

export function IconEye() {
  return (
    <svg {...stroke}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconCard() {
  return (
    <svg {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </svg>
  );
}

export function IconClock() {
  return (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );
}

export function IconLock() {
  return (
    <svg {...stroke}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
