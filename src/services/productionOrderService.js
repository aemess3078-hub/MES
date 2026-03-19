import { supabase } from '../lib/supabase'

export async function getProductionOrders(filters = {}) {
  let query = supabase
    .from('production_orders')
    .select('*, items(item_code, item_name, unit), business_partners(partner_name)')
    .order('created_at', { ascending: false })
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.keyword) {
    query = query.or(`order_no.ilike.%${filters.keyword}%`)
  }
  if (filters.dateFrom) query = query.gte('due_date', filters.dateFrom)
  if (filters.dateTo) query = query.lte('due_date', filters.dateTo)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getProductionOrderById(id) {
  const { data, error } = await supabase
    .from('production_orders')
    .select('*, items(item_code, item_name, unit), business_partners(partner_name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createProductionOrder(payload) {
  const { data, error } = await supabase.from('production_orders').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateProductionOrder(id, payload) {
  const { data, error } = await supabase
    .from('production_orders')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProductionOrder(id) {
  const { error } = await supabase.from('production_orders').delete().eq('id', id)
  if (error) throw error
}
