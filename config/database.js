import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

dotenv.config();

const certPath = path.resolve(process.cwd(), 'certs', 'ca-certificate.crt');
if (!fs.existsSync(certPath)) {
  console.error('Certificate file not found at:', certPath);
  process.exit(1);
}

const ca = fs.readFileSync(certPath);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 25060,
  ssl: {
    ca: ca,
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 50, // Reduced to avoid hitting DigitalOcean limits
  queueLimit: 0,
  connectTimeout: 60000, // 60 seconds
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Connected to MySQL');
    connection.release();
  } catch (err) {
    console.error('MySQL connection failed:', err);
  }

  db.on('error', (err) => {
    console.error('MySQL pool error:', err);
  });
  db.on('connection', () => {
    console.log('New pool connection created');
  });
})();

export default db;