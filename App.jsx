import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabase.js'
import Auth from './Auth.jsx'
import * as db from './db.js'

const DEFAULT_CATS=[
  {id:'comidas',label:'Comidas',ico:'fork',clr:'orange',emoji:'🍽️',is_default:true,sort_order:0},
  {id:'compras',label:'Compras',ico:'cart',clr:'pink',emoji:'🛍️',is_default:true,sort_order:1},
  {id:'suscripciones',label:'Suscripciones',ico:'apps',clr:'purple',emoji:'📱',is_default:true,sort_order:2},
  {id:'transporte',label:'Transporte',ico:'car',clr:'teal',emoji:'🚌',is_default:true,sort_order:3},
  {id:'belleza',label:'Belleza',ico:'sparkle',clr:'yellow',emoji:'✨',is_default:true,sort_order:4},
  {id:'extra',label:'Extra',ico:'dice',clr:'indigo',emoji:'🎲',is_default:true,sort_order:5},
  {id:'ahorros',label:'Ahorros',ico:'piggy',clr:'green',emoji:'🏦',is_default:true,sort_order:6},
]
const DEBT_TYPES=[
  {id:'tarjeta',label:'Tarjeta de crédito',ico:'card'},
  {id:'prestamo',label:'Préstamo personal',ico:'bank'},
  {id:'hipoteca',label:'Hipoteca',ico:'house'},
  {id:'auto',label:'Auto',ico:'car'},
  {id:'familiar',label:'Familiar/Amigo',ico:'person'},
  {id:'otro',label:'Otro',ico:'receipt'},
]
const MN=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MNF=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const NOW=new Date()
const mk=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
const fmt=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(n||0)
const today=`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,'0')}-${String(NOW.getDate()).padStart(2,'0')}`
const calcMonths=(b,m,r)=>{if(m<=0||b<=0)return null;const mr=r/100/12;if(mr===0)return Math.ceil(b/m);if(m<=b*mr)return Infinity;return Math.ceil(-Math.log(1-(b*mr/m))/Math.log(1+mr))}

// iOS tokens
const TK={
  dark:{bg:'#000',bgE:'#1C1C1E',bgE2:'#2C2C2E',blur:'rgba(28,28,30,.88)',sep:'rgba(84,84,88,.35)',sepF:'rgba(255,255,255,.06)',tx:'#fff',txS:'rgba(235,235,245,.6)',txT:'rgba(235,235,245,.3)',fill:'rgba(120,120,128,.24)',fillS:'rgba(120,120,128,.18)'},
  light:{bg:'#F2F2F7',bgE:'#fff',bgE2:'#F9F9FB',blur:'rgba(255,255,255,.88)',sep:'rgba(60,60,67,.18)',sepF:'rgba(60,60,67,.08)',tx:'#000',txS:'rgba(60,60,67,.6)',txT:'rgba(60,60,67,.3)',fill:'rgba(120,120,128,.14)',fillS:'rgba(120,120,128,.08)'},
  a:{red:{d:'#FF453A',l:'#FF3B30'},orange:{d:'#FF9F0A',l:'#FF9500'},yellow:{d:'#FFD60A',l:'#FFCC00'},green:{d:'#30D158',l:'#34C759'},mint:{d:'#66D4CF',l:'#00C7BE'},teal:{d:'#64D2FF',l:'#30B0C7'},blue:{d:'#0A84FF',l:'#007AFF'},indigo:{d:'#5E5CE6',l:'#5856D6'},purple:{d:'#BF5AF2',l:'#AF52DE'},pink:{d:'#FF375F',l:'#FF2D55'},brown:{d:'#AC8E68',l:'#A2845E'}}
}

// SF icons
const SF=({d,s=22,w=1.8,fill,ch,st,children})=><svg width={s} height={s} viewBox="0 0 24 24" fill={fill||'none'} stroke={fill?'none':'currentColor'} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{display:'block',...st}}>{d&&<path d={d}/>}{ch||children}</svg>
const Ic={
  house:p=><SF {...p}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></SF>,
  chart:p=><SF {...p} d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>,
  card:p=><SF {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h3"/></SF>,
  target:p=><SF {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></SF>,
  person:p=><SF {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></SF>,
  fork:p=><SF {...p} d="M7 2v9a3 3 0 0 0 3 3v8M4 2v5a3 3 0 0 0 3 3M17 2c-2 0-3 2-3 5s1 5 3 5v10"/>,
  cart:p=><SF {...p}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12.5a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 7H6"/></SF>,
  apps:p=><SF {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></SF>,
  car:p=><SF {...p} d="M5 17h14M4 13l2-6h12l2 6M4 13v5h2v-2h12v2h2v-5"/>,
  sparkle:p=><SF {...p} d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>,
  dice:p=><SF {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1" fill="currentColor" stroke="none"/></SF>,
  piggy:p=><SF {...p} d="M19 8a3 3 0 0 0-2-1c-1-3-5-4-8-3S4 7 4 10c0 2 1 4 3 5v3h3v-2h4v2h3v-3c2-1 3-3 3-5 0-.6-.2-1.3-.5-1.8z"/>,
  bank:p=><SF {...p} d="M3 9l9-5 9 5v2H3zM5 11v7M9 11v7M15 11v7M19 11v7M3 20h18"/>,
  receipt:p=><SF {...p} d="M6 2h12v20l-2-1.5L14 22l-2-1.5L10 22l-2-1.5L6 22z"/>,
  plus:p=><SF {...p} w={2} d="M12 5v14M5 12h14"/>,
  minus:p=><SF {...p} d="M5 12h14"/>,
  chevL:p=><SF {...p} d="M15 6l-6 6 6 6"/>,
  chevR:p=><SF {...p} d="M9 6l6 6-6 6"/>,
  close:p=><SF {...p} w={2} d="M6 6l12 12M18 6L6 18"/>,
  edit:p=><SF {...p} d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>,
  trash:p=><SF {...p} d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>,
  check:p=><SF {...p} w={2.2} d="M20 6L9 17l-5-5"/>,
  search:p=><SF {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></SF>,
  bell:p=><SF {...p} d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>,
  moon:p=><SF {...p} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>,
  sun:p=><SF {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></SF>,
  download:p=><SF {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>,
  logout:p=><SF {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>,
  wallet:p=><SF {...p}><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H6a2 2 0 0 0-2 2v2M18 14h.01"/></SF>,
  arrowUp:p=><SF {...p} d="M12 19V5M5 12l7-7 7 7"/>,
  arrowDown:p=><SF {...p} d="M12 5v14M19 12l-7 7-7-7"/>,
  alert:p=><SF {...p} d="M12 3L2 20h20L12 3zM12 10v5M12 18h.01"/>,
  refresh:p=><SF {...p}><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></SF>,
}

// Activity Rings
function Rings({sz=170,th=17,gap=4,data,bg}){
  const rings=data.map((r,i)=>{const rad=sz/2-th/2-i*(th+gap),c=2*Math.PI*rad,p=Math.min(1,Math.max(0,r.v));return{...r,rad,c,off:c*(1-p)}})
  return <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{display:'block'}}>
    <defs>{rings.map((r,i)=><linearGradient key={i} id={`rg${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={r.color} stopOpacity=".7"/><stop offset="100%" stopColor={r.color}/></linearGradient>)}</defs>
    {rings.map((r,i)=><g key={i} transform={`rotate(-90 ${sz/2} ${sz/2})`}>
      <circle cx={sz/2} cy={sz/2} r={r.rad} fill="none" stroke={bg||'rgba(255,255,255,.08)'} strokeWidth={th}/>
      <circle cx={sz/2} cy={sz/2} r={r.rad} fill="none" stroke={`url(#rg${i})`} strokeWidth={th} strokeLinecap="round" strokeDasharray={r.c} strokeDashoffset={r.off} style={{transition:'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)'}}/>
    </g>)}
  </svg>
}

// Progress Ring
function Ring({sz=100,th=10,val=0,color,bg,children}){
  const r=sz/2-th/2,c=2*Math.PI*r,p=Math.min(1,Math.max(0,val))
  return <div style={{position:'relative',width:sz,height:sz}}>
    <svg width={sz} height={sz}><g transform={`rotate(-90 ${sz/2} ${sz/2})`}>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={bg||'rgba(255,255,255,.08)'} strokeWidth={th}/>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color} strokeWidth={th} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-p)} style={{transition:'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)'}}/>
    </g></svg>
    {children&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>{children}</div>}
  </div>
}

// Sheet
function Sheet({open,onClose,children}){
  const [m,setM]=useState(open),[sh,setSh]=useState(false)
  useEffect(()=>{if(open){setM(true);requestAnimationFrame(()=>setSh(true))}else{setSh(false);const t=setTimeout(()=>setM(false),320);return()=>clearTimeout(t)}},[open])
  if(!m)return null
  return <div style={{position:'fixed',inset:0,zIndex:200}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',opacity:sh?1:0,transition:'opacity .28s'}}/>
    <div style={{position:'absolute',left:0,right:0,bottom:0,maxHeight:'90%',background:'var(--bgE)',borderTopLeftRadius:22,borderTopRightRadius:22,boxShadow:'0 -20px 60px rgba(0,0,0,.5)',transform:sh?'translateY(0)':'translateY(100%)',transition:'transform .32s cubic-bezier(.2,.9,.2,1)',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',justifyContent:'center',padding:'8px 0 4px'}}><div style={{width:36,height:5,borderRadius:3,background:'var(--fill)'}}/></div>
      <div style={{overflowY:'auto',flex:1}}>{children}</div>
    </div>
  </div>
}

// NavBar
function NB({title,onBack,right,blue}){
  return <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 14px 8px',position:'sticky',top:0,zIndex:10,background:'var(--blur)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)'}}>
    {onBack?<button onClick={onBack} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer',display:'flex',alignItems:'center',gap:2}}><Ic.chevL s={22}/>Atrás</button>:<div style={{width:70}}/>}
    <div style={{fontSize:16,fontWeight:600,letterSpacing:'-.3px',color:'var(--tx)'}}>{title}</div>
    <div style={{minWidth:70,display:'flex',justifyContent:'flex-end'}}>{right||<div style={{width:36}}/>}</div>
  </div>
}

export default function App(){
  const [sess,setSess]=useState(null),[loading,setLoading]=useState(true)
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSess(session);setLoading(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSess(s))
    return()=>subscription.unsubscribe()
  },[])
  if(loading)return <Splash/>
  if(!sess)return <AuthView/>
  return <App2 user={sess.user}/>
}

function Splash(){
  return <div style={{minHeight:'100vh',background:'#000',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
    <div style={{textAlign:'center'}}>
      <div style={{width:80,height:80,borderRadius:20,background:'linear-gradient(135deg,#0A84FF,#BF5AF2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',boxShadow:'0 16px 40px rgba(10,132,255,.4)'}}><Ic.wallet s={40} st={{color:'#fff'}}/></div>
      <div style={{fontSize:28,fontWeight:700,letterSpacing:'-.8px',color:'#fff'}}>Finanzas</div>
      <div style={{fontSize:14,color:'rgba(235,235,245,.6)',marginTop:8}}>Cargando...</div>
    </div>
  </div>
}

function AuthView(){
  const [email,setEmail]=useState(''),[pass,setPass]=useState(''),[mode,setMode]=useState('in'),[load,setLoad]=useState(false),[err,setErr]=useState('')
  const go=async()=>{setLoad(true);setErr('');try{const{error}=mode==='in'?await supabase.auth.signInWithPassword({email,password:pass}):await supabase.auth.signUp({email,password:pass});if(error)setErr(error.message==='Invalid login credentials'?'Email o contraseña incorrectos':error.message)}catch(e){setErr('Error de conexión')}setLoad(false)}
  const inp={width:'100%',padding:'14px 16px',background:'#1C1C1E',border:'.5px solid rgba(84,84,88,.35)',borderRadius:13,color:'#fff',fontSize:16,outline:'none',boxSizing:'border-box',marginBottom:10,fontFamily:'-apple-system,sans-serif'}
  return <div style={{minHeight:'100vh',background:'#000',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 30px',fontFamily:'-apple-system,sans-serif',WebkitFontSmoothing:'antialiased'}}>
    <div style={{width:72,height:72,borderRadius:18,background:'linear-gradient(135deg,#0A84FF,#BF5AF2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24,boxShadow:'0 16px 40px rgba(191,90,242,.4)'}}><Ic.wallet s={36} st={{color:'#fff'}}/></div>
    <div style={{fontSize:32,fontWeight:700,letterSpacing:'-1px',color:'#fff',marginBottom:8}}>Finanzas</div>
    <div style={{fontSize:15,color:'rgba(235,235,245,.6)',marginBottom:36}}>{mode==='in'?'Inicia sesión':'Crea tu cuenta'}</div>
    <div style={{width:'100%',maxWidth:340}}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo electrónico" type="email" style={inp}/>
      <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Contraseña" type="password" style={inp}/>
      {err&&<div style={{fontSize:13,color:'#FF453A',textAlign:'center',marginBottom:10}}>{err}</div>}
      <button onClick={go} disabled={load} style={{width:'100%',padding:'14px',borderRadius:13,background:'#fff',color:'#000',border:'none',fontSize:16,fontWeight:600,cursor:'pointer',marginBottom:12}}>{load?'...':(mode==='in'?'Iniciar sesión':'Crear cuenta')}</button>
      <button onClick={()=>{setMode(m=>m==='in'?'up':'in');setErr('')}} style={{width:'100%',background:'none',border:'none',color:'#0A84FF',fontSize:14,cursor:'pointer'}}>{mode==='in'?'¿Primera vez? Crea una cuenta':'¿Ya tienes cuenta? Inicia sesión'}</button>
    </div>
  </div>
}

function App2({user}){
  const [theme,setTheme]=useState(()=>localStorage.getItem('fn2_theme')||'dark')
  const tn=theme==='dark'?'d':'l', t=theme==='dark'?TK.dark:TK.light, A=TK.a
  const ac=k=>A[k]?.[tn]||A.indigo[tn]

  const [sc,setSc]=useState('home')
  const [mon,setMon]=useState(mk(NOW))
  const [cats,setCats]=useState(DEFAULT_CATS)
  const [sals,setSals]=useState({})
  const [buds,setBuds]=useState({})
  const [exps,setExps]=useState({})
  const [incs,setIncs]=useState({})
  const [recur,setRecur]=useState([])
  const [goals,setGoals]=useState([])
  const [notes,setNotes]=useState({})
  const [debts,setDebts]=useState([])
  const [ready,setReady]=useState(false)
  const [selCat,setSelCat]=useState(null)
  const [selDebt,setSelDebt]=useState(null)
  const [sh,setSh]=useState(null)
  const [notif,setNotif]=useState(null)
  const [editE,setEditE]=useState(null)
  const [editD,setEditD]=useState(null)
  const [payD,setPayD]=useState(null)
  const [editC,setEditC]=useState(null)
  const [editG,setEditG]=useState(null)
  const [editBC,setEditBC]=useState(null)
  const [srch,setSrch]=useState('')
  const [tmpS,setTmpS]=useState('')
  const [tmpB,setTmpB]=useState('')
  const [addGId,setAddGId]=useState(null)
  const [autoApplied,setAutoApplied]=useState(0)
  const [addGA,setAddGA]=useState('')

  const bE={cat:cats[0]?.id||'comidas',amt:'',desc:'',date:today}
  const bD={name:'',type:'tarjeta',bal:'',orig:'',minP:'',rate:'',dueD:'',dueM:'',clr:'red'}
  const bC={label:'',ico:'sparkle',clr:'indigo',emoji:'🎲'}
  const bG={label:'',target:'',deadline:'',clr:'green',emoji:'🎯'}

  const [eF,setEF]=useState(bE)
  const [iF,setIF]=useState({label:'',amt:'',date:today})
  const [rF,setRF]=useState({label:'',amt:'',cat:'comidas',day:1,auto:true})
  const [gF,setGF]=useState(bG)
  const [dF,setDF]=useState(bD)
  const [pF,setPF]=useState({amt:'',date:today,note:'',expCat:null})
  const [cF,setCF]=useState(bC)

  const notify=(msg,type='ok')=>{setNotif({msg,type});setTimeout(()=>setNotif(null),3000)}
  const openSh=s=>setSh(s), closeSh=()=>setSh(null)

  useEffect(()=>{
    if(!user)return
    const load=async()=>{try{
      const [c,s,b,e,i,r,n,d,gs]=await Promise.all([
        db.fetchCategories(user.id),db.fetchSalaries(user.id),db.fetchBudgets(user.id),
        db.fetchExpenses(user.id),db.fetchIncomes(user.id),db.fetchRecurring(user.id),
        db.fetchNotes(user.id),db.fetchDebts(user.id),db.fetchGoals(user.id).catch(()=>[])
      ])
      if(c.length>0){setCats(c.map(x=>{const df=DEFAULT_CATS.find(d=>d.id===x.id);return{...x,ico:df?.ico||'sparkle',clr:df?.clr||'indigo',emoji:df?.emoji||x.icon||'🎲'}}))}
      else{await Promise.all(DEFAULT_CATS.map(x=>db.upsertCategory(user.id,{...x,icon:x.emoji})));setCats(DEFAULT_CATS)}
      setSals(s);setBuds(b);setIncs(i);setRecur(r);setNotes(n);setDebts(d);setGoals(gs||[])
      const todayMon=mk(NOW),todayDay=NOW.getDate(),eNew={...e}
      let autoCount=0
      for(const rec of r){
        if(!rec.auto) continue
        if(rec.day>todayDay) continue
        const already=(eNew[todayMon]||[]).some(ex=>ex.description===rec.label&&ex.category===rec.category)
        if(!already){
          const expDate=`${todayMon}-${String(rec.day).padStart(2,'0')}`
          const expData={category:rec.category,amount:rec.amount,description:rec.label,date:expDate}
          const row=await db.insertExpense(user.id,expData)
          if(row){eNew[todayMon]=[...(eNew[todayMon]||[]),{id:row.id,...expData}];autoCount++}
        }
      }
      setExps(eNew);if(autoCount>0)setAutoApplied(autoCount);setReady(true)
    }catch(err){console.error(err);setReady(true)}}
    load()
  },[user])

  const sal=sals[mon]??(Object.values(sals)[0]??0)
  const mE=exps[mon]||[], mI=incs[mon]||[]
  const tSpent=mE.reduce((s,e)=>s+e.amount,0)
  const tInc=sal+mI.reduce((s,e)=>s+e.amount,0)
  const avail=tInc-tSpent
  const savId=cats.find(c=>c.id==='ahorros')?.id||'ahorros'
  const mSav=mE.filter(e=>e.category===savId).reduce((s,e)=>s+e.amount,0)
  const cSp=id=>mE.filter(e=>e.category===id).reduce((s,e)=>s+e.amount,0)
  const cBud=id=>buds[id]??0
  const tDebt=debts.reduce((s,d)=>s+d.balance,0)
  const tMinP=debts.reduce((s,d)=>s+d.minPayment,0)
  const tSaved=Object.values(exps).flat().filter(e=>e.category===savId).reduce((s,e)=>s+e.amount,0)
  const catColor=cat=>cat?.clr?ac(cat.clr):ac('indigo')
  const catDisp=cat=>cat?.emoji||cat?.icon||DEFAULT_CATS.find(d=>d.id===cat?.id)?.emoji||'🎲'


  const last6=useMemo(()=>Array.from({length:6},(_,i)=>{
    const d=new Date(NOW.getFullYear(),NOW.getMonth()-5+i,1),key=mk(d)
    const mE2=exps[key]||[],mI2=incs[key]||[],sal2=sals[key]??(Object.values(sals)[0]??0)
    const spent=mE2.reduce((s,e)=>s+e.amount,0),inc=sal2+mI2.reduce((s,e)=>s+e.amount,0)
    return{key,short:MN[d.getMonth()],label:`${MNF[d.getMonth()]} ${d.getFullYear()}`,spent,inc,savings:mE2.filter(e=>e.category===savId).reduce((s,e)=>s+e.amount,0)}
  }),[exps,incs,sals,savId])

  const score=useMemo(()=>{try{
    let sc2=100;const factors=[],msgs=[]
    const sR=tInc>0?(mSav/tInc)*100:0,sP=sR>=20?25:sR>=10?18:sR>0?10:2;sc2-=(25-sP)
    factors.push({label:'Ahorro',val:Math.min(100,Math.round(sR*5)),hint:`${sR.toFixed(1)}% (meta 20%)`,ok:sR>=10})
    msgs.push(sR>=20?'Excelente ahorro 🏆':sR>=10?'Buen ahorro 👍':'Sin ahorros 😬')
    const cwb=cats.filter(c=>(buds[c.id]??0)>0),exc=cwb.filter(c=>cSp(c.id)>(buds[c.id]??0))
    const bP=cwb.length===0?15:exc.length===0?25:Math.max(0,25-exc.length*8);sc2-=(25-bP)
    factors.push({label:'Presupuesto',val:Math.round(bP/25*100),hint:exc.length>0?`${exc.length} excedida${exc.length>1?'s':''}`:'Al día',ok:exc.length===0})
    if(exc.length===0&&cwb.length>0)msgs.push('Presupuesto al día 🎯');else if(exc.length>0)msgs.push(`${exc.length} categoría${exc.length>1?'s':''} excedida${exc.length>1?'s':''} ⚠️`)
    const ad=debts.filter(d=>d.balance>0),paid=mE.filter(e=>(e.description||'').toLowerCase().includes('pago')).reduce((s,e)=>s+e.amount,0)
    const dP=ad.length===0?20:paid>=tMinP&&tMinP>0?20:paid>0?14:6;sc2-=(20-dP)
    factors.push({label:'Deudas',val:Math.round(dP/20*100),hint:ad.length===0?'Sin deudas':'Revisando',ok:dP>=18})
    const ratio=tInc>0?(tSpent/tInc)*100:100,rP=ratio>95?0:ratio>80?10:ratio>60?22:30;sc2-=Math.max(0,30-rP)
    factors.push({label:'Gasto/Ingreso',val:Math.round(100-Math.min(100,ratio)),hint:`${ratio.toFixed(0)}% del ingreso`,ok:ratio<80})
    if(ratio<60)msgs.push('Gasto controlado 💚');else if(ratio>95)msgs.push('Gastando demasiado 🚨')
    sc2=Math.max(0,Math.min(100,sc2))
    const grade=sc2>=90?'A+':sc2>=80?'A':sc2>=70?'B+':sc2>=60?'B':sc2>=50?'C':'D'
    const color=sc2>=80?ac('green'):sc2>=60?ac('blue'):sc2>=40?ac('orange'):ac('red')
    return{score:sc2,grade,color,factors,msgs}
  }catch(e){return{score:0,grade:'?',color:ac('blue'),factors:[],msgs:[]}}},[mE,mSav,cats,buds,tInc,tSpent,debts,tMinP,tn])

  const dueSoon=debts.filter(d=>{if(d.balance<=0||!d.dueDay)return false;const sm=!d.dueMonth||d.dueMonth===NOW.getMonth()+1;return sm&&d.dueDay>=NOW.getDate()&&d.dueDay<=NOW.getDate()+3})
  const overdue=debts.filter(d=>{if(d.balance<=0||!d.dueDay)return false;const sm=!d.dueMonth||d.dueMonth===NOW.getMonth()+1;return sm&&d.dueDay<NOW.getDate()})

  const srchRes=useMemo(()=>{
    if(!srch.trim())return []
    const q=srch.toLowerCase(),res=[]
    Object.entries(exps).forEach(([mk2,arr])=>arr.forEach(e=>{if((e.description||'').toLowerCase().includes(q)||(e.category||'').includes(q))res.push({...e,mk:mk2})}))
    return res.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30)
  },[srch,exps])

  // Actions
  const saveExp=async(cat,amt,desc,date)=>{
    if(!amt||+amt<=0){notify('Monto inválido','err');return}
    if(saveExp._s)return;saveExp._s=true
    const mk2=date.slice(0,7),data={category:cat,amount:+amt,description:desc,date}
    if(editE){await db.updateExpense(editE.id,data);setExps(p=>({...p,[editE.mk]:(p[editE.mk]||[]).map(e=>e.id===editE.id?{...e,...data}:e)}));notify('Gasto actualizado ✓')}
    else{const row=await db.insertExpense(user.id,data);if(row)setExps(p=>({...p,[mk2]:[...(p[mk2]||[]),{id:row.id,...data}]}));notify('Gasto agregado ✓')}
    saveExp._s=false;setEditE(null);closeSh()
  }
  const delExp=async(id,mk2)=>{await db.deleteExpense(id);setExps(p=>({...p,[mk2]:(p[mk2]||[]).filter(e=>e.id!==id)}));notify('Eliminado')}
  const delInc=async(id,mk2)=>{await db.deleteIncome(id);setIncs(p=>({...p,[mk2]:(p[mk2]||[]).filter(e=>e.id!==id)}));notify('Eliminado')}
  const delRec=async id=>{await db.deleteRecurring(id);setRecur(p=>p.filter(r=>r.id!==id))}
  const applyRec=async r=>{
    if(mE.some(e=>e.description===r.label&&e.category===r.category)){notify('Ya aplicado','err');return}
    const d=`${mon}-${String(r.day).padStart(2,'0')}`,exp={category:r.category,amount:r.amount,description:r.label,date:d}
    const row=await db.insertExpense(user.id,exp);if(row)setExps(p=>({...p,[mon]:[...(p[mon]||[]),{id:row.id,...exp}]}));notify(`"${r.label}" aplicado ✓`)
  }
  const saveInc=async()=>{
    if(!iF.amt||+iF.amt<=0){notify('Monto inválido','err');return}
    const mk2=iF.date.slice(0,7),row=await db.insertIncome(user.id,{label:iF.label,amount:+iF.amt,date:iF.date})
    if(row)setIncs(p=>({...p,[mk2]:[...(p[mk2]||[]),{id:row.id,label:iF.label,amount:+iF.amt,date:iF.date}]}))
    setIF({label:'',amt:'',date:today});closeSh();notify('Ingreso agregado ✓')
  }
  const saveRec=async()=>{
    if(!rF.label||!rF.amt){notify('Completa los campos','err');return}
    const row=await db.insertRecurring(user.id,{label:rF.label,amount:+rF.amt,category:rF.cat,day:rF.day,auto:rF.auto})
    if(row)setRecur(p=>[...p,{id:row.id,label:rF.label,amount:+rF.amt,category:rF.cat,day:rF.day,auto:rF.auto}])
    setRF({label:'',amt:'',cat:cats[0]?.id||'comidas',day:1,auto:true});closeSh();notify('Recurrente guardado ✓')
  }
  const saveSal=async()=>{await db.upsertSalary(user.id,mon,+tmpS||0);setSals(p=>({...p,[mon]:+tmpS||0}));closeSh();notify('Salario guardado ✓')}
  const saveBud=async id=>{await db.upsertBudget(user.id,id,+tmpB||0);setBuds(p=>({...p,[id]:+tmpB||0}));setEditBC(null);closeSh();notify('Tope guardado ✓')}
  const saveDebt=async()=>{
    if(!dF.name||!dF.bal){notify('Completa nombre y saldo','err');return}
    const data={name:dF.name,type:dF.type,balance:+dF.bal,originalAmount:+dF.orig||+dF.bal,minPayment:+dF.minP||0,interestRate:+dF.rate||0,dueDay:+dF.dueD||0,dueMonth:+dF.dueM||0,color:dF.clr}
    if(editD){await db.updateDebt(editD.id,data);setDebts(p=>p.map(d=>d.id===editD.id?{...d,...data}:d));notify('Deuda actualizada ✓')}
    else{const row=await db.insertDebt(user.id,data);if(row)setDebts(p=>[...p,{id:row.id,...data,payments:[]}]);notify('Deuda agregada ✓')}
    setEditD(null);setDF(bD);closeSh()
  }
  const delDebt=async id=>{await db.deleteDebt(id);setDebts(p=>p.filter(d=>d.id!==id));notify('Deuda eliminada')}
  const startEditDebt=d=>{setEditD(d);setDF({name:d.name,type:d.type,bal:String(d.balance),orig:String(d.originalAmount||d.balance),minP:String(d.minPayment||''),rate:String(d.interestRate||''),dueD:String(d.dueDay||''),dueM:String(d.dueMonth||''),clr:d.color||'red'});openSh('debt')}
  const regPay=async()=>{
    if(!pF.amt||+pF.amt<=0){notify('Monto inválido','err');return}
    if(regPay._s)return;regPay._s=true
    const amt=+pF.amt,nb=Math.max(0,payD.balance-amt)
    await db.updateDebt(payD.id,{...payD,balance:nb})
    const pr=await db.insertDebtPayment(user.id,payD.id,{amount:amt,date:pF.date,note:pF.note})
    setDebts(p=>p.map(d=>d.id!==payD.id?d:{...d,balance:nb,payments:[...(d.payments||[]),(pr?{id:pr.id,date:pF.date,amount:amt,note:pF.note}:{})]}))
    // Registrar como gasto si el usuario eligió una categoría
    if(pF.expCat){
      const expData={category:pF.expCat,amount:amt,description:`Pago ${payD.name}${pF.note?' · '+pF.note:''}`,date:pF.date}
      const expRow=await db.insertExpense(user.id,expData)
      if(expRow){const mk2=pF.date.slice(0,7);setExps(p=>({...p,[mk2]:[...(p[mk2]||[]),{id:expRow.id,...expData}]}))}
    }
    regPay._s=false;setPF({amt:'',date:today,note:'',expCat:null});setPayD(null);closeSh();notify('Pago registrado ✓')
  }
  const delPay=async(dId,pId,amt)=>{await db.deleteDebtPayment(pId);setDebts(p=>p.map(d=>d.id!==dId?d:{...d,balance:d.balance+amt,payments:d.payments.filter(p=>p.id!==pId)}));notify('Pago eliminado')}
  const saveGoal=async()=>{
    if(!gF.label||!gF.target){notify('Completa nombre y monto','err');return}
    const g={label:gF.label,target:+gF.target,deadline:gF.deadline||null,color:gF.clr||'green',icon:gF.emoji||'🎯'}
    if(editG){await db.updateGoalItem(editG.id,g);setGoals(p=>p.map(x=>x.id===editG.id?{...x,...g}:x));notify('Meta actualizada ✓')}
    else{const row=await db.insertGoalItem(user.id,g);if(row)setGoals(p=>[...p,{id:row.id,...g,saved:0}]);notify('Meta creada ✓')}
    setEditG(null);setGF(bG);closeSh()
  }
  const delGoal=async id=>{await db.deleteGoalItem(id);setGoals(p=>p.filter(x=>x.id!==id));notify('Meta eliminada')}
  const abonar=async(gid,amt)=>{
    if(!amt||+amt<=0){notify('Monto inválido','err');return}
    const exp={category:savId,amount:+amt,description:`Ahorro: ${goals.find(g=>g.id===gid)?.label||''}`,date:today}
    const row=await db.insertExpense(user.id,exp)
    if(row)setExps(p=>({...p,[today.slice(0,7)]:[...(p[today.slice(0,7)]||[]),{id:row.id,...exp}]}))
    await db.addToGoalItem(gid,+amt);setGoals(p=>p.map(g=>g.id===gid?{...g,saved:(g.saved||0)+(+amt)}:g));notify('Abono registrado ✓')
  }
  const exportCSV=()=>{
    const rows=[['Fecha','Categoria','Descripcion','Monto','Tipo']]
    Object.entries(exps).forEach(([,arr])=>arr.forEach(e=>rows.push([e.date,e.category,e.description||'',e.amount,'gasto'])))
    Object.entries(incs).forEach(([,arr])=>arr.forEach(e=>rows.push([e.date,'ingreso_extra',e.label||'',e.amount,'ingreso'])))
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='finanzas.csv';a.click()
    notify('CSV descargado ✓')
  }

  const cvars={'--bgE':t.bgE,'--bgE2':t.bgE2,'--blur':t.blur,'--sep':t.sep,'--sepF':t.sepF,'--tx':t.tx,'--txS':t.txS,'--txT':t.txT,'--fill':t.fill,'--fillS':t.fiS}
  const shI={width:'100%',padding:'14px',background:t.bgE2,border:`.5px solid ${t.sepF}`,borderRadius:13,color:t.tx,fontSize:16,outline:'none',marginBottom:10,boxSizing:'border-box',fontFamily:'-apple-system,sans-serif'}
  const blue=A.blue[tn]

  if(!ready)return <Splash/>

  // ── SCREENS ──

  const Home=()=>{
    const tBud=Object.values(buds).reduce((s,v)=>s+v,0)
    const bPct=tBud>0?tSpent/tBud:tInc>0?tSpent/tInc:0
    const sPct=tInc>0?mSav/(tInc*0.2):0
    const over80=cats.filter(c=>{const b=cBud(c.id),sp=cSp(c.id);return b>0&&sp/b>=.8})
    return <div style={{paddingBottom:90}}>
      <div style={{padding:'18px 20px 8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:13,color:t.txS}}>{MNF[new Date(mon+'-01').getMonth()]} {new Date(mon+'-01').getFullYear()}</div>
          <div style={{fontSize:34,fontWeight:700,letterSpacing:'-1.2px',marginTop:2,color:t.tx}}>Resumen</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={()=>{setTheme(v=>{const nv=v==='dark'?'light':'dark';localStorage.setItem('fn2_theme',nv);return nv})}} style={{width:36,height:36,borderRadius:18,border:'none',background:t.fill,color:t.tx,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>{theme==='dark'?<Ic.sun s={18}/>:<Ic.moon s={18}/>}</button>
          <select value={mon} onChange={e=>setMon(e.target.value)} style={{background:t.fill,border:'none',borderRadius:10,color:t.tx,padding:'6px 10px',fontSize:12,cursor:'pointer'}}>{last6.map(m=><option key={m.key} value={m.key}>{m.label}</option>)}</select>
          <button onClick={()=>setSc('profile')} style={{width:36,height:36,borderRadius:18,border:'none',background:`linear-gradient(135deg,${blue},${ac('purple')})`,color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{user.email?.charAt(0).toUpperCase()}</button>
        </div>
      </div>

      {/* ── Anillos + leyenda categorías ── */}
      {(()=>{
        const ringColors=[A.red[tn],A.teal[tn],A.green[tn]]
        const top3=(cats.filter(c=>cBud(c.id)>0).sort((a,b)=>cSp(b.id)-cSp(a.id)).slice(0,3).length>0
          ?cats.filter(c=>cBud(c.id)>0).sort((a,b)=>cSp(b.id)-cSp(a.id)).slice(0,3)
          :cats.filter(c=>cSp(c.id)>0).sort((a,b)=>cSp(b.id)-cSp(a.id)).slice(0,3))
        const hasBud=cats.some(c=>cBud(c.id)>0)
        const ringsData=top3.map((c,i)=>{
          const pct=hasBud&&cBud(c.id)>0?cSp(c.id)/cBud(c.id):cSp(c.id)/(tSpent||1)
          return{v:Math.min(pct,1.05),color:ringColors[i]}
        })
        return <div style={{display:'flex',alignItems:'center',gap:16,padding:'8px 16px 20px'}}>
          <Rings sz={170} th={17} gap={4} bg={theme==='dark'?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)'} data={ringsData.length>0?ringsData:[{v:0,color:A.red[tn]}]}/>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:14}}>
            {top3.map((c,i)=>{
              const rCol=ringColors[i]
              const pct=hasBud&&cBud(c.id)>0?Math.round(cSp(c.id)/cBud(c.id)*100):Math.round(cSp(c.id)/(tSpent||1)*100)
              const over=pct>=100
              return <div key={c.id} style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:10,height:10,borderRadius:5,background:rCol,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:t.tx,fontWeight:500}}>{catDisp(c)} {c.label}</div>
                  <div style={{fontSize:11,color:t.txS,marginTop:1}}>{fmt(cSp(c.id))}{hasBud&&cBud(c.id)>0?` de ${fmt(cBud(c.id))}`:''}</div>
                </div>
                <div style={{fontSize:14,fontWeight:700,color:over?A.red[tn]:rCol,flexShrink:0}}>{pct}%</div>
              </div>
            })}
            {top3.length===0&&<div style={{fontSize:13,color:t.txT,textAlign:'center'}}>Sin gastos aún</div>}
          </div>
        </div>
      })()}
      

      <div style={{margin:'0 16px 16px',background:t.bgE,borderRadius:20,padding:'22px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-30,top:-30,width:120,height:120,borderRadius:60,background:blue+'14'}}/>
        <div style={{fontSize:13,color:t.txS}}>Disponible</div>
        <div style={{display:'flex',alignItems:'baseline',gap:4,marginTop:6}}>
          <span style={{fontSize:15,color:t.txS,fontWeight:500}}>$</span>
          <span style={{fontSize:46,fontWeight:700,letterSpacing:'-2px',lineHeight:1,color:avail>=0?t.tx:A.red[tn]}}>{Math.abs(avail).toLocaleString('es-CO')}</span>
        </div>
        {avail<0&&<div style={{fontSize:12,color:A.red[tn],fontWeight:600,marginTop:4}}>⚠️ Déficit este mes</div>}
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <div style={{flex:1,display:'flex',alignItems:'center',gap:6}}><div style={{width:22,height:22,borderRadius:11,background:A.green[tn]+'28',display:'flex',alignItems:'center',justifyContent:'center',color:A.green[tn]}}><Ic.arrowDown s={12}/></div><div><div style={{fontSize:11,color:t.txS}}>Entró</div><div style={{fontSize:14,fontWeight:600,color:t.tx}}>{fmt(tInc)}</div></div></div>
          <div style={{flex:1,display:'flex',alignItems:'center',gap:6}}><div style={{width:22,height:22,borderRadius:11,background:A.red[tn]+'28',display:'flex',alignItems:'center',justifyContent:'center',color:A.red[tn]}}><Ic.arrowUp s={12}/></div><div><div style={{fontSize:11,color:t.txS}}>Salió</div><div style={{fontSize:14,fontWeight:600,color:t.tx}}>{fmt(tSpent)}</div></div></div>
          <button onClick={()=>{setTmpS(String(sal||''));openSh('salary')}} style={{background:t.fill,border:'none',borderRadius:10,color:blue,padding:'6px 12px',fontSize:13,cursor:'pointer',fontWeight:600}}>💼 Salario</button>
        </div>
      </div>

      {autoApplied>0&&<div style={{margin:'0 16px 12px',background:A.green[tn]+'18',border:`.5px solid ${A.green[tn]}40`,borderRadius:14,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}} onClick={()=>setAutoApplied(0)}>
        <div style={{width:28,height:28,borderRadius:8,background:A.green[tn],color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:14}}>⚡</div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>{autoApplied} gasto{autoApplied>1?'s':''} aplicado{autoApplied>1?'s':''} automáticamente</div><div style={{fontSize:11,color:t.txS}}>Al inicio de {MNF[new Date(mon+'-01').getMonth()]} · toca para cerrar</div></div>
      </div>}
      {(overdue.length>0||dueSoon.length>0)&&mon===mk(NOW)&&<div onClick={()=>setSc('debts')} style={{margin:'0 16px 12px',background:A.orange[tn]+'18',border:`.5px solid ${A.orange[tn]}40`,borderRadius:14,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
        <div style={{width:28,height:28,borderRadius:8,background:A.orange[tn],color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ic.bell s={15}/></div>
        <div style={{flex:1}}>{overdue.length>0&&<div style={{fontSize:13,fontWeight:600,color:t.tx}}>Vencidas: {overdue.map(d=>d.name).join(', ')}</div>}{dueSoon.length>0&&<div style={{fontSize:11,color:t.txS}}>Próximas: {dueSoon.map(d=>`${d.name} día ${d.dueDay}`).join(' · ')}</div>}</div>
        <Ic.chevR s={16} st={{color:t.txT}}/>
      </div>}
      
      <div style={{padding:'0 16px 16px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[{id:'categories',lb:'Categorías',ico:'apps',clr:'indigo'},{id:'insights',lb:'Insights',ico:'sparkle',clr:'pink'},{id:'recur',lb:'Recurrentes',ico:'refresh',clr:'teal'}].map(q=>{const QI=Ic[q.ico];return(
          <button key={q.id} onClick={()=>setSc(q.id)} style={{background:t.bgE,border:'none',borderRadius:14,padding:'12px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:8,color:t.tx}}>
            <div style={{width:30,height:30,borderRadius:8,background:ac(q.clr),color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}><QI s={17}/></div>
            <div style={{fontSize:13,fontWeight:500}}>{q.lb}</div>
          </button>
        )})}
      </div>

      <div style={{padding:'4px 20px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',color:t.tx}}>Categorías</div>
        <button onClick={()=>{setEditC(null);setCF(bC);openSh('cat')}} style={{background:'none',border:'none',color:blue,fontSize:15,fontWeight:500,cursor:'pointer'}}>+ Nueva</button>
      </div>
      <div style={{margin:'0 16px 20px',borderRadius:16,background:t.bgE,overflow:'hidden'}}>
        {cats.map((cat,i)=>{
          const sp=cSp(cat.id),bud=cBud(cat.id),pct=bud>0?Math.min(1.2,sp/bud):0,over=bud>0&&sp>bud,color=catColor(cat)
          return <div key={cat.id} onClick={()=>{setSelCat(cat);setSc('catDetail')}} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',borderBottom:i<cats.length-1?`.5px solid ${t.sepF}`:'none'}}>
            <div style={{width:36,height:36,borderRadius:10,background:color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:18}}>{catDisp(cat)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:8}}>
                <div style={{fontSize:16,fontWeight:500,letterSpacing:'-.3px',color:t.tx}}>{cat.label}</div>
                <div style={{fontSize:15,fontWeight:600,color:over?A.red[tn]:t.tx}}>{fmt(sp)}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:5}}>
                <div style={{flex:1,height:3,borderRadius:2,background:t.fiS,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(100,pct*100)}%`,background:over?A.red[tn]:color,transition:'width .6s'}}/></div>
                <div style={{fontSize:12,color:t.txS,minWidth:60,textAlign:'right'}}>{bud>0?`de ${fmt(bud)}`:'Sin tope'}</div>
              </div>
            </div>
          </div>
        })}
      </div>


      <div style={{margin:'0 16px 20px',background:`linear-gradient(135deg,${score.color},${score.color}88)`,borderRadius:20,padding:'20px',color:'#fff',cursor:'pointer'}} onClick={()=>setSc('score')}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div><div style={{fontSize:13,opacity:.8}}>Score financiero</div><div style={{fontSize:42,fontWeight:700,letterSpacing:'-1.5px',lineHeight:1,marginTop:4}}>{score.score}</div><div style={{fontSize:13,opacity:.85,marginTop:4}}>{score.grade} · {score.msgs[0]}</div></div>
          <Ring sz={72} th={8} val={score.score/100} color="rgba(255,255,255,.9)" bg="rgba(255,255,255,.2)"><div style={{fontSize:16,fontWeight:700,color:'#fff'}}>{score.grade}</div></Ring>
        </div>
      </div>

      <div style={{margin:'0 16px 24px'}}>
        <div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:8}}>Nota del mes</div>
        <textarea value={notes[mon]||''} onChange={e=>{const v=e.target.value;setNotes(p=>({...p,[mon]:v}));db.upsertNote(user.id,mon,v)}} placeholder="Observaciones..." style={{width:'100%',background:t.bgE,border:`.5px solid ${t.sep}`,borderRadius:14,color:t.tx,padding:'14px',fontSize:15,outline:'none',minHeight:70,resize:'vertical',boxSizing:'border-box'}}/>
      </div>
    </div>
  }

  const CatList=()=><div style={{paddingBottom:90}}>
    <NB title="Categorías" onBack={()=>setSc('home')} blue={blue} right={<button onClick={()=>{setEditC(null);setCF(bC);openSh('cat')}} style={{width:36,height:36,borderRadius:18,border:'none',background:t.fill,color:t.tx,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Ic.plus s={22}/></button>}/>
    <div style={{padding:'0 16px 20px'}}>
      <div style={{fontSize:34,fontWeight:700,letterSpacing:'-1.2px',padding:'8px 4px 16px',color:t.tx}}>Categorías</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {cats.map(cat=>{
          const sp=cSp(cat.id),bud=cBud(cat.id),pct=bud>0?Math.min(1,sp/bud):0,over=bud>0&&sp>bud,color=catColor(cat)
          return <div key={cat.id} onClick={()=>{setSelCat(cat);setSc('catDetail')}} style={{background:t.bgE,borderRadius:16,padding:16,cursor:'pointer',minHeight:156,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{width:36,height:36,borderRadius:10,background:color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{catDisp(cat)}</div>
              <Ring sz={38} th={4} val={pct} color={over?A.red[tn]:color} bg={t.fiS}><div style={{fontSize:9,fontWeight:700,color:over?A.red[tn]:t.tx}}>{Math.round(pct*100)}%</div></Ring>
            </div>
            <div><div style={{fontSize:13,color:t.txS}}>{cat.label}</div><div style={{fontSize:20,fontWeight:600,letterSpacing:'-.5px',marginTop:2,color:over?A.red[tn]:t.tx}}>{fmt(sp)}</div><div style={{fontSize:11,color:t.txT,marginTop:2}}>{bud>0?`Tope ${fmt(bud)}`:'Sin tope'}</div></div>
          </div>
        })}
        <button onClick={()=>{setEditC(null);setCF(bC);openSh('cat')}} style={{background:t.fiS,border:`.5px dashed ${t.sep}`,borderRadius:16,padding:20,color:t.txS,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,minHeight:156,fontFamily:'inherit'}}>
          <Ic.plus s={22}/><div style={{fontSize:14}}>Nueva</div>
        </button>
      </div>
    </div>
  </div>

  const CatDetail=()=>{
    if(!selCat)return null
    const cat=cats.find(c=>c.id===selCat.id)||selCat,color=catColor(cat)
    const catEs=[...mE.filter(e=>e.category===cat.id)].sort((a,b)=>b.date.localeCompare(a.date))
    const catT=catEs.reduce((s,e)=>s+e.amount,0),bud=cBud(cat.id),pct=bud>0?Math.min(1,catT/bud):0,over=bud>0&&catT>bud
    const daily=Array.from({length:7},(_,i)=>{const d=new Date(NOW);d.setDate(NOW.getDate()-6+i);const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return mE.filter(e=>e.category===cat.id&&e.date===ds).reduce((s,e)=>s+e.amount,0)})
    const dMax=Math.max(...daily,1),avg=daily.reduce((s,v)=>s+v,0)/7
    return <div style={{paddingBottom:90}}>
      <NB title={cat.label} onBack={()=>{setSc('categories');setSelCat(null)}} blue={blue} right={<button onClick={()=>{setEditC(cat);setCF({label:cat.label,ico:cat.ico,clr:cat.clr,emoji:cat.emoji||'🎲'});openSh('cat')}} style={{width:36,height:36,borderRadius:18,border:'none',background:t.fill,color:t.tx,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Ic.edit s={20}/></button>}/>
      <div style={{padding:'8px 20px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <div style={{width:48,height:48,borderRadius:13,background:color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{catDisp(cat)}</div>
          <div><div style={{fontSize:13,color:t.txS}}>{MNF[new Date(mon+'-01').getMonth()]} {new Date(mon+'-01').getFullYear()}</div><div style={{fontSize:28,fontWeight:700,letterSpacing:'-.8px',color:over?A.red[tn]:t.tx}}>{fmt(catT)}</div></div>
        </div>
        <div style={{background:t.bgE,borderRadius:18,padding:'18px 20px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div><div style={{fontSize:13,color:t.txS}}>Presupuesto</div>
              {bud>0?<div style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',marginTop:2,color:t.tx}}>{fmt(bud)}</div>
               :<button onClick={()=>{setEditBC(cat.id);setTmpB('');openSh('budget')}} style={{background:'none',border:'none',color:blue,fontSize:15,cursor:'pointer',fontWeight:600,padding:0,marginTop:2}}>+ Establecer tope</button>}
            </div>
            {bud>0&&<Ring sz={72} th={8} val={Math.min(1,pct)} color={over?A.red[tn]:color} bg={t.fiS}><div style={{fontSize:14,fontWeight:700,color:over?A.red[tn]:t.tx}}>{Math.round(pct*100)}%</div></Ring>}
          </div>
          {bud>0&&<><div style={{height:4,borderRadius:2,background:t.fiS,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(100,pct*100)}%`,background:over?A.red[tn]:color,transition:'width .7s'}}/></div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <div style={{fontSize:12,color:t.txS}}>Gastado {fmt(catT)}</div>
            <div style={{fontSize:12,color:over?A.red[tn]:A.green[tn],fontWeight:600}}>{over?`+${fmt(catT-bud)} sobre`:`${fmt(bud-catT)} libre`}</div>
          </div>
          <button onClick={()=>{setEditBC(cat.id);setTmpB(String(bud));openSh('budget')}} style={{background:'none',border:'none',color:blue,fontSize:13,cursor:'pointer',marginTop:8,padding:0}}>✏️ Cambiar tope</button></>}
        </div>
        <div style={{background:t.bgE,borderRadius:18,padding:'18px 20px',marginBottom:16}}>
          <div style={{fontSize:13,color:t.txS}}>Últimos 7 días · Promedio</div>
          <div style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',marginTop:2,marginBottom:16,color:t.tx}}>{fmt(avg)}<span style={{fontSize:13,color:t.txS,fontWeight:400}}> /día</span></div>
          <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
            {daily.map((v,i)=><div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
              <div style={{width:'100%',height:v===0?3:Math.max(8,(v/dMax)*80),background:v===0?t.fiS:color,borderRadius:4,opacity:v===0?.5:1,transition:'height .6s'}}/>
              <div style={{fontSize:10,color:t.txS}}>{'LMMJVSD'[i]}</div>
            </div>)}
          </div>
        </div>
        <div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',padding:'4px 4px 8px'}}>Movimientos ({catEs.length})</div>
        <div style={{background:t.bgE,borderRadius:16,overflow:'hidden',marginBottom:16}}>
          {catEs.length===0?<div style={{padding:30,textAlign:'center',color:t.txS}}>Sin gastos este mes</div>:
            catEs.map((exp,i)=><div key={exp.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<catEs.length-1?`.5px solid ${t.sepF}`:'none'}}>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:500,color:t.tx}}>{exp.description||cat.label}</div><div style={{fontSize:12,color:t.txS,marginTop:1}}>{exp.date}</div></div>
              <div style={{fontSize:15,fontWeight:600,color:t.tx}}>{fmt(exp.amount)}</div>
              <button onClick={()=>{setEditE({...exp,mk:mon});setEF({cat:exp.category,amt:String(exp.amount),desc:exp.description||'',date:exp.date});openSh('expense')}} style={{width:32,height:32,borderRadius:8,background:t.fill,border:'none',color:t.tx,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.edit s={15}/></button>
              <button onClick={()=>delExp(exp.id,mon)} style={{width:32,height:32,borderRadius:8,background:A.red[tn]+'18',border:'none',color:A.red[tn],cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.trash s={15}/></button>
            </div>)
          }
        </div>
        <button onClick={()=>{setSelCat(null);setEF({...bE,cat:cat.id});openSh('expense')}} style={{width:'100%',background:color,border:'none',borderRadius:14,color:'#fff',padding:'14px',fontSize:16,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontFamily:'inherit'}}><Ic.plus s={18}/>Agregar gasto</button>
        {!cat.is_default&&<button onClick={async()=>{await db.deleteCategory(cat.id);setCats(p=>p.filter(c=>c.id!==cat.id));setSc('categories');setSelCat(null);notify('Categoría eliminada')}} style={{width:'100%',marginTop:10,background:A.red[tn]+'18',border:'none',borderRadius:14,color:A.red[tn],padding:'12px',fontSize:14,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>🗑️ Eliminar categoría</button>}
      </div>
    </div>
  }

  const Moves=()=>{
    const all=[...mE.map(e=>({...e,tp:'g'})),...mI.map(e=>({...e,tp:'i'}))].sort((a,b)=>b.date.localeCompare(a.date))
    const grp={};all.forEach(item=>{if(!grp[item.date])grp[item.date]=[];grp[item.date].push(item)})
    const dks=Object.keys(grp).sort((a,b)=>b.localeCompare(a))
    const yd=`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,'0')}-${String(NOW.getDate()-1).padStart(2,'0')}`
    return <div style={{paddingBottom:90}}>
      <NB title="Gastos" onBack={()=>setSc('home')} blue={blue} right={<button onClick={()=>openSh('income')} style={{width:36,height:36,borderRadius:18,border:'none',background:A.green[tn]+'28',color:A.green[tn],display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Ic.plus s={22}/></button>}/>
      <div style={{padding:'4px 16px 20px'}}>
        <div style={{fontSize:34,fontWeight:700,letterSpacing:'-1.2px',padding:'8px 4px 16px',color:t.tx}}>Gastos</div>
        <div style={{background:t.bgE,borderRadius:14,padding:'10px 14px',display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
          <Ic.search s={16} st={{color:t.txS}}/><input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Buscar en todos los meses..." style={{background:'none',border:'none',color:t.tx,fontSize:15,outline:'none',flex:1}}/>
          {srch&&<button onClick={()=>setSrch('')} style={{background:'none',border:'none',color:t.txS,cursor:'pointer'}}><Ic.close s={16}/></button>}
        </div>
        {srch?(<>
          <div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:8}}>Resultados ({srchRes.length})</div>
          <div style={{background:t.bgE,borderRadius:16,overflow:'hidden'}}>
            {srchRes.length===0?<div style={{padding:30,textAlign:'center',color:t.txS}}>Sin resultados</div>:
              srchRes.map((item,i)=>{const cat=cats.find(c=>c.id===item.category),color=catColor(cat)
                return <div key={item.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<srchRes.length-1?`.5px solid ${t.sepF}`:'none'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:color+'22',color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{catDisp(cat)}</div>
                  <div style={{flex:1}}><div style={{fontSize:15,fontWeight:500,color:t.tx}}>{item.description||cat?.label}</div><div style={{fontSize:12,color:t.txS}}>{item.date} · {MNF[new Date(item.mk+'-01').getMonth()]}</div></div>
                  <span style={{fontSize:14,fontWeight:600,color}}>{fmt(item.amount)}</span>
                  <button onClick={()=>{setEditE({...item,mk:item.mk});setEF({cat:item.category,amt:String(item.amount),desc:item.description||'',date:item.date});openSh('expense')}} style={{width:30,height:30,borderRadius:8,background:t.fill,border:'none',color:t.tx,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.edit s={14}/></button>
                  <button onClick={()=>delExp(item.id,item.mk)} style={{width:30,height:30,borderRadius:8,background:A.red[tn]+'18',border:'none',color:A.red[tn],cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.trash s={14}/></button>
                </div>
              })
            }
          </div>
        </>):(
          <>
            {all.length===0?<div style={{textAlign:'center',color:t.txS,padding:'50px 0'}}>Sin movimientos · Toca + para agregar</div>:
              dks.map(date=><div key={date}>
                <div style={{fontSize:13,fontWeight:600,color:blue,margin:'16px 4px 8px'}}>{date===today?'Hoy':date===yd?'Ayer':date}</div>
                <div style={{background:t.bgE,borderRadius:16,overflow:'hidden',marginBottom:8}}>
                  {grp[date].map((item,i)=>{const cat=cats.find(c=>c.id===item.category),isI=item.tp==='i',color=isI?A.green[tn]:catColor(cat),em=isI?'↓':cat?catDisp(cat):'💰'
                    return <div key={item.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<grp[date].length-1?`.5px solid ${t.sepF}`:'none'}}>
                      <div style={{width:36,height:36,borderRadius:10,background:color+'22',color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{isI?'💰':catDisp(cat)}</div>
                      <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:t.tx}}>{item.description||item.label||cat?.label}</div><div style={{fontSize:12,color:t.txS}}>{isI?'Ingreso':cat?.label}</div></div>
                      <span style={{fontSize:15,fontWeight:600,color:isI?A.green[tn]:t.tx}}>{isI?'+':'-'}{fmt(item.amount)}</span>
                      {!isI&&<button onClick={()=>{setEditE({...item,mk:mon});setEF({cat:item.category,amt:String(item.amount),desc:item.description||'',date:item.date});openSh('expense')}} style={{width:30,height:30,borderRadius:8,background:t.fill,border:'none',color:t.tx,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.edit s={14}/></button>}
                      <button onClick={()=>isI?delInc(item.id,mon):delExp(item.id,mon)} style={{width:30,height:30,borderRadius:8,background:A.red[tn]+'18',border:'none',color:A.red[tn],cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.trash s={14}/></button>
                    </div>
                  })}
                </div>
              </div>)
            }
            <div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',margin:'16px 4px 8px'}}>Gastos fijos</div>
            <button onClick={()=>openSh('recur')} style={{width:'100%',background:t.fiS,border:`.5px dashed ${t.sep}`,borderRadius:14,color:blue,padding:'13px',fontSize:15,fontWeight:500,cursor:'pointer',marginBottom:8,fontFamily:'inherit'}}>+ Agregar gasto recurrente</button>
            {recur.map(r=>{
              const cat=cats.find(c=>c.id===r.category)
              const applied=mE.some(e=>e.description===r.label&&e.category===r.category)
              const color=catColor(cat)
              const pending=!applied&&r.day<=NOW.getDate()
              const future=!applied&&r.day>NOW.getDate()
              const daysLeft=r.day-NOW.getDate()
              return <div key={r.id} style={{background:t.bgE,border:pending?`.5px solid ${A.orange[tn]}40`:'0.5px solid transparent',borderRadius:14,padding:'12px 16px',marginBottom:6,display:'flex',alignItems:'center',gap:12,opacity:applied?.6:1}}>
                <div style={{width:34,height:34,borderRadius:10,background:color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{catDisp(cat)}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{fontSize:15,fontWeight:500,color:t.tx}}>{r.label}</div>
                    <div style={{fontSize:14,fontWeight:600,color:applied?t.txS:color}}>{fmt(r.amount)}</div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:3}}>
                    <div style={{fontSize:11,color:t.txS}}>Día {r.day} · {cat?.label}{r.auto?' · auto':''}</div>
                    {applied&&<span style={{fontSize:10,background:A.green[tn]+'22',color:A.green[tn],borderRadius:20,padding:'1px 7px'}}>aplicado</span>}
                    {pending&&<span style={{fontSize:10,background:A.orange[tn]+'22',color:A.orange[tn],borderRadius:20,padding:'1px 7px'}}>pendiente</span>}
                    {future&&<span style={{fontSize:10,background:t.fiS,color:t.txS,borderRadius:20,padding:'1px 7px'}}>día {r.day}</span>}
                  </div>
                </div>
                {pending&&!r.auto&&<button onClick={()=>applyRec(r)} style={{background:color+'28',border:'none',borderRadius:8,color,padding:'6px 10px',fontSize:12,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>Aplicar</button>}
                <button onClick={()=>delRec(r.id)} style={{width:30,height:30,borderRadius:8,background:A.red[tn]+'18',border:'none',color:A.red[tn],cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.trash s={14}/></button>
              </div>
            })}
            <button onClick={exportCSV} style={{width:'100%',marginTop:12,background:t.bgE,border:`.5px solid ${t.sep}`,borderRadius:14,color:t.tx,padding:'13px',fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontWeight:500,fontFamily:'inherit'}}><Ic.download s={18}/>Exportar a CSV</button>
          </>
        )}
      </div>
    </div>
  }

  const Debts=()=>{
    const active=debts.filter(d=>d.balance>0),paid=debts.filter(d=>d.balance<=0)
    const tOrig=debts.reduce((s,d)=>s+(d.originalAmount||d.balance),0),paidOff=tOrig-tDebt,prog=tOrig>0?paidOff/tOrig:0
    return <div style={{paddingBottom:90}}>
      <NB title="Deudas" onBack={()=>setSc('home')} blue={blue} right={<button onClick={()=>{setEditD(null);setDF(bD);openSh('debt')}} style={{width:36,height:36,borderRadius:18,border:'none',background:t.fill,color:t.tx,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Ic.plus s={22}/></button>}/>
      <div style={{padding:'4px 16px 20px'}}>
        <div style={{fontSize:34,fontWeight:700,letterSpacing:'-1.2px',padding:'8px 4px 20px',color:t.tx}}>Deudas</div>
        <div style={{background:t.bgE,borderRadius:22,padding:22,marginBottom:16,display:'flex',gap:18,alignItems:'center'}}>
          <Ring sz={110} th={12} val={prog} color={A.green[tn]} bg={t.fiS}><div style={{textAlign:'center'}}><div style={{fontSize:20,fontWeight:700,letterSpacing:'-.5px',lineHeight:1,color:t.tx}}>{Math.round(prog*100)}%</div><div style={{fontSize:10,color:t.txS,marginTop:2}}>pagado</div></div></Ring>
          <div style={{flex:1}}><div style={{fontSize:13,color:t.txS}}>Deuda total</div><div style={{fontSize:30,fontWeight:700,letterSpacing:'-1px',lineHeight:1,marginTop:2,color:t.tx}}>{fmt(tDebt)}</div><div style={{fontSize:12,color:t.txS,marginTop:6}}>de {fmt(tOrig)} inicial</div><div style={{marginTop:10,padding:'6px 10px',background:t.fill,borderRadius:8,display:'inline-block'}}><div style={{fontSize:10,color:t.txS}}>Pago mín/mes</div><div style={{fontSize:13,fontWeight:600,color:t.tx}}>{fmt(tMinP)}</div></div></div>
        </div>
        {overdue.map(d=><div key={d.id} style={{background:A.orange[tn]+'22',border:`.5px solid ${A.orange[tn]}40`,borderRadius:14,padding:'10px 14px',marginBottom:10,display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:A.orange[tn],color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Ic.bell s={16}/></div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:t.tx}}>{d.name} vencida</div><div style={{fontSize:11,color:t.txS}}>Pago mínimo {fmt(d.minPayment)}</div></div>
        </div>)}
        {debts.length===0?<div style={{textAlign:'center',color:t.txS,padding:'50px 0'}}><div style={{fontSize:36,marginBottom:10}}>🎉</div>Sin deudas</div>:<>
          {active.length>0&&<><div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',padding:'0 4px 8px'}}>Activas ({active.length})</div>
          <div style={{background:t.bgE,borderRadius:16,overflow:'hidden',marginBottom:16}}>
            {active.map((d,i)=>{
              const color=A[d.color]?.[tn]||A.red[tn],paidP=(d.originalAmount||d.balance)>0?((d.originalAmount||d.balance)-d.balance)/(d.originalAmount||d.balance):0
              const DT=DEBT_TYPES.find(tp=>tp.id===d.type),DI=Ic[DT?.ico||'card']||Ic.card
              return <div key={d.id} onClick={()=>{setSelDebt(d);setSc('debtDetail')}} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',borderBottom:i<active.length-1?`.5px solid ${t.sepF}`:'none'}}>
                <div style={{width:38,height:38,borderRadius:11,background:color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><DI s={20}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:8}}><div style={{fontSize:15,fontWeight:600,letterSpacing:'-.3px',color:t.tx}}>{d.name}</div><div style={{fontSize:15,fontWeight:700,color}}>{fmt(d.balance)}</div></div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:5}}><div style={{flex:1,height:3,borderRadius:2,background:t.fiS,overflow:'hidden'}}><div style={{height:'100%',width:`${paidP*100}%`,background:color,transition:'width .6s'}}/></div><div style={{fontSize:11,color:t.txS}}>{d.dueDay?`Día ${d.dueDay}`:'—'}</div></div>
                </div>
              </div>
            })}
          </div></>}
          {paid.length>0&&<><div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',padding:'0 4px 8px'}}>Pagadas 🎉</div>
          <div style={{background:t.bgE,borderRadius:16,overflow:'hidden',marginBottom:16,opacity:.6}}>
            {paid.map((d,i)=>{const DT=DEBT_TYPES.find(tp=>tp.id===d.type),DI=Ic[DT?.ico||'card']||Ic.card
              return <div key={d.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<paid.length-1?`.5px solid ${t.sepF}`:'none'}}>
                <DI s={20} st={{color:t.txS}}/><div style={{flex:1}}><div style={{fontSize:15,textDecoration:'line-through',color:t.txS}}>{d.name}</div></div>
                <button onClick={()=>delDebt(d.id)} style={{background:'none',border:'none',color:A.red[tn],cursor:'pointer'}}><Ic.trash s={16}/></button>
              </div>
            })}
          </div></>}
          <button onClick={()=>{setEditD(null);setDF(bD);openSh('debt')}} style={{width:'100%',background:t.fill,border:'none',borderRadius:14,color:blue,padding:'14px',fontSize:15,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontFamily:'inherit'}}><Ic.plus s={18}/>Agregar deuda</button>
        </>}
      </div>
    </div>
  }

  const DebtDetail=()=>{
    if(!selDebt)return null
    const d=debts.find(x=>x.id===selDebt.id)||selDebt
    const color=A[d.color]?.[tn]||A.red[tn],months=calcMonths(d.balance,d.minPayment,d.interestRate)
    const paidP=(d.originalAmount||d.balance)>0?((d.originalAmount||d.balance)-d.balance)/(d.originalAmount||d.balance):0
    const tInt=months&&months!==Infinity?(months*d.minPayment)-d.balance:null
    const DT=DEBT_TYPES.find(tp=>tp.id===d.type),DI=Ic[DT?.ico||'card']||Ic.card
    return <div style={{paddingBottom:90}}>
      <NB title={d.name} onBack={()=>{setSc('debts');setSelDebt(null)}} blue={blue} right={<button onClick={()=>startEditDebt(d)} style={{width:36,height:36,borderRadius:18,border:'none',background:t.fill,color:t.tx,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Ic.edit s={20}/></button>}/>
      <div style={{padding:'8px 20px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <div style={{width:48,height:48,borderRadius:13,background:color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}><DI s={26}/></div>
          <div><div style={{fontSize:13,color:t.txS}}>{DT?.label}</div><div style={{fontSize:28,fontWeight:700,letterSpacing:'-.8px',color}}>{fmt(d.balance)}</div></div>
        </div>
        <div style={{background:t.bgE,borderRadius:18,padding:'18px 20px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div><div style={{fontSize:13,color:t.txS}}>Saldo original</div><div style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',marginTop:2,color:t.tx}}>{fmt(d.originalAmount||d.balance)}</div></div>
            <Ring sz={72} th={8} val={paidP} color={A.green[tn]} bg={t.fiS}><div style={{fontSize:14,fontWeight:700,color:A.green[tn]}}>{Math.round(paidP*100)}%</div></Ring>
          </div>
          <div style={{height:4,borderRadius:2,background:t.fiS,overflow:'hidden'}}><div style={{height:'100%',width:`${paidP*100}%`,background:A.green[tn],transition:'width .7s'}}/></div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:12}}><div style={{color:t.txS}}>Pagado {fmt((d.originalAmount||d.balance)-d.balance)}</div>{months&&months!==Infinity&&<div style={{color:A.green[tn],fontWeight:600}}>Libre en {months} meses</div>}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
          {[{l:'Interés',v:`${d.interestRate}%`,c:A.orange[tn]},{l:'Pago mín',v:fmt(d.minPayment),c:blue},{l:'Vence',v:d.dueDay?`Día ${d.dueDay}`:'—',c:A.red[tn]}].map(x=><div key={x.l} style={{background:t.bgE,borderRadius:12,padding:'10px 8px',textAlign:'center'}}><div style={{fontSize:9,color:t.txS,textTransform:'uppercase',marginBottom:4}}>{x.l}</div><div style={{fontSize:14,fontWeight:700,color:x.c}}>{x.v}</div></div>)}
        </div>
        {tInt!==null&&<div style={{background:A.yellow[tn]+'22',border:`.5px solid ${A.yellow[tn]}40`,borderRadius:12,padding:'10px 14px',marginBottom:16,fontSize:13,color:t.tx}}>💡 Pagarás aprox. <b style={{color:A.orange[tn]}}>{fmt(tInt)}</b> en intereses con el pago mínimo</div>}
        <button onClick={()=>{setPayD(d);setPF({amt:String(d.minPayment||''),date:today,note:''});openSh('payment')}} style={{width:'100%',background:A.green[tn],border:'none',borderRadius:14,color:'#fff',padding:'14px',fontSize:16,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:16,fontFamily:'inherit'}}><Ic.check s={18}/>Registrar pago</button>
        <div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:8}}>Historial de pagos</div>
        <div style={{background:t.bgE,borderRadius:16,overflow:'hidden'}}>
          {(!d.payments||d.payments.length===0)?<div style={{padding:20,textAlign:'center',color:t.txS}}>Sin pagos registrados</div>:
            [...(d.payments||[])].reverse().map((p,i)=><div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<d.payments.length-1?`.5px solid ${t.sepF}`:'none'}}>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:A.green[tn]}}>{fmt(p.amount)}</div><div style={{fontSize:12,color:t.txS}}>{p.date}{p.note?` · ${p.note}`:''}</div></div>
              <button onClick={()=>delPay(d.id,p.id,p.amount)} style={{width:30,height:30,borderRadius:8,background:A.red[tn]+'18',border:'none',color:A.red[tn],cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.trash s={14}/></button>
            </div>)
          }
        </div>
      </div>
    </div>
  }

  const Savings=()=>{
    const tSavedG=goals.reduce((s,g)=>s+(g.saved||0),0),tTarget=goals.reduce((s,g)=>s+g.target,0),prog=tTarget>0?tSavedG/tTarget:0
    const wk=new Date(NOW);wk.setDate(NOW.getDate()-NOW.getDay())
    const wkStr=`${wk.getFullYear()}-${String(wk.getMonth()+1).padStart(2,'0')}-${String(wk.getDate()).padStart(2,'0')}`
    const wkExp=mE.filter(e=>e.date>=wkStr).reduce((s,e)=>s+e.amount,0)
    const l7=Array.from({length:7},(_,i)=>{const d=new Date(NOW);d.setDate(NOW.getDate()-6+i);const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return mE.filter(e=>e.date===ds).reduce((s,e)=>s+e.amount,0)})
    const l7max=Math.max(...l7,1)
    return <div style={{paddingBottom:90}}>
      <NB title="Ahorros" onBack={()=>setSc('home')} blue={blue} right={<button onClick={()=>{setEditG(null);setGF(bG);openSh('goalitem')}} style={{width:36,height:36,borderRadius:18,border:'none',background:t.fill,color:t.tx,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Ic.plus s={22}/></button>}/>
      <div style={{padding:'4px 16px 20px'}}>
        <div style={{fontSize:34,fontWeight:700,letterSpacing:'-1.2px',padding:'8px 4px 20px',color:t.tx}}>Ahorros</div>
        <div style={{background:`linear-gradient(135deg,${A.green[tn]},${A.teal[tn]})`,borderRadius:22,padding:'22px 22px',color:'#fff',marginBottom:16}}>
          <div style={{fontSize:13,opacity:.8}}>Total ahorrado</div>
          <div style={{fontSize:42,fontWeight:700,letterSpacing:'-1.5px',marginTop:4,lineHeight:1}}>{fmt(tSaved)}</div>
          {goals.length>0&&<><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:16}}><div style={{fontSize:13,opacity:.85}}>de {fmt(tTarget)} en {goals.length} metas</div><div style={{fontSize:20,fontWeight:700}}>{Math.round(prog*100)}%</div></div>
          <div style={{height:6,borderRadius:3,background:'rgba(255,255,255,.25)',marginTop:10,overflow:'hidden'}}><div style={{height:'100%',width:`${prog*100}%`,background:'#fff',borderRadius:3,transition:'width .8s'}}/></div></>}
        </div>
        <div style={{background:t.bgE,borderRadius:18,padding:'18px 20px',marginBottom:16}}>
          <div style={{fontSize:13,color:t.txS}}>Esta semana · Gasto</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4,marginBottom:14}}><div style={{fontSize:24,fontWeight:700,letterSpacing:'-.5px',color:t.tx}}>{fmt(wkExp)}</div></div>
          <div style={{display:'flex',alignItems:'flex-end',gap:5,height:50}}>
            {l7.map((v,i)=><div key={i} style={{flex:1,height:v===0?3:Math.max(5,(v/l7max)*50),background:i===6?A.green[tn]:t.fill,borderRadius:3,transition:'height .6s'}}/>)}
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',color:t.tx}}>Metas</div>
          <button onClick={()=>{setEditG(null);setGF(bG);openSh('goalitem')}} style={{background:'none',border:'none',color:blue,fontSize:15,fontWeight:500,cursor:'pointer'}}>+ Nueva</button>
        </div>
        {goals.length===0?<div style={{background:t.bgE,borderRadius:16,padding:30,textAlign:'center',color:t.txS,marginBottom:16}}>Sin metas · Toca "+ Nueva"</div>:
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
            {goals.map(g=>{
              const gc=A[g.color]?.[tn]||A.green[tn],pct=g.target>0?Math.min(1,(g.saved||0)/g.target):0
              const dl=g.deadline?Math.ceil((new Date(g.deadline)-NOW)/86400000):null
              return <div key={g.id} style={{background:t.bgE,borderRadius:16,padding:16,minHeight:156,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:gc+'22',color:gc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{g.icon||g.emoji||'🎯'}</div>
                  <Ring sz={38} th={4} val={pct} color={gc} bg={t.fiS}><div style={{fontSize:9,fontWeight:700,color:gc}}>{Math.round(pct*100)}%</div></Ring>
                </div>
                <div><div style={{fontSize:13,color:t.txS}}>{g.label}</div><div style={{fontSize:18,fontWeight:600,letterSpacing:'-.4px',marginTop:2,color:t.tx}}>{fmt(g.saved||0)}</div><div style={{fontSize:11,color:t.txT,marginTop:2}}>de {fmt(g.target)}</div>{dl!==null&&<div style={{fontSize:10,color:dl<30?A.red[tn]:t.txT,marginTop:2}}>{dl>0?`${dl}d restantes`:'¡Cumplida!'}</div>}</div>
                <div style={{display:'flex',gap:5,marginTop:8}}>
                  {addGId===g.id?(<><input value={addGA} onChange={e=>setAddGA(e.target.value)} type="number" placeholder="$" style={{flex:1,background:t.fiS,border:'none',borderRadius:8,color:t.tx,padding:'6px 8px',fontSize:13,outline:'none'}} autoFocus/><button onClick={()=>{abonar(g.id,addGA);setAddGId(null);setAddGA('')}} style={{background:gc,border:'none',borderRadius:8,color:'#fff',padding:'6px 10px',cursor:'pointer',fontWeight:700,fontFamily:'inherit'}}>✓</button><button onClick={()=>{setAddGId(null);setAddGA('')}} style={{background:t.fill,border:'none',borderRadius:8,color:t.txS,padding:'6px 8px',cursor:'pointer',fontFamily:'inherit'}}>✕</button></>):
                  (<><button onClick={()=>setAddGId(g.id)} style={{flex:1,background:gc+'22',border:'none',borderRadius:8,color:gc,padding:'7px',fontSize:11,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>💰 Abonar</button><button onClick={()=>{setEditG(g);setGF({label:g.label,target:String(g.target),deadline:g.deadline||'',clr:g.color||'green',emoji:g.icon||g.emoji||'🎯'});openSh('goalitem')}} style={{width:30,height:30,background:t.fill,border:'none',borderRadius:8,color:t.tx,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.edit s={14}/></button><button onClick={()=>delGoal(g.id)} style={{width:30,height:30,background:A.red[tn]+'18',border:'none',borderRadius:8,color:A.red[tn],cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.trash s={14}/></button></>)}
                </div>
              </div>
            })}
          </div>
        }
        <div style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',marginBottom:12,color:t.tx}}>Tendencia 6 meses</div>
        <div style={{background:t.bgE,borderRadius:18,padding:'18px 20px'}}>
          <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
            {last6.map((m,i)=>{const mx=Math.max(...last6.map(x=>x.savings),1);return <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}><div style={{width:'100%',height:m.savings===0?3:Math.max(6,(m.savings/mx)*80),background:m.key===mon?A.green[tn]:t.fill,borderRadius:4,transition:'height .6s'}}/><div style={{fontSize:10,color:t.txS}}>{m.short}</div></div>})}
          </div>
        </div>
      </div>
    </div>
  }

  const Score=()=><div style={{paddingBottom:90}}>
    <NB title="Score" onBack={()=>setSc('home')} blue={blue}/>
    <div style={{padding:'4px 16px 20px'}}>
      <div style={{fontSize:34,fontWeight:700,letterSpacing:'-1.2px',padding:'8px 4px 20px',color:t.tx}}>Score</div>
      <div style={{background:t.bgE,borderRadius:22,padding:'22px',marginBottom:16,display:'flex',flexDirection:'column',alignItems:'center'}}>
        <Ring sz={140} th={14} val={score.score/100} color={score.color} bg={t.fiS}><div style={{textAlign:'center'}}><div style={{fontSize:38,fontWeight:700,letterSpacing:'-1.5px',lineHeight:1,color:t.tx}}>{score.score}</div><div style={{fontSize:16,fontWeight:600,color:score.color,marginTop:2}}>{score.grade}</div></div></Ring>
        <div style={{marginTop:16,fontSize:18,fontWeight:600,color:score.color}}>{score.grade==='A+'||score.grade==='A'?'Excelente 🌟':score.grade==='B+'||score.grade==='B'?'Bien 👍':score.grade==='C'?'Regular ⚡':'Mejorar 💪'}</div>
      </div>
      <div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:8}}>Desglose</div>
      {score.factors.map((f,i)=><div key={i} style={{background:t.bgE,borderRadius:16,padding:'14px 16px',marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div><div style={{fontSize:15,fontWeight:500,letterSpacing:'-.3px',color:t.tx}}>{f.label}</div><div style={{fontSize:12,color:t.txS,marginTop:2}}>{f.hint}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',color:f.ok?A.green[tn]:A.orange[tn]}}>{f.val}</div><div style={{fontSize:11,color:t.txS}}>/ 100</div></div>
        </div>
        <div style={{height:4,borderRadius:2,background:t.fiS,overflow:'hidden'}}><div style={{height:'100%',width:`${f.val}%`,background:f.ok?A.green[tn]:A.orange[tn],transition:'width .7s'}}/></div>
      </div>)}
      <div style={{background:`linear-gradient(135deg,${A.indigo[tn]},${blue})`,borderRadius:18,padding:18,color:'#fff',marginTop:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><Ic.sparkle s={18}/><div style={{fontSize:12,textTransform:'uppercase',letterSpacing:'.5px',opacity:.85}}>Cómo mejorar</div></div>
        <div style={{fontSize:15,fontWeight:500,letterSpacing:'-.2px',lineHeight:1.4}}>{score.msgs[0]}</div>
      </div>
    </div>
  </div>

  const Insights=()=>{
    const tBud=Object.values(buds).reduce((s,v)=>s+v,0),momMax=Math.max(...last6.map(m=>m.spent),1)
    const momChange=last6.length>1?((last6[5].spent-last6[4].spent)/Math.max(last6[4].spent,1))*100:0
    const top=[...cats].sort((a,b)=>cSp(b.id)-cSp(a.id)).slice(0,4)
    return <div style={{paddingBottom:90}}>
      <NB title="Insights" onBack={()=>setSc('home')} t={t}/>
      <div style={{padding:'4px 16px 20px'}}>
        <div style={{fontSize:34,fontWeight:700,letterSpacing:'-1.2px',padding:'8px 4px 20px',color:t.tx}}>Insights</div>
        <div style={{background:t.bgE,borderRadius:18,padding:'18px 20px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
            <div><div style={{fontSize:13,color:t.txS}}>Tendencia de gasto</div><div style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',marginTop:2,color:t.tx}}>{fmt(tSpent)}</div></div>
            <div style={{padding:'4px 10px',background:momChange>0?A.red[tn]+'22':A.green[tn]+'22',color:momChange>0?A.red[tn]:A.green[tn],borderRadius:999,fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>{momChange>0?<Ic.arrowUp s={12}/>:<Ic.arrowDown s={12}/>}{Math.abs(momChange).toFixed(0)}%</div>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
            {last6.map((m,i)=><div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}><div style={{width:'100%',height:m.spent===0?3:Math.max(8,(m.spent/momMax)*80),background:m.key===mon?blue:t.fill,borderRadius:4,transition:'height .6s'}}/><div style={{fontSize:10,color:t.txS}}>{m.short}</div></div>)}
          </div>
        </div>
        <div style={{fontSize:22,fontWeight:700,letterSpacing:'-.5px',marginBottom:12,color:t.tx}}>Por categoría</div>
        <div style={{background:t.bgE,borderRadius:16,overflow:'hidden',marginBottom:16}}>
          {top.map((c,i)=>{const sp=cSp(c.id),color=catColor(c),pct=tSpent>0?sp/tSpent:0
            return <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderBottom:i<top.length-1?`.5px solid ${t.sepF}`:'none'}}>
              <div style={{width:36,height:36,borderRadius:10,background:color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:18}}>{catDisp(c)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><div style={{fontSize:15,fontWeight:500,color:t.tx}}>{c.label}</div><div style={{fontSize:14,fontWeight:600,color:t.tx}}>{fmt(sp)}</div></div>
                <div style={{height:3,background:t.fiS,borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${pct*100}%`,background:color,transition:'width .6s'}}/></div>
                <div style={{fontSize:11,color:t.txS,marginTop:3}}>{(pct*100).toFixed(0)}% del gasto total</div>
              </div>
            </div>
          })}
        </div>
        <div style={{background:`linear-gradient(135deg,${A.indigo[tn]},${A.purple[tn]})`,borderRadius:18,padding:18,color:'#fff'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><Ic.sparkle s={18}/><div style={{fontSize:12,textTransform:'uppercase',letterSpacing:'.5px',opacity:.8}}>Sugerencia</div></div>
          <div style={{fontSize:16,fontWeight:500,letterSpacing:'-.2px',lineHeight:1.4}}>{tSpent>tBud&&tBud>0?`Excediste tu presupuesto en ${fmt(tSpent-tBud)}. Revisa tus categorías.`:mSav===0?`Considera apartar ${fmt(Math.round(tInc*0.1))} (10% del ingreso) para ahorros.`:`¡Vas bien! Llevas ${fmt(mSav)} ahorrados este mes.`}</div>
        </div>
      </div>
    </div>
  }

  const RecurScreen=()=>{
    const [showForm,setShowForm]=useState(false)
    return <div style={{paddingBottom:90}}>
      <NB title="Recurrentes" onBack={()=>setSc('home')} t={t} right={
        <button onClick={()=>openSh('recur')} style={{width:36,height:36,borderRadius:18,border:'none',background:t.fi,color:t.tx,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Ic.plus s={22}/></button>
      }/>
      <div style={{padding:'0 16px 20px'}}>
        <div style={{fontSize:34,fontWeight:700,letterSpacing:'-1.2px',padding:'8px 4px 16px',color:t.tx}}>Recurrentes</div>

        {/* Summary */}
        <div style={{background:t.bgE,borderRadius:18,padding:'16px 18px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div>
              <div style={{fontSize:13,color:t.txS}}>Total mensual fijo</div>
              <div style={{fontSize:28,fontWeight:700,letterSpacing:'-0.8px',color:t.tx}}>{fmt(recur.reduce((s,r)=>s+r.amount,0))}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:13,color:t.txS}}>{recur.length} gastos fijos</div>
              <div style={{fontSize:13,color:A.green[tn],marginTop:4}}>{recur.filter(r=>mE.some(e=>e.description===r.label&&e.category===r.category)).length} aplicados este mes</div>
            </div>
          </div>
          <div style={{height:4,background:t.fiS,borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${recur.length>0?(recur.filter(r=>mE.some(e=>e.description===r.label&&e.category===r.category)).length/recur.length)*100:0}%`,background:A.green[tn],transition:'width 600ms',borderRadius:2}}/>
          </div>
        </div>

        {/* Auto vs Manual */}
        {recur.length>0&&<><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          <div style={{background:A.green[tn]+'18',borderRadius:14,padding:'12px 14px'}}>
            <div style={{fontSize:11,color:A.green[tn],marginBottom:4}}>⚡ Automáticos</div>
            <div style={{fontSize:22,fontWeight:700,color:t.tx}}>{recur.filter(r=>r.auto).length}</div>
            <div style={{fontSize:11,color:t.txS,marginTop:2}}>{fmt(recur.filter(r=>r.auto).reduce((s,r)=>s+r.amount,0))}/mes</div>
          </div>
          <div style={{background:t.bgE,borderRadius:14,padding:'12px 14px',border:`0.5px solid ${t.sep}`}}>
            <div style={{fontSize:11,color:t.txS,marginBottom:4}}>👆 Manuales</div>
            <div style={{fontSize:22,fontWeight:700,color:t.tx}}>{recur.filter(r=>!r.auto).length}</div>
            <div style={{fontSize:11,color:t.txS,marginTop:2}}>{fmt(recur.filter(r=>!r.auto).reduce((s,r)=>s+r.amount,0))}/mes</div>
          </div>
        </div></>}

        {/* List */}
        {recur.length===0
          ?<div style={{background:t.bgE,borderRadius:16,padding:'40px 20px',textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:12}}>🔄</div>
            <div style={{fontSize:16,fontWeight:500,color:t.tx,marginBottom:8}}>Sin gastos recurrentes</div>
            <div style={{fontSize:14,color:t.txS,marginBottom:20}}>Agrega tus pagos fijos como Netflix, arriendo, gym...</div>
            <button onClick={()=>openSh('recur')} style={{background:A.teal[tn],border:'none',borderRadius:12,color:'#fff',padding:'12px 24px',fontSize:15,fontWeight:600,cursor:'pointer'}}>+ Agregar primero</button>
          </div>
          :<div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[...recur].sort((a,b)=>a.day-b.day).map(r=>{
              const cat=cats.find(c=>c.id===r.category)
              const applied=mE.some(e=>e.description===r.label&&e.category===r.category)
              const color=catColor(cat)
              const pending=!applied&&r.day<=NOW.getDate()
              const future=!applied&&r.day>NOW.getDate()
              return <div key={r.id} style={{background:t.bgE,borderRadius:16,padding:'14px 16px',border:pending?`.5px solid ${A.orange[tn]}40`:`0.5px solid ${t.sepF}`}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:12,background:color+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{catDisp(cat)}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                      <div style={{fontSize:16,fontWeight:500,color:t.tx}}>{r.label}</div>
                      <div style={{fontSize:16,fontWeight:700,color:applied?t.txS:color}}>{fmt(r.amount)}</div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
                      <div style={{fontSize:12,color:t.txS}}>Día {r.day} · {cat?.label}</div>
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        {r.auto&&<span style={{fontSize:10,background:A.teal[tn]+'22',color:A.teal[tn],borderRadius:20,padding:'2px 7px'}}>⚡ auto</span>}
                        {applied&&<span style={{fontSize:10,background:A.green[tn]+'22',color:A.green[tn],borderRadius:20,padding:'2px 7px'}}>✓ aplicado</span>}
                        {pending&&<span style={{fontSize:10,background:A.orange[tn]+'22',color:A.orange[tn],borderRadius:20,padding:'2px 7px'}}>pendiente</span>}
                        {future&&<span style={{fontSize:10,background:t.fiS,color:t.txS,borderRadius:20,padding:'2px 7px'}}>día {r.day}</span>}
                      </div>
                    </div>
                  </div>
                </div>
                {pending&&!r.auto&&<div style={{marginTop:10,display:'flex',gap:8}}>
                  <button onClick={()=>applyRec(r)} style={{flex:1,background:color,border:'none',borderRadius:10,color:'#fff',padding:'9px',fontSize:13,fontWeight:600,cursor:'pointer'}}>Aplicar ahora</button>
                  <button onClick={()=>delRec(r.id)} style={{width:36,height:36,background:A.red[tn]+'18',border:'none',borderRadius:10,color:A.red[tn],cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.trash s={15}/></button>
                </div>}
                {(applied||future||r.auto)&&<div style={{marginTop:8,display:'flex',justifyContent:'flex-end'}}>
                  <button onClick={()=>delRec(r.id)} style={{width:30,height:30,background:A.red[tn]+'18',border:'none',borderRadius:8,color:A.red[tn],cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.trash s={14}/></button>
                </div>}
              </div>
            })}
          </div>
        }
        <button onClick={()=>openSh('recur')} style={{width:'100%',marginTop:12,background:t.fi,border:`0.5px dashed ${t.sep}`,borderRadius:14,color:blue,padding:'13px',fontSize:15,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <Ic.plus s={18}/>Agregar recurrente
        </button>
      </div>
    </div>
  }


  const Profile=()=><div style={{paddingBottom:90}}>
    <NB title="Perfil" onBack={()=>setSc('home')} blue={blue}/>
    <div style={{padding:'0 0 24px'}}>
      <div style={{fontSize:34,fontWeight:700,letterSpacing:'-1.2px',padding:'8px 20px 20px',color:t.tx}}>Perfil</div>
      <div style={{margin:'0 16px 24px',background:t.bgE,borderRadius:16,padding:20,display:'flex',alignItems:'center',gap:14}}>
        <div style={{width:56,height:56,borderRadius:'50%',background:`linear-gradient(135deg,${blue},${ac('purple')})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:22,fontWeight:600}}>{user.email?.charAt(0).toUpperCase()}</div>
        <div style={{flex:1}}><div style={{fontSize:19,fontWeight:600,letterSpacing:'-.4px',color:t.tx}}>{user.email?.split('@')[0]}</div><div style={{fontSize:14,color:t.txS}}>{user.email}</div></div>
      </div>
      <div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',padding:'0 20px 8px'}}>Preferencias</div>
      <div style={{margin:'0 16px 24px',background:t.bgE,borderRadius:14,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px'}}>
          <div style={{width:30,height:30,borderRadius:7,background:ac('indigo'),display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><Ic.moon s={18}/></div>
          <div style={{flex:1,fontSize:16,color:t.tx}}>Apariencia</div>
          <div style={{display:'flex',background:t.fill,borderRadius:9,padding:2}}>
            {['light','dark'].map(v=><button key={v} onClick={()=>{setTheme(v);localStorage.setItem('fn2_theme',v)}} style={{padding:'6px 12px',background:theme===v?t.bgE:'transparent',color:t.tx,border:'none',borderRadius:7,cursor:'pointer',fontSize:13,fontWeight:theme===v?600:500,transition:'all 200ms',fontFamily:'inherit'}}>{v==='light'?'Claro':'Oscuro'}</button>)}
          </div>
        </div>
      </div>
      <div style={{fontSize:13,color:t.txS,textTransform:'uppercase',letterSpacing:'.4px',padding:'0 20px 8px'}}>Datos</div>
      <div style={{margin:'0 16px 24px',background:t.bgE,borderRadius:14,overflow:'hidden'}}>
        <div onClick={exportCSV} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',cursor:'pointer',borderBottom:`.5px solid ${t.sepF}`}}>
          <div style={{width:30,height:30,borderRadius:7,background:ac('mint'),display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><Ic.download s={18}/></div>
          <div style={{flex:1,fontSize:16,color:t.tx}}>Exportar a CSV</div><Ic.chevR s={16} st={{color:t.txT}}/>
        </div>
        <div onClick={()=>{setTmpS(String(sal||''));openSh('salary')}} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',cursor:'pointer'}}>
          <div style={{width:30,height:30,borderRadius:7,background:blue,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><Ic.wallet s={18}/></div>
          <div style={{flex:1,fontSize:16,color:t.tx}}>Configurar salario</div><Ic.chevR s={16} st={{color:t.txT}}/>
        </div>
      </div>
      <div style={{margin:'0 16px'}}><button onClick={()=>supabase.auth.signOut()} style={{width:'100%',background:A.red[tn]+'18',border:'none',borderRadius:14,color:A.red[tn],padding:'14px',fontSize:16,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'inherit'}}><Ic.logout s={18}/>Cerrar sesión</button></div>
      <div style={{textAlign:'center',fontSize:12,color:t.txT,padding:'16px 20px 0'}}>Finanzas Pro · v2.0</div>
    </div>
  </div>

  // ── EXPENSE SHEET (numpad) ──
  const ExpSheet=()=>{
    const [amt,setAmt]=useState(editE?String(editE.amount):'')
    const [desc,setDesc]=useState(editE?.description||'')
    const [cat,setCat]=useState(editE?.category||eF.cat||cats[0]?.id||'comidas')
    const [date,setDate]=useState(editE?.date||today)
    const press=k=>{if(k==='del')setAmt(a=>a.slice(0,-1));else if(k==='.'){if(!amt.includes('.'))setAmt(a=>(a||'0')+'.')}else setAmt(a=>{if(a==='0')return k;if(a.includes('.')&&a.split('.')[1].length>=2)return a;return a+k})}
    const keys=['1','2','3','4','5','6','7','8','9','.','0','del']
    const [ip,dp]=(amt||'0').split('.')
    const ac2=cats.find(c=>c.id===cat)||cats[0],cc=catColor(ac2)
    const doSave=async()=>{
      if(!amt||+amt<=0){notify('Monto inválido','err');return}
      if(doSave._s)return;doSave._s=true
      const data={category:cat,amount:+amt,description:desc,date},mk2=date.slice(0,7)
      if(editE){await db.updateExpense(editE.id,data);setExps(p=>({...p,[editE.mk]:(p[editE.mk]||[]).map(e=>e.id===editE.id?{...e,...data}:e)}));notify('Gasto actualizado ✓')}
      else{const row=await db.insertExpense(user.id,data);if(row)setExps(p=>({...p,[mk2]:[...(p[mk2]||[]),{id:row.id,...data}]}));notify('Gasto agregado ✓')}
      doSave._s=false;setEditE(null);closeSh()
    }
    return <div style={{padding:'0 0 24px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 20px 12px'}}>
        <button onClick={()=>{closeSh();setEditE(null)}} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer'}}>Cancelar</button>
        <div style={{fontSize:17,fontWeight:600,letterSpacing:'-.3px',color:t.tx}}>{editE?'Editar gasto':'Nuevo gasto'}</div>
        <button onClick={doSave} disabled={!amt||+amt<=0} style={{background:'none',border:'none',color:(!amt||+amt<=0)?t.txT:blue,fontSize:17,fontWeight:600,cursor:(!amt||+amt<=0)?'default':'pointer',letterSpacing:'-.2px'}}>Guardar</button>
      </div>
      <div style={{textAlign:'center',padding:'16px 20px 20px'}}>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'center',gap:2}}>
          <span style={{fontSize:28,color:t.txS,fontWeight:500,marginRight:4}}>$</span>
          <span style={{fontSize:68,fontWeight:700,letterSpacing:'-3px',lineHeight:1,color:amt?cc:t.txT}}>{ip||'0'}</span>
          {dp!==undefined&&<span style={{fontSize:32,fontWeight:700,letterSpacing:'-1px',color:amt?cc:t.txT}}>.{(dp||'').padEnd(2,'0').slice(0,2)}</span>}
        </div>
        <div style={{fontSize:12,color:t.txS,marginTop:4}}>COP · {date}</div>
      </div>
      <div style={{padding:'0 16px 12px'}}><input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descripción..." style={{width:'100%',padding:'12px 14px',background:t.bgE2,border:`.5px solid ${t.sepF}`,borderRadius:12,color:t.tx,fontSize:15,outline:'none',boxSizing:'border-box'}}/></div>
      <div style={{padding:'0 16px 12px'}}><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%',padding:'10px 14px',background:t.bgE2,border:`.5px solid ${t.sepF}`,borderRadius:12,color:t.tx,fontSize:14,outline:'none',boxSizing:'border-box'}}/></div>
      <div style={{padding:'0 16px 14px',overflowX:'auto'}}>
        <div style={{display:'flex',gap:8,minWidth:'min-content'}}>
          {cats.map(c=>{const cc2=catColor(c),active=cat===c.id
            return <button key={c.id} onClick={()=>setCat(c.id)} style={{background:active?cc2:t.bgE2,color:active?'#fff':t.tx,border:`.5px solid ${active?cc2:t.sepF}`,borderRadius:10,padding:'9px 13px',display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:13,fontWeight:500,flexShrink:0,transition:'all 180ms',fontFamily:'inherit'}}>{catDisp(c)} {c.label}</button>})}
        </div>
      </div>
      <div style={{padding:'0 12px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {keys.map(k=><button key={k} onClick={()=>press(k)} style={{padding:'14px 0',background:t.bgE2,border:'none',borderRadius:14,color:t.tx,fontSize:26,fontWeight:400,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>{k==='del'?<Ic.chevL s={22}/>:k}</button>)}
      </div>
    </div>
  }

  // ── BOTTOM NAV ──
  const BNav=()=>{
    const navSc=['home','categories','catDetail','insights','profile','recur'].includes(sc)?'home':sc==='moves'?'moves':['debts','debtDetail'].includes(sc)?'debts':sc==='savings'?'savings':sc==='score'?'score':sc
    return <div style={{position:'fixed',bottom:0,left:0,right:0,background:t.blur,backdropFilter:'blur(30px) saturate(180%)',WebkitBackdropFilter:'blur(30px) saturate(180%)',borderTop:`.5px solid ${t.sep}`,padding:'8px 0 20px',display:'flex',alignItems:'center',justifyContent:'space-around',zIndex:20}}>
      {[{id:'home',lb:'Resumen',Icon:Ic.house},{id:'moves',lb:'Gastos',Icon:Ic.receipt},{id:'debts',lb:'Deudas',Icon:Ic.card},{id:'savings',lb:'Ahorros',Icon:Ic.target},{id:'score',lb:'Score',Icon:Ic.chart}].map(item=>{
        const active=navSc===item.id,color=active?t.tx:t.txS
        return <button key={item.id} onClick={()=>{setSc(item.id);setSelCat(null);setSelDebt(null)}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color,transition:'color 200ms',fontFamily:'inherit'}}>
          <item.Icon s={24} st={{color}}/><div style={{fontSize:10,fontWeight:active?600:400,letterSpacing:'-.1px'}}>{item.lb}</div>
        </button>
      })}
      <button onClick={()=>{setEditE(null);setEF({...bE,cat:cats[0]?.id||'comidas'});openSh('expense')}} style={{width:44,height:44,borderRadius:'50%',background:t.tx,color:t.bg,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 -6px',boxShadow:theme==='dark'?'0 4px 14px rgba(255,255,255,.15)':'0 4px 14px rgba(0,0,0,.2)',fontFamily:'inherit'}}><Ic.plus s={22}/></button>
    </div>
  }

  const renderSc=()=>{switch(sc){case 'categories':return <CatList/>;case 'catDetail':return <CatDetail/>;case 'moves':return <Moves/>;case 'debts':return <Debts/>;case 'debtDetail':return <DebtDetail/>;case 'savings':return <Savings/>;case 'score':return <Score/>;case 'profile':return <Profile/>;case 'insights':return <Insights/>;case'recur':return <RecurScreen/>;case'moves':return <Moves/>;default:return <Home/>}}
  const noNav=['catDetail','debtDetail'].includes(sc)
  const shInp2={...shI,fontFamily:'inherit'}
  const shSel={...shI,cursor:'pointer',fontFamily:'inherit'}

  return <div style={{...cvars,background:t.bg,color:t.tx,minHeight:'100vh',fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif',WebkitFontSmoothing:'antialiased',MozOsxFontSmoothing:'grayscale',overflowX:'hidden'}}>
    <style>{`@keyframes sld{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}} input[type="date"]::-webkit-calendar-picker-indicator{filter:${theme==='dark'?'invert(1)':'none'}} ::-webkit-scrollbar{display:none} *{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    {notif&&<div style={{position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',background:notif.type==='err'?A.red[tn]:A.green[tn],color:'#fff',padding:'10px 20px',borderRadius:30,fontSize:14,fontWeight:600,zIndex:500,whiteSpace:'nowrap',boxShadow:'0 6px 20px rgba(0,0,0,.3)',animation:'sld .3s ease both'}}>{notif.msg}</div>}
    {renderSc()}
    {!noNav&&<BNav/>}

    <Sheet open={sh==='expense'} onClose={()=>{closeSh();setEditE(null)}}><ExpSheet/></Sheet>

    <Sheet open={sh==='income'} onClose={closeSh}>
      <div style={{padding:'0 20px 30px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0 20px'}}>
          <button onClick={closeSh} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer'}}>Cancelar</button>
          <div style={{fontSize:17,fontWeight:600,color:t.tx}}>Ingreso extra</div>
          <button onClick={saveInc} style={{background:'none',border:'none',color:blue,fontSize:17,fontWeight:600,cursor:'pointer'}}>Guardar</button>
        </div>
        <input value={iF.label} onChange={e=>setIF(p=>({...p,label:e.target.value}))} placeholder="Descripción (bono, freelance...)" style={shInp2}/>
        <input value={iF.amt} onChange={e=>setIF(p=>({...p,amt:e.target.value}))} type="number" placeholder="Monto $" style={shInp2}/>
        <input value={iF.date} onChange={e=>setIF(p=>({...p,date:e.target.value}))} type="date" style={shInp2}/>
      </div>
    </Sheet>

    <Sheet open={sh==='salary'} onClose={closeSh}>
      <div style={{padding:'0 20px 30px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0 20px'}}>
          <button onClick={closeSh} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer'}}>Cancelar</button>
          <div style={{fontSize:17,fontWeight:600,color:t.tx}}>Salario</div>
          <button onClick={saveSal} style={{background:'none',border:'none',color:blue,fontSize:17,fontWeight:600,cursor:'pointer'}}>Guardar</button>
        </div>
        <div style={{fontSize:14,color:t.txS,marginBottom:14}}>{MNF[new Date(mon+'-01').getMonth()]} — se guarda por mes</div>
        <input value={tmpS} onChange={e=>setTmpS(e.target.value)} type="number" placeholder="Monto neto $" autoFocus style={shInp2}/>
      </div>
    </Sheet>

    <Sheet open={sh==='budget'} onClose={()=>{closeSh();setEditBC(null)}}>
      <div style={{padding:'0 20px 30px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0 20px'}}>
          <button onClick={()=>{closeSh();setEditBC(null)}} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer'}}>Cancelar</button>
          <div style={{fontSize:17,fontWeight:600,color:t.tx}}>Tope de presupuesto</div>
          <button onClick={()=>saveBud(editBC)} style={{background:'none',border:'none',color:blue,fontSize:17,fontWeight:600,cursor:'pointer'}}>Guardar</button>
        </div>
        <div style={{fontSize:14,color:t.txS,marginBottom:14}}>Tope mensual para {cats.find(c=>c.id===editBC)?.label}</div>
        <input value={tmpB} onChange={e=>setTmpB(e.target.value)} type="number" placeholder="Monto $" autoFocus style={shInp2}/>
      </div>
    </Sheet>

    <Sheet open={sh==='recur'} onClose={closeSh}>
      <div style={{padding:'0 20px 30px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0 20px'}}>
          <button onClick={closeSh} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer'}}>Cancelar</button>
          <div style={{fontSize:17,fontWeight:600,color:t.tx}}>Gasto recurrente</div>
          <button onClick={saveRec} style={{background:'none',border:'none',color:blue,fontSize:17,fontWeight:600,cursor:'pointer'}}>Guardar</button>
        </div>
        <input value={rF.label} onChange={e=>setRF(p=>({...p,label:e.target.value}))} placeholder="Nombre (Netflix, Gym...)" style={shInp2}/>
        <input value={rF.amt} onChange={e=>setRF(p=>({...p,amt:e.target.value}))} type="number" placeholder="Monto $" style={shInp2}/>
        <select value={rF.cat} onChange={e=>setRF(p=>({...p,cat:e.target.value}))} style={shSel}>{cats.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select>
        <input value={rF.day} onChange={e=>setRF(p=>({...p,day:+e.target.value}))} type="number" min="1" max="31" placeholder="Día del mes (ej: 15)" style={shInp2}/>
        <div style={{background:t.bgE2,borderRadius:13,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div>
            <div style={{fontSize:15,color:t.tx}}>Aplicar automáticamente</div>
            <div style={{fontSize:12,color:t.txS,marginTop:2}}>Se registra solo cada mes en esa fecha</div>
          </div>
          <div onClick={()=>setRF(p=>({...p,auto:!p.auto}))} style={{width:44,height:26,borderRadius:13,background:rF.auto?A.green[tn]:t.fi,cursor:'pointer',position:'relative',transition:'background 200ms',flexShrink:0}}>
            <div style={{width:22,height:22,borderRadius:11,background:'#fff',position:'absolute',top:2,left:rF.auto?20:2,transition:'left 200ms'}}/>
          </div>
        </div>
      </div>
    </Sheet>

    <Sheet open={sh==='payment'&&!!payD} onClose={()=>{closeSh();setPayD(null)}}>
      <div style={{padding:'0 20px 30px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0 20px'}}>
          <button onClick={()=>{closeSh();setPayD(null)}} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer'}}>Cancelar</button>
          <div style={{fontSize:17,fontWeight:600,color:t.tx}}>Registrar pago</div>
          <button onClick={regPay} style={{background:'none',border:'none',color:blue,fontSize:17,fontWeight:600,cursor:'pointer'}}>Guardar</button>
        </div>
        <div style={{fontSize:14,color:t.txS,marginBottom:14}}>{payD?.name} · Saldo: <b style={{color:A.red[tn]}}>{fmt(payD?.balance||0)}</b></div>
        <input value={pF.amt} onChange={e=>setPF(p=>({...p,amt:e.target.value}))} type="number" placeholder={`Monto (mín. ${fmt(payD?.minPayment||0)})`} style={shInp2}/>
        <input value={pF.date} onChange={e=>setPF(p=>({...p,date:e.target.value}))} type="date" style={shInp2}/>
        <input value={pF.note} onChange={e=>setPF(p=>({...p,note:e.target.value}))} placeholder="Nota (opcional)" style={shInp2}/>
        <div style={{fontSize:13,color:t.txS,marginBottom:8,marginTop:4}}>Registrar también como gasto en:</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',paddingBottom:4}}>
          <button onClick={()=>setPF(p=>({...p,expCat:null}))} style={{background:!pF.expCat?A.blue[tn]:t.bgE2,color:!pF.expCat?'#fff':t.txS,border:'none',borderRadius:10,padding:'7px 12px',fontSize:12,cursor:'pointer',fontWeight:500,flexShrink:0}}>No registrar</button>
          {cats.map(c=><button key={c.id} onClick={()=>setPF(p=>({...p,expCat:c.id}))} style={{background:pF.expCat===c.id?catColor(c):t.bgE2,color:pF.expCat===c.id?'#fff':t.tx,border:'none',borderRadius:10,padding:'7px 12px',fontSize:12,cursor:'pointer',fontWeight:500,display:'flex',alignItems:'center',gap:4,flexShrink:0}}>{catDisp(c)} {c.label}</button>)}
        </div>
      </div>
    </Sheet>

    <Sheet open={sh==='debt'} onClose={()=>{closeSh();setEditD(null)}}>
      <div style={{padding:'0 20px 30px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0 20px'}}>
          <button onClick={()=>{closeSh();setEditD(null)}} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer'}}>Cancelar</button>
          <div style={{fontSize:17,fontWeight:600,color:t.tx}}>{editD?'Editar deuda':'Nueva deuda'}</div>
          <button onClick={saveDebt} style={{background:'none',border:'none',color:blue,fontSize:17,fontWeight:600,cursor:'pointer'}}>Guardar</button>
        </div>
        {[{ph:'Nombre',k:'name',tp:'text'},{ph:'Saldo actual $',k:'bal',tp:'number'},{ph:'Monto original $',k:'orig',tp:'number'},{ph:'Pago mínimo $',k:'minP',tp:'number'},{ph:'Tasa anual %',k:'rate',tp:'number'}].map(f=><input key={f.k} value={dF[f.k]} onChange={e=>setDF(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} type={f.tp} style={shInp2}/>)}
        <select value={dF.type} onChange={e=>setDF(p=>({...p,type:e.target.value}))} style={shSel}>{DEBT_TYPES.map(tp=><option key={tp.id} value={tp.id}>{tp.label}</option>)}</select>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
          <select value={dF.dueD||''} onChange={e=>setDF(p=>({...p,dueD:e.target.value}))} style={{...shSel,marginBottom:0}}><option value="">Día</option>{Array.from({length:31},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select>
          <select value={dF.dueM||''} onChange={e=>setDF(p=>({...p,dueM:e.target.value}))} style={{...shSel,marginBottom:0}}><option value="">Mes</option>{MN.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select>
        </div>
        <div style={{fontSize:14,color:t.txS,marginBottom:8}}>Color</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>{Object.keys(TK.a).map(c=><button key={c} onClick={()=>setDF(p=>({...p,clr:c}))} style={{width:28,height:28,borderRadius:'50%',background:A[c][tn],border:`3px solid ${dF.clr===c?t.tx:'transparent'}`,cursor:'pointer'}}/>)}</div>
      </div>
    </Sheet>

    <Sheet open={sh==='goalitem'} onClose={()=>{closeSh();setEditG(null)}}>
      <div style={{padding:'0 20px 30px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0 20px'}}>
          <button onClick={()=>{closeSh();setEditG(null)}} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer'}}>Cancelar</button>
          <div style={{fontSize:17,fontWeight:600,color:t.tx}}>{editG?'Editar meta':'Nueva meta'}</div>
          <button onClick={saveGoal} style={{background:'none',border:'none',color:blue,fontSize:17,fontWeight:600,cursor:'pointer'}}>Guardar</button>
        </div>
        <input value={gF.label} onChange={e=>setGF(p=>({...p,label:e.target.value}))} placeholder="Nombre (viaje, casa...)" style={shInp2}/>
        <input value={gF.target} onChange={e=>setGF(p=>({...p,target:e.target.value}))} type="number" placeholder="Monto objetivo $" style={shInp2}/>
        <div style={{fontSize:14,color:t.txS,marginBottom:6}}>Fecha límite (opcional)</div>
        <input value={gF.deadline||''} onChange={e=>setGF(p=>({...p,deadline:e.target.value}))} type="date" style={shInp2}/>
        <div style={{fontSize:14,color:t.txS,marginBottom:8}}>Ícono</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14,maxHeight:80,overflowY:'auto'}}>
          {['🎯','✈️','🏠','🚗','💍','🎓','🏖️','💊','📱','💻','🐶','👶','🌍','🎮','💰','🏋️'].map(ic=><button key={ic} onClick={()=>setGF(p=>({...p,emoji:ic}))} style={{width:38,height:38,borderRadius:10,border:`2px solid ${gF.emoji===ic?ac('green'):'transparent'}`,background:gF.emoji===ic?ac('green')+'22':t.fill,fontSize:18,cursor:'pointer'}}>{ic}</button>)}
        </div>
        <div style={{fontSize:14,color:t.txS,marginBottom:8}}>Color</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>{['green','blue','purple','orange','pink','teal','yellow','red'].map(c=><button key={c} onClick={()=>setGF(p=>({...p,clr:c}))} style={{width:28,height:28,borderRadius:'50%',background:A[c][tn],border:`3px solid ${gF.clr===c?t.tx:'transparent'}`,cursor:'pointer'}}/>)}</div>
        {editG&&<button onClick={()=>{delGoal(editG.id);closeSh();setEditG(null)}} style={{width:'100%',background:A.red[tn]+'18',border:'none',borderRadius:14,color:A.red[tn],padding:'13px',fontSize:15,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>🗑️ Eliminar meta</button>}
      </div>
    </Sheet>

    <Sheet open={sh==='cat'} onClose={()=>{closeSh();setEditC(null)}}>
      <div style={{padding:'0 20px 30px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0 20px'}}>
          <button onClick={()=>{closeSh();setEditC(null)}} style={{background:'none',border:'none',color:blue,fontSize:17,cursor:'pointer'}}>Cancelar</button>
          <div style={{fontSize:17,fontWeight:600,color:t.tx}}>{editC?'Editar categoría':'Nueva categoría'}</div>
          <button onClick={async()=>{
            if(!cF.label.trim()){notify('Escribe un nombre','err');return}
            const data={...cF,icon:cF.emoji,is_default:false,sort_order:cats.length}
            if(editC){const row=await db.upsertCategory(user.id,{...editC,...data});if(row)setCats(p=>p.map(c=>c.id===editC.id?{...c,...data}:c));notify('Categoría actualizada ✓')}
            else{const row=await db.upsertCategory(user.id,data);if(row)setCats(p=>[...p,{...row,ico:cF.ico,clr:cF.clr,emoji:cF.emoji}]);notify('Categoría creada ✓')}
            setEditC(null);closeSh()
          }} style={{background:'none',border:'none',color:blue,fontSize:17,fontWeight:600,cursor:'pointer'}}>Guardar</button>
        </div>
        <input value={cF.label} onChange={e=>setCF(p=>({...p,label:e.target.value}))} placeholder="Nombre" style={shInp2}/>
        <div style={{fontSize:14,color:t.txS,marginBottom:8}}>Ícono</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14,maxHeight:110,overflowY:'auto'}}>
          {['🍽️','🛍️','👗','👟','💄','🎮','🎬','📚','🏋️','🐾','🧴','☕','🍺','🎁','🏥','💊','✈️','🏖️','🎵','🍕','🥗','💡','📦','💻','📱','🎲','🏦','💰','🎓','👶','🐶','🌸','🍰','🎯'].map(ic=><button key={ic} onClick={()=>setCF(p=>({...p,emoji:ic}))} style={{width:38,height:38,borderRadius:10,border:`2px solid ${cF.emoji===ic?blue:'transparent'}`,background:cF.emoji===ic?blue+'22':t.fill,fontSize:18,cursor:'pointer'}}>{ic}</button>)}
        </div>
        <div style={{fontSize:14,color:t.txS,marginBottom:8}}>Color</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>{Object.keys(TK.a).map(c=><button key={c} onClick={()=>setCF(p=>({...p,clr:c}))} style={{width:28,height:28,borderRadius:'50%',background:A[c][tn],border:`3px solid ${cF.clr===c?t.tx:'transparent'}`,cursor:'pointer'}}/>)}</div>
        <div style={{background:t.bgE,borderRadius:12,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:ac(cF.clr),color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{cF.emoji||'🎲'}</div>
          <div style={{fontSize:16,fontWeight:500,color:t.tx}}>{cF.label||'Vista previa'}</div>
        </div>
        {editC&&!editC.is_default&&<button onClick={async()=>{await db.deleteCategory(editC.id);setCats(p=>p.filter(c=>c.id!==editC.id));closeSh();setEditC(null);notify('Categoría eliminada')}} style={{width:'100%',background:A.red[tn]+'18',border:'none',borderRadius:14,color:A.red[tn],padding:'13px',fontSize:15,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>🗑️ Eliminar</button>}
      </div>
    </Sheet>
  </div>
}
