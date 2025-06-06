import { Router } from 'express';
import { login, signUp, forgotPassword, resetPassword, updateMember, getMemberByUser } from '../controllers/auth_controller.js';
import { createNominee, createGuardian, getNomineesByMember } from '../controllers/nominee.controller.js';
import { createInsuranceInfo, getInsuranceInfoByMember } from '../controllers/insurance.controller.js';
import { createBusinessEntity, createStakeholder, getBusinessEntityByUser } from '../controllers/businessEntity.controller.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/auth_schema.js';
import * as authController from '../controllers/auth_controller.js';
import upload from '../utils/fileUpload.js';
import { verifyToken } from '../middleware/auth.js'; // Add this import


const router = Router();

// Auth Routes
router.post('/signup', validate(signUpSchema), signUp);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Note: The original code had a logout route, but no logout function was provided in auth.controller.js.
// If you have a logout function, you can uncomment and add validation as needed.
// router.post('/logout', authController.logout);

// Dashboard route (you may need to implement this in auth.controller.js if not already present)
router.get('/dashboard', verifyToken, authController.getDashboardData); // Add verifyToken middleware
// Member Routes
router.post('/member', upload.fields([
    { name: 'passport_document', maxCount: 1 },
    { name: 'driving_license_document', maxCount: 1 },
    { name: 'voter_id_document', maxCount: 1 },
    { name: 'vehicle_document', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 }
]), updateMember);
router.get('/member/:user_id', getMemberByUser);

// Nominee Routes
router.post('/nominee', createNominee);
router.post('/guardian', createGuardian);
router.get('/nominees/:member_id', getNomineesByMember);

// Insurance Routes
router.post('/insurance', createInsuranceInfo);
router.get('/insurance/:member_id', getInsuranceInfoByMember);

// Business Entity Routes
router.post('/business-entity', upload.fields([
    { name: 'company_document', maxCount: 1 },
    { name: 'license_document', maxCount: 1 },
    { name: 'software_license_document', maxCount: 1 },
    { name: 'pan_document', maxCount: 1 },
    { name: 'partnership_deed_document', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 }
]), createBusinessEntity);
router.post('/stakeholder', upload.single('id_proof_document'), createStakeholder);
router.get('/business-entity/:user_id', getBusinessEntityByUser);

// Debug log middleware
router.use((req, res, next) => {
  console.log(`Auth route hit: ${req.method} ${req.url}`);
  next();
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;