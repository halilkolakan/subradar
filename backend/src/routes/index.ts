import { Router } from 'express';
import authRoutes from './auth.routes';
import subscriptionRoutes from './subscription.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});
router.use('/auth', authRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;
