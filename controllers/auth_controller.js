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

    const resetLink = `https://growlio-portfolio.vercel.app/reset-password?token=${token}`;
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

export const getDashboardData = async (req, res) => {
  const { member } = req.query; // Get member from query parameter

  if (!member) {
    return res.status(400).json({ error: 'Member parameter is required' });
  }

  try {
    // Mock data for demonstration; replace with actual database queries
    const mockData = {
      'Bankim Doshi': {
        overview: [
          { title: 'Total Value', value: '₹ 20,00,000', icon: 'fa-dollar-sign', iconColor: '[#3AC2B9]' },
          { title: 'Monthly Return', value: '₹ 46,820', icon: 'fa-money-bill-transfer', iconColor: '[#7A9CCB]' },
          { title: 'Active Instruments', value: '5', icon: 'fa-chart-bar', iconColor: '[#9B8FD1]' },
          { title: 'Risk Score', value: 'Moderate', iconColor: '[#B07A3A]', extra: '6.8/10' },
        ],
        transactions: [
          { asset: 'Bank (SBI Bank)', type: 'Fixed Deposit', amount: '20,000', date: 'Apr 15, 2025', status: 'COMPLETED' },
          { asset: 'Apple Inc', type: 'Stocks', amount: '+ 9,678', date: 'Apr 12, 2025', status: 'COMPLETED' },
        ]
      },
      // Add mock data for other members as needed
    };

    const data = mockData[member];
    if (!data) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Use ES module syntax: `export` instead of `exports`
export const updateMember = async (req, res) => {
    const { user_id, full_name, date_of_birth, gender, contact_number, email, aadhaar_number, pan_number, residential_address,
            stock_market_email, stock_market_login_id, stock_market_password, demat_account_no, trading_account_no,
            mutual_fund_email, mutual_fund_login_id, mutual_fund_password, mutual_fund_demat_account_no, mutual_fund_broker_name, mutual_fund_broker_code,
            bank_name, bank_account_number, bank_ifsc_code, bank_net_banking_email, bank_branch_name, bank_password,
            passport_no, passport_issuing_country, passport_date_of_issue, passport_date_of_expiry,
            driving_license_no, driving_license_issued_from, driving_license_date_of_issue, driving_license_date_of_expiry,
            voter_id_no, voter_id_state_of_issue, voter_id_date_of_issue,
            vehicle_type, vehicle_brand_name, vehicle_registration_no, vehicle_insurance_policy_no } = req.body;

    const passport_document = req.files?.passport_document ? req.files.passport_document[0].filename : null;
    const driving_license_document = req.files?.driving_license_document ? req.files.driving_license_document[0].filename : null;
    const voter_id_document = req.files?.voter_id_document ? req.files.voter_id_document[0].filename : null;
    const vehicle_document = req.files?.vehicle_document ? req.files.vehicle_document[0].filename : null;
    const profile_image = req.files?.profile_image ? req.files.profile_image[0].filename : null;

    try {
        const [existingMember] = await db.query('SELECT member_id FROM members WHERE user_id = ?', [user_id]);
        let member_id;

        if (existingMember.length > 0) {
            // Update existing member
            member_id = existingMember[0].member_id;
            await db.query(
                `UPDATE members SET 
                    full_name = ?, date_of_birth = ?, gender = ?, contact_number = ?, email = ?, aadhaar_number = ?, pan_number = ?, residential_address = ?,
                    stock_market_email = ?, stock_market_login_id = ?, stock_market_password = ?, demat_account_no = ?, trading_account_no = ?,
                    mutual_fund_email = ?, mutual_fund_login_id = ?, mutual_fund_password = ?, mutual_fund_demat_account_no = ?, mutual_fund_broker_name = ?, mutual_fund_broker_code = ?,
                    bank_name = ?, bank_account_number = ?, bank_ifsc_code = ?, bank_net_banking_email = ?, bank_branch_name = ?, bank_password = ?,
                    passport_no = ?, passport_issuing_country = ?, passport_date_of_issue = ?, passport_date_of_expiry = ?, passport_document = ?,
                    driving_license_no = ?, driving_license_issued_from = ?, driving_license_date_of_issue = ?, driving_license_date_of_expiry = ?, driving_license_document = ?,
                    voter_id_no = ?, voter_id_state_of_issue = ?, voter_id_date_of_issue = ?, voter_id_document = ?,
                    vehicle_type = ?, vehicle_brand_name = ?, vehicle_registration_no = ?, vehicle_insurance_policy_no = ?, vehicle_document = ?, profile_image = ?
                WHERE member_id = ?`,
                [
                    full_name, date_of_birth, gender, contact_number, email, aadhaar_number, pan_number, residential_address,
                    stock_market_email, stock_market_login_id, stock_market_password, demat_account_no, trading_account_no,
                    mutual_fund_email, mutual_fund_login_id, mutual_fund_password, mutual_fund_demat_account_no, mutual_fund_broker_name, mutual_fund_broker_code,
                    bank_name, bank_account_number, bank_ifsc_code, bank_net_banking_email, bank_branch_name, bank_password,
                    passport_no, passport_issuing_country, passport_date_of_issue, passport_date_of_expiry, passport_document,
                    driving_license_no, driving_license_issued_from, driving_license_date_of_issue, driving_license_date_of_expiry, driving_license_document,
                    voter_id_no, voter_id_state_of_issue, voter_id_date_of_issue, voter_id_document,
                    vehicle_type, vehicle_brand_name, vehicle_registration_no, vehicle_insurance_policy_no, vehicle_document, profile_image,
                    member_id
                ]
            );
        } else {
            // Create new member
            const [result] = await db.query(
                `INSERT INTO members (
                    user_id, full_name, date_of_birth, gender, contact_number, email, aadhaar_number, pan_number, residential_address,
                    stock_market_email, stock_market_login_id, stock_market_password, demat_account_no, trading_account_no,
                    mutual_fund_email, mutual_fund_login_id, mutual_fund_password, mutual_fund_demat_account_no, mutual_fund_broker_name, mutual_fund_broker_code,
                    bank_name, bank_account_number, bank_ifsc_code, bank_net_banking_email, bank_branch_name, bank_password,
                    passport_no, passport_issuing_country, passport_date_of_issue, passport_date_of_expiry, passport_document,
                    driving_license_no, driving_license_issued_from, driving_license_date_of_issue, driving_license_date_of_expiry, driving_license_document,
                    voter_id_no, voter_id_state_of_issue, voter_id_date_of_issue, voter_id_document,
                    vehicle_type, vehicle_brand_name, vehicle_registration_no, vehicle_insurance_policy_no, vehicle_document, profile_image
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id, full_name, date_of_birth, gender, contact_number, email, aadhaar_number, pan_number, residential_address,
                    stock_market_email, stock_market_login_id, stock_market_password, demat_account_no, trading_account_no,
                    mutual_fund_email, mutual_fund_login_id, mutual_fund_password, mutual_fund_demat_account_no, mutual_fund_broker_name, mutual_fund_broker_code,
                    bank_name, bank_account_number, bank_ifsc_code, bank_net_banking_email, bank_branch_name, bank_password,
                    passport_no, passport_issuing_country, passport_date_of_issue, passport_date_of_expiry, passport_document,
                    driving_license_no, driving_license_issued_from, driving_license_date_of_issue, driving_license_date_of_expiry, driving_license_document,
                    voter_id_no, voter_id_state_of_issue, voter_id_date_of_issue, voter_id_document,
                    vehicle_type, vehicle_brand_name, vehicle_registration_no, vehicle_insurance_policy_no, vehicle_document, profile_image
                ]
            );
            member_id = result.insertId;
        }

        res.status(200).json({ message: 'Member updated', member_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMemberByUser = async (req, res) => {
    const { user_id } = req.params;

    try {
        const [member] = await db.query('SELECT * FROM members WHERE user_id = ?', [user_id]);
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};