import mysql from 'mysql2/promise';

let pool;

function getSslOptions() {
  if (process.env.DB_SSL_CA) {
    try {
      // DB_SSL_CA expected to be base64-encoded certificate string
      const ca = Buffer.from(process.env.DB_SSL_CA, 'base64');
      return { ca };
    } catch (e) {
      console.error('Failed to parse DB_SSL_CA; falling back to insecure:', e);
      return { rejectUnauthorized: false };
    }
  }
  return { rejectUnauthorized: false };
}

export function getPool() {
  if (pool) return pool;

  const ssl = getSslOptions();

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'kodbank',
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}
