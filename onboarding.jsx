// Onboarding (4 slides) + Auth (sign in)

function OnboardingScreen({ onDone, theme }) {
  const [step, setStep] = React.useState(0)
  const A = themeTokens.accent
  const tone = theme === 'dark' ? 'd' : 'l'
  const slides = [
    { icon: 'wallet',  color: A.blue[tone],   title: 'Control total\nde tu dinero', sub: 'Tus finanzas en una sola pantalla, con la elegancia de iOS.' },
    { icon: 'target',  color: A.green[tone],  title: 'Presupuestos\nque cumples', sub: 'Anillos tipo Fitness para ver tu progreso al instante.' },
    { icon: 'chart',   color: A.orange[tone], title: 'Insights\ninteligentes',    sub: 'Patrones, promedios y alertas antes de excederte.' },
    { icon: 'shield',  color: A.purple[tone], title: 'Privado\ny seguro',         sub: 'Encriptado, con Face ID y sin publicidad. Tu data es tuya.' },
  ]
  const cur = slides[step]
  const CurIcon = Icon[cur.icon]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'var(--textSec)', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>Saltar</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <div style={{
          width: 120, height: 120, borderRadius: 30,
          background: cur.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', marginBottom: 40,
          boxShadow: `0 24px 60px ${cur.color}55`,
        }}>
          <CurIcon size={60}/>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, whiteSpace: 'pre-line' }}>{cur.title}</div>
        <div style={{ fontSize: 16, color: 'var(--textSec)', marginTop: 16, lineHeight: 1.4, letterSpacing: '-0.2px', maxWidth: 300 }}>{cur.sub}</div>
      </div>
      <div style={{ padding: '20px 30px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 22 : 6, height: 6, borderRadius: 3,
              background: i === step ? 'var(--text)' : 'var(--fill)',
              transition: 'width 300ms ease',
            }}/>
          ))}
        </div>
        <button onClick={() => step === slides.length - 1 ? onDone() : setStep(step + 1)} style={{
          width: '100%', padding: '16px', borderRadius: 14,
          background: cur.color, color: '#fff',
          border: 'none', fontSize: 17, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '-0.3px',
          boxShadow: `0 8px 24px ${cur.color}40`,
          transition: 'background 300ms ease, box-shadow 300ms ease',
        }}>{step === slides.length - 1 ? 'Empezar' : 'Continuar'}</button>
      </div>
    </div>
  )
}

function AuthScreen({ onSignIn, theme }) {
  const [mode, setMode] = React.useState('signin')
  const A = themeTokens.accent
  const tone = theme === 'dark' ? 'd' : 'l'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: `linear-gradient(135deg, ${A.blue[tone]}, ${A.purple[tone]})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', marginBottom: 24,
          boxShadow: `0 16px 40px ${A.purple[tone]}40`,
        }}>
          <Icon.wallet size={36}/>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px', textAlign: 'center' }}>Finanzas</div>
        <div style={{ fontSize: 15, color: 'var(--textSec)', marginTop: 8, textAlign: 'center', letterSpacing: '-0.2px' }}>
          {mode === 'signin' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
        </div>

        <div style={{ width: '100%', maxWidth: 340, marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Correo electrónico" style={authInputStyle}/>
          <input placeholder="Contraseña" type="password" style={authInputStyle}/>
          <button onClick={onSignIn} style={{
            marginTop: 6, padding: '14px', borderRadius: 13,
            background: 'var(--text)', color: 'var(--bg)', border: 'none',
            fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.3px',
          }}>{mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 0.5, background: 'var(--sep)' }}/>
            <div style={{ fontSize: 12, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>o</div>
            <div style={{ flex: 1, height: 0.5, background: 'var(--sep)' }}/>
          </div>

          <button onClick={onSignIn} style={{
            padding: '14px', borderRadius: 13, background: 'var(--bgElev)', color: 'var(--text)',
            border: '0.5px solid var(--sep)', fontSize: 16, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}><Icon.faceid size={22}/>Continuar con Face ID</button>
        </div>
      </div>

      <div style={{ padding: '0 30px 30px', textAlign: 'center' }}>
        <button onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')} style={{
          background: 'none', border: 'none', color: 'var(--blue)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px',
        }}>
          {mode === 'signin' ? '¿Primera vez? Crea una cuenta' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  )
}

const authInputStyle = {
  width: '100%', padding: '14px 16px',
  background: 'var(--bgElev)', border: '0.5px solid var(--sep)',
  borderRadius: 13, color: 'var(--text)', fontSize: 16,
  outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.2px', boxSizing: 'border-box',
}

function AddExpenseSheet({ open, onClose, cat, theme }) {
  const [amount, setAmount] = React.useState('')
  const [desc, setDesc] = React.useState('')
  const [catId, setCatId] = React.useState(cat?.id || 'comidas')
  React.useEffect(() => { if (open && cat) setCatId(cat.id) }, [open, cat])
  const tone = theme === 'dark' ? 'd' : 'l'
  const activeCat = MOCK.cats.find(c => c.id === catId) || MOCK.cats[0]
  const activeColor = themeTokens.accent[catMeta[activeCat.id].color][tone]

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '0 20px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0 20px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 17, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>Cancelar</button>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.3px' }}>Nuevo gasto</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 17, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>Guardar</button>
        </div>

        {/* Huge amount input */}
        <div style={{ textAlign: 'center', padding: '30px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontSize: 22, color: 'var(--textSec)', fontWeight: 500 }}>$</span>
            <input
              type="text" inputMode="decimal"
              value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d.]/g,''))}
              placeholder="0"
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: 64, fontWeight: 700, letterSpacing: '-2.5px',
                color: amount ? 'var(--text)' : 'var(--textTer)',
                textAlign: 'center', width: 200, fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ fontSize: 13, color: 'var(--textSec)', marginTop: 4, letterSpacing: '-0.1px' }}>MXN</div>
        </div>

        {/* Category picker */}
        <div style={{ fontSize: 13, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px', padding: '0 4px 10px' }}>Categoría</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
          {MOCK.cats.map(c => {
            const m = catMeta[c.id]
            const col = themeTokens.accent[m.color][tone]
            const I = Icon[m.icon]
            const active = catId === c.id
            return (
              <button key={c.id} onClick={() => setCatId(c.id)} style={{
                background: active ? col : 'var(--bgElev)',
                color: active ? '#fff' : 'var(--text)',
                border: 'none', borderRadius: 12, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                letterSpacing: '-0.2px', flexShrink: 0,
                transition: 'all 200ms ease',
              }}>
                <I size={16}/>{c.label}
              </button>
            )
          })}
        </div>

        <div style={{ background: 'var(--bgElev)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--sepFaint)' }}>
            <div style={{ fontSize: 12, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Descripción</div>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Starbucks, Uber..." style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              fontSize: 16, color: 'var(--text)', fontFamily: 'inherit', marginTop: 4,
              letterSpacing: '-0.2px',
            }}/>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 16, letterSpacing: '-0.2px' }}>Fecha</div>
            <div style={{ fontSize: 15, color: 'var(--textSec)', letterSpacing: '-0.2px' }}>Hoy, 18 Nov</div>
          </div>
        </div>
      </div>
    </Sheet>
  )
}

Object.assign(window, { OnboardingScreen, AuthScreen, AddExpenseSheet })
