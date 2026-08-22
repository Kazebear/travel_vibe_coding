import { query, queryOne, insert, run } from '../database/database.js';

const BASE_SELECT = `
  SELECT f.*,
    al.code AS airline_code, al.name AS airline_name, al.logo AS airline_logo,
    oa.code AS origin_code, oa.city AS origin_city, oa.name AS origin_name,
    da.code AS destination_code, da.city AS destination_city, da.name AS destination_name
  FROM flights f
  JOIN airlines al ON al.id = f.airline_id
  JOIN airports oa ON oa.id = f.origin_airport_id
  JOIN airports da ON da.id = f.destination_airport_id
`;

export function getFlightById(id) {
  return queryOne(`${BASE_SELECT} WHERE f.id = ?`, [id]);
}

export function searchFlights(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.origin) {
    clauses.push('oa.code = ?');
    params.push(filters.origin);
  }
  if (filters.destination) {
    clauses.push('da.code = ?');
    params.push(filters.destination);
  }
  if (filters.date) {
    clauses.push('f.departure_date >= ?');
    params.push(filters.date);
  }
  if (filters.airlineIds && filters.airlineIds.length) {
    clauses.push(`f.airline_id IN (${filters.airlineIds.map(() => '?').join(',')})`);
    params.push(...filters.airlineIds);
  }
  if (filters.tripTypes && filters.tripTypes.length) {
    clauses.push(`f.trip_type IN (${filters.tripTypes.map(() => '?').join(',')})`);
    params.push(...filters.tripTypes);
  }
  if (filters.stopsMode === 'direct') {
    clauses.push('f.stops = 0');
  } else if (filters.stopsMode === 'multi-city') {
    clauses.push(`(f.trip_type = 'multi-city' OR f.stops > 0)`);
  }
  if (filters.timeSlots && filters.timeSlots.length) {
    const slotClauses = filters.timeSlots.map(() => `(CAST(substr(f.departure_time,1,2) AS INTEGER) >= ? AND CAST(substr(f.departure_time,1,2) AS INTEGER) < ?)`);
    clauses.push(`(${slotClauses.join(' OR ')})`);
    filters.timeSlots.forEach((s) => params.push(s.from, s.to));
  }

  let sql = BASE_SELECT;
  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');

  const priceField = filters.fareClass === 'business' ? 'f.business_price' : 'f.economy_price';
  if (filters.sort === 'price_asc') sql += ` ORDER BY ${priceField} ASC`;
  else if (filters.sort === 'price_desc') sql += ` ORDER BY ${priceField} DESC`;
  else sql += ' ORDER BY f.departure_date ASC, f.departure_time ASC';

  return query(sql, params);
}

export function countFlights() {
  return queryOne('SELECT COUNT(*) as count FROM flights').count;
}

export function getFlightsPage(page, pageSize) {
  const offset = (page - 1) * pageSize;
  return query(`${BASE_SELECT} ORDER BY f.id DESC LIMIT ? OFFSET ?`, [pageSize, offset]);
}

export function createFlight(data) {
  return insert(
    `INSERT INTO flights (flight_number, airline_id, origin_airport_id, destination_airport_id, departure_date, departure_time, arrival_time, duration_minutes, trip_type, stops, aircraft, economy_price, business_price, services, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.flight_number, data.airline_id, data.origin_airport_id, data.destination_airport_id,
      data.departure_date, data.departure_time, data.arrival_time, data.duration_minutes,
      data.trip_type, data.stops, data.aircraft, data.economy_price, data.business_price,
      data.services, data.status || 'available',
    ]
  );
}

export function updateFlightStatus(id, status) {
  run('UPDATE flights SET status = ? WHERE id = ?', [status, id]);
}

export function updateFlight(id, data) {
  run(
    `UPDATE flights SET flight_number = ?, airline_id = ?, origin_airport_id = ?, destination_airport_id = ?,
      departure_date = ?, departure_time = ?, arrival_time = ?, duration_minutes = ?, trip_type = ?,
      stops = ?, aircraft = ?, economy_price = ?, business_price = ?, services = ?, status = ?
     WHERE id = ?`,
    [
      data.flight_number, data.airline_id, data.origin_airport_id, data.destination_airport_id,
      data.departure_date, data.departure_time, data.arrival_time, data.duration_minutes,
      data.trip_type, data.stops, data.aircraft, data.economy_price, data.business_price,
      data.services, data.status || 'available', id,
    ]
  );
}

export function deleteFlight(id) {
  run('DELETE FROM flights WHERE id = ?', [id]);
}
