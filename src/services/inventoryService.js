import { supabase } from '../lib/supabase'

export async function getInventory(filters = {}) {
  let query = supabase
    .from('inventory')
    .select('*, items(item_code, item_name, item_type, unit, is_active)')
    .order('updated_at', { ascending: false })

  if (filters.item_type) {
    query = query.eq('items.item_type', filters.item_type)
  }

  const { data, error } = await query
  if (error) throw error

  if (filters.item_type) {
    return data.filter((d) => d.items?.item_type === filters.item_type)
  }
  return data
}

export async function getInventoryByItemId(itemId) {
  if (!itemId) return null
  const { data, error } = await supabase
    .from('inventory')
    .select('qty, items(item_name, unit)')
    .eq('item_id', itemId)
    .single()
  if (error) return null
  return data
}

export async function adjustInventory(itemId, qty, note) {
  const { data: existing } = await supabase
    .from('inventory')
    .select('id, qty')
    .eq('item_id', itemId)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('inventory')
      .update({ qty: Number(qty), updated_at: new Date().toISOString() })
      .eq('item_id', itemId)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('inventory')
      .insert({ item_id: itemId, qty: Number(qty) })
      .select()
      .single()
    if (error) throw error
    return data
  }
}
