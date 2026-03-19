import { supabase } from '../lib/supabase'

export async function getRoutings(filters = {}) {
  let query = supabase
    .from('process_routings')
    .select('*, process_routing_details(step_no, cycle_time, processes(process_code, process_name))')
    .order('routing_code')
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  const { data, error } = await query
  if (error) throw error
  // 각 라우팅의 상세를 step_no 순으로 정렬
  return (data ?? []).map((r) => ({
    ...r,
    process_routing_details: (r.process_routing_details ?? []).sort((a, b) => a.step_no - b.step_no),
  }))
}

export async function getRoutingWithDetails(routingId) {
  const { data, error } = await supabase
    .from('process_routings')
    .select('*, process_routing_details(*, processes(process_code, process_name))')
    .eq('id', routingId)
    .single()
  if (error) throw error
  // step_no 순으로 정렬
  if (data?.process_routing_details) {
    data.process_routing_details.sort((a, b) => a.step_no - b.step_no)
  }
  return data
}

export async function createRouting(payload) {
  const { data, error } = await supabase
    .from('process_routings')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRouting(id, payload) {
  const { data, error } = await supabase
    .from('process_routings')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRouting(id) {
  const { error } = await supabase.from('process_routings').delete().eq('id', id)
  if (error) throw error
}

// 라우팅 상세 전체 교체 (기존 삭제 후 재등록)
export async function saveRoutingDetails(routingId, steps) {
  // 기존 상세 삭제
  await supabase.from('process_routing_details').delete().eq('routing_id', routingId)
  if (!steps.length) return

  const rows = steps.map((s, idx) => ({
    routing_id: routingId,
    process_id: s.process_id,
    step_no: idx + 1,
    cycle_time: s.cycle_time ?? null,
    note: s.note ?? null,
  }))
  const { error } = await supabase.from('process_routing_details').insert(rows)
  if (error) throw error
}
