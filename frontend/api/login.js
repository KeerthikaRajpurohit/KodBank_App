import { getPool } from './_db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const COOKIE_MAX_AGE = 24 * 60 * 60; // seconds

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '24h' });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const pool = getPool();
    const [rows] = await pool.execute('SELECT uid, username, password, role FROM KodUser WHERE username = ?', [username]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = signToken({ sub: user.username, role: user.role });

    const decoded = jwt.decode(token);
    const expiry = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + COOKIE_MAX_AGE * 1000);

    await pool.execute('INSERT INTO UserToken (token, uid, expiry) VALUES (?, ?, ?)', [token, user.uid, expiry]);

    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
}
