import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
// TODO: Stripe integration

export async function createSubscription(req: Request, res: Response) {
  res.json({ message: 'Stripe subscription — TODO: implement with Stripe SDK' });
}

export async function cancelSubscription(req: Request, res: Response) {
  res.json({ message: 'Cancel subscription — TODO' });
}

export async function getSubscriptionStatus(req: Request, res: Response) {
  const { isPremium } = req as AuthenticatedRequest;
  res.json({ isPremium });
}

export async function stripeWebhook(req: Request, res: Response) {
  // TODO: verify Stripe signature + handle events
  res.json({ received: true });
}
