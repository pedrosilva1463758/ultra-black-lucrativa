const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

export const Calendar = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
    <path d="M3 9.5h18M8 3v3M16 3v3M7.5 13h.01M12 13h.01M16.5 13h.01M7.5 16.5h.01M12 16.5h.01" />
  </svg>
);
export const Clock = (p) => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);
export const Lock = (p) => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </svg>
);
export const List = (p) => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...base} {...p}>
    <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
);
export const Arrow = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...base} strokeWidth={2.2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const Back = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);
export const Check = (p) => (
  <svg width="13" height="13" viewBox="0 0 24 24" {...base} strokeWidth={3} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const Download = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);
