import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createSubscriptionSchema,
  querySubscriptionSchema,
  subscriptionIdParamSchema,
  upcomingQuerySchema,
  updateSubscriptionSchema,
} from '../schemas/subscription.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate({ body: createSubscriptionSchema }),
  asyncHandler((req, res) => subscriptionController.create(req, res)),
);
router.get(
  '/',
  validate({ query: querySubscriptionSchema }),
  asyncHandler((req, res) => subscriptionController.getAll(req, res)),
);
router.get(
  '/summary',
  asyncHandler((req, res) => subscriptionController.getSummary(req, res)),
);
router.get(
  '/upcoming',
  validate({ query: upcomingQuerySchema }),
  asyncHandler((req, res) => subscriptionController.getUpcoming(req, res)),
);
router.get(
  '/:id',
  validate({ params: subscriptionIdParamSchema }),
  asyncHandler((req, res) => subscriptionController.getById(req, res)),
);
router.patch(
  '/:id',
  validate({ params: subscriptionIdParamSchema, body: updateSubscriptionSchema }),
  asyncHandler((req, res) => subscriptionController.update(req, res)),
);
router.delete(
  '/:id',
  validate({ params: subscriptionIdParamSchema }),
  asyncHandler((req, res) => subscriptionController.delete(req, res)),
);

export default router;
