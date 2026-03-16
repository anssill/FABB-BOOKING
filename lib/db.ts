// lib/db.ts — Supabase CRUD helpers for Fabb.booking
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Items ───────────────────────────────────────────────────────
export async function getItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createItem(item: Record<string, unknown>) {
  const { data, error } = await supabase.from('items').insert(item).select().single()
  if (error) throw error
  return data
}

export async function updateItem(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('items').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) throw error
}

// ── Customers ───────────────────────────────────────────────────
export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createCustomer(customer: Record<string, unknown>) {
  const { data, error } = await supabase.from('customers').insert(customer).select().single()
  if (error) throw error
  return data
}

export async function updateCustomer(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw error
}

// ── Orders ──────────────────────────────────────────────────────
export async function getOrders() {
  const { data, error } = await supabase
    .from('orders_with_customer')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createOrder(order: Record<string, unknown>) {
  const { data, error } = await supabase.from('orders').insert(order).select().single()
  if (error) throw error
  return data
}

export async function updateOrder(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

// ── Order Lines ─────────────────────────────────────────────────
export async function getOrderLines(orderId: string) {
  const { data, error } = await supabase
    .from('order_lines')
    .select('*')
    .eq('order_id', orderId)
  if (error) throw error
  return data || []
}

export async function createOrderLine(line: Record<string, unknown>) {
  const { data, error } = await supabase.from('order_lines').insert(line).select().single()
  if (error) throw error
  return data
}

export async function deleteOrderLine(id: string) {
  const { error } = await supabase.from('order_lines').delete().eq('id', id)
  if (error) throw error
}

export async function replaceOrderLines(orderId: string, lines: Record<string, unknown>[]) {
  await supabase.from('order_lines').delete().eq('order_id', orderId)
  if (lines.length === 0) return []
  const { data, error } = await supabase.from('order_lines').insert(lines).select()
  if (error) throw error
  return data || []
}

// ── Wash Entries ────────────────────────────────────────────────
export async function getWashEntries() {
  const { data, error } = await supabase
    .from('wash_entries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createWashEntry(entry: Record<string, unknown>) {
  const { data, error } = await supabase.from('wash_entries').insert(entry).select().single()
  if (error) throw error
  return data
}

export async function updateWashEntry(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('wash_entries').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ── Settings ────────────────────────────────────────────────────
export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*').single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateSettings(updates: Record<string, unknown>) {
  const { data: existing } = await supabase.from('settings').select('id').single()
  if (existing) {
    const { data, error } = await supabase.from('settings').update(updates).eq('id', existing.id).select().single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase.from('settings').insert(updates).select().single()
    if (error) throw error
    return data
  }
}

// ── Profiles (Staff) ────────────────────────────────────────────
export async function getProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at')
  if (error) throw error
  return data || []
}

export async function updateProfile(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ── Pricing Rules ───────────────────────────────────────────────
export async function getPricingRules() {
  const { data, error } = await supabase.from('pricing_rules').select('*').order('created_at')
  if (error) throw error
  return data || []
}

export async function createPricingRule(rule: Record<string, unknown>) {
  const { data, error } = await supabase.from('pricing_rules').insert(rule).select().single()
  if (error) throw error
  return data
}

export async function updatePricingRule(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('pricing_rules').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deletePricingRule(id: string) {
  const { error } = await supabase.from('pricing_rules').delete().eq('id', id)
  if (error) throw error
}

// ── Custom Fields ───────────────────────────────────────────────
export async function getCustomFields(entity?: string) {
  let query = supabase.from('custom_fields').select('*').eq('active', true).order('sort_order')
  if (entity) query = query.eq('entity', entity)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createCustomField(field: Record<string, unknown>) {
  const { data, error } = await supabase.from('custom_fields').insert(field).select().single()
  if (error) throw error
  return data
}

export async function updateCustomField(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('custom_fields').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCustomField(id: string) {
  const { error } = await supabase.from('custom_fields').delete().eq('id', id)
  if (error) throw error
}

// ── Activity Log ────────────────────────────────────────────────
export async function getActivityLog(limit = 50) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*, profiles(name,email)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function logActivity(entry: {
  user_id?: string
  action: string
  entity_type?: string
  entity_id?: string
  description?: string
  metadata?: Record<string, unknown>
}) {
  const { error } = await supabase.from('activity_log').insert(entry)
  if (error) console.error('Activity log error:', error)
}

// ── Email Log ───────────────────────────────────────────────────
export async function getEmailLog(limit = 100) {
  const { data, error } = await supabase
    .from('email_log')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function logEmail(entry: Record<string, unknown>) {
  const { error } = await supabase.from('email_log').insert(entry)
  if (error) console.error('Email log error:', error)
}

// ── WhatsApp Log ────────────────────────────────────────────────
export async function logWhatsApp(entry: Record<string, unknown>) {
  const { error } = await supabase.from('whatsapp_log').insert(entry)
  if (error) console.error('WhatsApp log error:', error)
}

// ── Order number generation ─────────────────────────────────────
export async function generateOrderNumber(prefix = 'INV') {
  const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const num = (count || 0) + 1001
  return `${prefix}-${num}`
}
