const mysql = require('mysql2/promise');

function buildPool() {
  const useSsl = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';

  if (process.env.MYSQL_URL) {
    return mysql.createPool({
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      ssl: useSsl
        ? {
            rejectUnauthorized: false
          }
        : undefined
    });
  }

  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'web_backend_lab',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    ssl: useSsl
      ? {
          rejectUnauthorized: false
        }
      : undefined
  });
}

const pool = global.__lab2_mysql_pool || buildPool();

if (!global.__lab2_mysql_pool) {
  global.__lab2_mysql_pool = pool;
}

module.exports = pool;
