import { createSchema } from './schema.js';
import { seedDatabase } from './seed.js';

const STORAGE_KEY = 'travelviet_sqlite_db_v1';
const SQL_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';

let SQL = null;
let db = null;
let ready = null;

function uint8ToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToUint8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function persist() {
  if (!db) return;
  const data = db.export();
  localStorage.setItem(STORAGE_KEY, uint8ToBase64(data));
}

export async function initDatabase() {
  if (ready) return ready;

  ready = (async () => {
    SQL = await window.initSqlJs({ locateFile: (file) => SQL_CDN + file });

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        db = new SQL.Database(base64ToUint8(saved));
        return db;
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    db = new SQL.Database();
    createSchema(db);
    await seedDatabase(db);
    persist();
    return db;
  })();

  return ready;
}

export function getDb() {
  if (!db) throw new Error('Database chưa được khởi tạo.');
  return db;
}

export function query(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows.length ? rows[0] : null;
}

export function run(sql, params = []) {
  getDb().run(sql, params);
  persist();
}

export function insert(sql, params = []) {
  getDb().run(sql, params);
  const row = queryOne('SELECT last_insert_rowid() AS id');
  persist();
  return row ? row.id : null;
}

export async function resetDatabase() {
  localStorage.removeItem(STORAGE_KEY);
  db = null;
  ready = null;
  await initDatabase();
}
