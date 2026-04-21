// Categories detail, all-categories, add-expense, profile, onboarding, auth screens

function CategoriesScreen({ theme, onBack, onOpenCat, onAddCat }) {
  return (
    <div>
      <NavBar title="Categorías" onBack={onBack} right={
        <button onClick={onAddCat} style={navBtnStyle}><Icon.plus size={22}/></button>
      }/>
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-1.2px', padding: '8px 4px 16px' }}>Categorías</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {MOCK.cats.map(c => <CatCard key={c.id} cat={c} theme={theme} onClick={() => onOpenCat(c)} />)}
          <button onClick={onAddCat} style={{
            background: 'var(--fillSec)', border: '1px dashed var(--sep)', borderRadius: 16,
            padding: '20px', color: 'var(--textSec)', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            minHeight: 156,
          }}>
            <Icon.plus size={22}/>
            <div style={{ fontSize: 14, letterSpacing: '-0.2px' }}>Nueva categoría</div>
          </button>
        </div>
      </div>
    </div>
  )
}

function CatCard({ cat, theme, onClick }) {
  const meta = catMeta[cat.id]
  const IconComp = Icon[meta.icon]
  const color = themeTokens.accent[meta.color][theme === 'dark' ? 'd' : 'l']
  const pct = Math.min(1, cat.spent / cat.budget)
  const over = cat.spent > cat.budget
  return (
    <div onClick={onClick} style={{
      background: 'var(--bgElev)', borderRadius: 16, padding: '16px',
      cursor: 'pointer', minHeight: 156, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: color, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><IconComp size={20}/></div>
        <ProgressRing size={38} thickness={4} value={pct} color={over ? themeTokens.accent.red[theme==='dark'?'d':'l'] : color} bg="var(--fillSec)">
          <div style={{ fontSize: 9, fontWeight: 700, color: over ? 'var(--red)' : 'var(--text)', letterSpacing: '-0.1px' }}>{Math.round(pct*100)}%</div>
        </ProgressRing>
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>{cat.label}</div>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.5px', marginTop: 2, color: over ? 'var(--red)' : 'var(--text)' }}>{fmt(cat.spent)}</div>
        <div style={{ fontSize: 11, color: 'var(--textTer)', letterSpacing: '-0.1px', marginTop: 2 }}>Tope {fmt(cat.budget)}</div>
      </div>
    </div>
  )
}

function CategoryDetailScreen({ cat, theme, onBack, onAddExpense }) {
  const meta = catMeta[cat.id]
  const IconComp = Icon[meta.icon]
  const color = themeTokens.accent[meta.color][theme === 'dark' ? 'd' : 'l']
  const pct = cat.spent / cat.budget
  const over = cat.spent > cat.budget
  const daily = MOCK.daily[cat.id] || [0,0,0,0,0,0,0]
  const avg = daily.reduce((s,v)=>s+v,0) / 7
  const txs = MOCK.tx.filter(t => t.cat === cat.id)
  const dayLabels = ['L','M','M','J','V','S','D']

  return (
    <div>
      <NavBar title={cat.label} onBack={onBack} right={
        <button style={navBtnStyle}><Icon.edit size={20}/></button>
      }/>
      <div style={{ padding: '8px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 13, background: color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><IconComp size={26}/></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Noviembre 2026</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', color: over ? 'var(--red)' : 'var(--text)' }}>{fmt(cat.spent)}</div>
          </div>
        </div>

        {/* Big budget card */}
        <div style={{ background: 'var(--bgElev)', borderRadius: 18, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Presupuesto</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 2 }}>{fmt(cat.budget)}</div>
            </div>
            <ProgressRing size={72} thickness={8} value={Math.min(1, pct)} color={over ? 'var(--red)' : color} bg="var(--fillSec)">
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', color: over ? 'var(--red)' : 'var(--text)' }}>{Math.round(pct*100)}%</div>
            </ProgressRing>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--fillSec)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: Math.min(100,pct*100)+'%', background: over ? 'var(--red)' : color, transition: 'width 700ms cubic-bezier(.2,.8,.2,1)' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--textSec)' }}>Gastado</div>
            <div style={{ fontSize: 12, color: over ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
              {over ? `+${fmt(cat.spent - cat.budget)} sobre` : `${fmt(cat.budget - cat.spent)} libre`}
            </div>
          </div>
        </div>

        {/* 7-day bars */}
        <div style={{ background: 'var(--bgElev)', borderRadius: 18, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Últimos 7 días · Promedio</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginTop: 2, marginBottom: 16 }}>{fmt(avg)}<span style={{ fontSize: 13, color: 'var(--textSec)', fontWeight: 400 }}> /día</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {daily.map((v,i) => {
              const max = Math.max(...daily, 1)
              const h = v === 0 ? 3 : Math.max(8, (v/max) * 80)
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', height: h,
                    background: v === 0 ? 'var(--fillSec)' : color,
                    borderRadius: 4, opacity: v === 0 ? 0.5 : 1,
                    transition: 'height 600ms cubic-bezier(.2,.8,.2,1)',
                  }}/>
                  <div style={{ fontSize: 10, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>{dayLabels[i]}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Movements */}
        <div style={{ fontSize: 13, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px', padding: '4px 4px 8px' }}>Movimientos ({txs.length})</div>
        <div style={{ background: 'var(--bgElev)', borderRadius: 16, overflow: 'hidden' }}>
          {txs.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--textSec)' }}>Sin movimientos este mes</div>
          ) : txs.map((t,i) => <TxRow key={t.id} tx={t} theme={theme} last={i===txs.length-1}/>)}
        </div>

        <button onClick={() => onAddExpense(cat)} style={{
          marginTop: 16, width: '100%',
          background: color, border: 'none', borderRadius: 14,
          color: '#fff', padding: '14px', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}><Icon.plus size={18}/>Agregar gasto</button>
      </div>
    </div>
  )
}

const navBtnStyle = {
  width: 36, height: 36, borderRadius: 18, border: 'none',
  background: 'var(--fill)', color: 'var(--text)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontFamily: 'inherit',
}

function NavBar({ title, onBack, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 14px 8px',
      position: 'sticky', top: 0, zIndex: 10,
      background: 'var(--bgBlur)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      {onBack ? (
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'var(--blue)',
          fontSize: 17, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '-0.3px',
        }}><Icon.chevL size={22}/>Atrás</button>
      ) : <div style={{ width: 36 }}/>}
      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px' }}>{title}</div>
      <div>{right || <div style={{ width: 36 }}/>}</div>
    </div>
  )
}

Object.assign(window, { CategoriesScreen, CategoryDetailScreen, NavBar, navBtnStyle, CatCard })
