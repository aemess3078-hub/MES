import { supabase } from '../lib/supabase'

export async function getDefects(filters = {}) {
  let query = supabase
    .from('defects')
    .select('*, work_orders(work_order_no, items(item_name)), processes(process_name)')
    .order('occurred_at', { ascending: false })
  if (filters.work_order_id) query = query.eq('work_order_id', filters.work_order_id)
  if (filters.defect_type_code) query = query.eq('defect_type_code', filters.defect_type_code)
  if (filters.dateFrom) query = query.gte('occurred_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('occurred_at', filters.dateTo + 'T23:59:59')
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createDefect(payload) {
  const { data, error } = await supabase.from('defects').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function getDefectSummary(dateFrom, dateTo) {
  const { data, error } = await supabase
    .from('defects')
    .select('defect_type_code, defect_qty')
    .gte('occurred_at', dateFrom)
    .lte('occurred_at', dateTo + 'T23:59:59')
  if (error) throw error
  const summary = {}
  for (const row of data) {
    summary[row.defect_type_code] = (summary[row.defect_type_code] || 0) + row.defect_qty
  }
  return summary
}
