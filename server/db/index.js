const path = require('path');
const fs = require('fs');

let db = null;
let isPg = false;

if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  const isLocalDb = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalDb ? false : { rejectUnauthorized: false }
  });
  isPg = true;
  db = pool;
  console.log('[DB] Connected to PostgreSQL via DATABASE_URL');
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'nagadatta.sqlite');
  db = new sqlite3.Database(dbPath);
  console.log(`[DB] Connected to local SQLite database at ${dbPath}`);
}

// Unified Query Wrappers
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPg) {
      let finalSql = sql;
      const isInsert = /^\s*INSERT\s+INTO/i.test(sql);
      const hasReturning = /RETURNING/i.test(sql);
      const isShopSettings = /INSERT\s+INTO\s+shop_settings/i.test(sql);
      if (isInsert && !hasReturning && !isShopSettings) {
        finalSql += ' RETURNING id';
      }

      let paramCount = 1;
      const pgSql = finalSql.replace(/\?/g, () => `$${paramCount++}`);
      db.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve({ lastID: res.rows[0]?.id || null, changes: res.rowCount });
      });
    } else {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPg) {
      let paramCount = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramCount++}`);
      db.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows[0] || null);
      });
    } else {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    }
  });
}

function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPg) {
      let paramCount = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramCount++}`);
      db.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows || []);
      });
    } else {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    }
  });
}

module.exports = {
  db,
  isPg,
  runQuery,
  getOne,
  getAll
};
