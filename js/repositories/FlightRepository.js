import { supabase } from '../database/supabaseClient.js';

const SELECT = `
  *,
  airlines!fk_flights_airline(code,name,logo),
  origin_airport:airports!fk_flights_origin!inner(code,city,name),
  destination_airport:airports!fk_flights_destination!inner(code,city,name)
`;

function pad2(n) {
  return String(n).padStart(2, '0');
}

function flattenFlight(row) {
  if (!row) return row;
  const { airlines, origin_airport, destination_airport, ...rest } = row;
  return {
    ...rest,
    airline_code: airlines?.code,
    airline_name: airlines?.name,
    airline_logo: airlines?.logo,
    origin_code: origin_airport?.code,
    origin_city: origin_airport?.city,
    origin_name: origin_airport?.name,
    destination_code: destination_airport?.code,
    destination_city: destination_airport?.city,
    destination_name: destination_airport?.name,
  };
}

export async function getFlightById(id) {
  const { data, error } = await supabase.from('flights').select(SELECT).eq('id', id).single();
  if (error) return null;
  return flattenFlight(data);
}

export async function searchFlights(filters = {}) {
  let q = supabase.from('flights').select(SELECT);

  if (filters.origin) q = q.eq('origin_airport.code', filters.origin);
  if (filters.destination) q = q.eq('destination_airport.code', filters.destination);
  if (filters.date) q = q.gte('departure_date', filters.date);
  if (filters.airlineIds && filters.airlineIds.length) q = q.in('airline_id', filters.airlineIds);
  if (filters.tripTypes && filters.tripTypes.length) q = q.in('trip_type', filters.tripTypes);
  if (filters.stopsMode === 'direct') {
    q = q.eq('stops', 0);
  } else if (filters.stopsMode === 'multi-city') {
    q = q.or('trip_type.eq.multi-city,stops.gt.0');
  }
  if (filters.timeSlots && filters.timeSlots.length) {
    const orExpr = filters.timeSlots
      .map((s) => `and(departure_time.gte.${pad2(s.from)}:00,departure_time.lt.${pad2(s.to)}:00)`)
      .join(',');
    q = q.or(orExpr);
  }

  const priceField = filters.fareClass === 'business' ? 'business_price' : 'economy_price';
  if (filters.sort === 'price_asc') q = q.order(priceField, { ascending: true });
  else if (filters.sort === 'price_desc') q = q.order(priceField, { ascending: false });
  else q = q.order('departure_date', { ascending: true }).order('departure_time', { ascending: true });

  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(flattenFlight);
}

export async function countFlights() {
  const { count, error } = await supabase.from('flights').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

export async function getFlightsPage(page, pageSize) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase.from('flights').select(SELECT).order('id', { ascending: false }).range(from, to);
  if (error) throw error;
  return (data || []).map(flattenFlight);
}

export async function createFlight(data) {
  const { data: row, error } = await supabase
    .from('flights')
    .insert({
      flight_number: data.flight_number,
      airline_id: data.airline_id,
      origin_airport_id: data.origin_airport_id,
      destination_airport_id: data.destination_airport_id,
      departure_date: data.departure_date,
      departure_time: data.departure_time,
      arrival_time: data.arrival_time,
      duration_minutes: data.duration_minutes,
      trip_type: data.trip_type,
      stops: data.stops,
      aircraft: data.aircraft,
      economy_price: data.economy_price,
      business_price: data.business_price,
      services: data.services,
      status: data.status || 'available',
    })
    .select('id')
    .single();
  if (error) throw error;
  return row.id;
}

export async function updateFlight(id, data) {
  const { error } = await supabase
    .from('flights')
    .update({
      flight_number: data.flight_number,
      airline_id: data.airline_id,
      origin_airport_id: data.origin_airport_id,
      destination_airport_id: data.destination_airport_id,
      departure_date: data.departure_date,
      departure_time: data.departure_time,
      arrival_time: data.arrival_time,
      duration_minutes: data.duration_minutes,
      trip_type: data.trip_type,
      stops: data.stops,
      aircraft: data.aircraft,
      economy_price: data.economy_price,
      business_price: data.business_price,
      services: data.services,
      status: data.status || 'available',
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteFlight(id) {
  const { error } = await supabase.from('flights').delete().eq('id', id);
  if (error) throw error;
}
