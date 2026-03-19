import { supabase } from '../lib/supabase'

export async function getDowntimes(filters = {}) {
  let query = supabase
    .from('downtimes')
    .select('*, equipments(equip_name), work_orders(work_order_no)')
    .order('start_time', { ascending: false })
  if (filters.equipment_id) query = query.eq('equipment_id', filters.equipment_id)
  if (filters.reason_code) query = query.eq('reason_code', filters.reason_code)
  if (filters.dateFrom) query = query.gte('start_time', filters.dateFrom)
  if (filters.dateTo) query = query.lte('start_time', filters.dateTo + 'T23:59:59')
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createDowntime(payload) {
  const { data, error } = await supabase.from('downtimes').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateDowntime(id, payload) {
  const { data, error } = await supabase
    .from('downtimes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
