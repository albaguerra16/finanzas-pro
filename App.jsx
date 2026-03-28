import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './supabase'
import Auth from './Auth'
import * as db from './db'

/* ══════════════════════════════════════════ CONSTANTS ══════ */
const DEFAULT_CATS = [
  { id:'comidas',       label:'Comidas',       icon:'🍽️', color:'#F97316', is_default:true, sort_order:0 },
  { id:'compras',       label:'Compras',        icon:'🛍️', color:'#EC4899', is_default:true, sort_order:1 },
  { id:'suscripciones', label:'Suscripciones',  icon:'📱', color:'#A78BFA', is_default:true, sort_order:2 },
  { id:'transporte',    label:'Transporte',     icon:'🚌', color:'#38BDF8', is_default:true, sort_order:3 },
  { id:'belleza',       label:'Belleza',        icon:'✨', color:'#FBBF24', is_default:true, sort_order:4 },
  { id:'extra',         label:'Extra',          icon:'🎲', color:'#6366F1', is_default:true, sort_order:5 },
  { id:'ahorros',       label:'Ahorros',        icon:'🏦', color:'#34D399', is_default:true, sort_order:6 },
]
const DEBT_TYPES = [
  { id:'tarjeta',  label:'Tarjeta de crédito', icon:'💳' },
  { id:'prestamo', label:'Préstamo personal',  icon:'🤝' },
  { id:'hipoteca', label:'Hipoteca',           icon:'🏠' },
  { id:'auto',     label:'Auto',               icon:'🚗' },
  { id:'familiar', label:'Familiar/Amigo',     icon:'👨‍👩‍👦' },
  { id:'otro',     label:'Otro',               icon:'📄' },
]
const CAT_ICONS = ['🍽️','🛍️','👗','👟','💄','🎮','🎬','📚','🏋️','🐾','🧴','☕','🍺','🎁','🏥','💊','✈️','🏖️','🎵','🍕','🥗','🛺','⛽','🅿️','🏠','💡','📦','🌿','🧹','💻','📱','🎲','🏦','💰','🎓','👶','🐶','🌸','🍰','🎯']
const CAT_COLORS = ['#F97316','#EC4899','#A78BFA','#38BDF8','#FBBF24','#6366F1','#34D399','#F43F5E','#10B981','#06B6D4','#8B5CF6','#EF4444','#14B8A6','#F59E0B','#3B82F6','#84CC16','#E879F9','#FB923C']
const MN  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MNF = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const NOW = new Date()
const mk  = d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
const fmt = n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',minimumFractionDigits:0}).format(n||0)
const todayStr = `${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,'0')}-${String(NOW.getDate()).padStart(2,'0')}`

function calcPayoffMonths(balance,monthly,annualRate){
  if(monthly<=0||balance<=0) return null
  const r=annualRate/100/12
  if(r===0) return Math.ceil(balance/monthly)
  if(monthly<=balance*r) return Infinity
  return Math.ceil(-Math.log(1-(balance*r/monthly))/Math.log(1+r))
}

/* ══════════════════════════════════════════ CSS ANIMATIONS ═══ */
const ANIM_CSS = `
@keyframes slideUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes fadeIn {
  from { opacity:0; }
  to   { opacity:1; }
}
@keyframes popIn {
  0%   { opacity:0; transform:scale(0.85); }
  70%  { transform:scale(1.03); }
  100% { opacity:1; transform:scale(1); }
}
@keyframes slideDown {
  from { opacity:0; transform:translateY(-16px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(129,140,248,0); }
  50%      { box-shadow: 0 0 0 8px rgba(129,140,248,0.15); }
}
@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position: 200% center; }
}
.slide-up   { animation: slideUp .35s cubic-bezier(.22,1,.36,1) both; }
.fade-in    { animation: fadeIn .3s ease both; }
.pop-in     { animation: popIn .4s cubic-bezier(.22,1,.36,1) both; }
.slide-down { animation: slideDown .3s cubic-bezier(.22,1,.36,1) both; }
`

function InjectCSS(){
  useEffect(()=>{
    const el=document.getElementById('fn-anim-css')
    if(!el){ const s=document.createElement('style'); s.id='fn-anim-css'; s.textContent=ANIM_CSS; document.head.appendChild(s) }
  },[])
  return null
}

/* ══════════════════════════════════════════ SPARKLINE ══════ */
function Spark({data,color='#34D399',h=44}){
  if(!data||data.length<2) return null
  const max=Math.max(...data,1),W=200
  const pts=data.map((v,i)=>`${(i/(data.length-1))*W},${h-(v/max)*h}`).join(' ')
  const id=`sg${color.replace(/[^a-z0-9]/gi,'')}${h}`
  return(
    <svg viewBox={`0 0 ${W} ${h}`} style={{width:'100%',height:h,overflow:'visible'}}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity=".35"/>
        <stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${W},${h}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v,i)=><circle key={i} cx={(i/(data.length-1))*W} cy={h-(v/max)*h} r="3.5" fill={color}/>)}
    </svg>
  )
}

/* ══════════════════════════════════════════ MAIN APP ═══════ */
export default function App(){
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{ setSession(session); setLoading(false) })
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>setSession(session))
    return ()=>subscription.unsubscribe()
  },[])

  if(loading) return(
    <div style={{minHeight:'100vh',background:'#070712',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>💸</div>
        <div style={{color:'rgba(255,255,255,.4)',fontSize:14}}>Cargando...</div>
      </div>
    </div>
  )
  if(!session) return <Auth/>
  return <FinanceApp user={session.user}/>
}

/* ══════════════════════════════════════════ FINANCE APP ════ */
function FinanceApp({user}){
  const [view,      setView]     = useState('home')
  const [selMon,    setSelMon]   = useState(mk(NOW))
  const [cats,      setCats]     = useState(DEFAULT_CATS)
  const [salaries,  setSalaries] = useState({})
  const [budgets,   setBudgets]  = useState({})
  const [expenses,  setExpenses] = useState({})
  const [incomes,   setIncomes]  = useState({})
  const [recur,     setRecur]    = useState([])
  const [goal,      setGoal]     = useState({target:0,deadline:'',label:'Mi meta'})
  const [goals,     setGoals]    = useState([])  // multiple goals
  const [notes,     setNotes]    = useState({})
  const [debts,     setDebts]    = useState([])
  const [dataReady, setDataReady]= useState(false)
  const [darkMode,  setDarkMode]  = useState(()=>localStorage.getItem('fn4_dark')!=='false')
  const toggleDark=()=>{ const v=!darkMode; setDarkMode(v); localStorage.setItem('fn4_dark',String(v)) }

  const [modal,      setModal]      = useState(null)
  const [notif,      setNotif]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [editExp,    setEditExp]    = useState(null)
  const [editBud,    setEditBud]    = useState(null)
  const [editDebt,   setEditDebt]   = useState(null)
  const [payDebt,    setPayDebt]    = useState(null)
  const [detailDebt, setDetailDebt] = useState(null)
  const [editCat,    setEditCat]    = useState(null)

  const blankExp  = {category:cats[0]?.id||'comidas', amount:'', description:'', date:todayStr}
  const blankDebt = {name:'', type:'tarjeta', balance:'', originalAmount:'', minPayment:'', interestRate:'', dueDay:'', dueMonth:'', color:'#F87171'}
  const blankCat  = {label:'', icon:'🛍️', color:'#EC4899'}

  const [expF,  setExpF]  = useState(blankExp)
  const [incF,  setIncF]  = useState({label:'',amount:'',date:todayStr})
  const [recF,  setRecF]  = useState({label:'',amount:'',category:'comidas',day:1})
  const [goalF, setGoalF] = useState({target:'',deadline:'',label:''})
  const [editGoalItem, setEditGoalItem] = useState(null)  // which goal being edited
  const [debtF, setDebtF] = useState(blankDebt)
  const [payF,  setPayF]  = useState({amount:'',date:todayStr,note:''})
  const [catF,  setCatF]  = useState(blankCat)
  const [tmpBud,setTmpBud]= useState('')
  const [tmpSal,setTmpSal]= useState('')


  const notify=(msg,type='ok')=>{ setNotif({msg,type}); setTimeout(()=>setNotif(null),3000) }

  // ── Load all data ──
  useEffect(()=>{
    if(!user) return
    const load = async()=>{
      const [c,s,b,e,i,r,g,n,d,gs] = await Promise.all([
        db.fetchCategories(user.id), db.fetchSalaries(user.id), db.fetchBudgets(user.id),
        db.fetchExpenses(user.id),   db.fetchIncomes(user.id),   db.fetchRecurring(user.id),
        db.fetchGoal(user.id),       db.fetchNotes(user.id),     db.fetchDebts(user.id),
        db.fetchGoals(user.id)
      ])
      if(c.length>0) setCats(c.map(x=>({...x, id:x.id})))
      else {
        // insert defaults for new user
        const inserted = await Promise.all(DEFAULT_CATS.map(cat=>db.upsertCategory(user.id,cat)))
        setCats(inserted.filter(Boolean))
      }
      setSalaries(s); setBudgets(b); setExpenses(e); setIncomes(i)
      setRecur(r); setGoal(g); setNotes(n); setDebts(d); setGoals(gs||[])
      setDataReady(true)
    }
    load()
  },[user])

  // ── Derived ──
  const salary    = salaries[selMon]??(Object.values(salaries)[0]??0)
  const monExp    = expenses[selMon]||[]
  const monInc    = incomes[selMon] ||[]
  const totalSpent= monExp.reduce((s,e)=>s+e.amount,0)
  const totalInc  = salary+monInc.reduce((s,e)=>s+e.amount,0)
  const available = totalInc-totalSpent
  const savRate   = totalInc>0?Math.max(0,(available/totalInc)*100):0
  const catSpent  = id=>monExp.filter(e=>e.category===id).reduce((s,e)=>s+e.amount,0)
  const catBudget = id=>budgets[id]??0
  const totalSaved= Object.values(expenses).flat().filter(e=>e.category==='ahorros'||cats.find(c=>c.id===e.category&&c.label==='Ahorros')).reduce((s,e)=>s+e.amount,0)
  const goalPct   = goal.target>0?Math.min(100,(totalSaved/goal.target)*100):0
  const daysLeft  = goal.deadline?Math.ceil((new Date(goal.deadline)-NOW)/86400000):null
  const totalDebtBalance = debts.reduce((s,d)=>s+d.balance,0)
  const totalMinPayments = debts.reduce((s,d)=>s+d.minPayment,0)

  const last6 = useMemo(()=>Array.from({length:6},(_,i)=>{
    const d=new Date(NOW.getFullYear(),NOW.getMonth()-5+i,1)
    const key=mk(d)
    const mE=expenses[key]||[],mI=incomes[key]||[]
    const sal=salaries[key]??(Object.values(salaries)[0]??0)
    const spent=mE.reduce((s,e)=>s+e.amount,0)
    const inc=sal+mI.reduce((s,e)=>s+e.amount,0)
    const savings=mE.filter(e=>e.category==='ahorros').reduce((s,e)=>s+e.amount,0)
    return {key,short:MN[d.getMonth()],label:`${MNF[d.getMonth()]} ${d.getFullYear()}`,spent,inc,savings,avail:inc-spent}
  }),[expenses,incomes,salaries])

  const smartSuggestions = useMemo(()=>{
    const hist=last6.slice(0,5)
    return cats.map(cat=>{
      const vals=hist.map(m=>(expenses[m.key]||[]).filter(e=>e.category===cat.id).reduce((s,e)=>s+e.amount,0)).filter(v=>v>0)
      if(!vals.length) return {id:cat.id,avg:0,suggested:0}
      const avg=vals.reduce((s,v)=>s+v,0)/vals.length
      return {id:cat.id,avg:Math.round(avg),suggested:Math.ceil(avg*1.1/100)*100}
    })
  },[last6,expenses,cats])

  const projection = useMemo(()=>{
    const rs=last6.slice(-3).map(m=>m.savings).filter(v=>v>0)
    if(!rs.length||!goal.target) return null
    const avg=rs.reduce((s,v)=>s+v,0)/rs.length
    if(avg<=0) return null
    const remaining=goal.target-totalSaved
    const months=Math.ceil(remaining/avg)
    return {avg,months,projDate:new Date(NOW.getFullYear(),NOW.getMonth()+months,1),remaining}
  },[last6,goal,totalSaved])

  const searchResults = useMemo(()=>{
    if(!search.trim()) return []
    const q=search.toLowerCase()
    const results=[]
    Object.entries(expenses).forEach(([mk2,arr])=>{
      arr.forEach(e=>{
        if((e.description||'').toLowerCase().includes(q)||e.category.toLowerCase().includes(q))
          results.push({...e,monthKey:mk2})
      })
    })
    return results.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,30)
  },[search,expenses])

  // ── Actions ──
  const saveExpense=async()=>{
    if(!expF.amount||+expF.amount<=0){notify('Monto inválido','err');return}
    if(saveExpense._saving) return; saveExpense._saving=true
    const mk2=expF.date.slice(0,7)
    if(editExp){
      await db.updateExpense(editExp.id, expF)
      setExpenses(p=>({...p,[editExp.monthKey]:(p[editExp.monthKey]||[]).map(e=>e.id===editExp.id?{...e,...expF,amount:+expF.amount}:e)}))
      notify('Gasto actualizado ✓')
    } else {
      const row=await db.insertExpense(user.id,{...expF,amount:+expF.amount})
      if(row) setExpenses(p=>({...p,[mk2]:[...(p[mk2]||[]),{id:row.id,...expF,amount:+expF.amount}]}))
      notify('Gasto agregado ✓')
    }
    saveExpense._saving=false
    setEditExp(null);setExpF(blankExp);setModal(null)
  }

  const startEditExp=(exp,mk2)=>{
    setEditExp({...exp,monthKey:mk2})
    setExpF({category:exp.category,amount:String(exp.amount),description:exp.description||'',date:exp.date})
    setModal('expense')
  }

  const deleteExp=async(id,mk2)=>{
    await db.deleteExpense(id)
    setExpenses(p=>({...p,[mk2]:(p[mk2]||[]).filter(e=>e.id!==id)}))
    notify('Eliminado')
  }

  const deleteInc=async(id,mk2)=>{
    await db.deleteIncome(id)
    setIncomes(p=>({...p,[mk2]:(p[mk2]||[]).filter(e=>e.id!==id)}))
    notify('Eliminado')
  }

  const deleteRec=async(id)=>{
    await db.deleteRecurring(id)
    setRecur(p=>p.filter(r=>r.id!==id))
  }

  const addIncome=async()=>{
    if(!incF.amount||+incF.amount<=0){notify('Monto inválido','err');return}
    const mk2=incF.date.slice(0,7)
    const row=await db.insertIncome(user.id,{...incF,amount:+incF.amount})
    if(row) setIncomes(p=>({...p,[mk2]:[...(p[mk2]||[]),{id:row.id,...incF,amount:+incF.amount}]}))
    setIncF({label:'',amount:'',date:todayStr});setModal(null);notify('Ingreso agregado ✓')
  }

  const addRecur=async()=>{
    if(!recF.label||!recF.amount){notify('Completa los campos','err');return}
    const row=await db.insertRecurring(user.id,{...recF,amount:+recF.amount})
    if(row) setRecur(p=>[...p,{id:row.id,...recF,amount:+recF.amount}])
    setRecF({label:'',amount:'',category:cats[0]?.id||'comidas',day:1});setModal(null);notify('Recurrente guardado ✓')
  }

  const applyRecur=async(r)=>{
    if(monExp.some(e=>e.description===r.label&&e.category===r.category)) return
    const d=`${selMon}-${String(r.day).padStart(2,'0')}`
    const exp={category:r.category,amount:r.amount,description:r.label,date:d}
    const row=await db.insertExpense(user.id,exp)
    if(row) setExpenses(p=>({...p,[selMon]:[...(p[selMon]||[]),{id:row.id,...exp}]}))
    notify(`"${r.label}" aplicado ✓`)
  }

  const saveGoal=async()=>{
    const g={target:+goalF.target||0,deadline:goalF.deadline,label:goalF.label||'Mi meta'}
    await db.upsertGoal(user.id,g)
    setGoal(g);setModal(null);notify('Meta guardada ✓')
  }

  const saveGoalItem=async()=>{
    if(!goalF.label||!goalF.target){notify('Completa nombre y monto','err');return}
    const g={label:goalF.label,target:+goalF.target,deadline:goalF.deadline||null,color:goalF.color||'#34D399',icon:goalF.icon||'🎯'}
    if(editGoalItem){
      const row=await db.updateGoalItem(editGoalItem.id,g)
      setGoals(p=>p.map(x=>x.id===editGoalItem.id?{...x,...g}:x))
      notify('Meta actualizada ✓')
    } else {
      const row=await db.insertGoalItem(user.id,g)
      if(row) setGoals(p=>[...p,{id:row.id,...g,saved:0}])
      notify('Meta creada ✓')
    }
    setEditGoalItem(null);setGoalF({target:'',deadline:'',label:'',color:'#34D399',icon:'🎯'});setModal(null)
  }

  const deleteGoalItem=async(id)=>{
    await db.deleteGoalItem(id)
    setGoals(p=>p.filter(x=>x.id!==id))
    notify('Meta eliminada')
  }

  const addToGoal=async(goalId,amount,catId)=>{
    if(!amount||+amount<=0){notify('Monto inválido','err');return}
    // register as expense in savings category
    const savCat=cats.find(c=>c.label==='Ahorros')||cats.find(c=>c.id==='ahorros')||cats[cats.length-1]
    const exp={category:savCat?.id||catId,amount:+amount,description:`Ahorro: ${goals.find(g=>g.id===goalId)?.label||''}`,date:todayStr}
    const row=await db.insertExpense(user.id,exp)
    if(row) setExpenses(p=>({...p,[todayStr.slice(0,7)]:[...(p[todayStr.slice(0,7)]||[]),{id:row.id,...exp}]}))
    // update goal saved amount
    await db.addToGoalItem(goalId,+amount)
    setGoals(p=>p.map(g=>g.id===goalId?{...g,saved:(g.saved||0)+(+amount)}:g))
    notify('Abono a meta registrado ✓')
  }

  const saveSalary=async(mk2)=>{
    await db.upsertSalary(user.id,mk2,+tmpSal||0)
    setSalaries(p=>({...p,[mk2]:+tmpSal||0}));setModal(null);notify('Salario guardado ✓')
  }

  const saveBudget=async(id)=>{
    await db.upsertBudget(user.id,id,+tmpBud||0)
    setBudgets(p=>({...p,[id]:+tmpBud||0}));setEditBud(null);notify('Tope guardado ✓')
  }

  const applySmartBudgets=async()=>{
    await Promise.all(smartSuggestions.filter(s=>s.suggested>0).map(s=>db.upsertBudget(user.id,s.id,s.suggested)))
    const nb={...budgets};smartSuggestions.forEach(s=>{if(s.suggested>0)nb[s.id]=s.suggested})
    setBudgets(nb);setModal(null);notify('Presupuestos aplicados ✓')
  }

  const saveCat=async()=>{
    if(!catF.label.trim()){notify('Escribe un nombre','err');return}
    if(editCat){
      const row=await db.upsertCategory(user.id,{...editCat,...catF})
      if(row) setCats(p=>p.map(c=>c.id===editCat.id?{...c,...catF}:c))
      notify('Categoría actualizada ✓')
    } else {
      const row=await db.upsertCategory(user.id,{...catF,is_default:false,sort_order:cats.length})
      if(row) setCats(p=>[...p,row])
      notify('Categoría creada ✓')
    }
    setEditCat(null);setCatF(blankCat);setModal(null)
  }

  const deleteCat=async(id)=>{
    await db.deleteCategory(id)
    setCats(p=>p.filter(c=>c.id!==id))
    notify('Categoría eliminada')
  }

  const saveDebt=async()=>{
    if(!debtF.name||!debtF.balance){notify('Completa nombre y saldo','err');return}
    const data={...debtF,balance:+debtF.balance,originalAmount:+debtF.originalAmount||+debtF.balance,minPayment:+debtF.minPayment||0,interestRate:+debtF.interestRate||0,dueDay:+debtF.dueDay||1,dueMonth:+debtF.dueMonth||0}
    if(editDebt){
      await db.updateDebt(editDebt.id,data)
      setDebts(p=>p.map(d=>d.id===editDebt.id?{...d,...data}:d))
      notify('Deuda actualizada ✓')
    } else {
      const row=await db.insertDebt(user.id,data)
      if(row) setDebts(p=>[...p,{id:row.id,...data,payments:[]}])
      notify('Deuda agregada ✓')
    }
    setEditDebt(null);setDebtF(blankDebt);setModal(null)
  }

  const deleteDebt=async(id)=>{
    await db.deleteDebt(id)
    setDebts(p=>p.filter(d=>d.id!==id))
    notify('Deuda eliminada')
  }

  const registerPayment=async()=>{
    if(!payF.amount||+payF.amount<=0){notify('Monto inválido','err');return}
    if(registerPayment._saving) return; registerPayment._saving=true
    const amount=+payF.amount
    const newBal=Math.max(0,payDebt.balance-amount)
    const mk2=payF.date.slice(0,7)
    // 1. Update debt balance
    await db.updateDebt(payDebt.id,{...payDebt,balance:newBal})
    // 2. Save payment record
    const payRow=await db.insertDebtPayment(user.id,payDebt.id,{...payF,amount})
    // 3. Register as expense in movements so it shows in saldo
    const debtCat=cats.find(c=>c.label==='Deudas')||cats.find(c=>c.label==='Extra')||cats[cats.length-1]
    const expRow=await db.insertExpense(user.id,{
      category:debtCat?.id||cats[0]?.id,
      amount,
      description:`Pago deuda: ${payDebt.name}`,
      date:payF.date
    })
    // 4. Update local state
    setDebts(p=>p.map(d=>d.id!==payDebt.id?d:{...d,balance:newBal,payments:[...(d.payments||[]),(payRow?{id:payRow.id,date:payF.date,amount,note:payF.note}:{})]}))
    if(expRow) setExpenses(p=>({...p,[mk2]:[...(p[mk2]||[]),{id:expRow.id,category:debtCat?.id||cats[0]?.id,amount,description:`Pago deuda: ${payDebt.name}`,date:payF.date}]}))
    registerPayment._saving=false
    setPayF({amount:'',date:todayStr,note:''});setPayDebt(null);setModal(null)
    notify('Pago registrado ✓')
  }

  const deletePayment=async(debtId,payId,amount)=>{
    await db.deleteDebtPayment(payId)
    setDebts(p=>p.map(d=>d.id!==debtId?d:{...d,balance:d.balance+amount,payments:d.payments.filter(p=>p.id!==payId)}))
    notify('Pago eliminado')
  }

  const exportCSV=()=>{
    const rows=[['Fecha','Categoria','Descripcion','Monto','Tipo']]
    Object.entries(expenses).forEach(([,arr])=>arr.forEach(e=>rows.push([e.date,e.category,e.description||'',e.amount,'gasto'])))
    Object.entries(incomes).forEach(([,arr])=>arr.forEach(e=>rows.push([e.date,'ingreso_extra',e.label||'',e.amount,'ingreso'])))
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='finanzas.csv';a.click()
    notify('CSV descargado ✓')
  }

  /* ════════ STYLES ════════ */
  const C=darkMode
    ? {bg:'#070712',surf:'#0F0F1E',bord:'rgba(255,255,255,0.07)',acc:'#818CF8',grn:'#34D399',red:'#F87171',amb:'#FBBF24',txt:'#E8E8F8',mut:'rgba(255,255,255,0.38)'}
    : {bg:'#F0F2F8',surf:'#FFFFFF',bord:'rgba(0,0,0,0.08)',acc:'#6366F1',grn:'#059669',red:'#DC2626',amb:'#D97706',txt:'#1E1E2E',mut:'rgba(0,0,0,0.4)'}
  const S={
    app:   {minHeight:'100vh',background:C.bg,color:C.txt,fontFamily:"'Plus Jakarta Sans',sans-serif",paddingBottom:88,transition:'background .3s,color .3s'},
    hdr:   {background:C.surf,borderBottom:`1px solid ${C.bord}`,padding:'18px 16px 0',position:'sticky',top:0,zIndex:100},
    hTop:  {display:'flex',justifyContent:'space-between',alignItems:'center',maxWidth:520,margin:'0 auto 12px'},
    logo:  {fontSize:18,fontWeight:900,background:`linear-gradient(90deg,${C.acc},${C.grn},${C.acc})`,backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 4s linear infinite'},
    msel:  {background:'rgba(255,255,255,0.07)',border:`1px solid ${C.bord}`,borderRadius:9,color:C.txt,padding:'5px 10px',fontSize:12,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"},
    statsRow:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,maxWidth:520,margin:'0 auto 14px'},
    sCard: c=>({background:`rgba(${c},.09)`,border:`1px solid rgba(${c},.2)`,borderRadius:12,padding:'11px 10px',textAlign:'center'}),
    sVal:  c=>({fontSize:16,fontWeight:900,color:`rgb(${c})`,marginBottom:1}),
    body:  {maxWidth:520,margin:'0 auto',padding:'16px 14px'},
    sec:   {fontSize:10,fontWeight:800,color:C.mut,textTransform:'uppercase',letterSpacing:'1.2px',margin:'18px 0 10px'},
    card:  hi=>({background:hi?'rgba(248,113,113,.06)':C.surf,border:`1px solid ${hi?'rgba(248,113,113,.2)':C.bord}`,borderRadius:14,padding:'13px 15px',marginBottom:8}),
    pbar:  {height:5,borderRadius:3,background:'rgba(255,255,255,.07)',overflow:'hidden'},
    pfill: (p,c,o)=>({height:'100%',borderRadius:3,width:`${Math.min(p,100)}%`,background:o?`linear-gradient(90deg,${C.red},#dc2626)`:`linear-gradient(90deg,${c},${c}88)`,transition:'width .5s'}),
    fab:   {position:'fixed',bottom:94,right:18,width:52,height:52,borderRadius:'50%',background:`linear-gradient(135deg,${C.acc},#6366F1)`,border:'none',color:'#fff',fontSize:24,cursor:'pointer',boxShadow:`0 4px 20px rgba(129,140,248,.45)`,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'},
    bnav:  {position:'fixed',bottom:0,left:0,right:0,background:darkMode?'rgba(7,7,18,.96)':'rgba(255,255,255,.96)',backdropFilter:'blur(20px)',borderTop:`1px solid ${C.bord}`,display:'flex',padding:'8px 0 16px',zIndex:150},
    nbtn:  a=>({flex:1,background:'none',border:'none',color:a?C.acc:C.mut,fontSize:10,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,transition:'color .2s'}),
    overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',backdropFilter:'blur(12px)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center'},
    sheet: {background:darkMode?'#11111F':C.surf,border:`1px solid ${C.bord}`,borderRadius:'22px 22px 0 0',padding:'22px 20px 44px',width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto',animation:'slideUp .35s cubic-bezier(.22,1,.36,1) both'},
    shT:   {fontSize:18,fontWeight:900,marginBottom:18},
    inp:   {width:'100%',background:'rgba(255,255,255,.06)',border:`1px solid ${C.bord}`,borderRadius:10,color:C.txt,padding:'11px 13px',fontSize:15,marginBottom:10,boxSizing:'border-box',outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"},
    sel:   {width:'100%',background:'rgba(255,255,255,.06)',border:`1px solid ${C.bord}`,borderRadius:10,color:C.txt,padding:'11px 13px',fontSize:15,marginBottom:10,boxSizing:'border-box',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"},
    btn1:  g=>({width:'100%',background:`linear-gradient(135deg,${g})`,border:'none',borderRadius:12,color:'#fff',padding:'13px',fontSize:15,fontWeight:800,cursor:'pointer',marginTop:4,fontFamily:"'Plus Jakarta Sans',sans-serif"}),
    btn2:  {width:'100%',background:'rgba(255,255,255,.05)',border:`1px solid ${C.bord}`,borderRadius:12,color:C.txt,padding:'12px',fontSize:14,fontWeight:600,cursor:'pointer',marginTop:8,fontFamily:"'Plus Jakarta Sans',sans-serif"},
    notif: t=>({position:'fixed',top:24,left:'50%',transform:'translateX(-50%)',background:t==='err'?C.red:t==='warn'?C.amb:C.grn,color:'#fff',padding:'11px 24px',borderRadius:30,fontSize:14,fontWeight:700,zIndex:500,whiteSpace:'nowrap',boxShadow:'0 6px 24px rgba(0,0,0,.4)',display:'flex',alignItems:'center',gap:8}),
    iInp:  {background:'rgba(255,255,255,.08)',border:'1px solid rgba(129,140,248,.4)',borderRadius:8,color:C.txt,padding:'3px 8px',fontSize:13,width:88,textAlign:'right',fontFamily:"'Plus Jakarta Sans',sans-serif"},
    smB:   c=>({background:c,border:'none',borderRadius:7,color:'#fff',padding:'3px 9px',fontSize:12,cursor:'pointer',marginLeft:5,fontWeight:700}),
    srch:  {display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.05)',border:`1px solid ${C.bord}`,borderRadius:12,padding:'10px 14px',marginBottom:14},
    row:   {display:'flex',justifyContent:'space-between',alignItems:'center'},
    lbl:   {fontSize:11,color:C.mut,marginBottom:5,display:'block'},
  }

  // ── Debt due notifications ──
  const debtsDueSoon = debts.filter(d=>{
    if(d.balance<=0||!d.dueDay) return false
    const today=NOW.getDate(), month=NOW.getMonth()+1
    const sameMonth=!d.dueMonth||d.dueMonth===month
    return sameMonth && d.dueDay>=today && d.dueDay<=today+3
  })
  const debtsOverdue = debts.filter(d=>{
    if(d.balance<=0||!d.dueDay) return false
    const today=NOW.getDate(), month=NOW.getMonth()+1
    const sameMonth=!d.dueMonth||d.dueMonth===month
    return sameMonth && d.dueDay < today
  })

  if(!dataReady) return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:56,marginBottom:16,animation:'popIn .6s cubic-bezier(.22,1,.36,1) both'}}>💸</div>
        <div style={{background:`linear-gradient(90deg,${C.acc},${C.grn},${C.acc})`,backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:18,fontWeight:800,animation:'shimmer 2s linear infinite'}}>Finanzas Pro</div>
        <div style={{color:C.mut,fontSize:13,marginTop:8}}>Cargando tus datos...</div>
      </div>
    </div>
  )

  /* ════ HOME ════ */
  const Home=()=>{
    const totalBudget=Object.values(budgets).reduce((s,v)=>s+v,0)
    const debtBannerEl=(debtsDueSoon.length>0||debtsOverdue.length>0)&&selMon===mk(NOW)?(
      <div className="slide-down" onClick={()=>setView('debts')} style={{
        display:'flex',alignItems:'center',gap:10,marginBottom:12,cursor:'pointer',
        background:darkMode?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)',
        border:`1px solid ${debtsOverdue.length>0?'rgba(248,113,113,.25)':'rgba(251,191,36,.25)'}`,
        borderLeft:`3px solid ${debtsOverdue.length>0?C.red:C.amb}`,
        borderRadius:12,padding:'10px 14px'
      }}>
        <span style={{fontSize:16,flexShrink:0}}>{debtsOverdue.length>0?'🔴':'🟡'}</span>
        <div style={{flex:1,minWidth:0}}>
          {debtsOverdue.length>0&&<div style={{fontSize:11,color:C.red,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            Vencidas: {debtsOverdue.map(d=>d.name).join(', ')}
          </div>}
          {debtsDueSoon.length>0&&<div style={{fontSize:11,color:C.amb,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            Próximas: {debtsDueSoon.map(d=>`${d.name} día ${d.dueDay}`).join(' · ')}
          </div>}
        </div>
        <span style={{color:debtsOverdue.length>0?C.red:C.amb,fontSize:12,flexShrink:0}}>→</span>
      </div>
    ):null
    const globPct=totalBudget>0?(totalSpent/totalBudget)*100:(totalInc>0?(totalSpent/totalInc)*100:0)
    const over80=cats.filter(c=>{const b=catBudget(c.id);return b>0&&catSpent(c.id)/b>=.8})
    return(
      <div>
        {debtBannerEl}
        <div style={{...S.card(false),background:'linear-gradient(135deg,rgba(129,140,248,.08),rgba(52,211,153,.05))',border:'1px solid rgba(129,140,248,.2)',...S.row}}>
          <div>
            <div style={{fontSize:11,color:C.mut,marginBottom:4}}>Salario — {MNF[new Date(selMon+'-01').getMonth()]}</div>
            <div style={{fontSize:24,fontWeight:900,color:C.acc}}>{salary>0?fmt(salary):'Sin configurar'}</div>
            {monInc.length>0&&<div style={{fontSize:11,color:C.grn,marginTop:2}}>+{fmt(monInc.reduce((s,e)=>s+e.amount,0))} extra</div>}
          </div>
          <button onClick={()=>{setTmpSal(String(salary||''));setModal('salary')}} style={{background:'rgba(129,140,248,.15)',border:'1px solid rgba(129,140,248,.35)',borderRadius:10,color:C.acc,padding:'7px 16px',fontSize:13,cursor:'pointer',fontWeight:700}}>
            {salary>0?'Editar':'Configurar'}
          </button>
        </div>
        {totalDebtBalance>0&&(
          <div style={{background:'rgba(248,113,113,.07)',border:'1px solid rgba(248,113,113,.2)',borderRadius:12,padding:'10px 14px',marginBottom:8,...S.row}}>
            <div style={{fontSize:13,color:C.red}}>💳 Deuda total: <b>{fmt(totalDebtBalance)}</b></div>
            <button onClick={()=>setView('debts')} style={{background:'none',border:'none',color:C.red,fontSize:12,cursor:'pointer',fontWeight:700}}>Ver →</button>
          </div>
        )}
        {over80.length>0&&(
          <div style={{background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.25)',borderRadius:12,padding:'10px 14px',marginBottom:8,display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:18}}>⚠️</span>
            <div style={{fontSize:12,color:C.amb}}><b>Cerca del tope:</b> {over80.map(c=>`${c.icon} ${c.label}`).join(', ')}</div>
          </div>
        )}
        <div style={{...S.card(false),marginBottom:4}}>
          <div style={{...S.row,marginBottom:8}}>
            <span style={{fontSize:13,color:C.mut}}>Presupuesto del mes</span>
            <span style={{fontSize:13,fontWeight:700}}>{fmt(totalSpent)} <span style={{color:C.mut}}>/ {fmt(totalBudget||totalInc)}</span></span>
          </div>
          <div style={S.pbar}><div style={S.pfill(globPct,C.acc,false)}/></div>
          <div style={{...S.row,marginTop:6,fontSize:11}}>
            <span style={{color:C.mut}}>Ahorro: <b style={{color:C.grn}}>{savRate.toFixed(0)}%</b></span>
            <span style={{color:available>=0?C.grn:C.red,fontWeight:700}}>{available>=0?`Libre ${fmt(available)}`:`Déficit ${fmt(Math.abs(available))}`}</span>
          </div>
        </div>
        <button onClick={()=>setModal('smart')} style={{width:'100%',background:'rgba(129,140,248,.07)',border:'1px solid rgba(129,140,248,.2)',borderRadius:12,padding:'11px 16px',marginBottom:4,cursor:'pointer',...S.row,color:C.txt}}>
          <span style={{fontSize:13,display:'flex',alignItems:'center',gap:8}}>🤖 Sugerencias inteligentes de presupuesto</span>
          <span style={{color:C.acc,fontSize:16}}>→</span>
        </button>
        {recur.length>0&&(
          <>
            <div style={S.sec}>Recurrentes — toca para aplicar</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
              {recur.map(r=>{
                const cat=cats.find(c=>c.id===r.category),applied=monExp.some(e=>e.description===r.label&&e.category===r.category)
                return(
                  <button key={r.id} onClick={()=>!applied&&applyRecur(r)} style={{background:applied?'rgba(255,255,255,.03)':'rgba(129,140,248,.1)',border:`1px solid ${applied?'rgba(255,255,255,.07)':'rgba(129,140,248,.25)'}`,borderRadius:10,padding:'7px 12px',color:applied?C.mut:C.txt,fontSize:12,cursor:applied?'default':'pointer',display:'flex',alignItems:'center',gap:6}}>
                    {cat?.icon} {r.label} <b style={{color:applied?C.mut:C.acc}}>{fmt(r.amount)}</b>
                    {applied&&<span style={{color:C.grn,fontSize:10}}>✓</span>}
                  </button>
                )
              })}
            </div>
          </>
        )}
        <div style={{...S.row,marginTop:18,marginBottom:10}}>
          <span style={{...S.sec,margin:0}}>Categorías</span>
          <button onClick={()=>{setEditCat(null);setCatF(blankCat);setModal('cat')}} style={{background:'rgba(129,140,248,.12)',border:'1px solid rgba(129,140,248,.25)',borderRadius:8,color:C.acc,padding:'4px 12px',fontSize:12,cursor:'pointer',fontWeight:700}}>+ Nueva</button>
        </div>
        {cats.map(cat=>{
          const sp=catSpent(cat.id),bud=catBudget(cat.id),pct=bud>0?(sp/bud)*100:0,over=bud>0&&sp>bud,near=bud>0&&!over&&pct>=80
          return(
            <div key={cat.id} className="slide-up" style={{...S.card(over),animationDelay:`${cats.indexOf(cat)*0.05}s`}}>
              <div style={{...S.row,marginBottom:bud>0?8:0}}>
                <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
                  <span style={{fontSize:22}}>{cat.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700}}>{cat.label}</div>
                    {over&&<div style={{fontSize:10,color:C.red}}>+{fmt(sp-bud)} sobre tope</div>}
                    {near&&<div style={{fontSize:10,color:C.amb}}>⚠️ {pct.toFixed(0)}% del tope</div>}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:16,fontWeight:900,color:over?C.red:near?C.amb:cat.color}}>{fmt(sp)}</div>
                    {editBud===cat.id?(
                      <div style={{display:'flex',alignItems:'center',marginTop:3}}>
                        <input style={S.iInp} value={tmpBud} onChange={e=>setTmpBud(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveBudget(cat.id)} autoFocus placeholder="0"/>
                        <button style={S.smB(C.acc)} onClick={()=>saveBudget(cat.id)}>✓</button>
                      </div>
                    ):(
                      <div style={{fontSize:11,color:C.mut,cursor:'pointer',marginTop:2}} onClick={()=>{setEditBud(cat.id);setTmpBud(String(bud||''))}}>
                        Tope: {bud>0?fmt(bud):'Establecer'}
                      </div>
                    )}
                  </div>
                  {/* Edit button — visible on every category */}
                  <button
                    onClick={()=>{setEditCat(cat);setCatF({label:cat.label,icon:cat.icon,color:cat.color});setModal('cat')}}
                    style={{background:'rgba(255,255,255,.06)',border:`1px solid ${C.bord}`,borderRadius:8,padding:'6px 8px',fontSize:14,color:C.mut,cursor:'pointer',flexShrink:0}}>
                    ✏️
                  </button>
                </div>
              </div>
              {bud>0&&(
                <>
                  <div style={S.pbar}><div style={S.pfill(pct,cat.color,over)}/></div>
                  <div style={{...S.row,marginTop:4,fontSize:10,color:C.mut}}>
                    <span>{pct.toFixed(0)}% usado</span>
                    <span style={{color:over?C.red:near?C.amb:C.mut}}>{over?'EXCEDIDO':near?`Solo ${fmt(bud-sp)} libre`:`${fmt(bud-sp)} libre`}</span>
                  </div>
                </>
              )}
            </div>
          )
        })}
        <div style={S.sec}>Nota del mes</div>
        <textarea value={notes[selMon]||''} onChange={e=>{const v=e.target.value;setNotes(p=>({...p,[selMon]:v}));db.upsertNote(user.id,selMon,v)}}
          placeholder="Ej: Mes de vacaciones, hubo boda..." style={{...S.inp,minHeight:70,resize:'vertical',marginBottom:0}}/>
      </div>
    )
  }

  /* ════ DEBTS ════ */
  const Debts=()=>{
    const active=debts.filter(d=>d.balance>0), paid=debts.filter(d=>d.balance<=0)
    return(
      <div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          <div style={{...S.card(false),textAlign:'center',background:'rgba(248,113,113,.07)',border:'1px solid rgba(248,113,113,.18)'}}>
            <div style={{fontSize:10,color:C.mut,marginBottom:4,textTransform:'uppercase'}}>Deuda total</div>
            <div style={{fontSize:22,fontWeight:900,color:C.red}}>{fmt(totalDebtBalance)}</div>
          </div>
          <div style={{...S.card(false),textAlign:'center',background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.18)'}}>
            <div style={{fontSize:10,color:C.mut,marginBottom:4,textTransform:'uppercase'}}>Pago mínimo/mes</div>
            <div style={{fontSize:22,fontWeight:900,color:C.amb}}>{fmt(totalMinPayments)}</div>
          </div>
        </div>
        <button onClick={()=>{setEditDebt(null);setDebtF(blankDebt);setModal('debt')}} style={{width:'100%',background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.25)',borderRadius:14,padding:'14px',marginBottom:16,cursor:'pointer',color:C.txt,display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontWeight:700,fontSize:14}}>
          <span style={{fontSize:20}}>+</span> Agregar deuda
        </button>
        {active.length===0&&paid.length===0?(
          <div style={{textAlign:'center',color:C.mut,padding:'60px 0'}}>
            <div style={{fontSize:40,marginBottom:12}}>🎉</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>¡Sin deudas registradas!</div>
          </div>
        ):(
          <>
            {active.length>0&&<div style={S.sec}>Activas ({active.length})</div>}
            {active.map(d=>{
              const dt=DEBT_TYPES.find(t=>t.id===d.type)
              const paid2=d.originalAmount>0?Math.min(100,((d.originalAmount-d.balance)/d.originalAmount)*100):0
              const months=calcPayoffMonths(d.balance,d.minPayment,d.interestRate)
              const pDate=months&&months!==Infinity?new Date(NOW.getFullYear(),NOW.getMonth()+months,1):null
              return(
                <div key={d.id} className="slide-up" style={{...S.card(false),borderLeft:`3px solid ${d.color||C.red}`,cursor:'pointer',animationDelay:`${active.indexOf(d)*0.07}s`}} onClick={()=>setDetailDebt(d)}>
                  <div style={{...S.row,marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:42,height:42,borderRadius:12,background:`${d.color||C.red}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{dt?.icon||'📄'}</div>
                      <div>
                        <div style={{fontSize:15,fontWeight:800}}>{d.name}</div>
                        <div style={{fontSize:11,color:C.mut}}>{dt?.label}{d.dueDay?` · Vence ${d.dueMonth?MN[d.dueMonth-1]+' ':''} día ${d.dueDay}`:''}</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:18,fontWeight:900,color:d.color||C.red}}>{fmt(d.balance)}</div>
                      {d.interestRate>0&&<div style={{fontSize:10,color:C.mut}}>{d.interestRate}% anual</div>}
                    </div>
                  </div>
                  <div style={S.pbar}><div style={{height:'100%',borderRadius:3,width:`${paid2}%`,background:`linear-gradient(90deg,${C.grn},${C.grn}88)`,transition:'width .5s'}}/></div>
                  <div style={{...S.row,marginTop:6,fontSize:11,color:C.mut}}>
                    <span>{paid2.toFixed(0)}% pagado</span>
                    {months&&months!==Infinity&&pDate&&<span style={{color:C.amb}}>Libre en {months} mes{months!==1?'es':''}</span>}
                    {months===Infinity&&<span style={{color:C.red}}>⚠️ Pago mínimo insuficiente</span>}
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:10}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>{setPayDebt(d);setPayF({amount:String(d.minPayment||''),date:todayStr,note:''});setModal('payment')}} style={{flex:1,background:'rgba(52,211,153,.12)',border:'1px solid rgba(52,211,153,.25)',borderRadius:9,padding:'7px',fontSize:12,color:C.grn,cursor:'pointer',fontWeight:700}}>💳 Registrar pago</button>
                    <button onClick={()=>startEditDebt(d)} style={{background:'rgba(255,255,255,.06)',border:`1px solid ${C.bord}`,borderRadius:9,padding:'7px 12px',fontSize:13,color:C.mut,cursor:'pointer'}}>✏️</button>
                    <button onClick={()=>deleteDebt(d.id)} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.2)',borderRadius:9,padding:'7px 12px',fontSize:13,color:C.red,cursor:'pointer'}}>✕</button>
                  </div>
                </div>
              )
            })}
            {paid.length>0&&(
              <>
                <div style={S.sec}>Pagadas 🎉</div>
                {paid.map(d=>{
                  const dt=DEBT_TYPES.find(t=>t.id===d.type)
                  return(
                    <div key={d.id} style={{...S.card(false),opacity:.5,...S.row}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:20}}>{dt?.icon}</span>
                        <div><div style={{fontSize:14,fontWeight:700,textDecoration:'line-through'}}>{d.name}</div><div style={{fontSize:11,color:C.grn}}>✓ Pagada</div></div>
                      </div>
                      <button onClick={()=>deleteDebt(d.id)} style={{background:'none',border:'none',color:'rgba(248,113,113,.4)',cursor:'pointer',fontSize:15}}>✕</button>
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}
      </div>
    )
  }

  const startEditDebt=d=>{setEditDebt(d);setDebtF({name:d.name,type:d.type,balance:String(d.balance),originalAmount:String(d.originalAmount||d.balance),minPayment:String(d.minPayment||''),interestRate:String(d.interestRate||''),dueDay:String(d.dueDay||''),dueMonth:String(d.dueMonth||''),color:d.color||'#F87171'});setModal('debt')}

  /* ════ TRANSACTIONS ════ */
  const Transactions=()=>{
    const all=[...monExp.map(e=>({...e,type:'gasto'})),...monInc.map(e=>({...e,type:'ingreso'}))].sort((a,b)=>b.date.localeCompare(a.date)||(b.id>a.id?-1:1))
    return(
      <div>
        <div style={S.srch}>
          <span style={{color:C.mut,fontSize:16}}>🔍</span>
          <input style={{background:'none',border:'none',color:C.txt,fontSize:14,outline:'none',flex:1,fontFamily:"'Plus Jakarta Sans',sans-serif"}} placeholder="Buscar en todos los meses..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:C.mut,cursor:'pointer',fontSize:16}}>✕</button>}
        </div>
        {search?(
          <>
            <div style={S.sec}>Resultados ({searchResults.length})</div>
            {searchResults.length===0?<div style={{textAlign:'center',color:C.mut,padding:'30px 0',fontSize:13}}>Sin resultados</div>:
              searchResults.map(item=>{
                const cat=cats.find(c=>c.id===item.category)
                return(
                  <div key={item.id} className="slide-up" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:`1px solid ${C.bord}`,animationDelay:`${Math.min(all.indexOf(item)*0.03,0.3)}s`}}>
                    <div style={{display:'flex',alignItems:'center',gap:11}}>
                      <div style={{width:42,height:42,borderRadius:12,background:`${cat?.color||C.acc}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,border:`1px solid ${cat?.color||C.acc}40`}}>{cat?.icon||'📦'}</div>
                      <div><div style={{fontSize:14,fontWeight:600}}>{item.description||cat?.label}</div><div style={{fontSize:11,color:C.mut}}>{item.date} · {MNF[new Date(item.monthKey+'-01').getMonth()]}</div></div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:14,fontWeight:800,color:cat?.color||C.acc}}>{fmt(item.amount)}</span>
                      <button onClick={()=>startEditExp(item,item.monthKey)} style={{background:'none',border:'none',color:C.mut,cursor:'pointer',fontSize:14}}>✏️</button>
                      <button onClick={()=>deleteExp(item.id,item.monthKey)} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',cursor:'pointer',fontSize:14}}>✕</button>
                    </div>
                  </div>
                )
              })
            }
          </>
        ):(
          <>
            <div style={S.row}>
              <div style={S.sec}>Movimientos</div>
              <button onClick={()=>setModal('income')} style={{...S.smB(C.grn),padding:'6px 14px',fontSize:12,borderRadius:9}}>+ Ingreso</button>
            </div>
            {all.length===0?<div style={{textAlign:'center',color:C.mut,padding:'50px 0',fontSize:13}}>Sin movimientos · Toca + para agregar</div>:
              all.map(item=>{
                const cat=cats.find(c=>c.id===item.category),isInc=item.type==='ingreso'
                return(
                  <div key={item.id} className="slide-up" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:`1px solid ${C.bord}`,animationDelay:`${Math.min(all.indexOf(item)*0.03,0.3)}s`}}>
                    <div style={{display:'flex',alignItems:'center',gap:11}}>
                      <div style={{width:44,height:44,borderRadius:13,background:isInc?'rgba(52,211,153,.18)':cat?`${cat.color}28`:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,border:`1px solid ${isInc?'rgba(52,211,153,.25)':cat?cat.color+'40':'rgba(255,255,255,.1)'}`,flexShrink:0}}>{isInc?'💰':cat?.icon||'📦'}</div>
                      <div><div style={{fontSize:14,fontWeight:600}}>{item.description||item.label||cat?.label}</div><div style={{fontSize:11,color:C.mut}}>{isInc?'Ingreso extra':cat?.label} · {item.date}</div></div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      <span style={{fontSize:15,fontWeight:800,color:isInc?C.grn:cat?.color||C.acc}}>{isInc?'+':'-'}{fmt(item.amount)}</span>
                      {!isInc&&<button onClick={()=>startEditExp(item,selMon)} style={{background:'none',border:'none',color:C.mut,cursor:'pointer',fontSize:15,padding:'3px'}}>✏️</button>}
                      <button onClick={()=>isInc?deleteInc(item.id,selMon):deleteExp(item.id,selMon)} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',cursor:'pointer',fontSize:15,padding:'3px'}}>✕</button>
                    </div>
                  </div>
                )
              })
            }
            <div style={S.sec}>Gastos fijos</div>
            <button onClick={()=>setModal('recur')} style={{...S.card(false),width:'100%',cursor:'pointer',textAlign:'center',color:C.acc,fontSize:14,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:18}}>+</span> Agregar gasto recurrente
            </button>
            {recur.map(r=>{
              const cat=cats.find(c=>c.id===r.category)
              return(
                <div key={r.id} style={{...S.card(false),...S.row}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:20}}>{cat?.icon||'📦'}</span>
                    <div><div style={{fontSize:14,fontWeight:600}}>{r.label}</div><div style={{fontSize:11,color:C.mut}}>Día {r.day} · {cat?.label}</div></div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:14,fontWeight:800,color:cat?.color||C.acc}}>{fmt(r.amount)}</span>
                    <button onClick={()=>deleteRec(r.id)} style={{background:'none',border:'none',color:'rgba(248,113,113,.4)',cursor:'pointer',fontSize:15}}>✕</button>
                  </div>
                </div>
              )
            })}
            <button onClick={exportCSV} style={{width:'100%',marginTop:16,background:'rgba(255,255,255,.04)',border:`1px solid ${C.bord}`,borderRadius:12,color:C.mut,padding:'12px',fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontWeight:600}}>
              📥 Exportar todo a CSV
            </button>
          </>
        )}
      </div>
    )
  }

  /* ════ SAVINGS ════ */
  const Savings=()=>{
    const savCat=cats.find(c=>c.label==='Ahorros')||cats.find(c=>c.id==='ahorros')
    const monSaved=savCat?catSpent(savCat.id):0
    const allSaved=Object.values(expenses).flat().filter(e=>savCat?e.category===savCat.id:e.category==='ahorros').reduce((s,e)=>s+e.amount,0)

    // Weekly summary
    const weekStart=new Date(NOW); weekStart.setDate(NOW.getDate()-NOW.getDay())
    const weekStr=weekStart.toISOString().split('T')[0]
    const weekExp=monExp.filter(e=>e.date>=weekStr).reduce((s,e)=>s+e.amount,0)
    const daysInMonth=new Date(NOW.getFullYear(),NOW.getMonth()+1,0).getDate()
    const weeksInMonth=daysInMonth/7
    const avgWeekly=totalSpent>0?(totalSpent/(NOW.getDate()/7)):0
    const weekDiff=weekExp-avgWeekly

    const [addGoalId,setAddGoalId]=useState(null)
    const [addAmt,setAddAmt]=useState('')

    return(
      <div>
        {/* Weekly summary */}
        <div style={{...S.card(false),background:'linear-gradient(135deg,rgba(129,140,248,.08),rgba(99,102,241,.04))',border:'1px solid rgba(129,140,248,.2)'}}>
          <div style={{fontSize:11,color:C.mut,marginBottom:10,textTransform:'uppercase',letterSpacing:'1px'}}>📅 Resumen semanal</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div style={{textAlign:'center',background:'rgba(255,255,255,.03)',borderRadius:10,padding:'10px'}}>
              <div style={{fontSize:10,color:C.mut,marginBottom:4}}>Esta semana</div>
              <div style={{fontSize:20,fontWeight:900,color:C.acc}}>{fmt(weekExp)}</div>
            </div>
            <div style={{textAlign:'center',background:'rgba(255,255,255,.03)',borderRadius:10,padding:'10px'}}>
              <div style={{fontSize:10,color:C.mut,marginBottom:4}}>Promedio semanal</div>
              <div style={{fontSize:20,fontWeight:900,color:C.mut}}>{fmt(Math.round(avgWeekly))}</div>
            </div>
          </div>
          <div style={{marginTop:10,fontSize:12,textAlign:'center',color:weekDiff>0?C.red:C.grn,fontWeight:700}}>
            {weekDiff>0?`↑ ${fmt(Math.abs(Math.round(weekDiff)))} más que el promedio`:`↓ ${fmt(Math.abs(Math.round(weekDiff)))} menos que el promedio 🎉`}
          </div>
        </div>

        {/* Multiple goals */}
        <div style={{...S.row,marginTop:18,marginBottom:10}}>
          <span style={{...S.sec,margin:0}}>🎯 Metas de ahorro</span>
          <button onClick={()=>{setEditGoalItem(null);setGoalF({target:'',deadline:'',label:'',color:'#34D399',icon:'🎯'});setModal('goalitem')}}
            style={{background:'rgba(52,211,153,.12)',border:'1px solid rgba(52,211,153,.25)',borderRadius:8,color:C.grn,padding:'4px 12px',fontSize:12,cursor:'pointer',fontWeight:700}}>+ Nueva</button>
        </div>

        {goals.length===0?(
          <div style={{...S.card(false),textAlign:'center',padding:'30px',color:C.mut,fontSize:13}}>
            No tienes metas aún<br/>
            <span style={{fontSize:11,marginTop:4,display:'block'}}>Toca "+ Nueva" para crear una</span>
          </div>
        ):goals.map(g=>{
          const pct=g.target>0?Math.min(100,((g.saved||0)/g.target)*100):0
          const dl=g.deadline?Math.ceil((new Date(g.deadline)-NOW)/86400000):null
          const remaining=g.target-(g.saved||0)
          return(
            <div key={g.id} style={{...S.card(false),borderLeft:`3px solid ${g.color||C.grn}`}}>
              <div style={{...S.row,marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:42,height:42,borderRadius:12,background:`${g.color||C.grn}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{g.icon||'🎯'}</div>
                  <div>
                    <div style={{fontSize:15,fontWeight:800}}>{g.label}</div>
                    <div style={{fontSize:11,color:C.mut}}>{dl!==null?dl>0?`${dl} días restantes`:'¡Cumplida! 🎉':'Sin fecha límite'}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:16,fontWeight:900,color:g.color||C.grn}}>{fmt(g.saved||0)}</div>
                  <div style={{fontSize:11,color:C.mut}}>de {fmt(g.target)}</div>
                </div>
              </div>
              <div style={S.pbar}>
                <div style={{height:'100%',borderRadius:3,width:`${pct}%`,background:`linear-gradient(90deg,${g.color||C.grn},${g.color||C.grn}88)`,transition:'width .5s'}}/>
              </div>
              <div style={{...S.row,marginTop:4,fontSize:10,color:C.mut,marginBottom:10}}>
                <span>{pct.toFixed(0)}% alcanzado</span>
                <span>{remaining>0?`Faltan ${fmt(remaining)}`:'¡Meta cumplida! 🎉'}</span>
              </div>
              {addGoalId===g.id?(
                <div style={{display:'flex',gap:8}}>
                  <input style={{...S.inp,marginBottom:0,flex:1}} type="number" placeholder="Monto a abonar" value={addAmt} onChange={e=>setAddAmt(e.target.value)} autoFocus/>
                  <button onClick={()=>{addToGoal(g.id,addAmt,savCat?.id);setAddGoalId(null);setAddAmt('')}} style={{background:C.grn,border:'none',borderRadius:10,color:'#fff',padding:'0 16px',fontWeight:700,cursor:'pointer',fontSize:14}}>✓</button>
                  <button onClick={()=>{setAddGoalId(null);setAddAmt('')}} style={{background:'rgba(255,255,255,.06)',border:`1px solid ${C.bord}`,borderRadius:10,color:C.mut,padding:'0 12px',cursor:'pointer'}}>✕</button>
                </div>
              ):(
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setAddGoalId(g.id)} style={{flex:1,background:`rgba(52,211,153,.12)`,border:`1px solid rgba(52,211,153,.25)`,borderRadius:9,padding:'7px',fontSize:12,color:C.grn,cursor:'pointer',fontWeight:700}}>💰 Abonar</button>
                  <button onClick={()=>{setEditGoalItem(g);setGoalF({label:g.label,target:String(g.target),deadline:g.deadline||'',color:g.color||'#34D399',icon:g.icon||'🎯'});setModal('goalitem')}} style={{background:'rgba(255,255,255,.06)',border:`1px solid ${C.bord}`,borderRadius:9,padding:'7px 12px',fontSize:13,color:C.mut,cursor:'pointer'}}>✏️</button>
                  <button onClick={()=>deleteGoalItem(g.id)} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.2)',borderRadius:9,padding:'7px 12px',fontSize:13,color:C.red,cursor:'pointer'}}>✕</button>
                </div>
              )}
            </div>
          )
        })}

        {projection&&(
          <div style={{...S.card(false),background:'rgba(251,191,36,.05)',border:'1px solid rgba(251,191,36,.2)',marginTop:4}}>
            <div style={{fontSize:12,color:C.amb,fontWeight:800,marginBottom:8}}>📈 Proyección general</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div style={{textAlign:'center',background:'rgba(255,255,255,.03)',borderRadius:10,padding:'10px'}}>
                <div style={{fontSize:10,color:C.mut,marginBottom:4}}>Promedio mensual</div>
                <div style={{fontSize:18,fontWeight:900,color:C.amb}}>{fmt(projection.avg)}</div>
              </div>
              <div style={{textAlign:'center',background:'rgba(255,255,255,.03)',borderRadius:10,padding:'10px'}}>
                <div style={{fontSize:10,color:C.mut,marginBottom:4}}>Total ahorrado</div>
                <div style={{fontSize:18,fontWeight:900,color:C.grn}}>{fmt(allSaved)}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{...S.card(false),padding:'16px',marginTop:4}}>
          <div style={{fontSize:12,color:C.mut,marginBottom:10}}>Ahorros últimos 6 meses</div>
          <Spark data={last6.map(m=>m.savings)} color={C.grn}/>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            {last6.map((m,i)=><div key={i} style={{textAlign:'center',flex:1}}>
              <div style={{fontSize:9,color:C.mut}}>{m.short}</div>
              <div style={{fontSize:9,color:C.grn,fontWeight:700}}>{fmt(m.savings)}</div>
            </div>)}
          </div>
        </div>
      </div>
    )
  }

  /* ════ RENDER ════ */
  return(
    <div style={S.app}>
      <InjectCSS/>
      {notif&&<div style={{...S.notif(notif.type),animation:'slideDown .3s cubic-bezier(.22,1,.36,1) both'}}>{notif.msg}</div>}


      {/* HEADER */}
      <div style={S.hdr}>
        <div style={S.hTop}>
          <div style={S.logo}>💸 Finanzas Pro</div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <button onClick={toggleDark} title={darkMode?'Modo claro':'Modo oscuro'}
              style={{background:darkMode?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)',border:`1px solid ${C.bord}`,borderRadius:20,color:C.txt,padding:'5px 10px',fontSize:15,cursor:'pointer',transition:'all .3s'}}>
              {darkMode?'☀️':'🌙'}
            </button>
            <select style={S.msel} value={selMon} onChange={e=>setSelMon(e.target.value)}>
              {last6.map(m=><option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
            <button onClick={()=>supabase.auth.signOut()} style={{background:darkMode?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)',border:`1px solid ${C.bord}`,borderRadius:8,color:C.mut,padding:'5px 10px',fontSize:12,cursor:'pointer'}}>↩</button>
          </div>
        </div>
        <div style={S.statsRow}>
          {[{lbl:'Ingreso',val:totalInc,c:darkMode?'129,140,248':'99,102,241'},{lbl:'Gastado',val:totalSpent,c:'248,113,113'},{lbl:available>=0?'Libre':'Déficit',val:Math.abs(available),c:available>=0?darkMode?'52,211,153':'5,150,105':'248,113,113'}].map(s=>(
            <div key={s.lbl} style={S.sCard(s.c)}>
              <div style={{fontSize:9,color:C.mut,marginBottom:3,textTransform:'uppercase',letterSpacing:'.4px'}}>{s.lbl}</div>
              <div style={S.sVal(s.c)}>{fmt(s.val)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.body}>

        <div key={view} className="fade-in">
          {view==='home'   &&<Home/>}
          {view==='moves'  &&<Transactions/>}
          {view==='debts'  &&<Debts/>}
          {view==='savings'&&<Savings/>}
        </div>
      </div>

      <button style={{...S.fab,animation:'popIn .5s .2s cubic-bezier(.22,1,.36,1) both'}} onClick={()=>{setEditExp(null);setExpF({...blankExp,category:cats[0]?.id||'comidas'});setModal('expense')}}>+</button>

      <nav style={S.bnav}>
        {[{id:'home',icon:'🏠',l:'Inicio'},{id:'moves',icon:'📋',l:'Gastos'},{id:'debts',icon:'💳',l:'Deudas'},{id:'savings',icon:'🏦',l:'Ahorros'}].map(n=>(
          <button key={n.id} style={S.nbtn(view===n.id)} onClick={()=>setView(n.id)}>
            <span style={{fontSize:20}}>{n.icon}</span>{n.l}
          </button>
        ))}
      </nav>

      {/* MODALS */}
      {modal==='goalitem'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setEditGoalItem(null))}>
          <div style={S.sheet}>
            <div style={S.shT}>{editGoalItem?'✏️ Editar meta':'🎯 Nueva meta de ahorro'}</div>
            <input style={S.inp} type="text" placeholder="Nombre (Viaje, Casa, Emergencias...)" value={goalF.label} onChange={e=>setGoalF(p=>({...p,label:e.target.value}))}/>
            <input style={S.inp} type="number" placeholder="Monto objetivo $" value={goalF.target} onChange={e=>setGoalF(p=>({...p,target:e.target.value}))}/>
            <label style={S.lbl}>Fecha límite (opcional)</label>
            <input style={S.inp} type="date" value={goalF.deadline||''} onChange={e=>setGoalF(p=>({...p,deadline:e.target.value}))}/>
            <label style={S.lbl}>Ícono</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12,maxHeight:100,overflowY:'auto'}}>
              {['🎯','✈️','🏠','🚗','💍','🎓','🏖️','💊','📱','💻','🐶','👶','🌍','🎮','💰','🏋️'].map(ic=>(
                <button key={ic} onClick={()=>setGoalF(p=>({...p,icon:ic}))} style={{width:38,height:38,borderRadius:9,border:`2px solid ${goalF.icon===ic?C.grn:'transparent'}`,background:goalF.icon===ic?'rgba(52,211,153,.2)':'rgba(255,255,255,.05)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{ic}</button>
              ))}
            </div>
            <label style={S.lbl}>Color</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
              {['#34D399','#818CF8','#F97316','#EC4899','#38BDF8','#FBBF24','#F87171','#10B981'].map(col=>(
                <button key={col} onClick={()=>setGoalF(p=>({...p,color:col}))} style={{width:30,height:30,borderRadius:'50%',background:col,border:`3px solid ${goalF.color===col?'white':'transparent'}`,cursor:'pointer'}}/>
              ))}
            </div>
            <button style={S.btn1(`${C.grn},#10B981`)} onClick={saveGoalItem}>{editGoalItem?'Guardar cambios':'Crear meta'}</button>
            {editGoalItem&&(
              <button style={{...S.btn2,color:C.red,borderColor:'rgba(248,113,113,.3)'}} onClick={()=>{deleteGoalItem(editGoalItem.id);setModal(null);setEditGoalItem(null)}}>🗑️ Eliminar meta</button>
            )}
            <button style={S.btn2} onClick={()=>{setModal(null);setEditGoalItem(null)}}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='expense'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setEditExp(null))}>
          <div style={S.sheet}>
            <div style={S.shT}>{editExp?'✏️ Editar gasto':'➕ Nuevo gasto'}</div>
            <select style={S.sel} value={expF.category} onChange={e=>setExpF(p=>({...p,category:e.target.value}))}>
              {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <input style={S.inp} type="number" placeholder="Monto $" value={expF.amount} onChange={e=>setExpF(p=>({...p,amount:e.target.value}))}/>
            <input style={S.inp} type="text" placeholder="Descripción (opcional)" value={expF.description} onChange={e=>setExpF(p=>({...p,description:e.target.value}))}/>
            <input style={S.inp} type="date" value={expF.date} onChange={e=>setExpF(p=>({...p,date:e.target.value}))}/>
            <button style={S.btn1(`${C.acc},#6366F1`)} onClick={saveExpense}>{editExp?'Guardar cambios':'Agregar gasto'}</button>
            <button style={S.btn2} onClick={()=>{setModal(null);setEditExp(null)}}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='income'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={S.shT}>💰 Ingreso extra</div>
            <input style={S.inp} type="text" placeholder="Descripción (bono, freelance...)" value={incF.label} onChange={e=>setIncF(p=>({...p,label:e.target.value}))}/>
            <input style={S.inp} type="number" placeholder="Monto $" value={incF.amount} onChange={e=>setIncF(p=>({...p,amount:e.target.value}))}/>
            <input style={S.inp} type="date" value={incF.date} onChange={e=>setIncF(p=>({...p,date:e.target.value}))}/>
            <button style={S.btn1(`${C.grn},#10B981`)} onClick={addIncome}>Agregar ingreso</button>
            <button style={S.btn2} onClick={()=>setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='recur'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={S.shT}>🔄 Gasto recurrente</div>
            <input style={S.inp} type="text" placeholder="Nombre (Netflix, Gym, Renta...)" value={recF.label} onChange={e=>setRecF(p=>({...p,label:e.target.value}))}/>
            <input style={S.inp} type="number" placeholder="Monto mensual $" value={recF.amount} onChange={e=>setRecF(p=>({...p,amount:e.target.value}))}/>
            <select style={S.sel} value={recF.category} onChange={e=>setRecF(p=>({...p,category:e.target.value}))}>
              {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <input style={S.inp} type="number" min="1" max="31" placeholder="Día del mes" value={recF.day} onChange={e=>setRecF(p=>({...p,day:+e.target.value}))}/>
            <button style={S.btn1(`${C.acc},#6366F1`)} onClick={addRecur}>Guardar</button>
            <button style={S.btn2} onClick={()=>setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='goal'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={S.shT}>🎯 Meta de ahorro</div>
            <input style={S.inp} type="text" placeholder="Nombre (viaje, fondo de emergencia...)" value={goalF.label} onChange={e=>setGoalF(p=>({...p,label:e.target.value}))}/>
            <input style={S.inp} type="number" placeholder="Monto meta $" value={goalF.target} onChange={e=>setGoalF(p=>({...p,target:e.target.value}))}/>
            <label style={S.lbl}>Fecha límite (opcional)</label>
            <input style={S.inp} type="date" value={goalF.deadline} onChange={e=>setGoalF(p=>({...p,deadline:e.target.value}))}/>
            <button style={S.btn1(`${C.grn},#10B981`)} onClick={saveGoal}>Guardar meta</button>
            <button style={S.btn2} onClick={()=>setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='salary'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={S.shT}>💼 Salario — {MNF[new Date(selMon+'-01').getMonth()]}</div>
            <div style={{fontSize:13,color:C.mut,marginBottom:14}}>Se guarda por mes. Puedes tener salarios distintos cada mes.</div>
            <input style={S.inp} type="number" placeholder="Monto neto $" value={tmpSal} onChange={e=>setTmpSal(e.target.value)} autoFocus/>
            <button style={S.btn1(`${C.acc},#6366F1`)} onClick={()=>saveSalary(selMon)}>Guardar para {MNF[new Date(selMon+'-01').getMonth()]}</button>
            <button style={S.btn2} onClick={()=>setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='smart'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={S.shT}>🤖 Sugerencias inteligentes</div>
            <div style={{fontSize:13,color:C.mut,marginBottom:16}}>Basado en tu historial, sugerimos estos topes (promedio +10%):</div>
            {smartSuggestions.map(s=>{
              const cat=cats.find(c=>c.id===s.id)
              if(!s.suggested) return null
              return(
                <div key={s.id} style={{...S.row,padding:'10px 0',borderBottom:`1px solid ${C.bord}`}}>
                  <span style={{fontSize:14,display:'flex',alignItems:'center',gap:8}}>{cat?.icon} {cat?.label}</span>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:14,fontWeight:800,color:cat?.color}}>{fmt(s.suggested)}</div>
                    <div style={{fontSize:10,color:C.mut}}>Promedio: {fmt(s.avg)}</div>
                  </div>
                </div>
              )
            })}
            {smartSuggestions.every(s=>!s.suggested)&&<div style={{textAlign:'center',color:C.mut,padding:'20px 0',fontSize:13}}>Necesitas historial de al menos 1 mes</div>}
            <button style={S.btn1(`${C.acc},#6366F1`)} onClick={applySmartBudgets}>Aplicar sugerencias</button>
            <button style={S.btn2} onClick={()=>setModal(null)}>Cerrar</button>
          </div>
        </div>
      )}
      {modal==='cat'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setEditCat(null))}>
          <div style={S.sheet}>
            <div style={S.shT}>{editCat?'✏️ Editar categoría':'🏷️ Nueva categoría'}</div>
            <input style={S.inp} type="text" placeholder="Nombre (Ropa, Mascotas, Salud...)" value={catF.label} onChange={e=>setCatF(p=>({...p,label:e.target.value}))}/>
            <label style={S.lbl}>Icono</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12,maxHeight:120,overflowY:'auto'}}>
              {CAT_ICONS.map(ic=>(
                <button key={ic} onClick={()=>setCatF(p=>({...p,icon:ic}))} style={{width:38,height:38,borderRadius:9,border:`2px solid ${catF.icon===ic?C.acc:'transparent'}`,background:catF.icon===ic?'rgba(129,140,248,.2)':'rgba(255,255,255,.05)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{ic}</button>
              ))}
            </div>
            <label style={S.lbl}>Color</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
              {CAT_COLORS.map(col=>(
                <button key={col} onClick={()=>setCatF(p=>({...p,color:col}))} style={{width:30,height:30,borderRadius:'50%',background:col,border:`3px solid ${catF.color===col?'white':'transparent'}`,cursor:'pointer'}}/>
              ))}
            </div>
            <div style={{...S.card(false),display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <span style={{fontSize:26}}>{catF.icon}</span>
              <span style={{fontSize:16,fontWeight:700,color:catF.color}}>{catF.label||'Vista previa'}</span>
            </div>
            <button style={S.btn1(`${C.acc},#6366F1`)} onClick={saveCat}>{editCat?'Guardar cambios':'Crear categoría'}</button>
            {editCat&&(
              <button style={{...S.btn2,color:C.red,borderColor:'rgba(248,113,113,.3)'}} onClick={()=>{deleteCat(editCat.id);setModal(null);setEditCat(null)}}>🗑️ Eliminar categoría</button>
            )}
            <button style={S.btn2} onClick={()=>{setModal(null);setEditCat(null)}}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='debt'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setEditDebt(null))}>
          <div style={S.sheet}>
            <div style={S.shT}>{editDebt?'✏️ Editar deuda':'💳 Nueva deuda'}</div>
            <input style={S.inp} type="text" placeholder="Nombre (Banamex, Préstamo BBVA...)" value={debtF.name} onChange={e=>setDebtF(p=>({...p,name:e.target.value}))}/>
            <select style={S.sel} value={debtF.type} onChange={e=>setDebtF(p=>({...p,type:e.target.value}))}>
              {DEBT_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
            </select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div><label style={S.lbl}>Saldo actual $</label><input style={{...S.inp,marginBottom:0}} type="number" placeholder="0" value={debtF.balance} onChange={e=>setDebtF(p=>({...p,balance:e.target.value}))}/></div>
              <div><label style={S.lbl}>Monto original $</label><input style={{...S.inp,marginBottom:0}} type="number" placeholder="0" value={debtF.originalAmount} onChange={e=>setDebtF(p=>({...p,originalAmount:e.target.value}))}/></div>
            </div>
            <div style={{height:10}}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div><label style={S.lbl}>Pago mínimo $</label><input style={{...S.inp,marginBottom:0}} type="number" placeholder="0" value={debtF.minPayment} onChange={e=>setDebtF(p=>({...p,minPayment:e.target.value}))}/></div>
              <div><label style={S.lbl}>Tasa anual %</label><input style={{...S.inp,marginBottom:0}} type="number" placeholder="0" value={debtF.interestRate} onChange={e=>setDebtF(p=>({...p,interestRate:e.target.value}))}/></div>
            </div>
            <div style={{height:10}}/>
            <label style={S.lbl}>Fecha de vencimiento</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div>
                <label style={{...S.lbl,marginBottom:4}}>Día</label>
                <select style={{...S.sel,marginBottom:0}} value={debtF.dueDay||''} onChange={e=>setDebtF(p=>({...p,dueDay:e.target.value}))}>
                  <option value="">Día</option>
                  {Array.from({length:31},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
              <div>
                <label style={{...S.lbl,marginBottom:4}}>Mes</label>
                <select style={{...S.sel,marginBottom:0}} value={debtF.dueMonth||''} onChange={e=>setDebtF(p=>({...p,dueMonth:e.target.value}))}>
                  <option value="">Mes</option>
                  {MN.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
            </div>
            <div style={{height:10}}/>
            <label style={S.lbl}>Color</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
              {CAT_COLORS.map(col=>(
                <button key={col} onClick={()=>setDebtF(p=>({...p,color:col}))} style={{width:28,height:28,borderRadius:'50%',background:col,border:`3px solid ${debtF.color===col?'white':'transparent'}`,cursor:'pointer'}}/>
              ))}
            </div>
            <button style={S.btn1('#F87171,#EF4444')} onClick={saveDebt}>{editDebt?'Guardar cambios':'Agregar deuda'}</button>
            <button style={S.btn2} onClick={()=>{setModal(null);setEditDebt(null)}}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='payment'&&payDebt&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setPayDebt(null))}>
          <div style={S.sheet}>
            <div style={S.shT}>💳 Registrar pago</div>
            <div style={{fontSize:14,color:C.mut,marginBottom:16}}>Deuda: <b style={{color:C.txt}}>{payDebt.name}</b> · Saldo: <b style={{color:C.red}}>{fmt(payDebt.balance)}</b></div>
            <input style={S.inp} type="number" placeholder={`Monto (mínimo ${fmt(payDebt.minPayment)})`} value={payF.amount} onChange={e=>setPayF(p=>({...p,amount:e.target.value}))}/>
            <input style={S.inp} type="date" value={payF.date} onChange={e=>setPayF(p=>({...p,date:e.target.value}))}/>
            <input style={S.inp} type="text" placeholder="Nota (opcional)" value={payF.note} onChange={e=>setPayF(p=>({...p,note:e.target.value}))}/>
            <div style={{fontSize:12,color:C.mut,marginBottom:12,background:'rgba(255,255,255,.04)',borderRadius:10,padding:'10px 14px'}}>💡 El pago se registrará también como gasto en "Extra"</div>
            <button style={S.btn1(`${C.grn},#10B981`)} onClick={registerPayment}>Registrar pago</button>
            <button style={S.btn2} onClick={()=>{setModal(null);setPayDebt(null)}}>Cancelar</button>
          </div>
        </div>
      )}
      {detailDebt&&(()=>{
        const d=debts.find(x=>x.id===detailDebt.id)||detailDebt
        const dt=DEBT_TYPES.find(t=>t.id===d.type)
        const months=calcPayoffMonths(d.balance,d.minPayment,d.interestRate)
        const paid=d.originalAmount>0?Math.min(100,((d.originalAmount-d.balance)/d.originalAmount)*100):0
        const totalInt=months&&months!==Infinity?(months*d.minPayment)-d.balance:null
        return(
          <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setDetailDebt(null)}>
            <div style={S.sheet}>
              <div style={{...S.row,marginBottom:20}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:48,height:48,borderRadius:14,background:`${d.color||C.red}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{dt?.icon}</div>
                  <div><div style={{fontSize:18,fontWeight:900}}>{d.name}</div><div style={{fontSize:12,color:C.mut}}>{dt?.label}</div></div>
                </div>
                <button onClick={()=>setDetailDebt(null)} style={{background:'none',border:'none',color:C.mut,fontSize:22,cursor:'pointer'}}>✕</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16}}>
                {[{l:'Saldo',v:fmt(d.balance),c:C.red},{l:'Pagado',v:fmt((d.originalAmount||d.balance)-d.balance),c:C.grn},{l:'Original',v:fmt(d.originalAmount||d.balance),c:C.mut}].map(x=>(
                  <div key={x.l} style={{background:'rgba(255,255,255,.04)',borderRadius:10,padding:'10px',textAlign:'center'}}>
                    <div style={{fontSize:9,color:C.mut,marginBottom:4,textTransform:'uppercase'}}>{x.l}</div>
                    <div style={{fontSize:14,fontWeight:900,color:x.c}}>{x.v}</div>
                  </div>
                ))}
              </div>
              <div style={S.pbar}><div style={{height:'100%',borderRadius:3,width:`${paid}%`,background:`linear-gradient(90deg,${C.grn},${C.grn}88)`,transition:'width .5s'}}/></div>
              <div style={{...S.row,marginTop:4,fontSize:11,color:C.mut,marginBottom:14}}>
                <span>{paid.toFixed(0)}% pagado</span>
                {months&&months!==Infinity&&<span style={{color:C.amb}}>Libre en {months} meses</span>}
              </div>
              {totalInt!==null&&<div style={{background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.2)',borderRadius:10,padding:'10px 14px',fontSize:12,color:C.amb,marginBottom:14}}>
                💡 Pagarás aprox. <b>{fmt(totalInt)}</b> en intereses con el pago mínimo
              </div>}
              <div style={S.sec}>Historial de pagos</div>
              {(!d.payments||d.payments.length===0)?<div style={{textAlign:'center',color:C.mut,padding:'16px 0',fontSize:13}}>Sin pagos registrados</div>:
                [...(d.payments||[])].reverse().map(p=>(
                  <div key={p.id} style={{...S.row,padding:'9px 0',borderBottom:`1px solid ${C.bord}`}}>
                    <div><div style={{fontSize:14,fontWeight:600}}>{fmt(p.amount)}</div><div style={{fontSize:11,color:C.mut}}>{p.date}{p.note?` · ${p.note}`:''}</div></div>
                    <button onClick={()=>deletePayment(d.id,p.id,p.amount)} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',cursor:'pointer',fontSize:15}}>✕</button>
                  </div>
                ))
              }
              <button onClick={()=>{setDetailDebt(null);setPayDebt(d);setPayF({amount:String(d.minPayment||''),date:todayStr,note:''});setModal('payment')}} style={{...S.btn1(`${C.grn},#10B981`),marginTop:16}}>💳 Registrar nuevo pago</button>
            </div>
          </div>
        )
      })()}


    </div>
  )
}
