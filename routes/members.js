import { Router } from 'express';
import { authenticateToken } from '../middleware/validate.js';
import { getDashboardData } from '../controllers/dashboard_controller.js';
import db from '../config/database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed'));
  },
});

// Save member details
router.post('/', authenticateToken, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'passportDocument', maxCount: 1 },
  { name: 'drivingLicenseDocument', maxCount: 1 },
  { name: 'voterIdDocument', maxCount: 1 },
  { name: 'insuranceDocument', maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      personalInfo,
      stockMarketInfo,
      mutualFundInfo,
      bankInfo,
      nationalIdentity,
      vehicleInfo,
    } = req.body;

    const parsedPersonalInfo = JSON.parse(personalInfo);
    const parsedStockMarketInfo = JSON.parse(stockMarketInfo);
    const parsedMutualFundInfo = JSON.parse(mutualFundInfo);
    const parsedBankInfo = JSON.parse(bankInfo);
    const parsedNationalIdentity = JSON.parse(nationalIdentity);
    const parsedVehicleInfo = JSON.parse(vehicleInfo);

    const memberData = {
      user_id: req.user.id,
      full_name: parsedPersonalInfo.fullName,
      date_of_birth: parsedPersonalInfo.dateOfBirth,
      gender: parsedPersonalInfo.gender,
      contact_number: parsedPersonalInfo.contactNumber,
      email: parsedPersonalInfo.email,
      aadhaar_number: parsedPersonalInfo.aadhaarNumber,
      pan_number: parsedPersonalInfo.panNumber,
      residential_address: parsedPersonalInfo.residentialAddress,
      stock_market_email: parsedStockMarketInfo.email,
      stock_market_login_id: parsedStockMarketInfo.loginId,
      stock_market_password: parsedStockMarketInfo.password,
      demat_account_no: parsedStockMarketInfo.dematAccountNo,
      trading_account_no: parsedStockMarketInfo.tradingAccountNo,
      mutual_fund_email: parsedMutualFundInfo.email,
      mutual_fund_login_id: parsedMutualFundInfo.loginId,
      mutual_fund_password: parsedMutualFundInfo.password,
      mutual_fund_demat_account_no: parsedMutualFundInfo.dematAccountNo,
      mutual_fund_broker_name: parsedMutualFundInfo.brokerName,
      mutual_fund_broker_code: parsedMutualFundInfo.brokerCode,
      bank_name: parsedBankInfo.bankName,
      bank_account_number: parsedBankInfo.accountNumber,
      bank_ifsc_code: parsedBankInfo.ifscCode,
      bank_net_banking_email: parsedBankInfo.netBankingEmail,
      bank_branch_name: parsedBankInfo.branchName,
      bank_password: parsedBankInfo.password,
      passport_no: parsedNationalIdentity.passport.passportNo,
      passport_issuing_country: parsedNationalIdentity.passport.issuingCountry,
      passport_date_of_issue: parsedNationalIdentity.passport.dateOfIssue,
      passport_date_of_expiry: parsedNationalIdentity.passport.dateOfExpiry,
      passport_document: req.files.passportDocument ? req.files.passportDocument[0].path : null,
      driving_license_no: parsedNationalIdentity.drivingLicense.licenseNo,
      driving_license_issued_from: parsedNationalIdentity.drivingLicense.issuedFrom,
      driving_license_date_of_issue: parsedNationalIdentity.drivingLicense.dateOfIssue,
      driving_license_date_of_expiry: parsedNationalIdentity.drivingLicense.dateOfExpiry,
      driving_license_document: req.files.drivingLicenseDocument ? req.files.drivingLicenseDocument[0].path : null,
      voter_id_no: parsedNationalIdentity.voterId.voterIdNo,
      voter_id_state_of_issue: parsedNationalIdentity.voterId.stateOfIssue,
      voter_id_date_of_issue: parsedNationalIdentity.voterId.dateOfIssue,
      voter_id_document: req.files.voterIdDocument ? req.files.voterIdDocument[0].path : null,
      vehicle_type: parsedVehicleInfo.vehicleType,
      vehicle_brand_name: parsedVehicleInfo.brandName,
      vehicle_registration_no: parsedVehicleInfo.registrationNo,
      vehicle_insurance_policy_no: parsedVehicleInfo.insurancePolicyNo,
      vehicle_document: req.files.insuranceDocument ? req.files.insuranceDocument[0].path : null,
      profile_image: req.files.profileImage ? req.files.profileImage[0].path : null,
    };

    await db.execute(
      `INSERT INTO members (
        user_id, full_name, date_of_birth, gender, contact_number, email, aadhaar_number, pan_number, residential_address,
        stock_market_email, stock_market_login_id, stock_market_password, demat_account_no, trading_account_no,
        mutual_fund_email, mutual_fund_login_id, mutual_fund_password, mutual_fund_demat_account_no, mutual_fund_broker_name, mutual_fund_broker_code,
        bank_name, bank_account_number, bank_ifsc_code, bank_net_banking_email, bank_branch_name, bank_password,
        passport_no, passport_issuing_country, passport_date_of_issue, passport_date_of_expiry, passport_document,
        driving_license_no, driving_license_issued_from, driving_license_date_of_issue, driving_license_date_of_expiry, driving_license_document,
        voter_id_no, voter_id_state_of_issue, voter_id_date_of_issue, voter_id_document,
        vehicle_type, vehicle_brand_name, vehicle_registration_no, vehicle_insurance_policy_no, vehicle_document, profile_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        memberData.user_id, memberData.full_name, memberData.date_of_birth, memberData.gender, memberData.contact_number,
        memberData.email, memberData.aadhaar_number, memberData.pan_number, memberData.residential_address, vehicle_document, memberData.profile_image
      ]
    );

    res.json({ message: 'Member details saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get member details
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM members WHERE user_id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard route
router.get('/dashboard', authenticateToken, getDashboardData);

export default router;