'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

function parseBool(v, defVal) {
  if (v === undefined || v === null || v === '') return defVal;
  const s = String(v).toLowerCase().trim();
  return s === '1' || s === 'true' || s === 'yes' || s === 'y';
}

(async () => {
  const useSsl = parseBool(process.env.DB_SSL, false);

  const conn = process.env.MYSQL_URL && String(process.env.MYSQL_URL).trim()
    ? await mysql.createConnection(String(process.env.MYSQL_URL).trim())
    : await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORDWORD,
        database: process.env.DB_NAME,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined
      });

  try {
    const [rows] = await conn.execute('SELECT id, name, age_months, price_uah FROM puppies ORDER BY id ASC LIMIT 5');
    console.log('[SELECT]', rows);

    const [insertRes] = await conn.execute(
      'INSERT INTO puppies (name, description, age_months, price_uah, photo_url) VALUES (?, ?, ?, ?, ?)',
      ['Demo Puppy', 'Inserted from mysql2 demo', 3, 1000.00, 'assets/images/puppy2.png']
    );
    const insertedId = insertRes.insertId;
    console.log('[INSERT] id=', insertedId);

    const [updateRes] = await conn.execute('UPDATE puppies SET price_uah = price_uah + 250 WHERE id = ?', [insertedId]);
    console.log('[UPDATE] affected=', updateRes.affectedRows);

    const [deleteRes] = await conn.execute('DELETE FROM puppies WHERE id = ?', [insertedId]);
    console.log('[DELETE] affected=', deleteRes.affectedRows);
  } finally {
    await conn.end();
  }
})();
