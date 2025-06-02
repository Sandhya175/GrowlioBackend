import { Router } from 'express';
import { login, signUp, forgotPassword, resetPassword } from '../controllers/auth_controller.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/auth_schema.js';

const router = Router();

router.post('/signup', validate(signUpSchema), signUp);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Add debug log
router.use((req, res, next) => {
  console.log(`Auth route hit: ${req.method} ${req.url}`);
  next();
});

export default router;