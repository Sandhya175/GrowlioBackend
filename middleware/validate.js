import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// Validation middleware using Zod
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  req.body = result.data;
  next();
};

// JWT authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const [rows] = await db.query('SELECT * FROM tokens WHERE token = ?', [token]);
    if (rows.length === 0) return res.status(403).json({ error: 'Invalid token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded; // Payload has 'username'
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

export { validate, authenticateToken };