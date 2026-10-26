require('dotenv').config();
const mysql = require('mysql2/promise');

const mysqlPool = mysql.createPool({
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

console.log(`[DB] Connected to MySQL database: ${process.env.DB_NAME || 'new_cricket_db'} on ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);

// Enable PIPES_AS_CONCAT so standard SQL '||' string concatenation works in MySQL
mysqlPool.query("SET SESSION sql_mode = CONCAT(@@sql_mode, ',PIPES_AS_CONCAT')").catch((err) => {
  console.warn('[DB] Note setting sql_mode:', err.message);
});

// Generic query helper (supports direct SQL and CALL stored_procedures)
async function query(sql, params = []) {
  const isCall = sql.trim().toUpperCase().startsWith('CALL ');
  const [rows] = isCall 
    ? await mysqlPool.query(sql, params) 
    : await mysqlPool.execute(sql, params);

  // MySQL stored procedures return an array of result sets: [ [rows], OkPacket ]
  if (isCall && Array.isArray(rows) && Array.isArray(rows[0])) {
    return rows[0];
  }
  return rows;
}

// Get single row helper
async function get(sql, params = []) {
  const isCall = sql.trim().toUpperCase().startsWith('CALL ');
  const [rows] = isCall 
    ? await mysqlPool.query(sql, params) 
    : await mysqlPool.execute(sql, params);

  if (isCall && Array.isArray(rows) && Array.isArray(rows[0])) {
    return rows[0][0] || null;
  }
  return rows[0] || null;
}

// Execute insert/update/delete/proc execution helper
async function run(sql, params = []) {
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
  getDriver: () => 'mysql',
  mysqlPool,
  pool: mysqlPool
};
