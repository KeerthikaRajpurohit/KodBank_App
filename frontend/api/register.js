import { getPool } from './_db.js';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { uid, username, password, email, phone } = req.body || {};
    const role = 'customer';

    if (!uid || !username || !password || !email) {
      return res.status(400).json({ success: false, message: 'uid, username, password, and email are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pool = getPool();
    await pool.execute(
      `INSERT INTO KodUser (uid, username, password, email, phone, role, balance)
       VALUES (?, ?, ?, ?, ?, ?, 100000.00)`,
      [uid, username, hashedPassword, email, phone || null, role]
    );

    return res.status(201).json({ success: true });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'User ID or username already exists' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
}
