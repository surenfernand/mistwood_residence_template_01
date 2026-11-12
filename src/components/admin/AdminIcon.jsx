export default function AdminIcon({ name, size = 20 }) {
  const props = {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3Z" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    tag: (
      <>
        <path d="M20 13 13 20 3 10V3h7Z" />
        <circle cx="7.5" cy="7.5" r="1" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-2a5 5 0 0 1 10 0v2M16 8a3 3 0 0 1 0 6M19 21v-2a5 5 0 0 0-3-4.6" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8" cy="9" r="1.4" />
        <path d="m21 15-5-5L5 20" />
      </>
    ),
    spark: <path d="m13 2-9 12h7l-1 8 10-13h-7Z" />,
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    bed: (
      <>
        <path d="M3 19V9M3 14h18v5M7 14v-4h5a3 3 0 0 1 3 3v1M3 19v2M21 19v2" />
      </>
    ),
    block: <circle cx="12" cy="12" r="8" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V4M4 20h17" />
        <path d="m7 16 4-5 3 2 5-7" />
      </>
    ),
    chevron: <path d="m7 10 5 5 5-5" strokeWidth="2.35" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.2 2.2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-3.2v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.2-2.2.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4.8v-3.2H5a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.2-2.2.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h3.2v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.2 2.2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14h-.2a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    palette: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="16" cy="10" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.2a2.7 2.7 0 0 1 4.8 1.5c0 1.8-2.3 2-2.3 3.6" />
        <circle cx="12" cy="17.2" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
        <path d="m15 12 4-4M19 12l-4 4M19 12H9" />
      </>
    ),
  };
  return <svg {...props}>{paths[name] || paths.home}</svg>;
}
