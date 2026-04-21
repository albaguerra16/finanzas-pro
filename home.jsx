// Home / Dashboard — Wallet dark + Fitness rings aesthetic
const { useMemo: useMemoH } = React

function HomeScreen({ theme, onNav, onOpenTx, onOpenCat }) {
  const totalSpent = MOCK.cats.reduce((s,c) => s + c.spent, 0)
  const totalBudget = MOCK.cats.reduce((s,c) => s + c.budget, 0)
  const available = MOCK.salary - totalSpent
  const savings = MOCK.cats.find(c=>c.id==='ahorros').spent
  const savingsGoal = 8400 // 20% of salary
  const budgetProgress = totalSpent / totalBudget
  const savingsProgress = savings / savingsGoal
  const incomeProgress = MOCK.salary / MOCK.salary // full

  const A = themeTokens.accent
  const tone = theme === 'dark' ? 'd' : 'l'

  return (
    <div>
      {/* Large title header */}
      <div style={{ padding: '18px 20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>{MOCK.month}</div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-1.2px', marginTop: 2 }}>Resumen</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onNav('profile')} style={{
              width: 36, height: 36, borderRadius: '50%',
              border: 'none', background: 'var(--fill)',
              color: 'var(--text)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              letterSpacing: '-0.2px', fontFamily: 'inherit',
            }}>{MOCK.user.avatar}</button>
          </div>
        </div>
      </div>

      {/* RINGS — Fitness hero */}
      <div style={{ padding: '8px 16px 20px', display: 'flex', gap: 18, alignItems: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <ActivityRings
            size={160} thickness={16} gap={3}
            bg={theme === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'}
            data={[
              { value: budgetProgress, color: A.red[tone] },
              { value: savingsProgress, color: A.green[tone] },
              { value: incomeProgress, color: A.blue[tone] },
            ]}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <RingStat color={A.red[tone]}   label="Gasto"    value={fmt(totalSpent)} sub={`de ${fmt(totalBudget)}`} />
          <RingStat color={A.green[tone]} label="Ahorro"   value={fmt(savings)}    sub={`meta ${fmt(savingsGoal)}`} />
          <RingStat color={A.blue[tone]}  label="Ingreso"  value={fmt(MOCK.salary)} sub="Salario" />
        </div>
      </div>

      {/* BIG AVAILABLE BALANCE — Wallet style */}
      <div style={{
        margin: '0 16px 16px',
        background: 'var(--bgElev)',
        borderRadius: 20,
        padding: '22px 22px',
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Disponible</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
          <span style={{ fontSize: 15, color: 'var(--textSec)', fontWeight: 500 }}>$</span>
          <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1 }}>
            {available.toLocaleString('es-MX')}
          </span>
          <span style={{ fontSize: 18, color: 'var(--textSec)', fontWeight: 500, letterSpacing: '-0.5px' }}>.00</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <TrendPill color={A.green[tone]} icon={<Icon.arrowDown size={12}/>} label="Entró" value={fmt(MOCK.salary)}/>
          <TrendPill color={A.red[tone]}   icon={<Icon.arrowUp size={12}/>}  label="Salió" value={fmt(totalSpent)}/>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { id:'categories', label:'Categorías', icon: Icon.grid,    color: A.indigo[tone] },
          { id:'insights',   label:'Insights',   icon: Icon.sparkle, color: A.pink[tone]   },
          { id:'profile',    label:'Perfil',     icon: Icon.person,  color: A.blue[tone]   },
        ].map(q => {
          const I = q.icon
          return (
            <button key={q.id} onClick={() => onNav(q.id)} style={{
              background: 'var(--bgElev)', border: 'none', borderRadius: 14,
              padding: '12px', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
              color: 'var(--text)', letterSpacing: '-0.2px',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: q.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I size={17}/></div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{q.label}</div>
            </button>
          )
        })}
      </div>

      {/* CATEGORIES — iOS grouped list with ring per cat */}
      <div style={{ padding: '4px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>Categorías</div>
        <button onClick={() => onNav('categories')} style={{
          background: 'none', border: 'none', color: 'var(--blue)',
          fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px',
        }}>Ver todas</button>
      </div>
      <div style={{ margin: '0 16px 20px', borderRadius: 16, background: 'var(--bgElev)', overflow: 'hidden' }}>
        {MOCK.cats.slice(0, 5).map((c, i) => (
          <CatRow key={c.id} cat={c} theme={theme} last={i === 4} onClick={() => onOpenCat(c)} />
        ))}
      </div>

      {/* RECENT TRANSACTIONS */}
      <div style={{ padding: '4px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>Recientes</div>
        <button style={{
          background: 'none', border: 'none', color: 'var(--blue)',
          fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px',
        }}>Todas</button>
      </div>
      <div style={{ margin: '0 16px 20px', borderRadius: 16, background: 'var(--bgElev)', overflow: 'hidden' }}>
        {MOCK.tx.slice(0, 5).map((t, i) => (
          <TxRow key={t.id} tx={t} theme={theme} last={i === 4} />
        ))}
      </div>

      {/* GOAL CARD */}
      <div style={{ padding: '4px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>Meta</div>
      </div>
      <div style={{
        margin: '0 16px 24px',
        background: 'linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)',
        borderRadius: 20, padding: '20px',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.75, letterSpacing: '-0.1px' }}>{MOCK.goal.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-1px', marginTop: 4 }}>
              {fmt(MOCK.goal.saved)}
            </div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2, letterSpacing: '-0.1px' }}>de {fmt(MOCK.goal.target)} · {MOCK.goal.deadline}</div>
          </div>
          <ProgressRing size={72} thickness={8} value={MOCK.goal.saved / MOCK.goal.target} color="#fff" bg="rgba(255,255,255,.2)">
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px' }}>{Math.round(100 * MOCK.goal.saved / MOCK.goal.target)}%</div>
          </ProgressRing>
        </div>
      </div>
    </div>
  )
}

function RingStat({ color, label, value, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: color, flexShrink: 0 }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}</div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.3px', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--textTer)', letterSpacing: '-0.1px' }}>{sub}</div>
      </div>
    </div>
  )
}

function TrendPill({ color, icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ width: 22, height: 22, borderRadius: 11, background: color + '28', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.3px' }}>{value}</div>
      </div>
    </div>
  )
}

function CatRow({ cat, theme, last, onClick }) {
  const meta = catMeta[cat.id]
  const IconComp = Icon[meta.icon]
  const color = themeTokens.accent[meta.color][theme === 'dark' ? 'd' : 'l']
  const pct = Math.min(1.2, cat.spent / cat.budget)
  const over = cat.spent > cat.budget
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      cursor: 'pointer',
      borderBottom: last ? 'none' : '0.5px solid var(--sepFaint)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', flexShrink: 0,
      }}>
        <IconComp size={20}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.3px' }}>{cat.label}</div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px', color: over ? 'var(--red)' : 'var(--text)' }}>{fmt(cat.spent)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--fillSec)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: Math.min(100, pct*100) + '%', background: over ? 'var(--red)' : color, transition: 'width 600ms cubic-bezier(.2,.8,.2,1)' }}/>
          </div>
          <div style={{ fontSize: 12, color: 'var(--textSec)', letterSpacing: '-0.1px', minWidth: 50, textAlign: 'right' }}>
            de {fmt(cat.budget)}
          </div>
        </div>
      </div>
    </div>
  )
}

function TxRow({ tx, theme, last }) {
  const meta = catMeta[tx.cat]
  const IconComp = Icon[meta.icon]
  const color = themeTokens.accent[meta.color][theme === 'dark' ? 'd' : 'l']
  const isIn = tx.cat === 'ahorros'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: last ? 'none' : '0.5px solid var(--sepFaint)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: color + '22', color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconComp size={18}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.desc}</div>
        <div style={{ fontSize: 12, color: 'var(--textSec)', letterSpacing: '-0.1px', marginTop: 1 }}>{tx.when}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px', color: isIn ? 'var(--green)' : 'var(--text)' }}>
        {isIn ? '+' : '−'}{fmt(tx.amt)}
      </div>
    </div>
  )
}

Object.assign(window, { HomeScreen })
