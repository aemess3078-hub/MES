import { supabase } from '../lib/supabase'

export function generatePoNo() {
  const d = new Date()
  const date = d.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `PO-${date}-${rand}`
}

export async function getPurchaseOrders(filters = {}) {
  let query = supabase
    .from('purchase_orders')
    .select('*, items(item_code, item_name, unit), business_partners(partner_name)')
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.item_id) query = query.eq('item_id', filters.item_id)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPurchaseOrderById(id) {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, items(item_code, item_name, unit)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createPurchaseOrder(payload) {
  const { data, error } = await supabase
    .from('purchase_orders')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePurchaseOrder(id, payload) {
  const { data, error } = await supabase
    .from('purchase_orders')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePurchaseOrder(id) {
  const { error } = await supabase.from('purchase_orders').delete().eq('id', id)
  if (error) throw error
}
