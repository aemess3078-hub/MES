import { supabase } from '../lib/supabase'

export async function getWorkOrderProcesses(workOrderId) {
  const { data, error } = await supabase
    .from('work_order_processes')
    .select('*, processes(process_code, process_name)')
    .eq('work_order_id', workOrderId)
    .order('step_no')
  if (error) throw error
  return data ?? []
}

export async function createWorkOrderProcesses(workOrderId, routingDetails) {
  // routingDetails: [{process_id, step_no}] - 라우팅 상세 목록
  if (!routingDetails?.length) return
  const rows = routingDetails.map((d) => ({
    work_order_id: workOrderId,
    process_id: d.process_id,
    step_no: d.step_no,
    status: 'waiting',
  }))
  const { error } = await supabase.from('work_order_processes').insert(rows)
  if (error) throw error
}

export async function updateWorkOrderProcess(id, payload) {
  const { data, error } = await supabase
    .from('work_order_processes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
