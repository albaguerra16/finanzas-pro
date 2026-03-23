import { supabase } from './supabase'

const uid = () => supabase.auth.getUser().then(r => r.data.user?.id)

// ── CATEGORIES ──
export async function fetchCategories(userId) {
  const { data } = await supabase.from('categories').select('*').eq('user_id', userId).order('sort_order')
  return data || []
}
export async function upsertCategory(userId, cat) {
  const { data } = await supabase.from('categories').upsert({ ...cat, user_id: userId }).select().single()
  return data
}
export async function deleteCategory(id) {
  await supabase.from('categories').delete().eq('id', id)
}

// ── SALARIES ──
export async function fetchSalaries(userId) {
  const { data } = await supabase.from('salaries').select('*').eq('user_id', userId)
  const map = {}
  data?.forEach(s => { map[s.month_key] = s.amount })
  return map
}
export async function upsertSalary(userId, monthKey, amount) {
  await supabase.from('salaries').upsert({ user_id: userId, month_key: monthKey, amount }, { onConflict: 'user_id,month_key' })
}

// ── BUDGETS ──
export async function fetchBudgets(userId) {
  const { data } = await supabase.from('budgets').select('*').eq('user_id', userId)
  const map = {}
  data?.forEach(b => { map[b.category_id] = b.amount })
  return map
}
export async function upsertBudget(userId, categoryId, amount) {
  await supabase.from('budgets').upsert({ user_id: userId, category_id: categoryId, amount }, { onConflict: 'user_id,category_id' })
}

// ── EXPENSES ──
export async function fetchExpenses(userId) {
  const { data } = await supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false })
  const map = {}
  data?.forEach(e => {
    if (!map[e.month_key]) map[e.month_key] = []
    map[e.month_key].push({ id: e.id, category: e.category_id, amount: e.amount, description: e.description, date: e.date })
  })
  return map
}
export async function insertExpense(userId, exp) {
  const { data } = await supabase.from('expenses').insert({
    user_id: userId, category_id: exp.category, amount: exp.amount,
    description: exp.description || '', date: exp.date, month_key: exp.date.slice(0,7)
  }).select().single()
  return data
}
export async function updateExpense(id, exp) {
  await supabase.from('expenses').update({
    category_id: exp.category, amount: exp.amount,
    description: exp.description || '', date: exp.date, month_key: exp.date.slice(0,7)
  }).eq('id', id)
}
export async function deleteExpense(id) {
  await supabase.from('expenses').delete().eq('id', id)
}

// ── INCOMES ──
export async function fetchIncomes(userId) {
  const { data } = await supabase.from('incomes').select('*').eq('user_id', userId).order('date', { ascending: false })
  const map = {}
  data?.forEach(e => {
    if (!map[e.month_key]) map[e.month_key] = []
    map[e.month_key].push({ id: e.id, label: e.label, amount: e.amount, date: e.date })
  })
  return map
}
export async function insertIncome(userId, inc) {
  const { data } = await supabase.from('incomes').insert({
    user_id: userId, label: inc.label || '', amount: inc.amount,
    date: inc.date, month_key: inc.date.slice(0,7)
  }).select().single()
  return data
}
export async function deleteIncome(id) {
  await supabase.from('incomes').delete().eq('id', id)
}

// ── RECURRING ──
export async function fetchRecurring(userId) {
  const { data } = await supabase.from('recurring').select('*').eq('user_id', userId)
  return data?.map(r => ({ id: r.id, label: r.label, amount: r.amount, category: r.category_id, day: r.due_day })) || []
}
export async function insertRecurring(userId, rec) {
  const { data } = await supabase.from('recurring').insert({
    user_id: userId, label: rec.label, amount: rec.amount, category_id: rec.category, due_day: rec.day
  }).select().single()
  return data
}
export async function deleteRecurring(id) {
  await supabase.from('recurring').delete().eq('id', id)
}

// ── SAVING GOAL ──
export async function fetchGoal(userId) {
  const { data } = await supabase.from('saving_goal').select('*').eq('user_id', userId).single()
  return data ? { target: data.target, deadline: data.deadline || '', label: data.label } : { target: 0, deadline: '', label: 'Mi meta' }
}
export async function upsertGoal(userId, goal) {
  await supabase.from('saving_goal').upsert({ user_id: userId, ...goal }, { onConflict: 'user_id' })
}

// ── NOTES ──
export async function fetchNotes(userId) {
  const { data } = await supabase.from('notes').select('*').eq('user_id', userId)
  const map = {}
  data?.forEach(n => { map[n.month_key] = n.content })
  return map
}
export async function upsertNote(userId, monthKey, content) {
  await supabase.from('notes').upsert({ user_id: userId, month_key: monthKey, content }, { onConflict: 'user_id,month_key' })
}

// ── DEBTS ──
export async function fetchDebts(userId) {
  const { data: debts } = await supabase.from('debts').select('*').eq('user_id', userId)
  const { data: payments } = await supabase.from('debt_payments').select('*').eq('user_id', userId)
  return debts?.map(d => ({
    id: d.id, name: d.name, type: d.type, balance: d.balance,
    originalAmount: d.original_amount, minPayment: d.min_payment,
    interestRate: d.interest_rate, dueDay: d.due_day, color: d.color,
    payments: payments?.filter(p => p.debt_id === d.id).map(p => ({ id: p.id, date: p.date, amount: p.amount, note: p.note })) || []
  })) || []
}
export async function insertDebt(userId, debt) {
  const { data } = await supabase.from('debts').insert({
    user_id: userId, name: debt.name, type: debt.type, balance: debt.balance,
    original_amount: debt.originalAmount, min_payment: debt.minPayment,
    interest_rate: debt.interestRate, due_day: debt.dueDay, color: debt.color
  }).select().single()
  return data
}
export async function updateDebt(id, debt) {
  await supabase.from('debts').update({
    name: debt.name, type: debt.type, balance: debt.balance,
    original_amount: debt.originalAmount, min_payment: debt.minPayment,
    interest_rate: debt.interestRate, due_day: debt.dueDay, color: debt.color
  }).eq('id', id)
}
export async function deleteDebt(id) {
  await supabase.from('debts').delete().eq('id', id)
}
export async function insertDebtPayment(userId, debtId, pay) {
  const { data } = await supabase.from('debt_payments').insert({
    user_id: userId, debt_id: debtId, amount: pay.amount, date: pay.date, note: pay.note || ''
  }).select().single()
  return data
}
export async function deleteDebtPayment(id) {
  await supabase.from('debt_payments').delete().eq('id', id)
}
