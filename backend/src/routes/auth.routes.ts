import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler((req, res) => authController.register(req, res)),
);
router.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler((req, res) => authController.login(req, res)),
);

export default router;
