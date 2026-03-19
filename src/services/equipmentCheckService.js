import { supabase } from '../lib/supabase'

// ── 점검항목 마스터 ──────────────────────────────────────
export async function getCheckItems(filters = {}) {
  let query = supabase
    .from('equip_check_items')
    .select('*, equipments(equip_code, equip_name)')
    .order('sort_no')
    .order('created_at')
  if (filters.equipment_id) query = query.eq('equipment_id', filters.equipment_id)
  if (filters.cycle)        query = query.eq('cycle', filters.cycle)
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createCheckItem(payload) {
  const { data, error } = await supabase.from('equip_check_items').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateCheckItem(id, payload) {
  const { data, error } = await supabase.from('equip_check_items').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCheckItem(id) {
  const { error } = await supabase.from('equip_check_items').delete().eq('id', id)
  if (error) throw error
}

// ── 점검 실적 ────────────────────────────────────────────
export async function getCheckLogs(cycle, checkDate) {
  const { data, error } = await supabase
    .from('equip_check_logs')
    .select('*')
    .eq('cycle', cycle)
    .eq('check_date', checkDate)
  if (error) throw error
  return data
}

export async function getCheckLogHistory(filters = {}) {
  let query = supabase
    .from('equip_check_logs')
    .select('*, equip_check_items(check_name, cycle), equipments(equip_code, equip_name)')
    .order('check_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (filters.equipment_id) query = query.eq('equipment_id', filters.equipment_id)
  if (filters.cycle)        query = query.eq('cycle', filters.cycle)
  if (filters.dateFrom)     query = query.gte('check_date', filters.dateFrom)
  if (filters.dateTo)       query = query.lte('check_date', filters.dateTo)
  const { data, error } = await query
  if (error) throw error
  return data
}

// rows: [{ equipment_id, check_item_id, cycle, check_date, result, note, checked_by }]
export async function saveCheckLogs(rows) {
  const { data, error } = await supabase
    .from('equip_check_logs')
    .upsert(rows, { onConflict: 'check_item_id,check_date' })
    .select()
  if (error) throw error
  return data
}
