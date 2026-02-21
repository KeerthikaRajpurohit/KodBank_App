import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const username = req.user.sub;

    const [rows] = await pool.execute(
      'SELECT balance FROM KodUser WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const balance = parseFloat(rows[0].balance);
    return res.status(200).json({ success: true, balance });
  } catch (err) {
    console.error('Balance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch balance' });
  }
});

export default router;
