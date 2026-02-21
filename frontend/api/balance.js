import { getPool } from './_db.js';
import jwt from 'jsonwebtoken';

function getTokenFromHeaders(req) {
  const cookie = req.headers?.cookie || '';
  const pairs = cookie.split(';').map((c) => c.trim());
  for (const p of pairs) {
    if (p.startsWith('token=')) return p.slice('token='.length);
  }
  return null;
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const token = getTokenFromHeaders(req);
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

    let payload;
    try {
      payload = verifyToken(token);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const username = payload.sub;
    const pool = getPool();
    const [rows] = await pool.execute('SELECT balance FROM KodUser WHERE username = ?', [username]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const balance = parseFloat(rows[0].balance);
    return res.status(200).json({ success: true, balance });
  } catch (err) {
    console.error('Balance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch balance' });
  }
}
