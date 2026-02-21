import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';

const router = Router();
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { uid, username, password, email, phone } = req.body;
    const role = 'customer';

    if (!uid || !username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'uid, username, password, and email are required',
      });
    }

    const hashedPassword = await hashPassword(password);

    await pool.execute(
      `INSERT INTO KodUser (uid, username, password, email, phone, role, balance)
       VALUES (?, ?, ?, ?, ?, ?, 100000.00)`,
      [uid, username, hashedPassword, email, phone || null, role]
    );

    return res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'User ID or username already exists',
      });
    }
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  let user;
  let token;

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const [rows] = await pool.execute(
      'SELECT uid, username, password, role FROM KodUser WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    user = rows[0];
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    token = signToken({
      sub: user.username,
      role: user.role,
    });

    const decoded = jwt.decode(token);
    const expiry = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + COOKIE_MAX_AGE);

    await pool.execute(
      'INSERT INTO UserToken (token, uid, expiry) VALUES (?, ?, ?)',
      [token, user.uid, expiry]
    );
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });

  return res.status(200).json({ success: true });
});

export default router;
