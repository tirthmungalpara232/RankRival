const path = require('path');
require('dotenv').config();

let sqliteDb = null;
let mysqlPool = null;
let activeDriver = 'sqlite';

const isMySQL = (process.env.DB_CLIENT || '').toLowerCase() === 'mysql';

if (isMySQL) {
  try {
    const mysql = require('mysql2/promise');
    mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'new_cricket_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true
    });
    activeDriver = 'mysql';
    console.log(`[DB] Connected directly to XAMPP MySQL database: ${process.env.DB_NAME || 'cricket_db'} on ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);

    // Enable PIPES_AS_CONCAT so standard SQL '||' string concatenation works in MySQL
    mysqlPool.query("SET SESSION sql_mode = CONCAT(@@sql_mode, ',PIPES_AS_CONCAT')").catch(() => {});
  } catch (err) {
    console.warn('[DB] MySQL configuration failed:', err.message);
  }
}

// Fallback to SQLite only if MySQL is not selected or failed
if (activeDriver !== 'mysql') {
  try {
    const Database = require('better-sqlite3');
    const DB_FILE_PATH = path.join(__dirname, 'cricket_db.sqlite');
    sqliteDb = new Database(DB_FILE_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
    activeDriver = 'sqlite';
    console.log(`[DB] Connected to SQLite database: ${DB_FILE_PATH}`);
  } catch (err) {
    console.error('[DB] SQLite initialization note:', err.message);
  }
}

// Generic query helper (supports direct SQL and CALL stored_procedures)
async function query(sql, params = []) {
  if (activeDriver === 'mysql' && mysqlPool) {
    try {
      const isCall = sql.trim().toUpperCase().startsWith('CALL ');
      const [rows] = isCall 
        ? await mysqlPool.query(sql, params) 
        : await mysqlPool.execute(sql, params);

      // MySQL stored procedures return an array of result sets: [ [rows], OkPacket ]
      if (isCall && Array.isArray(rows) && Array.isArray(rows[0])) {
        return rows[0];
      }
      return rows;
    } catch (err) {
      if (sqliteDb) {
        console.warn('[DB MySQL Error, fallback to SQLite]:', err.message);
      } else {
        throw err;
      }
    }
  }
  
  if (!sqliteDb) {
    throw new Error('Database connection not available.');
  }

  const stmt = sqliteDb.prepare(sql);
  return stmt.all(...params);
}

// Get single row helper
async function get(sql, params = []) {
  if (activeDriver === 'mysql' && mysqlPool) {
    try {
      const isCall = sql.trim().toUpperCase().startsWith('CALL ');
      const [rows] = isCall 
        ? await mysqlPool.query(sql, params) 
        : await mysqlPool.execute(sql, params);

      if (isCall && Array.isArray(rows) && Array.isArray(rows[0])) {
        return rows[0][0] || null;
      }
      return rows[0] || null;
    } catch (err) {
      if (sqliteDb) {
        console.warn('[DB MySQL Error, fallback to SQLite]:', err.message);
      } else {
        throw err;
      }
    }
  }

  if (!sqliteDb) {
    throw new Error('Database connection not available.');
  }

  const stmt = sqliteDb.prepare(sql);
  return stmt.get(...params) || null;
}

// Execute insert/update/delete/proc execution helper
async function run(sql, params = []) {
  if (activeDriver === 'mysql' && mysqlPool) {
    try {
      const isCall = sql.trim().toUpperCase().startsWith('CALL ');
      const [result] = isCall 
        ? await mysqlPool.query(sql, params) 
        : await mysqlPool.execute(sql, params);

      let lastInsertRowid = 0;
      let changes = 0;

      if (isCall && Array.isArray(result) && Array.isArray(result[0]) && result[0][0]) {
        const first = result[0][0];
        lastInsertRowid = first.insert_id || first.player_id || first.user_id || first.match_id || first.tournament_id || first.earning_id || first.lastInsertRowid || 0;
      }

      if (result && result.insertId) {
        lastInsertRowid = result.insertId;
      }
      if (result && result.affectedRows !== undefined) {
        changes = result.affectedRows;
      }

      return {
        lastInsertRowid,
        changes,
        raw: result
      };
    } catch (err) {
      if (sqliteDb) {
        console.warn('[DB MySQL Error, fallback to SQLite]:', err.message);
      } else {
        throw err;
      }
    }
  }

  if (!sqliteDb) {
    throw new Error('Database connection not available.');
  }

  const stmt = sqliteDb.prepare(sql);
  const result = stmt.run(...params);
  return {
    lastInsertRowid: result.lastInsertRowid,
    changes: result.changes
  };
}

// Stored procedure helpers
async function call(procName, params = []) {
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${procName}(${placeholders})`;
  return await query(sql, params);
}

async function callSingle(procName, params = []) {
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${procName}(${placeholders})`;
  return await get(sql, params);
}

module.exports = {
  query,
  get,
  run,
  call,
  callSingle,
  getDriver: () => activeDriver,
  sqliteDb,
  mysqlPool
};
