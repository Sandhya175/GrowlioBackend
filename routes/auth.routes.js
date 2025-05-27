import { Router } from 'express';
import { login, signUp } from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import { loginSchema, signUpSchema } from '../validation/auth.schema.js';

const router = Router();

router.post('/signup', validate(signUpSchema), signUp);
router.post('/login', validate(loginSchema), login);

export default router;
