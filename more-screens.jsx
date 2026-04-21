// Debts, Savings/Goals, Score screens + Add Expense v2 (with numpad)

function DebtsScreen({ theme, onBack, onOpenDebt, onAddDebt }) {
  const A = themeTokens.accent
  const tone = theme === 'dark' ? 'd' : 'l'
  const total = MOCK.debts.reduce((s,d) => s + d.balance, 0)
  const original = MOCK.debts.reduce((s,d) => s + d.originalAmount, 0)
  const paidOff = original - total
  const minMonth = MOCK.debts.reduce((s,d) => s + d.minPayment, 0)
  const progress = paidOff / original

  return (
    <div>
      <NavBar title="Deudas" onBack={onBack} right={
        <button onClick={onAddDebt} style={navBtnStyle}><Icon.plus size={22}/></button>
      }/>
      <div style={{ padding: '4px 16px 20px' }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-1.2px', padding: '4px 4px 20px' }}>Deudas</div>

        {/* Hero card — single progress ring */}
        <div style={{ background: 'var(--bgElev)', borderRadius: 22, padding: 22, marginBottom: 16, display: 'flex', gap: 18, alignItems: 'center' }}>
          <ProgressRing size={110} thickness={12} value={progress} color={A.green[tone]} bg="var(--fillSec)">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1 }}>{Math.round(progress*100)}%</div>
              <div style={{ fontSize: 10, color: 'var(--textSec)', letterSpacing: '-0.1px', marginTop: 2 }}>pagado</div>
            </div>
          </ProgressRing>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Debes</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1, marginTop: 2 }}>{fmt(total)}</div>
            <div style={{ fontSize: 12, color: 'var(--textSec)', marginTop: 6 }}>de {fmt(original)} inicial</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1, padding: '6px 10px', background: 'var(--fill)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Pago mín/mes</div>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.2px' }}>{fmt(minMonth)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div style={{ background: A.orange[tone] + '22', border: '0.5px solid ' + A.orange[tone] + '40', borderRadius: 14, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: A.orange[tone], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.bell size={16}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.2px' }}>BBVA Azul vence hoy</div>
            <div style={{ fontSize: 11, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Pago mínimo {fmt(1200)}</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px', padding: '0 4px 8px' }}>Activas ({MOCK.debts.length})</div>
        <div style={{ background: 'var(--bgElev)', borderRadius: 16, overflow: 'hidden' }}>
          {MOCK.debts.map((d, i) => <DebtRow key={d.id} debt={d} theme={theme} last={i === MOCK.debts.length-1} onClick={() => onOpenDebt(d)}/>)}
        </div>

        <button onClick={onAddDebt} style={{
          marginTop: 16, width: '100%', background: 'var(--fill)', border: 'none',
          borderRadius: 14, color: 'var(--blue)', padding: '14px', fontSize: 15, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}><Icon.plus size={18}/>Agregar deuda</button>
      </div>
    </div>
  )
}

function DebtRow({ debt, theme, last, onClick }) {
  const tone = theme === 'dark' ? 'd' : 'l'
  const color = themeTokens.accent[debt.color][tone]
  const pct = (debt.originalAmount - debt.balance) / debt.originalAmount
  const icons = { tarjeta: Icon.card, auto: Icon.car, familiar: Icon.person, hipoteca: Icon.house, prestamo: Icon.bank, otro: Icon.receipt }
  const I = icons[debt.type] || Icon.card
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer',
      borderBottom: last ? 'none' : '0.5px solid var(--sepFaint)',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><I size={20}/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px' }}>{debt.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', color }}>{fmt(debt.balance)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--fillSec)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct*100+'%', background: color, transition: 'width 600ms cubic-bezier(.2,.8,.2,1)' }}/>
          </div>
          <div style={{ fontSize: 11, color: 'var(--textSec)', letterSpacing: '-0.1px', minWidth: 72, textAlign: 'right' }}>
            {debt.dueDay ? `Vence día ${debt.dueDay}` : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
function SavingsScreen({ theme, onBack, onAddGoal }) {
  const A = themeTokens.accent
  const tone = theme === 'dark' ? 'd' : 'l'
  const totalSaved = MOCK.goals.reduce((s,g) => s + g.saved, 0)
  const totalTarget = MOCK.goals.reduce((s,g) => s + g.target, 0)
  const progress = totalSaved / totalTarget

  return (
    <div>
      <NavBar title="Ahorros" onBack={onBack} right={
        <button onClick={onAddGoal} style={navBtnStyle}><Icon.plus size={22}/></button>
      }/>
      <div style={{ padding: '4px 16px 20px' }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-1.2px', padding: '4px 4px 20px' }}>Ahorros</div>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${A.green[tone]}, ${A.teal[tone]})`, borderRadius: 22, padding: '22px 22px', color: '#fff', marginBottom: 16 }}>
          <div style={{ fontSize: 13, opacity: 0.8, letterSpacing: '-0.1px' }}>Total ahorrado</div>
          <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-1.5px', marginTop: 4, lineHeight: 1 }}>{fmt(totalSaved)}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div style={{ fontSize: 13, opacity: 0.85, letterSpacing: '-0.1px' }}>de {fmt(totalTarget)} en {MOCK.goals.length} metas</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>{Math.round(progress*100)}%</div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.25)', marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: progress*100+'%', background: '#fff', borderRadius: 3, transition: 'width 800ms cubic-bezier(.2,.8,.2,1)' }}/>
          </div>
        </div>

        {/* Goals grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {MOCK.goals.map(g => <GoalCard key={g.id} goal={g} theme={theme}/>)}
        </div>

        {/* Quick stats */}
        <div style={{ fontSize: 13, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px', padding: '0 4px 8px' }}>Esta semana</div>
        <div style={{ background: 'var(--bgElev)', borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Abonado últimos 7 días</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 2 }}>{fmt(5000)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: A.green[tone]+'22', color: A.green[tone], borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
              <Icon.arrowUp size={12}/>+12%
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 50, marginTop: 14 }}>
            {[0,0,0,5000,0,0,0].map((v,i) => {
              const max = 5000
              return <div key={i} style={{ flex: 1, height: Math.max(4, (v/max)*50), background: v ? A.green[tone] : 'var(--fillSec)', borderRadius: 3, transition: 'height 600ms' }}/>
            })}
          </div>
        </div>

        <button onClick={onAddGoal} style={{
          marginTop: 16, width: '100%', background: A.green[tone], border: 'none',
          borderRadius: 14, color: '#fff', padding: '14px', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: `0 8px 24px ${A.green[tone]}40`,
        }}><Icon.plus size={18}/>Nueva meta</button>
      </div>
    </div>
  )
}

function GoalCard({ goal, theme }) {
  const tone = theme === 'dark' ? 'd' : 'l'
  const color = themeTokens.accent[goal.color][tone]
  const pct = goal.saved / goal.target
  const I = Icon[goal.icon] || Icon.target
  return (
    <div style={{ background: 'var(--bgElev)', borderRadius: 16, padding: 16, minHeight: 170, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I size={20}/></div>
        <ProgressRing size={40} thickness={4} value={pct} color={color} bg="var(--fillSec)">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '-0.1px' }}>{Math.round(pct*100)}%</div>
        </ProgressRing>
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>{goal.label}</div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 2 }}>{fmt(goal.saved)}</div>
        <div style={{ fontSize: 11, color: 'var(--textTer)', letterSpacing: '-0.1px', marginTop: 2 }}>de {fmt(goal.target)} · {goal.deadline}</div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
function ScoreScreen({ theme, onBack }) {
  const A = themeTokens.accent
  const tone = theme === 'dark' ? 'd' : 'l'
  const s = MOCK.score
  const scoreColor = s.value >= 80 ? A.green[tone] : s.value >= 60 ? A.blue[tone] : s.value >= 40 ? A.orange[tone] : A.red[tone]
  const label = s.value >= 80 ? 'Excelente' : s.value >= 60 ? 'Bien' : s.value >= 40 ? 'Regular' : 'Por mejorar'

  return (
    <div>
      <NavBar title="Score" onBack={onBack}/>
      <div style={{ padding: '4px 16px 20px' }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-1.2px', padding: '4px 4px 20px' }}>Score financiero</div>

        {/* Big score card */}
        <div style={{ background: 'var(--bgElev)', borderRadius: 22, padding: '24px 22px', marginBottom: 16, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <ProgressRing size={180} thickness={16} value={s.value/100} color={scoreColor} bg="var(--fillSec)">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Puntaje</div>
                <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-2.5px', lineHeight: 1, color: scoreColor }}>{s.value}</div>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px', marginTop: 2 }}>{s.grade} · {label}</div>
              </div>
            </ProgressRing>
          </div>
          <div style={{ fontSize: 14, color: 'var(--textSec)', letterSpacing: '-0.2px', marginTop: 8, lineHeight: 1.4 }}>
            Subió <b style={{ color: A.green[tone] }}>+3</b> puntos vs. mes pasado. Sigue así.
          </div>
        </div>

        {/* History chart */}
        <div style={{ background: 'var(--bgElev)', borderRadius: 18, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Últimos 6 meses</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 2, marginBottom: 16 }}>{s.history[s.history.length-1]} <span style={{ fontSize: 13, color: A.green[tone], fontWeight: 600 }}>↑ {s.history[s.history.length-1] - s.history[0]}</span></div>
          <svg viewBox="0 0 300 80" width="100%" height="80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={scoreColor} stopOpacity="0.35"/>
                <stop offset="100%" stopColor={scoreColor} stopOpacity="0"/>
              </linearGradient>
            </defs>
            {(() => {
              const min = Math.min(...s.history) - 5
              const max = Math.max(...s.history) + 5
              const pts = s.history.map((v,i) => [i * (300 / (s.history.length-1)), 80 - ((v-min)/(max-min))*70 - 5])
              const d = pts.map((p,i) => (i === 0 ? 'M' : 'L') + p[0] + ' ' + p[1]).join(' ')
              const fillD = d + ` L 300 80 L 0 80 Z`
              return (<>
                <path d={fillD} fill="url(#scoreGrad)"/>
                <path d={d} stroke={scoreColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                {pts.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length-1 ? 4 : 2.5} fill={scoreColor}/>)}
              </>)
            })()}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--textSec)' }}>
            {['Jun','Jul','Ago','Sep','Oct','Nov'].map(m => <div key={m}>{m}</div>)}
          </div>
        </div>

        {/* Factors */}
        <div style={{ fontSize: 13, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px', padding: '0 4px 8px' }}>Factores</div>
        <div style={{ background: 'var(--bgElev)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
          {s.factors.map((f,i) => (
            <div key={i} style={{ padding: '14px 16px', borderBottom: i === s.factors.length-1 ? 'none' : '0.5px solid var(--sepFaint)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px' }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--textSec)', letterSpacing: '-0.1px', marginTop: 1 }}>{f.hint}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--textTer)', letterSpacing: '-0.1px' }}>{f.weight}%</div>
                  <div style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: '-0.1px',
                    background: f.status === 'ok' ? A.green[tone]+'22' : A.orange[tone]+'22',
                    color: f.status === 'ok' ? A.green[tone] : A.orange[tone],
                  }}>{f.value}</div>
                </div>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: 'var(--fillSec)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: f.value+'%', background: f.status === 'ok' ? A.green[tone] : A.orange[tone], transition: 'width 700ms cubic-bezier(.2,.8,.2,1)' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div style={{ background: `linear-gradient(135deg, ${A.indigo[tone]}, ${A.blue[tone]})`, borderRadius: 18, padding: 18, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon.sparkle size={18}/>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px', opacity: 0.85 }}>Cómo subir a A</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px', lineHeight: 1.4 }}>
            Sube tu tasa de ahorro del 12% al 20% para ganar <b>+5 puntos</b>. Equivale a <b>{fmt(3400)}</b> más al mes.
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Add Expense v2 — with numpad, big amount, category picker
function AddExpenseSheetV2({ open, onClose, cat, theme }) {
  const [amount, setAmount] = React.useState('')
  const [desc, setDesc] = React.useState('')
  const [catId, setCatId] = React.useState(cat?.id || 'comidas')
  React.useEffect(() => {
    if (open) { setAmount(''); setDesc(''); setCatId(cat?.id || 'comidas') }
  }, [open, cat])
  const tone = theme === 'dark' ? 'd' : 'l'
  const activeCat = MOCK.cats.find(c => c.id === catId) || MOCK.cats[0]
  const activeColor = themeTokens.accent[catMeta[activeCat.id].color][tone]

  const press = (k) => {
    if (k === 'del') setAmount(a => a.slice(0, -1))
    else if (k === '.') { if (!amount.includes('.')) setAmount(a => (a || '0') + '.') }
    else setAmount(a => {
      if (a === '0') return k
      if (a.includes('.') && a.split('.')[1].length >= 2) return a
      return a + k
    })
  }
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','del']

  const displayAmount = amount || '0'
  const [intPart, decPart] = displayAmount.split('.')

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '0 0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 12px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 17, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>Cancelar</button>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.3px' }}>Nuevo gasto</div>
          <button onClick={onClose} disabled={!amount || +amount <= 0} style={{
            background: 'none', border: 'none',
            color: (!amount || +amount <= 0) ? 'var(--textTer)' : 'var(--blue)',
            fontSize: 17, fontWeight: 600, cursor: (!amount || +amount <= 0) ? 'default' : 'pointer',
            fontFamily: 'inherit', letterSpacing: '-0.2px',
          }}>Guardar</button>
        </div>

        {/* Amount display */}
        <div style={{ textAlign: 'center', padding: '16px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 28, color: 'var(--textSec)', fontWeight: 500, marginRight: 4 }}>$</span>
            <span style={{ fontSize: 68, fontWeight: 700, letterSpacing: '-3px', lineHeight: 1, color: amount ? activeColor : 'var(--textTer)' }}>
              {intPart || '0'}
            </span>
            {decPart !== undefined && (
              <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px', color: amount ? activeColor : 'var(--textTer)' }}>
                .{(decPart || '').padEnd(2, '0').slice(0,2)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--textSec)', marginTop: 6, letterSpacing: '-0.1px' }}>MXN · Hoy</div>
        </div>

        {/* Description */}
        <div style={{ padding: '0 16px 12px' }}>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descripción (Starbucks, Uber...)" style={{
            width: '100%', padding: '12px 14px', background: 'var(--bgElev2)',
            border: '0.5px solid var(--sepFaint)', borderRadius: 12, color: 'var(--text)',
            fontSize: 15, outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.2px', boxSizing: 'border-box',
          }}/>
        </div>

        {/* Category chips */}
        <div style={{ padding: '0 16px 14px', overflowX: 'auto' }} className="h-scroll">
          <div style={{ display: 'flex', gap: 8, minWidth: 'min-content' }}>
            {MOCK.cats.map(c => {
              const m = catMeta[c.id]
              const col = themeTokens.accent[m.color][tone]
              const I = Icon[m.icon]
              const active = catId === c.id
              return (
                <button key={c.id} onClick={() => setCatId(c.id)} style={{
                  background: active ? col : 'var(--bgElev2)',
                  color: active ? '#fff' : 'var(--text)',
                  border: '0.5px solid ' + (active ? col : 'var(--sepFaint)'),
                  borderRadius: 10, padding: '9px 13px',
                  display: 'flex', alignItems: 'center', gap: 6,
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                  letterSpacing: '-0.2px', flexShrink: 0, transition: 'all 180ms ease',
                }}>
                  <I size={15}/>{c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Numpad */}
        <div style={{ padding: '0 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {keys.map(k => (
            <button key={k} onClick={() => press(k)} style={{
              padding: '14px 0', background: 'var(--bgElev2)',
              border: 'none', borderRadius: 14,
              color: 'var(--text)', fontSize: 26, fontWeight: 400,
              cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 120ms ease',
            }}
            onMouseDown={e => e.currentTarget.style.background = 'var(--fill)'}
            onMouseUp={e => e.currentTarget.style.background = 'var(--bgElev2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bgElev2)'}>
              {k === 'del' ? <Icon.chevL size={22}/> : k}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

Object.assign(window, { DebtsScreen, SavingsScreen, ScoreScreen, AddExpenseSheetV2 })
