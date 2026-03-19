import { supabase } from '../lib/supabase'

export async function getItems(filters = {}) {
  let query = supabase.from('items').select('*').order('item_code')
  if (filters.keyword) {
    query = query.or(`item_code.ilike.%${filters.keyword}%,item_name.ilike.%${filters.keyword}%`)
  }
  if (filters.item_type) query = query.eq('item_type', filters.item_type)
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createItem(payload) {
  const { data, error } = await supabase.from('items').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateItem(id, payload) {
  const { data, error } = await supabase.from('items').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteItem(id) {
  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) throw error
}

function safeName(originalName) {
  const ext = originalName.split('.').pop()
  const base = originalName
    .slice(0, originalName.lastIndexOf('.'))
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // 영문/숫자/밑줄/하이픈 외 전부 _로
    .replace(/_+/g, '_')               // 연속 _ 정리
    .slice(0, 60)                      // 너무 긴 이름 자르기
  return `${base}.${ext}`
}

export async function uploadWorkStandard(itemId, file) {
  const safe = safeName(file.name)
  const path = `${itemId}/${safe}`
  const { error } = await supabase.storage
    .from('work-standards')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('work-standards').getPublicUrl(path)
  // 원본 파일명은 work_standard_name에 보존
  return { url: data.publicUrl, name: file.name, safeName: safe }
}

export async function deleteWorkStandard(itemId, safeName) {
  const path = `${itemId}/${safeName}`
  await supabase.storage.from('work-standards').remove([path])
}
