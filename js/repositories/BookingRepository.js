import { query, queryOne, insert } from '../database/database.js';

export function createBooking(data) {
  return insert(
    `INSERT INTO bookings (booking_code, user_id, customer_name, customer_email, customer_phone, country, address, total_amount, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
    [
      data.booking_code, data.user_id || null, data.customer_name, data.customer_email,
      data.customer_phone || '', data.country || '', data.address || '',
      data.total_amount, new Date().toISOString(),
    ]
  );
}

export function addBookingFlight(bookingId, flightId, fareClass, price) {
  insert(
    `INSERT INTO booking_flights (booking_id, flight_id, fare_class, quantity, price) VALUES (?, ?, ?, 1, ?)`,
    [bookingId, flightId, fareClass, price]
  );
}

export function addBookingTour(bookingId, tourId, price) {
  insert(
    `INSERT INTO booking_tours (booking_id, tour_id, quantity, price) VALUES (?, ?, 1, ?)`,
    [bookingId, tourId, price]
  );
}

export function getBookingByCode(code) {
  return queryOne('SELECT * FROM bookings WHERE booking_code = ?', [code]);
}

/* ===== Dashboard aggregates ===== */

export function getMonthlyTourCount() {
  const row = queryOne(
    `SELECT COUNT(*) AS count FROM tours WHERE strftime('%Y-%m', departure_date) = strftime('%Y-%m','now')`
  );
  return row ? row.count : 0;
}

export function getFlightCount() {
  return queryOne('SELECT COUNT(*) AS count FROM flights').count;
}

export function getTourCustomerCount() {
  const row = queryOne('SELECT COUNT(DISTINCT booking_id) AS count FROM booking_tours');
  return row ? row.count : 0;
}

export function getFlightCustomerCount() {
  const row = queryOne('SELECT COUNT(DISTINCT booking_id) AS count FROM booking_flights');
  return row ? row.count : 0;
}

export function getTopAirlines(limit = 10) {
  return query(
    `SELECT al.name AS airline, COUNT(bf.id) AS bookings
     FROM booking_flights bf
     JOIN flights f ON f.id = bf.flight_id
     JOIN airlines al ON al.id = f.airline_id
     GROUP BY al.id
     ORDER BY bookings DESC
     LIMIT ?`,
    [limit]
  );
}

export function getTopTourCountries(limit = 10) {
  return query(
    `SELECT t.country AS country, COUNT(DISTINCT t.id) AS tour_count, COUNT(bt.id) AS customer_count
     FROM booking_tours bt
     JOIN tours t ON t.id = bt.tour_id
     GROUP BY t.country
     ORDER BY customer_count DESC
     LIMIT ?`,
    [limit]
  );
}
