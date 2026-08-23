import { supabase } from '../database/supabaseClient.js';

export async function getAllAirports() {
  const { data, error } = await supabase
    .from('airports')
    .select('*')
    .order('country', { ascending: true })
    .order('city', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getAirportByCode(code) {
  const { data, error } = await supabase.from('airports').select('*').eq('code', code).single();
  if (error) return null;
  return data;
}
