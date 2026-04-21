// Primitives: ActivityRings (Fitness-style), Sheet (iOS modal), ListRow, Segmented

const { useState, useEffect, useRef } = React

// Three concentric rings a la Apple Fitness
function ActivityRings({ size = 220, thickness = 22, gap = 4, data, bg = 'rgba(255,255,255,.08)' }) {
  // data: [{value: 0-1.2, color, label}]
  const rings = data.map((r, i) => {
    const radius = size / 2 - thickness / 2 - i * (thickness + gap)
    const circ = 2 * Math.PI * radius
    const progress = Math.min(1, Math.max(0, r.value))
    return { ...r, radius, circ, progress, offset: circ * (1 - progress) }
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <defs>
        {rings.map((r, i) => (
          <linearGradient key={i} id={`rg${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={r.color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={r.color} stopOpacity="1" />
          </linearGradient>
        ))}
      </defs>
      {rings.map((r, i) => (
        <g key={i} transform={`rotate(-90 ${size/2} ${size/2})`}>
          <circle cx={size/2} cy={size/2} r={r.radius} fill="none" stroke={bg} strokeWidth={thickness} />
          <circle
            cx={size/2} cy={size/2} r={r.radius} fill="none"
            stroke={`url(#rg${i})`}
            strokeWidth={thickness} strokeLinecap="round"
            strokeDasharray={r.circ}
            strokeDashoffset={r.offset}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)' }}
          />
        </g>
      ))}
    </svg>
  )
}

// Single bold ring (for debt / single-metric)
function ProgressRing({ size = 140, thickness = 14, value = 0.6, color = '#30D158', bg = 'rgba(255,255,255,.08)', children }) {
  const r = size / 2 - thickness / 2
  const c = 2 * Math.PI * r
  const p = Math.min(1, Math.max(0, value))
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <g transform={`rotate(-90 ${size/2} ${size/2})`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={thickness} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-p)} style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(.2,.8,.2,1)' }} />
        </g>
      </svg>
      {children && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>}
    </div>
  )
}

// iOS-style sheet (slides up from bottom with rubber-band, scrim blur)
function Sheet({ open, onClose, children, snap = 'auto' }) {
  const [mounted, setMounted] = useState(open)
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (open) { setMounted(true); requestAnimationFrame(() => setShow(true)) }
    else { setShow(false); const t = setTimeout(() => setMounted(false), 320); return () => clearTimeout(t) }
  }, [open])
  if (!mounted) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        opacity: show ? 1 : 0, transition: 'opacity 280ms ease',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        maxHeight: snap === 'full' ? '92%' : '88%',
        background: 'var(--bgElev)',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -20px 60px rgba(0,0,0,.5)',
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 320ms cubic-bezier(.2,.9,.2,1)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: 36, height: 5, borderRadius: 3, background: 'var(--fill)' }}/>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}

// iOS Settings-style grouped list row
function Row({ icon, iconBg, title, subtitle, value, valueColor, onClick, right, danger, first, last }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      cursor: onClick ? 'pointer' : 'default',
      background: 'var(--bgElev)',
      borderTopLeftRadius: first ? 14 : 0,
      borderTopRightRadius: first ? 14 : 0,
      borderBottomLeftRadius: last ? 14 : 0,
      borderBottomRightRadius: last ? 14 : 0,
      borderBottom: last ? 'none' : '0.5px solid var(--sepFaint)',
      position: 'relative',
    }}>
      {icon && (
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: iconBg || 'var(--fill)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0,
        }}>{typeof icon === 'function' ? icon({ size: 18 }) : icon}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, color: danger ? 'var(--red)' : 'var(--text)', letterSpacing: '-0.2px' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--textSec)', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {value !== undefined && <div style={{ fontSize: 15, color: valueColor || 'var(--textSec)', letterSpacing: '-0.2px' }}>{value}</div>}
      {right !== undefined ? right : onClick && <Icon.chevR size={16} style={{ color: 'var(--textTer)' }}/>}
    </div>
  )
}

function Group({ title, footer, children, style }) {
  return (
    <div style={{ margin: '0 0 24px', ...style }}>
      {title && <div style={{ fontSize: 13, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px', padding: '0 20px 8px', fontWeight: 400 }}>{title}</div>}
      <div style={{ margin: '0 16px', borderRadius: 14, overflow: 'hidden' }}>{children}</div>
      {footer && <div style={{ fontSize: 12, color: 'var(--textSec)', padding: '8px 20px 0', lineHeight: 1.35 }}>{footer}</div>}
    </div>
  )
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', background: 'var(--fill)', borderRadius: 9, padding: 2,
      position: 'relative',
    }}>
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            flex: 1, border: 'none', padding: '6px 10px',
            background: active ? 'var(--bgElev)' : 'transparent',
            color: 'var(--text)',
            fontSize: 13, fontWeight: active ? 600 : 500,
            borderRadius: 7, cursor: 'pointer',
            boxShadow: active ? '0 3px 8px rgba(0,0,0,.12), 0 0 0 0.5px rgba(0,0,0,.04)' : 'none',
            transition: 'all 200ms ease',
            fontFamily: 'inherit', letterSpacing: '-0.1px',
          }}>{opt.label}</button>
        )
      })}
    </div>
  )
}

// Minimal bar chart (7 bars, last-7-days style)
function MiniBars({ data, color, height = 60 }) {
  const max = Math.max(...data, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, background: color, opacity: v === 0 ? 0.18 : 0.4 + 0.6 * (v / max),
          borderRadius: 3,
          height: Math.max(4, (v / max) * height),
          transition: 'height 600ms cubic-bezier(.2,.8,.2,1)',
        }}/>
      ))}
    </div>
  )
}

// Ghost button + primary pill button
function PillBtn({ children, onClick, variant = 'primary', style, icon, disabled }) {
  const s = {
    primary:  { background: 'var(--text)', color: 'var(--bg)' },
    tinted:   { background: 'var(--fill)', color: 'var(--blue)' },
    ghost:    { background: 'transparent', color: 'var(--blue)' },
    danger:   { background: 'rgba(255,69,58,.15)', color: 'var(--red)' },
  }[variant]
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '10px 18px',
      borderRadius: 999,
      border: 'none',
      fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      fontFamily: 'inherit',
      transition: 'transform 120ms ease, opacity 120ms ease',
      ...s, ...style,
    }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      {icon}{children}
    </button>
  )
}

Object.assign(window, { ActivityRings, ProgressRing, Sheet, Row, Group, Segmented, MiniBars, PillBtn })
