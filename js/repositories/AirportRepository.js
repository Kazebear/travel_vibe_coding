import { query, queryOne } from '../database/database.js';

export function getAllAirports() {
  return query('SELECT * FROM airports ORDER BY country ASC, city ASC');
}

export function getAirportByCode(code) {
  return queryOne('SELECT * FROM airports WHERE code = ?', [code]);
}
