// Design tokens — Apple Wallet (dark) + Fitness (rings) + Health (light)

const themeTokens = {
  dark: {
    bg:        '#000000',
    bgElev:    '#1C1C1E',
    bgElev2:   '#2C2C2E',
    bgBlur:    'rgba(28,28,30,.72)',
    sep:       'rgba(84,84,88,0.35)',
    sepFaint:  'rgba(255,255,255,0.06)',
    text:      '#FFFFFF',
    textSec:   'rgba(235,235,245,0.60)',
    textTer:   'rgba(235,235,245,0.30)',
    fill:      'rgba(120,120,128,0.24)',
    fillSec:   'rgba(120,120,128,0.18)',
  },
  light: {
    bg:        '#F2F2F7',
    bgElev:    '#FFFFFF',
    bgElev2:   '#F9F9FB',
    bgBlur:    'rgba(255,255,255,.72)',
    sep:       'rgba(60,60,67,0.18)',
    sepFaint:  'rgba(60,60,67,0.08)',
    text:      '#000000',
    textSec:   'rgba(60,60,67,0.60)',
    textTer:   'rgba(60,60,67,0.30)',
    fill:      'rgba(120,120,128,0.14)',
    fillSec:   'rgba(120,120,128,0.08)',
  },
  // iOS system colors — vivid on dark, slightly muted on light
  accent: {
    red:    { d: '#FF453A', l: '#FF3B30' },
    orange: { d: '#FF9F0A', l: '#FF9500' },
    yellow: { d: '#FFD60A', l: '#FFCC00' },
    green:  { d: '#30D158', l: '#34C759' },
    mint:   { d: '#66D4CF', l: '#00C7BE' },
    teal:   { d: '#64D2FF', l: '#30B0C7' },
    blue:   { d: '#0A84FF', l: '#007AFF' },
    indigo: { d: '#5E5CE6', l: '#5856D6' },
    purple: { d: '#BF5AF2', l: '#AF52DE' },
    pink:   { d: '#FF375F', l: '#FF2D55' },
    brown:  { d: '#AC8E68', l: '#A2845E' },
  }
}

// Map existing category ids to SF-symbol-style icons + iOS system colors
const catMeta = {
  comidas:       { icon: 'fork',    color: 'orange' },
  compras:       { icon: 'cart',    color: 'pink'   },
  suscripciones: { icon: 'apps',    color: 'purple' },
  transporte:    { icon: 'car',     color: 'teal'   },
  belleza:       { icon: 'sparkle', color: 'yellow' },
  extra:         { icon: 'dice',    color: 'indigo' },
  ahorros:       { icon: 'piggy',   color: 'green'  },
}

const fmt = n => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n || 0)
const fmtShort = n => {
  if (n >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M'
  if (n >= 10000) return '$' + (n/1000).toFixed(1) + 'K'
  if (n >= 1000) return '$' + (n/1000).toFixed(1) + 'K'
  return fmt(n)
}

Object.assign(window, { themeTokens, catMeta, fmt, fmtShort })
