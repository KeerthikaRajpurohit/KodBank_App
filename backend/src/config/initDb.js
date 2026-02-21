import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const sslOpts = process.env.DB_SSL_CA
  ? { ca: fs.readFileSync(path.resolve(process.env.DB_SSL_CA)) }
  : { rejectUnauthorized: false };

async function initDb() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'defaultdb',
    ssl: sslOpts,
  });

  try {
    await conn.query(`
      CREATE DATABASE IF NOT EXISTS kodbank
    `);
    console.log('Database kodbank created or already exists.');

    await conn.changeUser({ database: 'kodbank' });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS KodUser (
        uid VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('customer') DEFAULT 'customer',
        balance DECIMAL(15,2) DEFAULT 100000.00
      )
    `);
    console.log('Table KodUser created or already exists.');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS UserToken (
        tid INT AUTO_INCREMENT PRIMARY KEY,
        token TEXT NOT NULL,
        uid VARCHAR(50) NOT NULL,
        expiry DATETIME NOT NULL,
        FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE,
        INDEX idx_uid (uid)
      )
    `);
    console.log('Table UserToken created or already exists.');
  } finally {
    await conn.end();
  }
}

initDb().catch((err) => {
  console.error('DB init failed:', err);
  process.exit(1);
});
