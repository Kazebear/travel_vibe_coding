import { supabase } from '../database/supabaseClient.js';

export async function createBooking(data) {
  const { data: row, error } = await supabase
    .from('bookings')
    .insert({
      booking_code: data.booking_code,
      user_id: data.user_id || null,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone || '',
      country: data.country || '',
      address: data.address || '',
      total_amount: data.total_amount,
      status: 'completed',
    })
    .select('id')
    .single();
  if (error) throw error;
  return row.id;
}

export async function addBookingFlight(bookingId, flightId, fareClass, price) {
  const { error } = await supabase
    .from('booking_flights')
    .insert({ booking_id: bookingId, flight_id: flightId, fare_class: fareClass, quantity: 1, price });
  if (error) throw error;
}

export async function addBookingTour(bookingId, tourId, price) {
  const { error } = await supabase.from('booking_tours').insert({ booking_id: bookingId, tour_id: tourId, quantity: 1, price });
  if (error) throw error;
}

export async function getBookingByCode(code) {
  const { data, error } = await supabase.from('bookings').select('*').eq('booking_code', code).single();
  if (error) return null;
  return data;
}

/* ===== Dashboard aggregates (RPC — xem supabase/schema.sql) ===== */

export async function getMonthlyTourCount() {
  const { data, error } = await supabase.rpc('fn_monthly_tour_count');
  if (error) throw error;
  return data || 0;
}

export async function getFlightCount() {
  const { count, error } = await supabase.from('flights').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

export async function getTourCustomerCount() {
  const { data, error } = await supabase.rpc('fn_tour_customer_count');
  if (error) throw error;
  return data || 0;
}

export async function getFlightCustomerCount() {
  const { data, error } = await supabase.rpc('fn_flight_customer_count');
  if (error) throw error;
  return data || 0;
}

export async function getTopAirlines(limit = 10) {
  const { data, error } = await supabase.rpc('fn_top_airlines', { limit_n: limit });
  if (error) throw error;
  return data || [];
}

export async function getTopTourCountries(limit = 10) {
  const { data, error } = await supabase.rpc('fn_top_tour_countries', { limit_n: limit });
  if (error) throw error;
  return data || [];
}
