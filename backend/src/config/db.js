import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const sslOpts = process.env.DB_SSL_CA
  ? { ca: fs.readFileSync(path.resolve(process.env.DB_SSL_CA)) }
  : { rejectUnauthorized: false };

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'kodbank',
  ssl: sslOpts,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
