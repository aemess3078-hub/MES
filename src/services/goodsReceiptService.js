import { supabase } from '../lib/supabase'

export function generateReceiptNo() {
  const d = new Date()
  const date = d.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `GR-${date}-${rand}`
}

export async function getGoodsReceipts(filters = {}) {
  let query = supabase
    .from('goods_receipts')
    .select('*, items(item_code, item_name, unit), purchase_orders(po_no)')
    .order('receipt_date', { ascending: false })

  if (filters.item_id) query = query.eq('item_id', filters.item_id)
  if (filters.po_id) query = query.eq('po_id', filters.po_id)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createGoodsReceipt(payload) {
  // 1. 입고 레코드 생성
  const { data, error } = await supabase
    .from('goods_receipts')
    .insert(payload)
    .select()
    .single()
  if (error) throw error

  // 2. LOT별 재고 레코드 생성
  await supabase.from('inventory_lots').insert({
    item_id: payload.item_id,
    receipt_id: data.id,
    lot_no: payload.lot_no ?? null,
    qty: Number(payload.qty),
    receipt_date: payload.receipt_date ?? new Date().toISOString().slice(0, 10),
  })

  // 3. 재고 총합 upsert
  const { data: existing } = await supabase
    .from('inventory')
    .select('id, qty')
    .eq('item_id', payload.item_id)
    .single()

  if (existing) {
    await supabase
      .from('inventory')
      .update({ qty: Number(existing.qty) + Number(payload.qty), updated_at: new Date().toISOString() })
      .eq('item_id', payload.item_id)
  } else {
    await supabase
      .from('inventory')
      .insert({ item_id: payload.item_id, qty: Number(payload.qty) })
  }

  // 4. 발주와 연결된 경우 발주 수량 및 상태 업데이트
  if (payload.po_id) {
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('order_qty, received_qty')
      .eq('id', payload.po_id)
      .single()

    if (po) {
      const newReceivedQty = Number(po.received_qty) + Number(payload.qty)
      const newStatus = newReceivedQty >= Number(po.order_qty) ? 'completed' : 'partial'
      await supabase
        .from('purchase_orders')
        .update({ received_qty: newReceivedQty, status: newStatus })
        .eq('id', payload.po_id)
    }
  }

  return data
}

export async function deleteGoodsReceipt(id) {
  const { error } = await supabase.from('goods_receipts').delete().eq('id', id)
  if (error) throw error
}
