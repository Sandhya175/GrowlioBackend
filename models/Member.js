// models/Member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personalInfo: {
    fullName: String,
    dateOfBirth: Date,
    gender: String,
    contactNumber: String,
    email: String,
    aadhaarNumber: String,
    panNumber: String,
    residentialAddress: String,
  },
  stockMarketInfo: {
    email: String,
    loginId: String,
    password: String,
    dematAccountNo: String,
    tradingAccountNo: String,
  },
  mutualFundInfo: {
    email: String,
    loginId: String,
    password: String,
    dematAccountNo: String,
    brokerName: String,
    brokerCode: String,
  },
  bankInfo: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    netBankingEmail: String,
    branchName: String,
    password: String,
  },
  nationalIdentity: {
    passport: {
      passportNo: String,
      issuingCountry: String,
      dateOfIssue: Date,
      dateOfExpiry: Date,
      document: String, // Store file path or URL
    },
    drivingLicense: {
      licenseNo: String,
      issuedFrom: String,
      dateOfIssue: Date,
      dateOfExpiry: Date,
      document: String,
    },
    voterId: {
      voterIdNo: String,
      stateOfIssue: String,
      dateOfIssue: Date,
      document: String,
    },
  },
  vehicleInfo: {
    vehicleType: String,
    brandName: String,
    registrationNo: String,
    insurancePolicyNo: String,
    document: String,
  },
  profileImage: String,
});

module.exports = mongoose.model('Member', memberSchema);