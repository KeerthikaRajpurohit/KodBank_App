import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRY = process.env.JWT_EXPIRY || '24h';

export function signToken(payload) {
  return jwt.sign(
    payload,
    SECRET,
    { algorithm: 'HS256', expiresIn: EXPIRY }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET, { algorithms: ['HS256'] });
}
