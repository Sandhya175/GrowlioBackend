import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // For generating random tokens
import db from '../config/database.js';
import { sendEmail } from '../utils/sendEmail.js';

const SECRET = process.env.JWT_SECRET || 'secretkey';

export const signUp = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashed]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, username, email }, SECRET, { expiresIn: '7d' });

    await db.execute(
      'INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [userId, token]
    );

    res.status(201).json({ message: 'User created successfully', token, username, user_id: userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    );

    const user = rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '7d' }
    );

    await db.execute(
      'INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [user.id, token]
    );

    res.json({ token, username: user.username, user_id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await db.execute(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expires_at = ?',
      [email, token, expiresAt, token, expiresAt]
    );

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    const emailText = `Hello,\n\nYou requested a password reset for your Growlio account. Click the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.\n\nBest,\nGrowlio Team`;

    await sendEmail(email, 'Password Reset Request - Growlio', emailText);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const [resetRows] = await db.execute(
      'SELECT * FROM password_resets WHERE token = ?',
      [token]
    );

    if (resetRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const resetRequest = resetRows[0];
    if (new Date() > new Date(resetRequest.expires_at)) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, resetRequest.email]
    );

    await db.execute('DELETE FROM password_resets WHERE email = ?', [resetRequest.email]);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};