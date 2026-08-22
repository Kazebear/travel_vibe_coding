import { query, queryOne, insert, run } from '../database/database.js';

export function getUserByEmail(email) {
  return queryOne('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase()]);
}

export function getUserByUsername(username) {
  return queryOne('SELECT * FROM users WHERE username = ?', [username]);
}

export function getUserById(id) {
  return queryOne('SELECT * FROM users WHERE id = ?', [id]);
}

export function createUser(data) {
  return insert(
    `INSERT INTO users (username, email, password_hash, role, full_name, phone, country, address, avatar, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.username, String(data.email).toLowerCase(), data.password_hash, data.role || 'user',
      data.full_name || '', data.phone || '', data.country || '', data.address || '',
      data.avatar || '', new Date().toISOString(),
    ]
  );
}

export function updateUser(id, data) {
  run(
    `UPDATE users SET full_name = ?, phone = ?, country = ?, address = ?, avatar = ?, updated_at = ? WHERE id = ?`,
    [data.full_name || '', data.phone || '', data.country || '', data.address || '', data.avatar || '', new Date().toISOString(), id]
  );
}
