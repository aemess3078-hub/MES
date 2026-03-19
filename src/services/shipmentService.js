import { supabase } from '../lib/supabase'

export function generateShipmentNo() {
  const d = new Date()
  const date = d.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `SH-${date}-${rand}`
}

// 생산오더 ID 배열별 출하완료 수량 합계 반환 { [production_order_id]: shippedQty }
export async function getShippedQtyByOrders(orderIds) {
  if (!orderIds?.length) return {}
  const { data } = await supabase
    .from('shipments')
    .select('production_order_id, qty')
    .in('production_order_id', orderIds)
    .eq('status', 'completed')
  const result = {}
  for (const row of (data ?? [])) {
    result[row.production_order_id] = (result[row.production_order_id] ?? 0) + Number(row.qty)
  }
  return result
}

export async function getShipments(filters = {}) {
  let query = supabase
    .from('shipments')
    .select('*, items(item_code, item_name, unit), business_partners(partner_name), production_orders(order_no)')
    .order('shipment_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.item_id) query = query.eq('item_id', filters.item_id)
  if (filters.partner_id) query = query.eq('partner_id', filters.partner_id)
  if (filters.dateFrom) query = query.gte('shipment_date', filters.dateFrom)
  if (filters.dateTo) query = query.lte('shipment_date', filters.dateTo)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createShipment(payload) {
  const { data, error } = await supabase
    .from('shipments')
    .insert(payload)
    .select()
    .single()
  if (error) throw error

  // 재고 차감
  if (payload.status !== 'cancelled') {
    const { data: inv } = await supabase
      .from('inventory')
      .select('id, qty')
      .eq('item_id', payload.item_id)
      .single()
    if (inv) {
      await supabase
        .from('inventory')
        .update({ qty: Number(inv.qty) - Number(payload.qty), updated_at: new Date().toISOString() })
        .eq('item_id', payload.item_id)
    }
  }

  return data
}

export async function updateShipment(id, payload) {
  const { data, error } = await supabase
    .from('shipments')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteShipment(id) {
  // 삭제 전 원래 데이터 조회 (재고 복원용)
  const { data: ship } = await supabase
    .from('shipments')
    .select('item_id, qty, status')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('shipments').delete().eq('id', id)
  if (error) throw error

  // 취소 아닌 출하였으면 재고 복원
  if (ship && ship.status !== 'cancelled') {
    const { data: inv } = await supabase
      .from('inventory')
      .select('id, qty')
      .eq('item_id', ship.item_id)
      .single()
    if (inv) {
      await supabase
        .from('inventory')
        .update({ qty: Number(inv.qty) + Number(ship.qty), updated_at: new Date().toISOString() })
        .eq('item_id', ship.item_id)
    }
  }
}
