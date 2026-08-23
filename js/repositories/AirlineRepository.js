import { supabase } from '../database/supabaseClient.js';

export async function getAllAirlines() {
  const { data, error } = await supabase.from('airlines').select('*').eq('active', true).order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getAirlineById(id) {
  const { data, error } = await supabase.from('airlines').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function getAirlineByCode(code) {
  const { data, error } = await supabase.from('airlines').select('*').eq('code', code).single();
  if (error) return null;
  return data;
}
