import { supabase } from '../database/supabaseClient.js';

const SELECT = `*, airlines(name,code)`;

function flattenTour(row) {
  if (!row) return row;
  const { airlines, ...rest } = row;
  return {
    ...rest,
    airline_name: airlines?.name,
    airline_code: airlines?.code,
  };
}

export async function getTourById(id) {
  const { data, error } = await supabase.from('tours').select(SELECT).eq('id', id).single();
  if (error) return null;
  return flattenTour(data);
}

export async function getFeaturedTours(limit = 8) {
  const { data, error } = await supabase.from('tours').select(SELECT).eq('featured', true).order('id', { ascending: true }).limit(limit);
  if (error) throw error;
  return (data || []).map(flattenTour);
}

export async function getTourItinerary(tourId) {
  const { data, error } = await supabase
    .from('tour_itineraries')
    .select('*')
    .eq('tour_id', tourId)
    .order('day_number', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function searchTours(filters = {}) {
  let q = supabase.from('tours').select(SELECT);

  if (filters.destination) q = q.or(`destination.ilike.%${filters.destination}%,country.ilike.%${filters.destination}%`);
  if (filters.country) q = q.eq('country', filters.country);
  if (filters.operator) q = q.eq('operator', filters.operator);
  if (filters.airlineIds && filters.airlineIds.length) q = q.in('airline_id', filters.airlineIds);
  if (filters.days) q = q.eq('days', filters.days);
  if (filters.timeSlots && filters.timeSlots.length) {
    const orExpr = filters.timeSlots
      .map((s) => `and(departure_time.gte.${String(s.from).padStart(2, '0')}:00,departure_time.lt.${String(s.to).padStart(2, '0')}:00)`)
      .join(',');
    q = q.or(orExpr);
  }

  if (filters.sort === 'price_asc') q = q.order('price', { ascending: true });
  else if (filters.sort === 'price_desc') q = q.order('price', { ascending: false });
  else q = q.order('departure_date', { ascending: true });

  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(flattenTour);
}

export async function countTours() {
  const { count, error } = await supabase.from('tours').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

export async function getToursPage(page, pageSize) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase.from('tours').select(SELECT).order('id', { ascending: false }).range(from, to);
  if (error) throw error;
  return (data || []).map(flattenTour);
}

export async function getDistinctOperators() {
  const { data, error } = await supabase.from('tours').select('operator').order('operator', { ascending: true });
  if (error) throw error;
  return Array.from(new Set((data || []).map((r) => r.operator)));
}

function tourPayload(data) {
  return {
    code: data.code,
    name: data.name,
    operator: data.operator,
    origin: data.origin,
    destination: data.destination,
    country: data.country,
    departure_date: data.departure_date,
    departure_time: data.departure_time,
    days: data.days,
    nights: data.nights,
    airline_id: data.airline_id || null,
    aircraft: data.aircraft || null,
    price: data.price,
    thumbnail: data.thumbnail,
    description: data.description,
    included_services: data.included_services,
    excluded_services: data.excluded_services,
    status: data.status || 'available',
    featured: !!data.featured,
  };
}

async function insertItinerary(tourId, itineraryDays) {
  const rows = (itineraryDays || []).map((day) => ({
    tour_id: tourId,
    day_number: day.day_number,
    title: day.title,
    description: day.description,
    meals: day.meals || '',
    accommodation: day.accommodation || '',
  }));
  if (!rows.length) return;
  const { error } = await supabase.from('tour_itineraries').insert(rows);
  if (error) throw error;
}

export async function createTour(data, itineraryDays) {
  const { data: row, error } = await supabase.from('tours').insert(tourPayload(data)).select('id').single();
  if (error) throw error;
  await insertItinerary(row.id, itineraryDays);
  return row.id;
}

export async function updateTour(id, data, itineraryDays) {
  const { error } = await supabase.from('tours').update(tourPayload(data)).eq('id', id);
  if (error) throw error;

  const { error: delError } = await supabase.from('tour_itineraries').delete().eq('tour_id', id);
  if (delError) throw delError;
  await insertItinerary(id, itineraryDays);
}

export async function deleteTour(id) {
  const { error: delError } = await supabase.from('tour_itineraries').delete().eq('tour_id', id);
  if (delError) throw delError;
  const { error } = await supabase.from('tours').delete().eq('id', id);
  if (error) throw error;
}
