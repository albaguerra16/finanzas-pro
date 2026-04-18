import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabase'
import Auth from './Auth'
import * as db from './db'

const DEFAULT_CATS=[
  {id:'comidas',label:'Comidas',icon:'🍽️',color:'#F97316',is_default:true,sort_order:0},
  {id:'compras',label:'Compras',icon:'🛍️',color:'#EC4899',is_default:true,sort_order:1},
  {id:'suscripciones',label:'Suscripciones',icon:'📱',color:'#A78BFA',is_default:true,sort_order:2},
  {id:'transporte',label:'Transporte',icon:'🚌',color:'#38BDF8',is_default:true,sort_order:3},
  {id:'belleza',label:'Belleza',icon:'✨',color:'#FBBF24',is_default:true,sort_order:4},
  {id:'extra',label:'Extra',icon:'🎲',color:'#6366F1',is_default:true,sort_order:5},
  {id:'ahorros',label:'Ahorros',icon:'🏦',color:'#34D399',is_default:true,sort_order:6},
]
const DEBT_TYPES=[
  {id:'tarjeta',label:'Tarjeta de crédito',icon:'💳'},
  {id:'prestamo',label:'Préstamo personal',icon:'🤝'},
  {id:'hipoteca',label:'Hipoteca',icon:'🏠'},
  {id:'auto',label:'Auto',icon:'🚗'},
  {id:'familiar',label:'Familiar/Amigo',icon:'👨‍👩‍👦'},
  {id:'otro',label:'Otro',icon:'📄'},
]
const CAT_ICONS=['🍽️','🛍️','👗','👟','💄','🎮','🎬','📚','🏋️','🐾','🧴','☕','🍺','🎁','🏥','💊','✈️','🏖️','🎵','🍕','🥗','🛺','⛽','🅿️','🏠','💡','📦','🌿','🧹','💻','📱','🎲','🏦','💰','🎓','👶','🐶','🌸','🍰','🎯']
const CAT_COLORS=['#F97316','#EC4899','#A78BFA','#38BDF8','#FBBF24','#6366F1','#34D399','#F43F5E','#10B981','#06B6D4','#8B5CF6','#EF4444','#14B8A6','#F59E0B','#3B82F6','#84CC16','#E879F9','#FB923C']
const MN=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MNF=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const NOW=new Date()
const mk=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
const fmt=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',minimumFractionDigits:0}).format(n||0)
const todayStr=`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,'0')}-${String(NOW.getDate()).padStart(2,'0')}`

function calcPayoffMonths(b,m,r){
  if(m<=0||b<=0) return null
  const mr=r/100/12
  if(mr===0) return Math.ceil(b/m)
  if(m<=b*mr) return Infinity
  return Math.ceil(-Math.log(1-(b*mr/m))/Math.log(1+mr))
}

const CSS=`
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes popIn{0%{opacity:0;transform:scale(0.92)}70%{transform:scale(1.02)}100%{opacity:1;transform:scale(1)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
.su{animation:slideUp .35s cubic-bezier(.22,1,.36,1) both}
.fi{animation:fadeIn .25s ease both}
.pi{animation:popIn .4s cubic-bezier(.22,1,.36,1) both}
.sd{animation:slideDown .3s cubic-bezier(.22,1,.36,1) both}
`
function InjectCSS(){
  useEffect(()=>{
    if(!document.getElementById('fn-css')){
      const s=document.createElement('style');s.id='fn-css';s.textContent=CSS;document.head.appendChild(s)
    }
  },[])
  return null
}

export default function App(){
  const [session,setSession]=useState(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setLoading(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSession(s))
    return ()=>subscription.unsubscribe()
  },[])
  if(loading) return <Splash/>
  if(!session) return <Auth/>
  return <FinanceApp user={session.user}/>
}

function Splash(){
  return(
    <div style={{minHeight:'100vh',background:'#f8f9fe',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:52,marginBottom:12}}>💸</div>
        <div style={{fontSize:20,fontWeight:900,background:'linear-gradient(90deg,#4c1d95,#0284c7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Finanzas Pro</div>
        <div style={{color:'#bbb',fontSize:13,marginTop:8}}>Cargando...</div>
      </div>
    </div>
  )
}

function FinanceApp({user}){
  const [view,setView]=useState('home')
  const [selMon,setSelMon]=useState(mk(NOW))
  const [cats,setCats]=useState(DEFAULT_CATS)
  const [salaries,setSalaries]=useState({})
  const [budgets,setBudgets]=useState({})
  const [expenses,setExpenses]=useState({})
  const [incomes,setIncomes]=useState({})
  const [recur,setRecur]=useState([])
  const [goal,setGoal]=useState({target:0,deadline:'',label:'Mi meta'})
  const [goals,setGoals]=useState([])
  const [notes,setNotes]=useState({})
  const [debts,setDebts]=useState([])
  const [dataReady,setDataReady]=useState(false)
  const [selCat,setSelCat]=useState(null)
  const [detailDebt,setDetailDebt]=useState(null)
  const [modal,setModal]=useState(null)
  const [notif,setNotif]=useState(null)
  const [search,setSearch]=useState('')
  const [editExp,setEditExp]=useState(null)
  const [editDebt,setEditDebt]=useState(null)
  const [payDebt,setPayDebt]=useState(null)
  const [editCat,setEditCat]=useState(null)
  const [editGoalItem,setEditGoalItem]=useState(null)
  const [editBudCat,setEditBudCat]=useState(null)
  const [darkMode,setDarkMode]=useState(()=>localStorage.getItem('fn4_dark')==='true')
  const toggleDark=()=>{const v=!darkMode;setDarkMode(v);localStorage.setItem('fn4_dark',String(v))}
  const [tmpBud,setTmpBud]=useState('')
  const [tmpSal,setTmpSal]=useState('')
  const [addGoalId,setAddGoalId]=useState(null)
  const [addAmt,setAddAmt]=useState('')

  const blankExp={category:cats[0]?.id||'comidas',amount:'',description:'',date:todayStr}
  const blankDebt={name:'',type:'tarjeta',balance:'',originalAmount:'',minPayment:'',interestRate:'',dueDay:'',dueMonth:'',color:'#F87171'}
  const blankCat={label:'',icon:'🛍️',color:'#EC4899'}
  const blankGoal={target:'',deadline:'',label:'',color:'#34D399',icon:'🎯'}

  const [expF,setExpF]=useState(blankExp)
  const [incF,setIncF]=useState({label:'',amount:'',date:todayStr})
  const [recF,setRecF]=useState({label:'',amount:'',category:'comidas',day:1})
  const [goalF,setGoalF]=useState(blankGoal)
  const [debtF,setDebtF]=useState(blankDebt)
  const [payF,setPayF]=useState({amount:'',date:todayStr,note:''})
  const [catF,setCatF]=useState(blankCat)

  const notify=(msg,type='ok')=>{setNotif({msg,type});setTimeout(()=>setNotif(null),3000)}

  useEffect(()=>{
    if(!user) return
    const load=async()=>{ try {
      const [c,s,b,e,i,r,g,n,d,gs]=await Promise.all([
        db.fetchCategories(user.id),db.fetchSalaries(user.id),db.fetchBudgets(user.id),
        db.fetchExpenses(user.id),db.fetchIncomes(user.id),db.fetchRecurring(user.id),
        db.fetchGoal(user.id),db.fetchNotes(user.id),db.fetchDebts(user.id),
        db.fetchGoals(user.id).catch(()=>[])
      ])
      if(c.length>0) setCats(c)
      else { const ins=await Promise.all(DEFAULT_CATS.map(cat=>db.upsertCategory(user.id,cat))); setCats(ins.filter(Boolean)) }
      setSalaries(s);setBudgets(b);setExpenses(e);setIncomes(i)
      setRecur(r);setGoal(g);setNotes(n);setDebts(d);setGoals(gs||[])
      setDataReady(true)
    } catch(err){console.error(err);setDataReady(true)} }
    load()
  },[user])

  const salary=salaries[selMon]??(Object.values(salaries)[0]??0)
  const monExp=expenses[selMon]||[]
  const monInc=incomes[selMon]||[]
  const totalSpent=monExp.reduce((s,e)=>s+e.amount,0)
  const totalInc=salary+monInc.reduce((s,e)=>s+e.amount,0)
  const available=totalInc-totalSpent
  const savCatId=cats.find(c=>c.label==='Ahorros')?.id||'ahorros'
  const monSavings=monExp.filter(e=>e.category===savCatId).reduce((s,e)=>s+e.amount,0)
  const catSpent=id=>monExp.filter(e=>e.category===id).reduce((s,e)=>s+e.amount,0)
  const catBudget=id=>budgets[id]??0
  const totalDebtBalance=debts.reduce((s,d)=>s+d.balance,0)
  const totalMinPayments=debts.reduce((s,d)=>s+d.minPayment,0)
  const totalSaved=Object.values(expenses).flat().filter(e=>e.category===savCatId).reduce((s,e)=>s+e.amount,0)
  const goalPct=goal.target>0?Math.min(100,(totalSaved/goal.target)*100):0

  const last6=useMemo(()=>Array.from({length:6},(_,i)=>{
    const d=new Date(NOW.getFullYear(),NOW.getMonth()-5+i,1)
    const key=mk(d)
    const mE=expenses[key]||[],mI=incomes[key]||[]
    const sal=salaries[key]??(Object.values(salaries)[0]??0)
    const spent=mE.reduce((s,e)=>s+e.amount,0)
    const inc=sal+mI.reduce((s,e)=>s+e.amount,0)
    const savings=mE.filter(e=>e.category===savCatId).reduce((s,e)=>s+e.amount,0)
    return {key,short:MN[d.getMonth()],label:`${MNF[d.getMonth()]} ${d.getFullYear()}`,spent,inc,savings,avail:inc-spent}
  }),[expenses,incomes,salaries,savCatId])

  const finScore=useMemo(()=>{ try {
    let score=100; const msgs=[]
    const savRate=totalInc>0?(monSavings/totalInc)*100:0
    if(savRate>=20) msgs.push('Excelente tasa de ahorro 🏆')
    else if(savRate>=10) msgs.push('Buen ahorro este mes 👍')
    else if(savRate>0){score-=10;msgs.push('Ahorro bajo, intenta el 10% 💡')}
    else{score-=25;msgs.push('Sin ahorros este mes 😬')}
    const cwb=cats.filter(c=>(budgets[c.id]??0)>0)
    const exc=cwb.filter(c=>monExp.filter(e=>e.category===c.id).reduce((s,e)=>s+e.amount,0)>(budgets[c.id]??0))
    if(exc.length===0&&cwb.length>0) msgs.push('Dentro del presupuesto 🎯')
    else if(exc.length>0){score-=exc.length*8;msgs.push(`${exc.length} categoría${exc.length>1?'s':''} excedida${exc.length>1?'s':''} ⚠️`)}
    if(cwb.length===0){score-=10;msgs.push('Define topes por categoría 📊')}
    const ad=debts.filter(d=>d.balance>0)
    if(ad.length>0){
      const paid=monExp.filter(e=>(e.description||'').toLowerCase().includes('pago deuda')).reduce((s,e)=>s+e.amount,0)
      if(paid>=totalMinPayments&&totalMinPayments>0) msgs.push('Deudas al día ✅')
      else if(paid>0){score-=5;msgs.push('Pagando deudas parcialmente 💳')}
      else{score-=15;msgs.push('Sin pagos de deuda este mes 💳')}
    }
    const ratio=totalInc>0?(totalSpent/totalInc)*100:100
    if(ratio>95){score-=20;msgs.push('Gastando casi todo el ingreso 🚨')}
    else if(ratio>80){score-=10;msgs.push('Gasto alto vs ingreso 📉')}
    else if(ratio<60) msgs.push('Gasto muy controlado 💚')
    score=Math.max(0,Math.min(100,score))
    const grade=score>=90?'A+':score>=80?'A':score>=70?'B+':score>=60?'B':score>=50?'C':'D'
    const color=score>=80?'#10b981':score>=60?'#6366f1':score>=40?'#f59e0b':'#ef4444'
    const label=score>=80?'Excelente 🌟':score>=60?'Bien 👍':score>=40?'Regular ⚡':'Mejorar 💪'
    return {score,grade,color,label,msgs}
  } catch(e){return {score:0,grade:'?',color:'#6366f1',label:'Cargando...',msgs:[]}} }
  ,[monExp,monSavings,cats,budgets,totalInc,totalSpent,debts,totalMinPayments])

  const debtsDueSoon=debts.filter(d=>{
    if(d.balance<=0||!d.dueDay) return false
    const today=NOW.getDate(),month=NOW.getMonth()+1
    const sm=!d.dueMonth||d.dueMonth===month
    return sm&&d.dueDay>=today&&d.dueDay<=today+3
  })
  const debtsOverdue=debts.filter(d=>{
    if(d.balance<=0||!d.dueDay) return false
    const today=NOW.getDate(),month=NOW.getMonth()+1
    const sm=!d.dueMonth||d.dueMonth===month
    return sm&&d.dueDay<today
  })

  const searchResults=useMemo(()=>{
    if(!search.trim()) return []
    const q=search.toLowerCase()
    const res=[]
    Object.entries(expenses).forEach(([mk2,arr])=>arr.forEach(e=>{
      if((e.description||'').toLowerCase().includes(q)||e.category.toLowerCase().includes(q))
        res.push({...e,monthKey:mk2})
    }))
    return res.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30)
  },[search,expenses])

  // ── ACTIONS ──
  const saveExpense=async()=>{
    if(!expF.amount||+expF.amount<=0){notify('Monto inválido','err');return}
    if(saveExpense._s) return; saveExpense._s=true
    const mk2=expF.date.slice(0,7)
    if(editExp){
      await db.updateExpense(editExp.id,expF)
      setExpenses(p=>({...p,[editExp.monthKey]:(p[editExp.monthKey]||[]).map(e=>e.id===editExp.id?{...e,...expF,amount:+expF.amount}:e)}))
      notify('Gasto actualizado ✓')
    } else {
      const row=await db.insertExpense(user.id,{...expF,amount:+expF.amount})
      if(row) setExpenses(p=>({...p,[mk2]:[...(p[mk2]||[]),{id:row.id,...expF,amount:+expF.amount}]}))
      notify('Gasto agregado ✓')
    }
    saveExpense._s=false;setEditExp(null);setExpF(blankExp);setModal(null)
  }
  const startEditExp=(exp,mk2)=>{setEditExp({...exp,monthKey:mk2});setExpF({category:exp.category,amount:String(exp.amount),description:exp.description||'',date:exp.date});setModal('expense')}
  const deleteExp=async(id,mk2)=>{await db.deleteExpense(id);setExpenses(p=>({...p,[mk2]:(p[mk2]||[]).filter(e=>e.id!==id)}));notify('Eliminado')}
  const deleteInc=async(id,mk2)=>{await db.deleteIncome(id);setIncomes(p=>({...p,[mk2]:(p[mk2]||[]).filter(e=>e.id!==id)}));notify('Eliminado')}
  const deleteRec=async(id)=>{await db.deleteRecurring(id);setRecur(p=>p.filter(r=>r.id!==id))}
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
    if(monExp.some(e=>e.description===r.label&&e.category===r.category)){notify('Ya aplicado este mes','err');return}
    const d=`${selMon}-${String(r.day).padStart(2,'0')}`
    const exp={category:r.category,amount:r.amount,description:r.label,date:d}
    const row=await db.insertExpense(user.id,exp)
    if(row) setExpenses(p=>({...p,[selMon]:[...(p[selMon]||[]),{id:row.id,...exp}]}))
    notify(`"${r.label}" aplicado ✓`)
  }
  const saveSalary=async(mk2)=>{await db.upsertSalary(user.id,mk2,+tmpSal||0);setSalaries(p=>({...p,[mk2]:+tmpSal||0}));setModal(null);notify('Salario guardado ✓')}
  const saveBudget=async(id)=>{await db.upsertBudget(user.id,id,+tmpBud||0);setBudgets(p=>({...p,[id]:+tmpBud||0}));setEditBudCat(null);notify('Tope guardado ✓')}
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
  const deleteCat=async(id)=>{await db.deleteCategory(id);setCats(p=>p.filter(c=>c.id!==id));notify('Categoría eliminada')}
  const saveDebt=async()=>{
    if(!debtF.name||!debtF.balance){notify('Completa nombre y saldo','err');return}
    const data={...debtF,balance:+debtF.balance,originalAmount:+debtF.originalAmount||+debtF.balance,minPayment:+debtF.minPayment||0,interestRate:+debtF.interestRate||0,dueDay:+debtF.dueDay||0,dueMonth:+debtF.dueMonth||0}
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
  const deleteDebt=async(id)=>{await db.deleteDebt(id);setDebts(p=>p.filter(d=>d.id!==id));notify('Deuda eliminada')}
  const startEditDebt=d=>{setEditDebt(d);setDebtF({name:d.name,type:d.type,balance:String(d.balance),originalAmount:String(d.originalAmount||d.balance),minPayment:String(d.minPayment||''),interestRate:String(d.interestRate||''),dueDay:String(d.dueDay||''),dueMonth:String(d.dueMonth||''),color:d.color||'#F87171'});setModal('debt')}
  const registerPayment=async()=>{
    if(!payF.amount||+payF.amount<=0){notify('Monto inválido','err');return}
    if(registerPayment._s) return; registerPayment._s=true
    const amount=+payF.amount
    const newBal=Math.max(0,payDebt.balance-amount)
    await db.updateDebt(payDebt.id,{...payDebt,balance:newBal})
    const payRow=await db.insertDebtPayment(user.id,payDebt.id,{...payF,amount})
    setDebts(p=>p.map(d=>d.id!==payDebt.id?d:{...d,balance:newBal,payments:[...(d.payments||[]),(payRow?{id:payRow.id,date:payF.date,amount,note:payF.note}:{})]}))
    registerPayment._s=false
    setPayF({amount:'',date:todayStr,note:''});setPayDebt(null);setModal(null);notify('Pago registrado ✓')
  }
  const deletePayment=async(debtId,payId,amount)=>{
    await db.deleteDebtPayment(payId)
    setDebts(p=>p.map(d=>d.id!==debtId?d:{...d,balance:d.balance+amount,payments:d.payments.filter(p=>p.id!==payId)}))
    notify('Pago eliminado')
  }
  const saveGoalItem=async()=>{
    if(!goalF.label||!goalF.target){notify('Completa nombre y monto','err');return}
    const g={label:goalF.label,target:+goalF.target,deadline:goalF.deadline||null,color:goalF.color||'#34D399',icon:goalF.icon||'🎯'}
    if(editGoalItem){
      await db.updateGoalItem(editGoalItem.id,g)
      setGoals(p=>p.map(x=>x.id===editGoalItem.id?{...x,...g}:x))
      notify('Meta actualizada ✓')
    } else {
      const row=await db.insertGoalItem(user.id,g)
      if(row) setGoals(p=>[...p,{id:row.id,...g,saved:0}])
      notify('Meta creada ✓')
    }
    setEditGoalItem(null);setGoalF(blankGoal);setModal(null)
  }
  const deleteGoalItem=async(id)=>{await db.deleteGoalItem(id);setGoals(p=>p.filter(x=>x.id!==id));notify('Meta eliminada')}
  const addToGoal=async(goalId,amount)=>{
    if(!amount||+amount<=0){notify('Monto inválido','err');return}
    const savCat=cats.find(c=>c.id===savCatId)||cats[0]
    const exp={category:savCat?.id,amount:+amount,description:`Ahorro: ${goals.find(g=>g.id===goalId)?.label||''}`,date:todayStr}
    const row=await db.insertExpense(user.id,exp)
    if(row) setExpenses(p=>({...p,[todayStr.slice(0,7)]:[...(p[todayStr.slice(0,7)]||[]),{id:row.id,...exp}]}))
    await db.addToGoalItem(goalId,+amount)
    setGoals(p=>p.map(g=>g.id===goalId?{...g,saved:(g.saved||0)+(+amount)}:g))
    notify('Abono registrado ✓')
  }
  const exportCSV=()=>{
    const rows=[['Fecha','Categoria','Descripcion','Monto','Tipo']]
    Object.entries(expenses).forEach(([,arr])=>arr.forEach(e=>rows.push([e.date,e.category,e.description||'',e.amount,'gasto'])))
    Object.entries(incomes).forEach(([,arr])=>arr.forEach(e=>rows.push([e.date,'ingreso_extra',e.label||'',e.amount,'ingreso'])))
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='finanzas.csv';a.click()
    notify('CSV descargado ✓')
  }

  // ── STYLES ──
  const W='#f8f9fe',WS='#ffffff',BR='#f0f0f0'
  const S={
    app:{minHeight:'100vh',background:darkMode?'#0a0a14':W,color:darkMode?'#f0f0ff':'#111',fontFamily:"system-ui,sans-serif",paddingBottom:80,transition:'background .3s'},
    wave:{position:'absolute',bottom:-1,left:0,right:0,height:28,background:darkMode?'#0a0a14':W,borderRadius:'22px 22px 0 0'},
    body:{padding:'14px 16px'},
    card:(bl)=>({background:darkMode?'#0f0f1e':WS,borderRadius:14,padding:'12px 14px',marginBottom:8,boxShadow:darkMode?'0 1px 0 rgba(255,255,255,.05)':'0 1px 6px rgba(0,0,0,.07)',borderLeft:bl?`3px solid ${bl}`:'none'}),
    sec:{fontSize:10,fontWeight:800,color:'#bbb',textTransform:'uppercase',letterSpacing:'1.2px',margin:'16px 0 8px'},
    pbar:{height:5,borderRadius:99,background:BR,overflow:'hidden'},
    pfill:(w,c)=>({height:'100%',borderRadius:99,width:`${Math.min(w,100)}%`,background:`linear-gradient(90deg,${c},${c}88)`,transition:'width .5s'}),
    row:{display:'flex',justifyContent:'space-between',alignItems:'center'},
    bnav:{position:'fixed',bottom:0,left:0,right:0,background:darkMode?'rgba(10,10,20,.97)':'rgba(255,255,255,.97)',backdropFilter:'blur(20px)',borderTop:`1px solid ${BR}`,display:'flex',padding:'8px 0 16px',zIndex:150},
    nbtn:(a,c)=>({flex:1,background:'none',border:'none',color:a?c:'#ccc',fontSize:10,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3}),
    fab:{position:'fixed',bottom:86,right:18,width:54,height:54,borderRadius:'50%',background:'linear-gradient(135deg,#4c1d95,#0284c7)',border:'none',color:'#fff',fontSize:26,cursor:'pointer',boxShadow:'0 6px 24px rgba(76,29,149,.4)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'},
    overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center'},
    sheet:{background:darkMode?'#0f0f1e':WS,borderRadius:'24px 24px 0 0',padding:'20px 18px 48px',width:'100%',maxWidth:520,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 -8px 40px rgba(0,0,0,.2)'},
    inp:{width:'100%',background:darkMode?'rgba(255,255,255,.06)':'#f8f9fe',border:`1px solid ${BR}`,borderRadius:12,color:darkMode?'#f0f0ff':'#111',padding:'12px 14px',fontSize:15,marginBottom:10,boxSizing:'border-box',outline:'none',fontFamily:'system-ui,sans-serif'},
    sel:{width:'100%',background:darkMode?'rgba(255,255,255,.06)':'#f8f9fe',border:`1px solid ${BR}`,borderRadius:12,color:darkMode?'#f0f0ff':'#111',padding:'12px 14px',fontSize:15,marginBottom:10,boxSizing:'border-box',cursor:'pointer',fontFamily:'system-ui,sans-serif'},
    btn1:(g)=>({width:'100%',background:`linear-gradient(135deg,${g})`,border:'none',borderRadius:14,color:'#fff',padding:'14px',fontSize:15,fontWeight:800,cursor:'pointer',marginTop:4,boxShadow:'0 4px 14px rgba(0,0,0,.15)'}),
    btn2:{width:'100%',background:'#f8f9fe',border:`1px solid ${BR}`,borderRadius:14,color:'#666',padding:'13px',fontSize:14,fontWeight:600,cursor:'pointer',marginTop:8},
    lbl:{fontSize:12,color:'#888',marginBottom:6,display:'block'},
    notif:(t)=>({position:'fixed',top:22,left:'50%',transform:'translateX(-50%)',background:t==='err'?'linear-gradient(135deg,#ef4444,#dc2626)':'linear-gradient(135deg,#10b981,#059669)',color:'#fff',padding:'11px 24px',borderRadius:30,fontSize:14,fontWeight:700,zIndex:500,whiteSpace:'nowrap',boxShadow:'0 6px 24px rgba(0,0,0,.2)',animation:'slideDown .3s cubic-bezier(.22,1,.36,1) both'}),
  }

  if(!dataReady) return <Splash/>

  // ── HEADER ──
  const Hdr=({grad,children,extraRight})=>(
    <div style={{background:grad,paddingBottom:32,position:'relative'}}>
      <div style={{padding:'52px 16px 0'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontSize:15,fontWeight:900,color:'rgba(255,255,255,.95)'}}>💸 Finanzas Pro</div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            {extraRight}
            <select style={{background:'rgba(255,255,255,.15)',border:'none',borderRadius:20,color:'#fff',padding:'5px 10px',fontSize:11,cursor:'pointer'}} value={selMon} onChange={e=>setSelMon(e.target.value)}>
              {last6.map(m=><option key={m.key} value={m.key} style={{background:'#4c1d95',color:'#fff'}}>{m.label}</option>)}
            </select>
            <button onClick={toggleDark} style={{background:'rgba(255,255,255,.15)',border:'none',borderRadius:20,color:'#fff',padding:'5px 9px',fontSize:14,cursor:'pointer'}}>{darkMode?'☀️':'🌙'}</button>
            <button onClick={()=>supabase.auth.signOut()} style={{background:'rgba(255,255,255,.15)',border:'none',borderRadius:8,color:'#fff',padding:'5px 10px',fontSize:11,cursor:'pointer'}}>↩</button>
          </div>
        </div>
        {children}
      </div>
      <div style={S.wave}/>
    </div>
  )

  const StatPill=({l,v,c})=>(
    <div style={{background:'rgba(255,255,255,.13)',borderRadius:12,padding:'8px 6px',textAlign:'center'}}>
      <div style={{fontSize:8,color:'rgba(255,255,255,.55)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:3}}>{l}</div>
      <div style={{fontSize:11,fontWeight:800,color:c||'#fff'}}>{v}</div>
    </div>
  )

  // ── HOME ──
  const Home=()=>{
    const totalBudget=Object.values(budgets).reduce((s,v)=>s+v,0)
    const globPct=totalBudget>0?(totalSpent/totalBudget)*100:totalInc>0?(totalSpent/totalInc)*100:0
    const over80=cats.filter(c=>{const b=catBudget(c.id);const sp=catSpent(c.id);return b>0&&sp/b>=.8})
    const recentAll=[...monExp.map(e=>({...e,isInc:false})),...monInc.map(e=>({...e,isInc:true}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4)
    return(
      <div>
        <Hdr grad="linear-gradient(160deg,#4c1d95,#0284c7)" extraRight={
          <button onClick={()=>{setTmpSal(String(salary||''));setModal('salary')}} style={{background:'rgba(255,255,255,.15)',border:'none',borderRadius:8,color:'#fff',padding:'5px 10px',fontSize:11,cursor:'pointer'}}>💼 Salario</button>
        }>
          <div style={{textAlign:'center',margin:'8px 0 14px'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.6)',marginBottom:3}}>Dinero libre</div>
            <div style={{fontSize:36,fontWeight:900,color:'#fff',lineHeight:1}}>{fmt(Math.max(0,available))}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:4}}>
            <StatPill l="Ingreso" v={fmt(totalInc)}/>
            <StatPill l="Gastado" v={fmt(totalSpent)} c="#fca5a5"/>
            <StatPill l="Ahorros" v={fmt(monSavings)} c="#6ee7b7"/>
          </div>
        </Hdr>
        <div style={S.body}>
          {/* Debt alert */}
          {(debtsOverdue.length>0||debtsDueSoon.length>0)&&selMon===mk(NOW)&&(
            <div className="sd" onClick={()=>setView('debts')} style={{background:debtsOverdue.length>0?'#fef2f2':'#fefce8',border:`1px solid ${debtsOverdue.length>0?'#fecaca':'#fde68a'}`,borderLeft:`3px solid ${debtsOverdue.length>0?'#ef4444':'#f59e0b'}`,borderRadius:14,padding:'10px 12px',marginBottom:10,display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
              <span style={{fontSize:16}}>{debtsOverdue.length>0?'🔴':'🟡'}</span>
              <div style={{flex:1,minWidth:0}}>
                {debtsOverdue.length>0&&<div style={{fontSize:11,color:'#dc2626',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Vencidas: {debtsOverdue.map(d=>d.name).join(', ')}</div>}
                {debtsDueSoon.length>0&&<div style={{fontSize:11,color:'#d97706',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Próximas: {debtsDueSoon.map(d=>`${d.name} día ${d.dueDay}`).join(' · ')}</div>}
              </div>
              <span style={{color:'#bbb'}}>→</span>
            </div>
          )}

          {/* Budget bar */}
          <div style={S.card()}>
            <div style={{...S.row,marginBottom:8}}>
              <span style={{fontSize:12,color:'#888'}}>Presupuesto del mes</span>
              <span style={{fontSize:12,fontWeight:700}}>{fmt(totalSpent)} <span style={{color:'#bbb'}}>/ {fmt(totalBudget||totalInc)}</span></span>
            </div>
            <div style={S.pbar}><div style={S.pfill(globPct,'#6366f1')}/></div>
            <div style={{...S.row,marginTop:5,fontSize:11}}>
              <span style={{color:'#888'}}>Ahorro: <b style={{color:'#10b981'}}>{totalInc>0?((monSavings/totalInc)*100).toFixed(0):0}%</b></span>
              <span style={{color:available>=0?'#10b981':'#ef4444',fontWeight:700}}>{available>=0?`Libre ${fmt(available)}`:`Déficit ${fmt(Math.abs(available))}`}</span>
            </div>
          </div>

          {/* Smart suggestions */}
          <div onClick={()=>setModal('smart')} style={{background:'#ede9fe',borderRadius:14,padding:'10px 14px',marginBottom:10,display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
            <span>🤖</span>
            <span style={{fontSize:12,color:'#4c1d95',fontWeight:600,flex:1}}>Ver sugerencias inteligentes de presupuesto</span>
            <span style={{color:'#7c3aed'}}>→</span>
          </div>

          {/* Over budget alert */}
          {over80.length>0&&(
            <div style={{background:'#fefce8',border:'1px solid #fde68a',borderLeft:'3px solid #f59e0b',borderRadius:14,padding:'10px 12px',marginBottom:10,fontSize:11,color:'#92400e',display:'flex',alignItems:'center',gap:8}}>
              <span>⚠️</span>
              <span><b>Cerca del tope:</b> {over80.map(c=>`${c.icon} ${c.label}`).join(', ')}</span>
            </div>
          )}

          {/* Category chips */}
          <div style={{...S.row,marginBottom:10}}>
            <div style={S.sec}>Categorías</div>
            <button onClick={()=>{setEditCat(null);setCatF(blankCat);setModal('cat')}} style={{background:'#ede9fe',border:'none',borderRadius:8,color:'#7c3aed',padding:'4px 12px',fontSize:12,cursor:'pointer',fontWeight:700}}>+ Nueva</button>
          </div>
          <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:8,marginBottom:10,scrollbarWidth:'none'}}>
            {cats.map(cat=>{
              const sp=catSpent(cat.id),bud=catBudget(cat.id),pct=bud>0?(sp/bud)*100:0,over=bud>0&&sp>bud
              return(
                <div key={cat.id} onClick={()=>setSelCat(cat)} style={{flexShrink:0,background:WS,borderRadius:16,padding:'10px 8px',boxShadow:'0 2px 8px rgba(0,0,0,.07)',minWidth:74,textAlign:'center',cursor:'pointer',border:over?'1px solid #fecaca':'1px solid transparent',transition:'transform .15s'}} className="su">
                  <div style={{fontSize:20,marginBottom:4}}>{cat.icon}</div>
                  <div style={{fontSize:9,color:'#999',marginBottom:2,fontWeight:600,maxWidth:64,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cat.label}</div>
                  <div style={{fontSize:11,fontWeight:900,color:over?'#dc2626':cat.color}}>{fmt(sp)}</div>
                  {bud>0&&<><div style={{height:3,background:'#f0f0f0',borderRadius:99,marginTop:5,overflow:'hidden'}}><div style={{height:'100%',borderRadius:99,width:`${Math.min(pct,100)}%`,background:over?'#ef4444':cat.color}}/></div><div style={{fontSize:8,color:over?'#ef4444':'#bbb',marginTop:3,fontWeight:over?700:400}}>{over?'EXCEDIDO':`${pct.toFixed(0)}%`}</div></>}
                </div>
              )
            })}
          </div>

          {/* Recurring quick apply */}
          {recur.length>0&&(
            <>
              <div style={S.sec}>Gastos fijos — toca para aplicar</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                {recur.map(r=>{
                  const cat=cats.find(c=>c.id===r.category),applied=monExp.some(e=>e.description===r.label&&e.category===r.category)
                  return(<button key={r.id} onClick={()=>!applied&&applyRecur(r)} style={{background:applied?'#f8f9fe':'#ede9fe',border:`1px solid ${applied?BR:'#c4b5fd'}`,borderRadius:10,padding:'6px 10px',color:applied?'#ccc':'#4c1d95',fontSize:11,cursor:applied?'default':'pointer',display:'flex',alignItems:'center',gap:5,fontWeight:600}}>
                    {cat?.icon} {r.label} <b style={{color:applied?'#ccc':'#7c3aed'}}>{fmt(r.amount)}</b>
                    {applied&&<span style={{color:'#10b981',fontSize:10}}>✓</span>}
                  </button>)
                })}
              </div>
            </>
          )}

          {/* Recent transactions */}
          {recentAll.length>0&&(
            <>
              <div style={{...S.row,marginBottom:8}}>
                <div style={S.sec}>Últimos movimientos</div>
                <button onClick={()=>setView('moves')} style={{background:'none',border:'none',color:'#7c3aed',fontSize:11,fontWeight:700,cursor:'pointer'}}>Ver todos →</button>
              </div>
              {recentAll.map(item=>{
                const cat=cats.find(c=>c.id===item.category),isInc=item.isInc
                return(
                  <div key={item.id} className="su" style={{...S.card(),display:'flex',alignItems:'center',gap:10,padding:'10px 12px'}}>
                    <div style={{width:38,height:38,borderRadius:12,background:isInc?'#dcfce7':cat?`${cat.color}15`:'#f8f9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,border:`1px solid ${isInc?'#bbf7d0':cat?cat.color+'30':'#f0f0f0'}`,flexShrink:0}}>
                      {isInc?'💰':cat?.icon||'📦'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700}}>{item.description||item.label||cat?.label}</div>
                      <div style={{fontSize:11,color:'#bbb'}}>{isInc?'Ingreso extra':cat?.label} · {item.date}</div>
                    </div>
                    <div style={{fontSize:14,fontWeight:900,color:isInc?'#10b981':'#ef4444'}}>{isInc?'+':'-'}{fmt(item.amount)}</div>
                  </div>
                )
              })}
            </>
          )}

          {/* Note */}
          <div style={S.sec}>Nota del mes</div>
          <textarea value={notes[selMon]||''} onChange={e=>{const v=e.target.value;setNotes(p=>({...p,[selMon]:v}));db.upsertNote(user.id,selMon,v)}} placeholder="Vacaciones, boda, mes especial..." style={{...S.inp,minHeight:60,resize:'vertical',marginBottom:0}}/>
        </div>
      </div>
    )
  }

  // ── CATEGORY DETAIL ──
  const CatDetail=()=>{
    if(!selCat) return null
    const cat=cats.find(c=>c.id===selCat.id)||selCat
    const catExps=[...monExp.filter(e=>e.category===cat.id)].sort((a,b)=>b.date.localeCompare(a.date))
    const catTotal=catExps.reduce((s,e)=>s+e.amount,0)
    const bud=catBudget(cat.id),pct=bud>0?Math.min(100,(catTotal/bud)*100):0,over=bud>0&&catTotal>bud
    return(
      <div style={{minHeight:'100vh',background:W,paddingBottom:80}}>
        <div style={{background:`linear-gradient(160deg,${cat.color},${cat.color}99)`,paddingBottom:32,position:'relative'}}>
          <div style={{padding:'52px 16px 0'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <button onClick={()=>setSelCat(null)} style={{width:34,height:34,borderRadius:99,background:'rgba(255,255,255,.2)',border:'none',color:'#fff',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
              <div style={{fontSize:16,fontWeight:900,color:'#fff',flex:1}}>{cat.icon} {cat.label}</div>
              <button onClick={()=>{setEditCat(cat);setCatF({label:cat.label,icon:cat.icon,color:cat.color});setModal('cat')}} style={{background:'rgba(255,255,255,.2)',border:'none',borderRadius:8,color:'#fff',padding:'5px 10px',fontSize:12,cursor:'pointer'}}>✏️ Editar</button>
            </div>
            <div style={{textAlign:'center',marginBottom:10}}>
              <div style={{fontSize:34,fontWeight:900,color:'#fff'}}>{fmt(catTotal)}</div>
              {bud>0&&<div style={{fontSize:12,color:'rgba(255,255,255,.7)',marginTop:2}}>de {fmt(bud)} presupuesto</div>}
            </div>
            {bud>0&&<>
              <div style={{height:8,background:'rgba(255,255,255,.2)',borderRadius:99,overflow:'hidden',margin:'8px 0 4px'}}>
                <div style={{height:'100%',borderRadius:99,width:`${pct}%`,background:'rgba(255,255,255,.85)',transition:'width .6s'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'rgba(255,255,255,.7)'}}>
                <span>{pct.toFixed(0)}% usado</span>
                <span style={{fontWeight:700,color:over?'#fca5a5':'rgba(255,255,255,.9)'}}>{over?`+${fmt(catTotal-bud)} sobre`:`${fmt(bud-catTotal)} libre`}</span>
              </div>
            </>}
          </div>
          <div style={{...S.wave,background:W}}/>
        </div>
        <div style={S.body}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
            {[{l:'Gastado',v:fmt(catTotal),c:over?'#dc2626':cat.color},{l:'Tope',v:bud>0?fmt(bud):'Sin tope',c:'#6366f1'},{l:over?'Exceso':'Libre',v:bud>0?fmt(Math.abs(bud-catTotal)):'—',c:over?'#dc2626':'#10b981'}].map(x=>(
              <div key={x.l} style={{background:WS,borderRadius:12,padding:'10px 8px',textAlign:'center',boxShadow:'0 1px 5px rgba(0,0,0,.06)'}}>
                <div style={{fontSize:9,color:'#bbb',marginBottom:4,textTransform:'uppercase'}}>{x.l}</div>
                <div style={{fontSize:13,fontWeight:900,color:x.c}}>{x.v}</div>
              </div>
            ))}
          </div>
          {editBudCat===cat.id?(
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <input style={{...S.inp,flex:1,marginBottom:0}} type="number" placeholder="Tope $" value={tmpBud} onChange={e=>setTmpBud(e.target.value)} autoFocus/>
              <button onClick={()=>saveBudget(cat.id)} style={{background:'#6366f1',border:'none',borderRadius:12,color:'#fff',padding:'0 16px',fontWeight:700,cursor:'pointer',fontSize:16}}>✓</button>
              <button onClick={()=>setEditBudCat(null)} style={{background:'#f8f9fe',border:`1px solid ${BR}`,borderRadius:12,color:'#888',padding:'0 12px',cursor:'pointer'}}>✕</button>
            </div>
          ):(
            <button onClick={()=>{setEditBudCat(cat.id);setTmpBud(String(bud||''))}} style={{width:'100%',background:'#ede9fe',border:'none',borderRadius:12,color:'#7c3aed',padding:'9px',fontSize:12,fontWeight:700,cursor:'pointer',marginBottom:10}}>
              {bud>0?`✏️ Cambiar tope (${fmt(bud)})`:'+ Establecer tope de presupuesto'}
            </button>
          )}
          <div style={S.sec}>Movimientos ({catExps.length})</div>
          {catExps.length===0?<div style={{textAlign:'center',color:'#bbb',padding:'30px 0',fontSize:13}}>Sin gastos este mes</div>:
            catExps.map(exp=>(
              <div key={exp.id} className="su" style={{...S.card(),display:'flex',alignItems:'center',gap:10,padding:'10px 12px'}}>
                <div style={{width:36,height:36,borderRadius:11,background:`${cat.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{cat.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700}}>{exp.description||cat.label}</div>
                  <div style={{fontSize:11,color:'#bbb'}}>{exp.date}</div>
                </div>
                <span style={{fontSize:14,fontWeight:900,color:cat.color}}>{fmt(exp.amount)}</span>
                <button onClick={()=>startEditExp(exp,selMon)} style={{background:'#f5f3ff',border:'none',borderRadius:7,padding:'4px 7px',fontSize:12,color:'#7c3aed',cursor:'pointer'}}>✏️</button>
                <button onClick={()=>deleteExp(exp.id,selMon)} style={{background:'#fef2f2',border:'none',borderRadius:7,padding:'4px 7px',fontSize:12,color:'#dc2626',cursor:'pointer'}}>✕</button>
              </div>
            ))
          }
          <button onClick={()=>{setSelCat(null);setExpF({...blankExp,category:cat.id});setModal('expense')}} style={{...S.btn1(`${cat.color},${cat.color}bb`),marginTop:8}}>+ Agregar gasto en {cat.label}</button>
          {!cat.is_default&&<button onClick={()=>{deleteCat(cat.id);setSelCat(null)}} style={{...S.btn2,color:'#dc2626',borderColor:'#fecaca',marginTop:8}}>🗑️ Eliminar categoría</button>}
        </div>
      </div>
    )
  }

  // ── TRANSACTIONS ──
  const Transactions=()=>{
    const all=[...monExp.map(e=>({...e,type:'gasto'})),...monInc.map(e=>({...e,type:'ingreso'}))].sort((a,b)=>b.date.localeCompare(a.date))
    const grouped={}
    all.forEach(item=>{if(!grouped[item.date]) grouped[item.date]=[];grouped[item.date].push(item)})
    const dateKeys=Object.keys(grouped).sort((a,b)=>b.localeCompare(a))
    const yd=`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,'0')}-${String(NOW.getDate()-1).padStart(2,'0')}`
    return(
      <div>
        <Hdr grad="linear-gradient(160deg,#1e3a5f,#6366f1)" extraRight={
          <button onClick={()=>setModal('income')} style={{background:'rgba(255,255,255,.15)',border:'none',borderRadius:8,color:'#fff',padding:'5px 10px',fontSize:11,cursor:'pointer'}}>+ Ingreso</button>
        }>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,margin:'10px 0 14px'}}>
            <StatPill l="Este mes" v={fmt(totalSpent)}/>
            <StatPill l="Movimientos" v={all.length}/>
            <StatPill l="Categorías" v={cats.length}/>
          </div>
        </Hdr>
        <div style={S.body}>
          <div style={{background:WS,borderRadius:14,padding:'10px 14px',display:'flex',alignItems:'center',gap:8,marginBottom:12,boxShadow:'0 1px 6px rgba(0,0,0,.07)'}}>
            <span style={{color:'#bbb',fontSize:16}}>🔍</span>
            <input style={{background:'none',border:'none',color:'#111',fontSize:14,outline:'none',flex:1}} placeholder="Buscar en todos los meses..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'#bbb',cursor:'pointer',fontSize:16}}>✕</button>}
          </div>
          {search?(
            <>
              <div style={S.sec}>Resultados ({searchResults.length})</div>
              {searchResults.length===0?<div style={{textAlign:'center',color:'#bbb',padding:'30px 0'}}>Sin resultados</div>:
                searchResults.map(item=>{
                  const cat=cats.find(c=>c.id===item.category)
                  return(
                    <div key={item.id} className="su" style={{...S.card(),display:'flex',alignItems:'center',gap:10,padding:'10px 12px'}}>
                      <div style={{width:38,height:38,borderRadius:12,background:`${cat?.color||'#6366f1'}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{cat?.icon||'📦'}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700}}>{item.description||cat?.label}</div>
                        <div style={{fontSize:11,color:'#bbb'}}>{item.date} · {MNF[new Date(item.monthKey+'-01').getMonth()]}</div>
                      </div>
                      <span style={{fontSize:13,fontWeight:900,color:cat?.color||'#6366f1'}}>{fmt(item.amount)}</span>
                      <button onClick={()=>startEditExp(item,item.monthKey)} style={{background:'#f5f3ff',border:'none',borderRadius:7,padding:'3px 6px',fontSize:12,color:'#7c3aed',cursor:'pointer'}}>✏️</button>
                      <button onClick={()=>deleteExp(item.id,item.monthKey)} style={{background:'#fef2f2',border:'none',borderRadius:7,padding:'3px 6px',fontSize:12,color:'#dc2626',cursor:'pointer'}}>✕</button>
                    </div>
                  )
                })
              }
            </>
          ):(
            <>
              {all.length===0?<div style={{textAlign:'center',color:'#bbb',padding:'50px 0',fontSize:14}}>Sin movimientos · Toca + para agregar</div>:
                dateKeys.map(date=>(
                  <div key={date}>
                    <div style={{fontSize:11,fontWeight:700,color:'#6366f1',margin:'12px 0 6px',paddingLeft:2}}>
                      {date===todayStr?'Hoy':date===yd?'Ayer':date}
                    </div>
                    {grouped[date].map(item=>{
                      const cat=cats.find(c=>c.id===item.category),isInc=item.type==='ingreso'
                      return(
                        <div key={item.id} className="su" style={{...S.card(),display:'flex',alignItems:'center',gap:10,padding:'10px 12px'}}>
                          <div style={{width:38,height:38,borderRadius:12,background:isInc?'#dcfce7':cat?`${cat.color}15`:'#f8f9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,border:`1px solid ${isInc?'#bbf7d0':cat?cat.color+'30':'#f0f0f0'}`,flexShrink:0}}>
                            {isInc?'💰':cat?.icon||'📦'}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:700}}>{item.description||item.label||cat?.label}</div>
                            <div style={{fontSize:11,color:'#bbb'}}>{isInc?'Ingreso extra':cat?.label}</div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <span style={{fontSize:14,fontWeight:900,color:isInc?'#10b981':'#ef4444'}}>{isInc?'+':'-'}{fmt(item.amount)}</span>
                            {!isInc&&<button onClick={()=>startEditExp(item,selMon)} style={{background:'#f5f3ff',border:'none',borderRadius:7,padding:'4px 7px',fontSize:12,color:'#7c3aed',cursor:'pointer'}}>✏️</button>}
                            <button onClick={()=>isInc?deleteInc(item.id,selMon):deleteExp(item.id,selMon)} style={{background:'#fef2f2',border:'none',borderRadius:7,padding:'4px 7px',fontSize:12,color:'#dc2626',cursor:'pointer'}}>✕</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              }
              <div style={S.sec}>Gastos fijos</div>
              <button onClick={()=>setModal('recur')} style={{...S.card(),width:'100%',cursor:'pointer',textAlign:'center',color:'#7c3aed',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8,border:'1px dashed #c4b5fd',boxShadow:'none'}}>
                + Agregar gasto recurrente
              </button>
              {recur.map(r=>{
                const cat=cats.find(c=>c.id===r.category),applied=monExp.some(e=>e.description===r.label&&e.category===r.category)
                return(
                  <div key={r.id} className="su" style={{...S.card('#6366f1'),display:'flex',alignItems:'center',gap:10,padding:'10px 12px',opacity:applied?.65:1}}>
                    <span style={{fontSize:18}}>{cat?.icon||'📦'}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700}}>{r.label} {applied&&<span style={{color:'#10b981',fontSize:11}}>✓</span>}</div>
                      <div style={{fontSize:11,color:'#bbb'}}>Día {r.day} · {cat?.label}</div>
                    </div>
                    <span style={{fontSize:13,fontWeight:800,color:'#6366f1'}}>{fmt(r.amount)}</span>
                    <button onClick={()=>deleteRec(r.id)} style={{background:'#fef2f2',border:'none',borderRadius:7,padding:'4px 7px',fontSize:12,color:'#dc2626',cursor:'pointer'}}>✕</button>
                  </div>
                )
              })}
              <button onClick={exportCSV} style={{width:'100%',marginTop:10,background:WS,border:`1px solid ${BR}`,borderRadius:14,color:'#888',padding:'11px',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontWeight:600}}>📥 Exportar a CSV</button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── DEBTS ──
  const Debts=()=>{
    const active=debts.filter(d=>d.balance>0),paid=debts.filter(d=>d.balance<=0)
    return(
      <div>
        <Hdr grad="linear-gradient(160deg,#7f1d1d,#dc2626)">
          <div style={{textAlign:'center',margin:'8px 0 14px'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.6)',marginBottom:3}}>Deuda total</div>
            <div style={{fontSize:36,fontWeight:900,color:'#fff',lineHeight:1}}>{fmt(totalDebtBalance)}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:4}}>
            <StatPill l="Pago mínimo/mes" v={fmt(totalMinPayments)}/>
            <StatPill l="Deudas activas" v={active.length}/>
          </div>
        </Hdr>
        <div style={S.body}>
          <button onClick={()=>{setEditDebt(null);setDebtF(blankDebt);setModal('debt')}} style={{...S.btn1('#dc2626,#ef4444'),marginBottom:14}}>+ Agregar deuda</button>
          {debts.length===0?<div style={{textAlign:'center',color:'#bbb',padding:'50px 0'}}><div style={{fontSize:36,marginBottom:10}}>🎉</div>Sin deudas registradas</div>:(
            <>
              {active.length>0&&<div style={S.sec}>Activas ({active.length})</div>}
              {active.map(d=>{
                const dt=DEBT_TYPES.find(t=>t.id===d.type)
                const paidPct=d.originalAmount>0?Math.min(100,((d.originalAmount-d.balance)/d.originalAmount)*100):0
                const months=calcPayoffMonths(d.balance,d.minPayment,d.interestRate)
                const pDate=months&&months!==Infinity?new Date(NOW.getFullYear(),NOW.getMonth()+months,1):null
                const isDueSoon=debtsDueSoon.find(x=>x.id===d.id)
                const isOverdue=debtsOverdue.find(x=>x.id===d.id)
                return(
                  <div key={d.id} className="su" style={{...S.card(d.color||'#ef4444'),cursor:'pointer',marginBottom:8}} onClick={()=>setDetailDebt(d)}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                      <div style={{width:40,height:40,borderRadius:12,background:`${d.color||'#ef4444'}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{dt?.icon||'📄'}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:800}}>{d.name}</div>
                        <div style={{fontSize:11,color:'#bbb'}}>{dt?.label}{d.dueDay?` · Vence${d.dueMonth?' '+MN[d.dueMonth-1]:''} día ${d.dueDay}`:''}</div>
                        {isOverdue&&<div style={{fontSize:10,color:'#dc2626',fontWeight:700}}>🔴 Vencida este mes</div>}
                        {isDueSoon&&!isOverdue&&<div style={{fontSize:10,color:'#d97706',fontWeight:700}}>⏰ Vence en {d.dueDay-NOW.getDate()} días</div>}
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:16,fontWeight:900,color:d.color||'#ef4444'}}>{fmt(d.balance)}</div>
                        {d.interestRate>0&&<div style={{fontSize:10,color:'#bbb'}}>{d.interestRate}% anual</div>}
                      </div>
                    </div>
                    <div style={S.pbar}><div style={{height:'100%',borderRadius:99,width:`${paidPct}%`,background:'linear-gradient(90deg,#22c55e,#16a34a)',transition:'width .5s'}}/></div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:10,color:'#bbb',marginBottom:8}}>
                      <span>{paidPct.toFixed(0)}% pagado</span>
                      {pDate&&months!==Infinity&&<span style={{color:'#f59e0b',fontWeight:600}}>Libre {pDate.toLocaleDateString('es-MX',{month:'short',year:'numeric'})}</span>}
                      {months===Infinity&&<span style={{color:'#ef4444',fontWeight:600}}>⚠️ Pago insuficiente</span>}
                    </div>
                    <div style={{display:'flex',gap:6}} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>{setPayDebt(d);setPayF({amount:String(d.minPayment||''),date:todayStr,note:''});setModal('payment')}} style={{flex:1,background:'#dcfce7',border:'none',borderRadius:10,padding:'7px',fontSize:11,color:'#16a34a',cursor:'pointer',fontWeight:700}}>💳 Registrar pago</button>
                      <button onClick={()=>startEditDebt(d)} style={{background:'#f5f3ff',border:'none',borderRadius:10,padding:'7px 10px',fontSize:13,color:'#7c3aed',cursor:'pointer'}}>✏️</button>
                      <button onClick={()=>deleteDebt(d.id)} style={{background:'#fef2f2',border:'none',borderRadius:10,padding:'7px 10px',fontSize:13,color:'#dc2626',cursor:'pointer'}}>✕</button>
                    </div>
                  </div>
                )
              })}
              {paid.length>0&&<><div style={S.sec}>Pagadas 🎉</div>{paid.map(d=>{const dt=DEBT_TYPES.find(t=>t.id===d.type);return(<div key={d.id} style={{...S.card(),display:'flex',alignItems:'center',gap:10,opacity:.5}}><span style={{fontSize:18}}>{dt?.icon}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,textDecoration:'line-through'}}>{d.name}</div><div style={{fontSize:11,color:'#10b981'}}>✓ Pagada</div></div><button onClick={()=>deleteDebt(d.id)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',opacity:.5}}>✕</button></div>)})}</>}
            </>
          )}
        </div>
      </div>
    )
  }

  // ── DEBT DETAIL ──
  const DebtDetail=()=>{
    if(!detailDebt) return null
    const d=debts.find(x=>x.id===detailDebt.id)||detailDebt
    const dt=DEBT_TYPES.find(t=>t.id===d.type)
    const months=calcPayoffMonths(d.balance,d.minPayment,d.interestRate)
    const paidPct=d.originalAmount>0?Math.min(100,((d.originalAmount-d.balance)/d.originalAmount)*100):0
    const totalInt=months&&months!==Infinity?(months*d.minPayment)-d.balance:null
    return(
      <div style={{minHeight:'100vh',background:W,paddingBottom:80}}>
        <div style={{background:`linear-gradient(160deg,${d.color||'#dc2626'},${d.color||'#dc2626'}aa)`,paddingBottom:32,position:'relative'}}>
          <div style={{padding:'52px 16px 0'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <button onClick={()=>setDetailDebt(null)} style={{width:34,height:34,borderRadius:99,background:'rgba(255,255,255,.2)',border:'none',color:'#fff',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
              <div style={{flex:1}}><div style={{fontSize:16,fontWeight:900,color:'#fff'}}>{dt?.icon} {d.name}</div><div style={{fontSize:11,color:'rgba(255,255,255,.7)'}}>{dt?.label}</div></div>
              <button onClick={()=>startEditDebt(d)} style={{background:'rgba(255,255,255,.2)',border:'none',borderRadius:8,color:'#fff',padding:'5px 10px',fontSize:12,cursor:'pointer'}}>✏️</button>
            </div>
            <div style={{textAlign:'center',marginBottom:10}}>
              <div style={{fontSize:34,fontWeight:900,color:'#fff'}}>{fmt(d.balance)}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.7)',marginTop:2}}>de {fmt(d.originalAmount||d.balance)} original</div>
            </div>
            <div style={{height:8,background:'rgba(255,255,255,.2)',borderRadius:99,overflow:'hidden',margin:'8px 0 4px'}}>
              <div style={{height:'100%',borderRadius:99,width:`${paidPct}%`,background:'rgba(255,255,255,.85)',transition:'width .6s'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'rgba(255,255,255,.7)'}}>
              <span>{paidPct.toFixed(0)}% pagado</span>
              {months&&months!==Infinity&&<span style={{fontWeight:700}}>Libre en {months} meses</span>}
            </div>
          </div>
          <div style={{...S.wave,background:W}}/>
        </div>
        <div style={S.body}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
            {[{l:'Saldo',v:fmt(d.balance),c:'#dc2626'},{l:'Pagado',v:fmt((d.originalAmount||d.balance)-d.balance),c:'#10b981'},{l:'Interés',v:`${d.interestRate}%`,c:'#f59e0b'}].map(x=>(
              <div key={x.l} style={{background:WS,borderRadius:12,padding:'10px 8px',textAlign:'center',boxShadow:'0 1px 5px rgba(0,0,0,.06)'}}>
                <div style={{fontSize:9,color:'#bbb',marginBottom:4,textTransform:'uppercase'}}>{x.l}</div>
                <div style={{fontSize:13,fontWeight:900,color:x.c}}>{x.v}</div>
              </div>
            ))}
          </div>
          {totalInt!==null&&<div style={{background:'#fefce8',border:'1px solid #fde68a',borderRadius:12,padding:'10px 12px',marginBottom:10,fontSize:12,color:'#92400e'}}>💡 Pagarás aprox. <b>{fmt(totalInt)}</b> en intereses con el pago mínimo</div>}
          <button onClick={()=>{setDetailDebt(null);setPayDebt(d);setPayF({amount:String(d.minPayment||''),date:todayStr,note:''});setModal('payment')}} style={S.btn1('#16a34a,#22c55e')}>💳 Registrar pago</button>
          <div style={S.sec}>Historial de pagos</div>
          {(!d.payments||d.payments.length===0)?<div style={{textAlign:'center',color:'#bbb',padding:'16px 0'}}>Sin pagos registrados</div>:
            [...(d.payments||[])].reverse().map(p=>(
              <div key={p.id} style={{...S.card(),display:'flex',alignItems:'center',gap:10,padding:'10px 12px'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#10b981'}}>{fmt(p.amount)}</div>
                  <div style={{fontSize:11,color:'#bbb'}}>{p.date}{p.note?` · ${p.note}`:''}</div>
                </div>
                <button onClick={()=>deletePayment(d.id,p.id,p.amount)} style={{background:'#fef2f2',border:'none',borderRadius:7,padding:'4px 8px',fontSize:12,color:'#dc2626',cursor:'pointer'}}>✕</button>
              </div>
            ))
          }
        </div>
      </div>
    )
  }

  // ── SAVINGS ──
  const Savings=()=>{
    const weekStart=new Date(NOW);weekStart.setDate(NOW.getDate()-NOW.getDay())
    const weekStr=`${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,'0')}-${String(weekStart.getDate()).padStart(2,'0')}`
    const weekExp=monExp.filter(e=>e.date>=weekStr).reduce((s,e)=>s+e.amount,0)
    const avgWeekly=totalSpent>0?(totalSpent/(Math.max(NOW.getDate(),1)/7)):0
    const weekDiff=weekExp-avgWeekly
    const avgMon=Math.round(last6.map(m=>m.savings).reduce((s,v)=>s+v,0)/6)
    return(
      <div>
        <Hdr grad="linear-gradient(160deg,#064e3b,#0284c7)">
          <div style={{textAlign:'center',margin:'8px 0 14px'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.6)',marginBottom:3}}>Total ahorrado</div>
            <div style={{fontSize:36,fontWeight:900,color:'#fff',lineHeight:1}}>{fmt(totalSaved)}</div>
            {goal.target>0&&<div style={{fontSize:12,color:'rgba(255,255,255,.6)',marginTop:2}}>{goalPct.toFixed(0)}% de tu meta</div>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:4}}>
            <StatPill l="Este mes" v={fmt(monSavings)}/>
            <StatPill l="Promedio mensual" v={fmt(avgMon)}/>
          </div>
        </Hdr>
        <div style={S.body}>
          {/* Weekly */}
          <div style={S.card()}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>📅 Resumen semanal</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
              <div style={{background:'#f5f3ff',borderRadius:10,padding:'8px',textAlign:'center'}}>
                <div style={{fontSize:9,color:'#888',marginBottom:2}}>Esta semana</div>
                <div style={{fontSize:15,fontWeight:900,color:'#7c3aed'}}>{fmt(weekExp)}</div>
              </div>
              <div style={{background:'#f8f9fe',borderRadius:10,padding:'8px',textAlign:'center'}}>
                <div style={{fontSize:9,color:'#888',marginBottom:2}}>Promedio semanal</div>
                <div style={{fontSize:15,fontWeight:900,color:'#888'}}>{fmt(Math.round(avgWeekly))}</div>
              </div>
            </div>
            <div style={{fontSize:11,textAlign:'center',fontWeight:700,color:weekDiff>0?'#dc2626':'#10b981'}}>
              {weekDiff>0?`↑ ${fmt(Math.abs(Math.round(weekDiff)))} más que el promedio`:`↓ ${fmt(Math.abs(Math.round(weekDiff)))} menos que el promedio 🎉`}
            </div>
          </div>

          {/* Goals */}
          <div style={{...S.row,marginBottom:8}}>
            <div style={S.sec}>Metas de ahorro</div>
            <button onClick={()=>{setEditGoalItem(null);setGoalF(blankGoal);setModal('goalitem')}} style={{background:'#dcfce7',border:'none',borderRadius:8,color:'#16a34a',padding:'4px 12px',fontSize:12,cursor:'pointer',fontWeight:700}}>+ Nueva</button>
          </div>
          {goals.length===0?<div style={{...S.card(),textAlign:'center',padding:'24px',color:'#bbb',fontSize:13}}>Sin metas · Toca "+ Nueva"</div>:
            goals.map(g=>{
              const pct=g.target>0?Math.min(100,((g.saved||0)/g.target)*100):0
              const dl=g.deadline?Math.ceil((new Date(g.deadline)-NOW)/86400000):null
              return(
                <div key={g.id} className="su" style={{...S.card(g.color||'#10b981'),marginBottom:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:38,height:38,borderRadius:12,background:`${g.color||'#10b981'}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{g.icon||'🎯'}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:800}}>{g.label}</div>
                      <div style={{fontSize:11,color:'#bbb'}}>{dl!==null?dl>0?`${dl} días restantes`:'¡Cumplida! 🎉':'Sin fecha límite'}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:15,fontWeight:900,color:g.color||'#10b981'}}>{fmt(g.saved||0)}</div>
                      <div style={{fontSize:10,color:'#bbb'}}>de {fmt(g.target)}</div>
                    </div>
                  </div>
                  <div style={S.pbar}><div style={S.pfill(pct,g.color||'#10b981')}/></div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#bbb',marginTop:4,marginBottom:8}}>
                    <span>{pct.toFixed(0)}% alcanzado</span>
                    <span style={{color:g.color||'#10b981',fontWeight:700}}>{g.target-(g.saved||0)>0?`Faltan ${fmt(g.target-(g.saved||0))}`:'¡Meta cumplida! 🎉'}</span>
                  </div>
                  {addGoalId===g.id?(
                    <div style={{display:'flex',gap:6}}>
                      <input style={{...S.inp,flex:1,marginBottom:0}} type="number" placeholder="Monto a abonar" value={addAmt} onChange={e=>setAddAmt(e.target.value)} autoFocus/>
                      <button onClick={()=>{addToGoal(g.id,addAmt);setAddGoalId(null);setAddAmt('')}} style={{background:'#10b981',border:'none',borderRadius:10,color:'#fff',padding:'0 14px',fontWeight:700,cursor:'pointer'}}>✓</button>
                      <button onClick={()=>{setAddGoalId(null);setAddAmt('')}} style={{background:'#f8f9fe',border:`1px solid ${BR}`,borderRadius:10,color:'#888',padding:'0 10px',cursor:'pointer'}}>✕</button>
                    </div>
                  ):(
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>setAddGoalId(g.id)} style={{flex:1,background:'#dcfce7',border:'none',borderRadius:10,padding:'7px',fontSize:11,color:'#16a34a',cursor:'pointer',fontWeight:700}}>💰 Abonar</button>
                      <button onClick={()=>{setEditGoalItem(g);setGoalF({label:g.label,target:String(g.target),deadline:g.deadline||'',color:g.color||'#34D399',icon:g.icon||'🎯'});setModal('goalitem')}} style={{background:'#f5f3ff',border:'none',borderRadius:10,padding:'7px 10px',fontSize:13,color:'#7c3aed',cursor:'pointer'}}>✏️</button>
                      <button onClick={()=>deleteGoalItem(g.id)} style={{background:'#fef2f2',border:'none',borderRadius:10,padding:'7px 10px',fontSize:13,color:'#dc2626',cursor:'pointer'}}>✕</button>
                    </div>
                  )}
                </div>
              )
            })
          }

          {/* Sparkline */}
          <div style={S.sec}>Últimos 6 meses</div>
          <div style={S.card()}>
            <div style={{display:'flex',alignItems:'flex-end',gap:4,height:60,marginBottom:6}}>
              {last6.map((m,i)=>{
                const max=Math.max(...last6.map(x=>x.savings),1)
                return(
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <div style={{width:'100%',height:50,display:'flex',alignItems:'flex-end'}}>
                      <div style={{width:'100%',borderRadius:'4px 4px 0 0',height:`${Math.max((m.savings/max)*100,2)}%`,background:m.key===selMon?'#10b981':'#bbf7d0',transition:'height .5s'}}/>
                    </div>
                    <div style={{fontSize:8,color:'#bbb'}}>{m.short}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── SCORE ──
  const ScoreView=()=>(
    <div>
      <Hdr grad={`linear-gradient(160deg,#1e3a5f,${finScore.color})`}>
        <div style={{textAlign:'center',margin:'8px 0 14px'}}>
          <div style={{position:'relative',width:120,height:120,margin:'0 auto 10px'}}>
            <svg viewBox="0 0 120 120" style={{width:120,height:120,transform:'rotate(-90deg)'}}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={finScore.color}/><stop offset="100%" stopColor={finScore.color+'88'}/></linearGradient></defs>
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#sg)" strokeWidth="10" strokeDasharray={`${2*Math.PI*50}`} strokeDashoffset={`${2*Math.PI*50*(1-finScore.score/100)}`} strokeLinecap="round" style={{transition:'stroke-dashoffset 1.2s ease'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <div style={{fontSize:30,fontWeight:900,color:'#fff',lineHeight:1}}>{finScore.score}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>/100</div>
            </div>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:'#fff'}}>{finScore.grade}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.8)',marginTop:2}}>{finScore.label}</div>
        </div>
      </Hdr>
      <div style={S.body}>
        <div style={S.sec}>Desglose</div>
        {(()=>{
          const cbud=id=>budgets[id]??0
          const csp=id=>monExp.filter(e=>e.category===id).reduce((s,e)=>s+e.amount,0)
          const cwb=cats.filter(c=>cbud(c.id)>0)
          const exc=cwb.filter(c=>csp(c.id)>cbud(c.id))
          const ratio=totalInc>0?(totalSpent/totalInc)*100:100
          const savRate=totalInc>0?(monSavings/totalInc)*100:0
          const items=[
            {label:'Tasa de ahorro',val:`${savRate.toFixed(1)}%`,pts:savRate>=20?30:savRate>=10?20:savRate>0?15:5,max:30,color:savRate>=20?'#10b981':savRate>=10?'#6366f1':'#ef4444',icon:'💰'},
            {label:'Control presupuesto',val:cwb.length>0?exc.length===0?'Al día':`${exc.length} excedida${exc.length>1?'s':''}`:'-',pts:cwb.length===0?20:exc.length===0?30:Math.max(0,30-exc.length*8),max:30,color:exc.length===0?'#10b981':'#ef4444',icon:'📊'},
            {label:'Pago de deudas',val:debts.filter(d=>d.balance>0).length===0?'Sin deudas':'Ver deudas',pts:debts.filter(d=>d.balance>0).length===0?20:10,max:20,color:'#6366f1',icon:'💳'},
            {label:'Gasto vs ingreso',val:`${ratio.toFixed(0)}%`,pts:ratio>95?0:ratio>80?10:20,max:20,color:ratio>95?'#ef4444':ratio>80?'#f59e0b':'#10b981',icon:'📉'},
          ]
          return items.map((it,i)=>(
            <div key={i} className="su" style={{...S.card(),marginBottom:8,animationDelay:`${i*.07}s`}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:34,height:34,borderRadius:10,background:`${it.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{it.icon}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{it.label}</div><div style={{fontSize:11,color:'#bbb'}}>{it.val}</div></div>
                <div style={{textAlign:'right'}}><div style={{fontSize:18,fontWeight:900,color:it.color}}>{it.pts}</div><div style={{fontSize:10,color:'#bbb'}}>/ {it.max} pts</div></div>
              </div>
              <div style={S.pbar}><div style={S.pfill((it.pts/it.max)*100,it.color)}/></div>
            </div>
          ))
        })()}
        <div style={S.sec}>Consejos</div>
        {finScore.msgs.map((m,i)=>(
          <div key={i} className="su" style={{...S.card(),display:'flex',alignItems:'center',gap:10,padding:'10px 12px',animationDelay:`${i*.06}s`}}>
            <div style={{width:32,height:32,borderRadius:10,background:i===0?'#fef2f2':i===1?'#fefce8':'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{i===0?'💡':i===1?'📊':i===2?'💳':'🎯'}</div>
            <div style={{fontSize:12,color:'#555',fontWeight:500,flex:1}}>{m}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const navItems=[
    {id:'home',icon:'🏠',l:'Inicio',c:'#6366f1'},
    {id:'moves',icon:'📋',l:'Gastos',c:'#6366f1'},
    {id:'debts',icon:'💳',l:'Deudas',c:'#dc2626'},
    {id:'savings',icon:'🏦',l:'Ahorros',c:'#10b981'},
    {id:'score',icon:'⭐',l:'Score',c:'#f59e0b'},
  ]
  const showCat=selCat&&view==='home'
  const showDebt=detailDebt&&view==='debts'

  return(
    <div style={S.app}>
      <InjectCSS/>
      {notif&&<div style={S.notif(notif.type)}>{notif.msg}</div>}
      <div key={showCat?'cat':showDebt?'debt':view} className="fi">
        {showCat&&<CatDetail/>}
        {!showCat&&showDebt&&<DebtDetail/>}
        {!showCat&&!showDebt&&view==='home'&&<Home/>}
        {!showCat&&!showDebt&&view==='moves'&&<Transactions/>}
        {!showCat&&!showDebt&&view==='debts'&&<Debts/>}
        {!showCat&&!showDebt&&view==='savings'&&<Savings/>}
        {!showCat&&!showDebt&&view==='score'&&<ScoreView/>}
      </div>
      {!showCat&&!showDebt&&<button style={S.fab} onClick={()=>{setEditExp(null);setExpF({...blankExp,category:cats[0]?.id||'comidas'});setModal('expense')}}>+</button>}
      {!showCat&&!showDebt&&(
        <nav style={S.bnav}>
          {navItems.map(n=>(
            <button key={n.id} style={S.nbtn(view===n.id,n.c)} onClick={()=>setView(n.id)}>
              <span style={{fontSize:20}}>{n.icon}</span>{n.l}
            </button>
          ))}
        </nav>
      )}

      {/* ── MODALS ── */}
      {modal==='expense'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setEditExp(null))}>
          <div style={S.sheet}>
            <div style={{width:36,height:4,borderRadius:99,background:'#e5e7eb',margin:'0 auto 18px'}}/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:16}}>{editExp?'✏️ Editar gasto':'➕ Nuevo gasto'}</div>
            <select style={S.sel} value={expF.category} onChange={e=>setExpF(p=>({...p,category:e.target.value}))}>
              {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <input style={S.inp} type="number" placeholder="Monto $" value={expF.amount} onChange={e=>setExpF(p=>({...p,amount:e.target.value}))}/>
            <input style={S.inp} type="text" placeholder="Descripción (opcional)" value={expF.description} onChange={e=>setExpF(p=>({...p,description:e.target.value}))}/>
            <input style={S.inp} type="date" value={expF.date} onChange={e=>setExpF(p=>({...p,date:e.target.value}))}/>
            <button style={S.btn1('#4c1d95,#0284c7')} onClick={saveExpense}>{editExp?'Guardar cambios':'Agregar gasto'}</button>
            <button style={S.btn2} onClick={()=>{setModal(null);setEditExp(null)}}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='income'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={{width:36,height:4,borderRadius:99,background:'#e5e7eb',margin:'0 auto 18px'}}/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:16}}>💰 Ingreso extra</div>
            <input style={S.inp} type="text" placeholder="Descripción (bono, freelance...)" value={incF.label} onChange={e=>setIncF(p=>({...p,label:e.target.value}))}/>
            <input style={S.inp} type="number" placeholder="Monto $" value={incF.amount} onChange={e=>setIncF(p=>({...p,amount:e.target.value}))}/>
            <input style={S.inp} type="date" value={incF.date} onChange={e=>setIncF(p=>({...p,date:e.target.value}))}/>
            <button style={S.btn1('#16a34a,#22c55e')} onClick={addIncome}>Agregar ingreso</button>
            <button style={S.btn2} onClick={()=>setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='recur'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={{width:36,height:4,borderRadius:99,background:'#e5e7eb',margin:'0 auto 18px'}}/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:16}}>🔄 Gasto recurrente</div>
            <input style={S.inp} type="text" placeholder="Nombre (Netflix, Gym...)" value={recF.label} onChange={e=>setRecF(p=>({...p,label:e.target.value}))}/>
            <input style={S.inp} type="number" placeholder="Monto $" value={recF.amount} onChange={e=>setRecF(p=>({...p,amount:e.target.value}))}/>
            <select style={S.sel} value={recF.category} onChange={e=>setRecF(p=>({...p,category:e.target.value}))}>
              {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <input style={S.inp} type="number" min="1" max="31" placeholder="Día del mes" value={recF.day} onChange={e=>setRecF(p=>({...p,day:+e.target.value}))}/>
            <button style={S.btn1('#4c1d95,#6366f1')} onClick={addRecur}>Guardar</button>
            <button style={S.btn2} onClick={()=>setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='salary'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={{width:36,height:4,borderRadius:99,background:'#e5e7eb',margin:'0 auto 18px'}}/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:6}}>💼 Salario</div>
            <div style={{fontSize:13,color:'#888',marginBottom:14}}>{MNF[new Date(selMon+'-01').getMonth()]} — se guarda por mes</div>
            <input style={S.inp} type="number" placeholder="Monto neto $" value={tmpSal} onChange={e=>setTmpSal(e.target.value)} autoFocus/>
            <button style={S.btn1('#4c1d95,#0284c7')} onClick={()=>saveSalary(selMon)}>Guardar</button>
            <button style={S.btn2} onClick={()=>setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='smart'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={S.sheet}>
            <div style={{width:36,height:4,borderRadius:99,background:'#e5e7eb',margin:'0 auto 18px'}}/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:6}}>🤖 Sugerencias inteligentes</div>
            <div style={{fontSize:13,color:'#888',marginBottom:14}}>Basado en tu historial (promedio +10%)</div>
            {cats.map(cat=>{
              const hist=last6.slice(0,5)
              const vals=hist.map(m=>(expenses[m.key]||[]).filter(e=>e.category===cat.id).reduce((s,e)=>s+e.amount,0)).filter(v=>v>0)
              if(!vals.length) return null
              const avg=vals.reduce((s,v)=>s+v,0)/vals.length
              const sug=Math.ceil(avg*1.1/100)*100
              return(
                <div key={cat.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${BR}`}}>
                  <span style={{fontSize:14,display:'flex',alignItems:'center',gap:8}}>{cat.icon} {cat.label}</span>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:14,fontWeight:800,color:cat.color}}>{fmt(sug)}</div>
                    <div style={{fontSize:10,color:'#bbb'}}>Promedio: {fmt(Math.round(avg))}</div>
                  </div>
                </div>
              )
            })}
            <button style={{...S.btn1('#4c1d95,#6366f1'),marginTop:14}} onClick={()=>{
              const nb={...budgets}
              cats.forEach(cat=>{
                const vals=last6.slice(0,5).map(m=>(expenses[m.key]||[]).filter(e=>e.category===cat.id).reduce((s,e)=>s+e.amount,0)).filter(v=>v>0)
                if(vals.length){const avg=vals.reduce((s,v)=>s+v,0)/vals.length;nb[cat.id]=Math.ceil(avg*1.1/100)*100}
              })
              Promise.all(Object.entries(nb).map(([id,amt])=>db.upsertBudget(user.id,id,amt)))
              setBudgets(nb);setModal(null);notify('Presupuestos aplicados ✓')
            }}>Aplicar sugerencias</button>
            <button style={S.btn2} onClick={()=>setModal(null)}>Cerrar</button>
          </div>
        </div>
      )}
      {modal==='cat'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setEditCat(null))}>
          <div style={S.sheet}>
            <div style={{width:36,height:4,borderRadius:99,background:'#e5e7eb',margin:'0 auto 18px'}}/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:16}}>{editCat?'✏️ Editar categoría':'🏷️ Nueva categoría'}</div>
            <input style={S.inp} type="text" placeholder="Nombre" value={catF.label} onChange={e=>setCatF(p=>({...p,label:e.target.value}))}/>
            <label style={S.lbl}>Ícono</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12,maxHeight:110,overflowY:'auto'}}>
              {CAT_ICONS.map(ic=>(<button key={ic} onClick={()=>setCatF(p=>({...p,icon:ic}))} style={{width:38,height:38,borderRadius:10,border:`2px solid ${catF.icon===ic?'#6366f1':'transparent'}`,background:catF.icon===ic?'#ede9fe':'#f8f9fe',fontSize:18,cursor:'pointer'}}>{ic}</button>))}
            </div>
            <label style={S.lbl}>Color</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
              {CAT_COLORS.map(col=>(<button key={col} onClick={()=>setCatF(p=>({...p,color:col}))} style={{width:30,height:30,borderRadius:'50%',background:col,border:`3px solid ${catF.color===col?'#111':'transparent'}`,cursor:'pointer'}}/>))}
            </div>
            <div style={{...S.card(),display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <span style={{fontSize:26}}>{catF.icon}</span>
              <span style={{fontSize:15,fontWeight:700,color:catF.color}}>{catF.label||'Vista previa'}</span>
            </div>
            <button style={S.btn1('#4c1d95,#6366f1')} onClick={saveCat}>{editCat?'Guardar':'Crear categoría'}</button>
            {editCat&&!editCat.is_default&&<button style={{...S.btn2,color:'#dc2626',borderColor:'#fecaca'}} onClick={()=>{deleteCat(editCat.id);setModal(null);setEditCat(null)}}>🗑️ Eliminar</button>}
            <button style={S.btn2} onClick={()=>{setModal(null);setEditCat(null)}}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='debt'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setEditDebt(null))}>
          <div style={S.sheet}>
            <div style={{width:36,height:4,borderRadius:99,background:'#e5e7eb',margin:'0 auto 18px'}}/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:16}}>{editDebt?'✏️ Editar deuda':'💳 Nueva deuda'}</div>
            <input style={S.inp} type="text" placeholder="Nombre" value={debtF.name} onChange={e=>setDebtF(p=>({...p,name:e.target.value}))}/>
            <select style={S.sel} value={debtF.type} onChange={e=>setDebtF(p=>({...p,type:e.target.value}))}>
              {DEBT_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
            </select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={S.lbl}>Saldo actual $</label><input style={{...S.inp,marginBottom:0}} type="number" placeholder="0" value={debtF.balance} onChange={e=>setDebtF(p=>({...p,balance:e.target.value}))}/></div>
              <div><label style={S.lbl}>Monto original $</label><input style={{...S.inp,marginBottom:0}} type="number" placeholder="0" value={debtF.originalAmount} onChange={e=>setDebtF(p=>({...p,originalAmount:e.target.value}))}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={S.lbl}>Pago mínimo $</label><input style={{...S.inp,marginBottom:0}} type="number" placeholder="0" value={debtF.minPayment} onChange={e=>setDebtF(p=>({...p,minPayment:e.target.value}))}/></div>
              <div><label style={S.lbl}>Tasa anual %</label><input style={{...S.inp,marginBottom:0}} type="number" placeholder="0" value={debtF.interestRate} onChange={e=>setDebtF(p=>({...p,interestRate:e.target.value}))}/></div>
            </div>
            <label style={S.lbl}>Fecha de vencimiento</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div><label style={S.lbl}>Día</label><select style={{...S.sel,marginBottom:0}} value={debtF.dueDay||''} onChange={e=>setDebtF(p=>({...p,dueDay:e.target.value}))}><option value="">Día</option>{Array.from({length:31},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
              <div><label style={S.lbl}>Mes</label><select style={{...S.sel,marginBottom:0}} value={debtF.dueMonth||''} onChange={e=>setDebtF(p=>({...p,dueMonth:e.target.value}))}><option value="">Mes</option>{MN.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
            </div>
            <label style={S.lbl}>Color</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
              {CAT_COLORS.map(col=>(<button key={col} onClick={()=>setDebtF(p=>({...p,color:col}))} style={{width:28,height:28,borderRadius:'50%',background:col,border:`3px solid ${debtF.color===col?'#111':'transparent'}`,cursor:'pointer'}}/>))}
            </div>
            <button style={S.btn1('#dc2626,#ef4444')} onClick={saveDebt}>{editDebt?'Guardar cambios':'Agregar deuda'}</button>
            <button style={S.btn2} onClick={()=>{setModal(null);setEditDebt(null)}}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='payment'&&payDebt&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setPayDebt(null))}>
          <div style={S.sheet}>
            <div style={{width:36,height:4,borderRadius:99,background:'#e5e7eb',margin:'0 auto 18px'}}/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:6}}>💳 Registrar pago</div>
            <div style={{fontSize:13,color:'#888',marginBottom:14}}>{payDebt.name} · Saldo: <b style={{color:'#dc2626'}}>{fmt(payDebt.balance)}</b></div>
            <input style={S.inp} type="number" placeholder={`Monto (mín. ${fmt(payDebt.minPayment)})`} value={payF.amount} onChange={e=>setPayF(p=>({...p,amount:e.target.value}))}/>
            <input style={S.inp} type="date" value={payF.date} onChange={e=>setPayF(p=>({...p,date:e.target.value}))}/>
            <input style={S.inp} type="text" placeholder="Nota (opcional)" value={payF.note} onChange={e=>setPayF(p=>({...p,note:e.target.value}))}/>
            <button style={S.btn1('#16a34a,#22c55e')} onClick={registerPayment}>Registrar pago</button>
            <button style={S.btn2} onClick={()=>{setModal(null);setPayDebt(null)}}>Cancelar</button>
          </div>
        </div>
      )}
      {modal==='goalitem'&&(
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&(setModal(null),setEditGoalItem(null))}>
          <div style={S.sheet}>
            <div style={{width:36,height:4,borderRadius:99,background:'#e5e7eb',margin:'0 auto 18px'}}/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:16}}>{editGoalItem?'✏️ Editar meta':'🎯 Nueva meta'}</div>
            <input style={S.inp} type="text" placeholder="Nombre (viaje, casa...)" value={goalF.label} onChange={e=>setGoalF(p=>({...p,label:e.target.value}))}/>
            <input style={S.inp} type="number" placeholder="Monto objetivo $" value={goalF.target} onChange={e=>setGoalF(p=>({...p,target:e.target.value}))}/>
            <label style={S.lbl}>Fecha límite (opcional)</label>
            <input style={S.inp} type="date" value={goalF.deadline||''} onChange={e=>setGoalF(p=>({...p,deadline:e.target.value}))}/>
            <label style={S.lbl}>Ícono</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12,maxHeight:80,overflowY:'auto'}}>
              {['🎯','✈️','🏠','🚗','💍','🎓','🏖️','💊','📱','💻','🐶','👶','🌍','🎮','💰','🏋️'].map(ic=>(<button key={ic} onClick={()=>setGoalF(p=>({...p,icon:ic}))} style={{width:38,height:38,borderRadius:10,border:`2px solid ${goalF.icon===ic?'#10b981':'transparent'}`,background:goalF.icon===ic?'#dcfce7':'#f8f9fe',fontSize:18,cursor:'pointer'}}>{ic}</button>))}
            </div>
            <label style={S.lbl}>Color</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
              {['#34D399','#818CF8','#F97316','#EC4899','#38BDF8','#FBBF24','#F87171','#10B981'].map(col=>(<button key={col} onClick={()=>setGoalF(p=>({...p,color:col}))} style={{width:30,height:30,borderRadius:'50%',background:col,border:`3px solid ${goalF.color===col?'#111':'transparent'}`,cursor:'pointer'}}/>))}
            </div>
            <button style={S.btn1('#16a34a,#22c55e')} onClick={saveGoalItem}>{editGoalItem?'Guardar cambios':'Crear meta'}</button>
            {editGoalItem&&<button style={{...S.btn2,color:'#dc2626',borderColor:'#fecaca'}} onClick={()=>{deleteGoalItem(editGoalItem.id);setModal(null);setEditGoalItem(null)}}>🗑️ Eliminar meta</button>}
            <button style={S.btn2} onClick={()=>{setModal(null);setEditGoalItem(null)}}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
