// Smart Insights screen — AI-powered recommendations, patterns, forecasts

function InsightsScreenV2({ theme, onBack }) {
  const A = themeTokens.accent
  const tone = theme === 'dark' ? 'd' : 'l'

  // Derived data
  const totalSpent = MOCK.cats.reduce((s,c) => s + c.spent, 0)
  const totalBudget = MOCK.cats.reduce((s,c) => s + c.budget, 0)
  const trend = [28000, 31200, 29800, 33400, 35100, 42350]
  const months = ['Jun','Jul','Ago','Sep','Oct','Nov']
  const trendMax = Math.max(...trend)
  const trendMin = Math.min(...trend)
  const avgTrend = trend.reduce((s,v)=>s+v,0)/trend.length
  const momChange = ((trend[5] - trend[4]) / trend[4]) * 100
  const forecast = Math.round(trend[5] * 1.05)

  const spendByCat = MOCK.cats.map(c => ({
    ...c,
    color: themeTokens.accent[catMeta[c.id].color][tone],
    icon: Icon[catMeta[c.id].icon],
    pct: c.spent / totalSpent,
    overBudget: c.spent > c.budget,
    budgetPct: c.spent / c.budget,
  })).sort((a,b) => b.spent - a.spent)
  const maxCat = spendByCat[0].spent

  // Day-of-week pattern (dummy data, Mon–Sun)
  const dow = [420, 680, 520, 890, 1240, 1850, 980]
  const dowLabels = ['L','M','M','J','V','S','D']
  const dowMax = Math.max(...dow)
  const peakDay = dowLabels[dow.indexOf(dowMax)]

  // Smart insights — computed
  const insights = [
    {
      id: 'overrun',
      icon: Icon.alert,
      color: A.red[tone],
      tag: 'Alerta',
      title: 'Extra rebasó el presupuesto',
      body: 'Gastaste $150 de $0 planeados. Considera asignar $300 para que no se descontrole.',
      cta: 'Asignar presupuesto',
      priority: 1,
    },
    {
      id: 'weekend',
      icon: Icon.calendar,
      color: A.orange[tone],
      tag: 'Patrón',
      title: 'Los sábados gastas 3.4× más',
      body: `Tu día pico es ${peakDay} ($${dowMax.toLocaleString()} promedio). Si redujeras 30%, ahorrarías ~$2,220/mes.`,
      cta: 'Ver transacciones',
      priority: 2,
    },
    {
      id: 'forecast',
      icon: Icon.chart,
      color: A.blue[tone],
      tag: 'Pronóstico',
      title: `Diciembre proyectado: ${fmt(forecast)}`,
      body: `Al ritmo actual, cerrarás el mes ${momChange > 0 ? Math.round(momChange)+'% arriba' : Math.abs(Math.round(momChange))+'% abajo'} vs. noviembre. Tu promedio 6M es ${fmt(avgTrend)}.`,
      cta: 'Ver detalle',
      priority: 2,
    },
    {
      id: 'saving',
      icon: Icon.target,
      color: A.green[tone],
      tag: 'Oportunidad',
      title: 'Sube tu ahorro al 20%',
      body: 'Vas en 11.9%. Si dominas "Extra" y "Compras", puedes liberar $2,800/mes hacia tus metas.',
      cta: 'Ajustar metas',
      priority: 3,
    },
    {
      id: 'subs',
      icon: Icon.receipt,
      color: A.indigo[tone],
      tag: 'Suscripciones',
      title: '$890/mes en recurrentes',
      body: 'Detectamos 6 cargos fijos: Spotify, Netflix, iCloud, Gym, ChatGPT, Patreon. Cancela 2 y ahorra $340.',
      cta: 'Revisar',
      priority: 3,
    },
  ]

  return (
    <div>
      <NavBar title="Insights" onBack={onBack}/>
      <div style={{ padding: '4px 16px 20px' }}>
        <div style={{ padding: '4px 4px 4px' }}>
          <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Tus hábitos</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-1.2px' }}>Insights</div>
            <div style={{
              padding: '3px 9px', borderRadius: 999,
              background: `linear-gradient(135deg, ${A.indigo[tone]}, ${A.pink[tone]})`,
              color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.3px',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Icon.sparkle size={11}/>IA
            </div>
          </div>
        </div>

        {/* Hero — smart summary */}
        <div style={{
          margin: '16px 0', padding: '20px 22px', borderRadius: 22,
          background: `linear-gradient(135deg, ${A.indigo[tone]} 0%, ${A.purple[tone]} 55%, ${A.pink[tone]} 100%)`,
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.12)' }}/>
          <div style={{ position: 'absolute', right: 40, bottom: -50, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }}/>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase', opacity: 0.85, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon.sparkle size={12}/>Resumen del mes
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', lineHeight: 1.25, marginTop: 10 }}>
              Vas bien, pero noviembre está <b>{Math.round(momChange)}%</b> arriba del mes pasado. <span style={{ opacity: 0.85 }}>Tu mayor fuga fue</span> <b>Extra</b>.
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <HeroStat label="Gastado" value={fmt(totalSpent)}/>
              <div style={{ width: 0.5, background: 'rgba(255,255,255,.3)' }}/>
              <HeroStat label="vs. mes ant." value={`${momChange > 0 ? '+' : ''}${Math.round(momChange)}%`} negative={momChange > 0}/>
              <div style={{ width: 0.5, background: 'rgba(255,255,255,.3)' }}/>
              <HeroStat label="Proyección" value={fmt(forecast)}/>
            </div>
          </div>
        </div>

        {/* Segmented */}
        <div style={{ padding: '0 0 14px' }}>
          <Segmented value="mes" onChange={()=>{}} options={[
            {value:'semana',label:'Semana'},{value:'mes',label:'Mes'},{value:'6m',label:'6M'},{value:'ano',label:'Año'},
          ]}/>
        </div>

        {/* Trend chart */}
        <div style={{ background: 'var(--bgElev)', borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Tendencia 6 meses</div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginTop: 2 }}>{fmt(avgTrend)}</div>
              <div style={{ fontSize: 12, color: 'var(--textTer)', letterSpacing: '-0.1px' }}>promedio mensual</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: (momChange > 0 ? A.red[tone] : A.green[tone])+'22', color: momChange > 0 ? A.red[tone] : A.green[tone], borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
              <Icon.arrowUp size={12} style={{ transform: momChange > 0 ? 'none' : 'rotate(180deg)' }}/>
              {Math.abs(Math.round(momChange))}%
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, marginTop: 20 }}>
            {trend.map((v,i) => {
              const isLast = i === trend.length-1
              const isMin = v === trendMin
              const h = ((v - trendMin*0.6) / (trendMax - trendMin*0.6)) * 120
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: '100%', height: Math.max(10, h),
                    background: isLast ? `linear-gradient(to top, ${A.blue[tone]}, ${A.indigo[tone]})` : 'var(--fill)',
                    borderRadius: 6,
                    transition: 'height 700ms cubic-bezier(.2,.8,.2,1)',
                    position: 'relative',
                  }}>
                    {isLast && (
                      <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 600, color: A.blue[tone], whiteSpace: 'nowrap' }}>
                        {Math.round(v/1000)}k
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: isLast ? A.blue[tone] : 'var(--textSec)', letterSpacing: '-0.1px', fontWeight: isLast ? 600 : 400 }}>{months[i]}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI insights — cards */}
        <div style={{ fontSize: 13, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px', padding: '0 4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon.sparkle size={12}/>Sugerencias para ti
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {insights.map(ins => <InsightCard key={ins.id} insight={ins}/>)}
        </div>

        {/* Patterns — day of week */}
        <div style={{ fontSize: 13, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px', padding: '0 4px 8px' }}>Patrones</div>
        <div style={{ background: 'var(--bgElev)', borderRadius: 18, padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.1px' }}>Gasto por día de la semana</div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', marginTop: 2 }}>Sábado es tu día pico</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90, marginTop: 18 }}>
            {dow.map((v,i) => {
              const isMax = v === dowMax
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', height: Math.max(6, (v/dowMax)*80),
                    background: isMax ? A.orange[tone] : 'var(--fillSec)',
                    borderRadius: 4,
                    transition: 'height 700ms cubic-bezier(.2,.8,.2,1)',
                  }}/>
                  <div style={{ fontSize: 11, color: isMax ? A.orange[tone] : 'var(--textSec)', fontWeight: isMax ? 700 : 400, letterSpacing: '-0.1px' }}>{dowLabels[i]}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top categories breakdown */}
        <div style={{ fontSize: 13, color: 'var(--textSec)', textTransform: 'uppercase', letterSpacing: '.4px', padding: '0 4px 8px' }}>Dónde se va tu dinero</div>
        <div style={{ background: 'var(--bgElev)', borderRadius: 16, padding: '6px 0', marginBottom: 16 }}>
          {spendByCat.slice(0,6).map((s,i) => {
            const I = s.icon
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I size={18}/></div>
                  {s.overBudget && <div style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: 7, background: A.red[tone], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, border: '1.5px solid var(--bgElev)' }}>!</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.2px' }}>{s.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>{fmt(s.spent)}</div>
                      <div style={{ fontSize: 11, color: 'var(--textTer)', letterSpacing: '-0.1px', minWidth: 32, textAlign: 'right' }}>{Math.round(s.pct*100)}%</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'var(--fillSec)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: (s.spent/maxCat)*100+'%', background: s.color, transition: 'width 700ms cubic-bezier(.2,.8,.2,1)' }}/>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Compare callout */}
        <div style={{ background: 'var(--bgElev)', borderRadius: 18, padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: A.teal[tone], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.person size={22}/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.2px' }}>Comparado con gente como tú</div>
            <div style={{ fontSize: 12, color: 'var(--textSec)', letterSpacing: '-0.1px', marginTop: 2, lineHeight: 1.4 }}>
              Gastas <b style={{ color: A.red[tone] }}>12% más</b> en comidas y <b style={{ color: A.green[tone] }}>8% menos</b> en transporte que usuarios con ingreso similar.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroStat({ label, value, negative }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.4px', opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  )
}

function InsightCard({ insight }) {
  return (
    <div style={{ background: 'var(--bgElev)', borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: insight.color+'22', color: insight.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <insight.icon size={19}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.4px', color: insight.color, fontWeight: 700 }}>{insight.tag}</div>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px', marginTop: 3, lineHeight: 1.3 }}>{insight.title}</div>
        <div style={{ fontSize: 13, color: 'var(--textSec)', letterSpacing: '-0.15px', marginTop: 6, lineHeight: 1.45 }}>{insight.body}</div>
        {insight.cta && (
          <button style={{
            marginTop: 12, background: 'var(--fill)', border: 'none',
            padding: '8px 14px', borderRadius: 9, color: insight.color,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>{insight.cta} <Icon.chevR size={13}/></button>
        )}
      </div>
    </div>
  )
}

Object.assign(window, { InsightsScreenV2 })
