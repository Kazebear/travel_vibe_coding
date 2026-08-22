import { query, queryOne } from '../database/database.js';

export function getAllAirlines() {
  return query('SELECT * FROM airlines WHERE active = 1 ORDER BY name ASC');
}

export function getAirlineById(id) {
  return queryOne('SELECT * FROM airlines WHERE id = ?', [id]);
}

export function getAirlineByCode(code) {
  return queryOne('SELECT * FROM airlines WHERE code = ?', [code]);
}
