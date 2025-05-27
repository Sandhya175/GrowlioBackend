// routes/members.js
const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const auth = require('../middleware/auth'); // Assuming you have auth middleware
const multer = require('multer');
const path = require('path');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
router.post('/', auth, upload.fields([
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

    const memberData = {
      userId: req.user.id, // From auth middleware
      personalInfo: JSON.parse(personalInfo),
      stockMarketInfo: JSON.parse(stockMarketInfo),
      mutualFundInfo: JSON.parse(mutualFundInfo),
      bankInfo: JSON.parse(bankInfo),
      nationalIdentity: JSON.parse(nationalIdentity),
      vehicleInfo: JSON.parse(vehicleInfo),
      profileImage: req.files.profileImage ? req.files.profileImage[0].path : null,
      nationalIdentity: {
        passport: {
          ...JSON.parse(nationalIdentity).passport,
          document: req.files.passportDocument ? req.files.passportDocument[0].path : null,
        },
        drivingLicense: {
          ...JSON.parse(nationalIdentity).drivingLicense,
          document: req.files.drivingLicenseDocument ? req.files.drivingLicenseDocument[0].path : null,
        },
        voterId: {
          ...JSON.parse(nationalIdentity).voterId,
          document: req.files.voterIdDocument ? req.files.voterIdDocument[0].path : null,
        },
      },
      vehicleInfo: {
        ...JSON.parse(vehicleInfo),
        document: req.files.insuranceDocument ? req.files.insuranceDocument[0].path : null,
      },
    };

    const member = new Member(memberData);
    await member.save();
    res.json({ message: 'Member details saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get member details
router.get('/', auth, async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user.id });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;