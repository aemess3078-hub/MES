import { supabase } from '../lib/supabase'

export async function getWorkOrders(filters = {}) {
  let query = supabase
    .from('work_orders')
    .select('*, items(item_code, item_name, unit, work_standard_url, work_standard_name, process_routings(routing_name, process_routing_details(step_no, processes(process_name)))), processes(process_name), production_orders(order_no)')
    .order('created_at', { ascending: false })
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.production_order_id) query = query.eq('production_order_id', filters.production_order_id)
  if (filters.keyword) {
    query = query.or(`work_order_no.ilike.%${filters.keyword}%`)
  }
  if (filters.dateFrom) query = query.gte('plan_date', filters.dateFrom)
  if (filters.dateTo) query = query.lte('plan_date', filters.dateTo)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getWorkOrderById(id) {
  const { data, error } = await supabase
    .from('work_orders')
    .select('*, items(item_code, item_name, unit, work_standard_url, work_standard_name, process_routings(routing_name, process_routing_details(step_no, processes(process_name)))), processes(process_name), production_orders(order_no)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createWorkOrder(payload) {
  const { data, error } = await supabase.from('work_orders').insert(payload).select().single()
  if (error) throw error

  // 품목의 공정라우팅으로 공정단계 자동 생성
  if (payload.item_id) {
    const { data: item } = await supabase
      .from('items')
      .select('routing_id')
      .eq('id', payload.item_id)
      .single()

    if (item?.routing_id) {
      const { data: details } = await supabase
        .from('process_routing_details')
        .select('process_id, step_no')
        .eq('routing_id', item.routing_id)
        .order('step_no')

      if (details?.length) {
        const rows = details.map((d) => ({
          work_order_id: data.id,
          process_id: d.process_id,
          step_no: d.step_no,
          status: 'waiting',
        }))
        await supabase.from('work_order_processes').insert(rows)
      }
    }
  }

  return data
}

export async function updateWorkOrder(id, payload) {
  const { data, error } = await supabase
    .from('work_orders')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateWorkOrderStatus(id, status) {
  return updateWorkOrder(id, { status, updated_at: new Date().toISOString() })
}

export async function deleteWorkOrder(id) {
  const { error } = await supabase.from('work_orders').delete().eq('id', id)
  if (error) throw error
}
