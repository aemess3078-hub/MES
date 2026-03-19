import { supabase } from '../lib/supabase'

export async function getCodesByGroup(groupCode) {
  const { data, error } = await supabase
    .from('common_codes')
    .select('*')
    .eq('group_code', groupCode)
    .eq('is_active', true)
    .order('sort_seq')
  if (error) throw error
  return data
}

export async function getAllGroups() {
  const { data, error } = await supabase
    .from('common_codes')
    .select('group_code, group_name')
    .order('group_code')
  if (error) throw error
  const unique = []
  const seen = new Set()
  for (const row of data) {
    if (!seen.has(row.group_code)) {
      seen.add(row.group_code)
      unique.push(row)
    }
  }
  return unique
}

export async function createCode(payload) {
  const { data, error } = await supabase.from('common_codes').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateCode(id, payload) {
  const { data, error } = await supabase.from('common_codes').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCode(id) {
  const { error } = await supabase.from('common_codes').delete().eq('id', id)
  if (error) throw error
}
