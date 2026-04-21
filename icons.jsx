// SF Symbols-style icon set — stroke-based, 1.8 weight, consistent 24px grid
// All icons use currentColor so they can be tinted via CSS color.

const SF = ({ d, fill, size = 22, sw = 1.8, style, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    {d && <path d={d} />}
    {children}
  </svg>
)

const Icon = {
  // Nav
  house: p => <SF {...p}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></SF>,
  chart: p => <SF {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></SF>,
  card: p => <SF {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h3"/></SF>,
  target: p => <SF {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></SF>,
  person: p => <SF {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></SF>,

  // Categories
  fork: p => <SF {...p}><path d="M7 2v9a3 3 0 0 0 3 3v8M4 2v5a3 3 0 0 0 3 3M17 2c-2 0-3 2-3 5s1 5 3 5v10"/></SF>,
  cart: p => <SF {...p}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12.5a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 7H6"/></SF>,
  apps: p => <SF {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></SF>,
  car: p => <SF {...p}><path d="M5 17h14M4 13l2-6h12l2 6M4 13v5h2v-2h12v2h2v-5M4 13h16"/><circle cx="7.5" cy="15.5" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="15.5" r="1" fill="currentColor" stroke="none"/></SF>,
  sparkle: p => <SF {...p}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM5 15l.7 1.3L7 17l-1.3.7L5 19l-.7-1.3L3 17l1.3-.7z"/></SF>,
  dice: p => <SF {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1" fill="currentColor" stroke="none"/></SF>,
  bank: p => <SF {...p}><path d="M3 9l9-5 9 5v2H3zM5 11v7M9 11v7M15 11v7M19 11v7M3 20h18"/></SF>,

  // UI
  plus: p => <SF {...p} sw={2}><path d="M12 5v14M5 12h14"/></SF>,
  minus: p => <SF {...p} sw={2}><path d="M5 12h14"/></SF>,
  chevR: p => <SF {...p}><path d="M9 6l6 6-6 6"/></SF>,
  chevL: p => <SF {...p}><path d="M15 6l-6 6 6 6"/></SF>,
  chevD: p => <SF {...p}><path d="M6 9l6 6 6-6"/></SF>,
  close: p => <SF {...p} sw={2}><path d="M6 6l12 12M18 6L6 18"/></SF>,
  search: p => <SF {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></SF>,
  bell: p => <SF {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/></SF>,
  gear: p => <SF {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></SF>,
  sun: p => <SF {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></SF>,
  moon: p => <SF {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></SF>,
  arrowUp: p => <SF {...p}><path d="M12 19V5M5 12l7-7 7 7"/></SF>,
  arrowDown: p => <SF {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></SF>,
  edit: p => <SF {...p}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></SF>,
  trash: p => <SF {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></SF>,
  check: p => <SF {...p} sw={2.2}><path d="M20 6L9 17l-5-5"/></SF>,
  download: p => <SF {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></SF>,
  logout: p => <SF {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></SF>,
  wallet: p => <SF {...p}><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H6a2 2 0 0 0-2 2v2M18 14h.01"/></SF>,
  flame: p => <SF {...p}><path d="M12 2s4 4 4 9a4 4 0 0 1-8 0c0-3 2-4 2-7 0 0 2 1 2 4 0 0 2-1 0-6z"/></SF>,
  lock: p => <SF {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></SF>,
  shield: p => <SF {...p}><path d="M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z"/></SF>,
  info: p => <SF {...p}><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></SF>,
  cloud: p => <SF {...p}><path d="M17.5 19a4.5 4.5 0 1 0-1-8.9A6 6 0 0 0 5 12a4.5 4.5 0 0 0 1 8.9"/></SF>,
  face: p => <SF {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2M9 10v1M15 10v1M9 15s1 1.5 3 1.5 3-1.5 3-1.5"/></SF>,
  faceid: p => <SF {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2M9 10v1M15 10v1M12 9v4M9 15s1 1.5 3 1.5 3-1.5 3-1.5"/></SF>,
  heart: p => <SF {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.5 1-1a5.5 5.5 0 0 0 0-7.8z"/></SF>,
  calendar: p => <SF {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></SF>,
  alert: p => <SF {...p}><path d="M12 3L2 20h20L12 3zM12 10v5M12 18h.01"/></SF>,
  receipt: p => <SF {...p}><path d="M6 2h12v20l-2-1.5L14 22l-2-1.5L10 22l-2-1.5L6 22zM9 7h6M9 11h6M9 15h4"/></SF>,
  tag: p => <SF {...p}><path d="M20.6 13.4L13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/></SF>,
  bolt: p => <SF {...p}><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></SF>,
  piggy: p => <SF {...p}><path d="M19 8a3 3 0 0 0-2-1c-1-3-5-4-8-3S4 7 4 10c0 2 1 4 3 5v3h3v-2h4v2h3v-3c2-1 3-3 3-5 0-.6-.2-1.3-.5-1.8zM16 10h.01M8 6c-.5-1.5-2-2-3-1"/></SF>,
  grid: p => <SF {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></SF>,
  list: p => <SF {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></SF>,
}

Object.assign(window, { Icon })
