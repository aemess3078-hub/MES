import { supabase } from '../lib/supabase'

export async function getEquipments(filters = {}) {
  let query = supabase
    .from('equipments')
    .select('*, processes(process_name)')
    .order('equip_code')
  if (filters.keyword) {
    query = query.or(`equip_code.ilike.%${filters.keyword}%,equip_name.ilike.%${filters.keyword}%`)
  }
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createEquipment(payload) {
  const { data, error } = await supabase.from('equipments').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateEquipment(id, payload) {
  const { data, error } = await supabase.from('equipments').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteEquipment(id) {
  const { error } = await supabase.from('equipments').delete().eq('id', id)
  if (error) throw error
}

export async function uploadEquipPhoto(equipId, file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${equipId}.${ext}`
  const { error } = await supabase.storage
    .from('equip-photos')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  const { data } = supabase.storage.from('equip-photos').getPublicUrl(path)
  // 캐시 무효화를 위해 타임스탬프 쿼리 추가
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function deleteEquipPhoto(equipId, photoUrl) {
  // URL에서 확장자 추출
  const ext = photoUrl?.split('?')[0].split('.').pop()
  if (!ext) return
  await supabase.storage.from('equip-photos').remove([`${equipId}.${ext}`])
}
