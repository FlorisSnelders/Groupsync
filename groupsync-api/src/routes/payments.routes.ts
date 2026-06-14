import { Router } from 'express';
import {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  stripeWebhook,
} from '../controllers/payments.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/create-subscription', requireAuth, createSubscription);
router.post('/cancel-subscription', requireAuth, cancelSubscription);
router.get('/subscription-status', requireAuth, getSubscriptionStatus);
router.post('/webhook', stripeWebhook);   // raw body — no auth middleware

export default router;
