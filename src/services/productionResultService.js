import { supabase } from '../lib/supabase'

// 재고 총합 증감
async function upsertInventory(itemId, deltaQty) {
  const { data: existing } = await supabase
    .from('inventory')
    .select('id, qty')
    .eq('item_id', itemId)
    .single()

  if (existing) {
    await supabase
      .from('inventory')
      .update({ qty: Number(existing.qty) + deltaQty, updated_at: new Date().toISOString() })
      .eq('item_id', itemId)
  } else if (deltaQty > 0) {
    await supabase
      .from('inventory')
      .insert({ item_id: itemId, qty: deltaQty })
  }
}

// 선입선출 차감 (오래된 LOT부터)
async function deductFIFO(itemId, qtyToDeduct) {
  const { data: lots } = await supabase
    .from('inventory_lots')
    .select('id, qty')
    .eq('item_id', itemId)
    .gt('qty', 0)
    .order('receipt_date', { ascending: true })
    .order('created_at', { ascending: true })

  let remaining = qtyToDeduct
  for (const lot of (lots ?? [])) {
    if (remaining <= 0) break
    const deduct = Math.min(Number(lot.qty), remaining)
    await supabase.from('inventory_lots').update({ qty: Number(lot.qty) - deduct }).eq('id', lot.id)
    remaining -= deduct
  }
  await upsertInventory(itemId, -qtyToDeduct)
}

// LOT 직접 선택 차감
async function deductByLot(lotDeductions) {
  for (const d of lotDeductions) {
    const { data: lot } = await supabase
      .from('inventory_lots')
      .select('qty')
      .eq('id', d.lot_id)
      .single()
    if (lot) {
      await supabase
        .from('inventory_lots')
        .update({ qty: Number(lot.qty) - Number(d.qty) })
        .eq('id', d.lot_id)
      await upsertInventory(d.item_id, -Number(d.qty))
    }
  }
}

export async function getProductionResults(filters = {}) {
  let query = supabase
    .from('production_results')
    .select('*, work_orders(work_order_no, items(item_name))')
    .order('created_at', { ascending: false })
  if (filters.work_order_id) query = query.eq('work_order_id', filters.work_order_id)
  if (filters.dateFrom) query = query.gte('start_time', filters.dateFrom)
  if (filters.dateTo) query = query.lte('start_time', filters.dateTo + 'T23:59:59')
  const { data, error } = await query
  if (error) throw error
  return data
}

// deductionOptions: { method: 'fifo'|'lot', lotDeductions: [{child_item_id, lot_id, qty}] }
export async function createProductionResult(payload, deductionOptions = { method: 'fifo' }) {
  const { data, error } = await supabase.from('production_results').insert(payload).select().single()
  if (error) throw error

  if (payload.good_qty > 0) {
    const { data: wo } = await supabase
      .from('work_orders')
      .select('item_id')
      .eq('id', payload.work_order_id)
      .single()

    if (wo?.item_id) {
      // 모품목 재고 증가 (lot 없이 총합만)
      await upsertInventory(wo.item_id, Number(payload.good_qty))

      // 자품목 차감 (BOM 기준)
      const { data: bomItems } = await supabase
        .from('bom')
        .select('child_item_id, quantity')
        .eq('parent_item_id', wo.item_id)
        .eq('is_active', true)

      if (bomItems?.length > 0) {
        if (deductionOptions.method === 'lot' && deductionOptions.lotDeductions?.length > 0) {
          await deductByLot(deductionOptions.lotDeductions)
        } else {
          // FIFO
          for (const bom of bomItems) {
            const deductQty = Number(bom.quantity) * Number(payload.good_qty)
            await deductFIFO(bom.child_item_id, deductQty)
          }
        }
      }
    }
  }

  return data
}

export async function updateProductionResult(id, payload) {
  const { data, error } = await supabase
    .from('production_results')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
