import { supabase } from '../database/supabaseClient.js';

export async function getUserById(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function updateUser(id, data) {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name || '',
      phone: data.phone || '',
      country: data.country || '',
      address: data.address || '',
      avatar: data.avatar || '',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error('Không thể cập nhật thông tin.');
}
