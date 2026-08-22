import { query, queryOne, insert, run } from '../database/database.js';

const BASE_SELECT = `
  SELECT t.*, al.name AS airline_name, al.code AS airline_code
  FROM tours t
  LEFT JOIN airlines al ON al.id = t.airline_id
`;

export function getTourById(id) {
  return queryOne(`${BASE_SELECT} WHERE t.id = ?`, [id]);
}

export function getFeaturedTours(limit = 8) {
  return query(`${BASE_SELECT} WHERE t.featured = 1 ORDER BY t.id ASC LIMIT ?`, [limit]);
}

export function getTourItinerary(tourId) {
  return query('SELECT * FROM tour_itineraries WHERE tour_id = ? ORDER BY day_number ASC', [tourId]);
}

export function searchTours(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.destination) {
    clauses.push('(t.destination LIKE ? OR t.country LIKE ?)');
    params.push(`%${filters.destination}%`, `%${filters.destination}%`);
  }
  if (filters.country) {
    clauses.push('t.country = ?');
    params.push(filters.country);
  }
  if (filters.operator) {
    clauses.push('t.operator = ?');
    params.push(filters.operator);
  }
  if (filters.airlineIds && filters.airlineIds.length) {
    clauses.push(`t.airline_id IN (${filters.airlineIds.map(() => '?').join(',')})`);
    params.push(...filters.airlineIds);
  }
  if (filters.days) {
    clauses.push('t.days = ?');
    params.push(filters.days);
  }
  if (filters.timeSlots && filters.timeSlots.length) {
    const slotClauses = filters.timeSlots.map(() => `(CAST(substr(t.departure_time,1,2) AS INTEGER) >= ? AND CAST(substr(t.departure_time,1,2) AS INTEGER) < ?)`);
    clauses.push(`(${slotClauses.join(' OR ')})`);
    filters.timeSlots.forEach((s) => params.push(s.from, s.to));
  }

  let sql = BASE_SELECT;
  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');

  if (filters.sort === 'price_asc') sql += ' ORDER BY t.price ASC';
  else if (filters.sort === 'price_desc') sql += ' ORDER BY t.price DESC';
  else sql += ' ORDER BY t.departure_date ASC';

  return query(sql, params);
}

export function countTours() {
  return queryOne('SELECT COUNT(*) as count FROM tours').count;
}

export function getToursPage(page, pageSize) {
  const offset = (page - 1) * pageSize;
  return query(`${BASE_SELECT} ORDER BY t.id DESC LIMIT ? OFFSET ?`, [pageSize, offset]);
}

export function getDistinctOperators() {
  return query('SELECT DISTINCT operator FROM tours ORDER BY operator ASC').map((r) => r.operator);
}

export function createTour(data, itineraryDays) {
  const tourId = insert(
    `INSERT INTO tours (code, name, operator, origin, destination, country, departure_date, departure_time, days, nights, airline_id, aircraft, price, thumbnail, description, included_services, excluded_services, status, featured, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code, data.name, data.operator, data.origin, data.destination, data.country,
      data.departure_date, data.departure_time, data.days, data.nights, data.airline_id || null,
      data.aircraft || null, data.price, data.thumbnail, data.description,
      data.included_services, data.excluded_services, data.status || 'available',
      data.featured ? 1 : 0, new Date().toISOString(),
    ]
  );

  (itineraryDays || []).forEach((day) => {
    insert(
      `INSERT INTO tour_itineraries (tour_id, day_number, title, description, meals, accommodation) VALUES (?, ?, ?, ?, ?, ?)`,
      [tourId, day.day_number, day.title, day.description, day.meals || '', day.accommodation || '']
    );
  });

  return tourId;
}

export function updateTourStatus(id, status) {
  run('UPDATE tours SET status = ? WHERE id = ?', [status, id]);
}

export function updateTour(id, data, itineraryDays) {
  run(
    `UPDATE tours SET code = ?, name = ?, operator = ?, origin = ?, destination = ?, country = ?,
      departure_date = ?, departure_time = ?, days = ?, nights = ?, airline_id = ?, aircraft = ?,
      price = ?, thumbnail = ?, description = ?, included_services = ?, excluded_services = ?,
      status = ?, featured = ?
     WHERE id = ?`,
    [
      data.code, data.name, data.operator, data.origin, data.destination, data.country,
      data.departure_date, data.departure_time, data.days, data.nights, data.airline_id || null,
      data.aircraft || null, data.price, data.thumbnail, data.description,
      data.included_services, data.excluded_services, data.status || 'available',
      data.featured ? 1 : 0, id,
    ]
  );

  run('DELETE FROM tour_itineraries WHERE tour_id = ?', [id]);
  (itineraryDays || []).forEach((day) => {
    insert(
      `INSERT INTO tour_itineraries (tour_id, day_number, title, description, meals, accommodation) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, day.day_number, day.title, day.description, day.meals || '', day.accommodation || '']
    );
  });
}

export function deleteTour(id) {
  run('DELETE FROM tour_itineraries WHERE tour_id = ?', [id]);
  run('DELETE FROM tours WHERE id = ?', [id]);
}
