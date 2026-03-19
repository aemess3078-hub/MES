import { supabase } from '../lib/supabase'

export async function getProcesses(filters = {}) {
  let query = supabase.from('processes').select('*').order('process_seq')
  if (filters.keyword) {
    query = query.or(`process_code.ilike.%${filters.keyword}%,process_name.ilike.%${filters.keyword}%`)
  }
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createProcess(payload) {
  const { data, error } = await supabase.from('processes').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateProcess(id, payload) {
  const { data, error } = await supabase.from('processes').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProcess(id) {
  const { error } = await supabase.from('processes').delete().eq('id', id)
  if (error) throw error
}
