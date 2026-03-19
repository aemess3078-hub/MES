import { supabase } from '../lib/supabase'

export async function getBusinessPartners(filters = {}) {
  let query = supabase
    .from('business_partners')
    .select('*')
    .order('partner_name')

  if (filters.partner_type && filters.partner_type !== 'all') {
    query = query.or(`partner_type.eq.${filters.partner_type},partner_type.eq.both`)
  }
  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createBusinessPartner(payload) {
  const { data, error } = await supabase
    .from('business_partners')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBusinessPartner(id, payload) {
  const { data, error } = await supabase
    .from('business_partners')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBusinessPartner(id) {
  const { error } = await supabase.from('business_partners').delete().eq('id', id)
  if (error) throw error
}
