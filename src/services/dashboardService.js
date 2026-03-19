import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'

export async function getDashboardData() {
  const today = dayjs().format('YYYY-MM-DD')

  const [workOrders, results, defects, equipments] = await Promise.all([
    supabase
      .from('work_orders')
      .select('id, status, plan_qty, items(item_name)')
      .gte('plan_date', today)
      .lte('plan_date', today),
    supabase
      .from('production_results')
      .select('good_qty, defect_qty')
      .gte('start_time', today)
      .lte('start_time', today + 'T23:59:59'),
    supabase
      .from('defects')
      .select('defect_type_code, defect_qty')
      .gte('occurred_at', today)
      .lte('occurred_at', today + 'T23:59:59'),
    supabase
      .from('equipments')
      .select('id, equip_name, status')
      .eq('is_active', true),
  ])

  const totalGoodQty = (results.data || []).reduce((s, r) => s + (r.good_qty || 0), 0)
  const totalDefectQty = (results.data || []).reduce((s, r) => s + (r.defect_qty || 0), 0)
  const totalQty = totalGoodQty + totalDefectQty

  const workOrderStatusCount = {}
  for (const wo of workOrders.data || []) {
    workOrderStatusCount[wo.status] = (workOrderStatusCount[wo.status] || 0) + 1
  }

  const defectByType = {}
  for (const d of defects.data || []) {
    defectByType[d.defect_type_code] = (defectByType[d.defect_type_code] || 0) + d.defect_qty
  }

  return {
    today,
    totalGoodQty,
    totalDefectQty,
    defectRate: totalQty > 0 ? ((totalDefectQty / totalQty) * 100).toFixed(1) : 0,
    workOrders: workOrders.data || [],
    workOrderStatusCount,
    defectByType,
    equipments: equipments.data || [],
  }
}
