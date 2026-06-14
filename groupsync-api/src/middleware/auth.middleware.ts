import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  userId: string;
  isPremium: boolean;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      isPremium: boolean;
    };
    (req as AuthenticatedRequest).userId = payload.userId;
    (req as AuthenticatedRequest).isPremium = payload.isPremium ?? false;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
}

export function requirePremium(req: Request, _res: Response, next: NextFunction) {
  if (!(req as AuthenticatedRequest).isPremium) {
    return next(new AppError('Premium subscription required', 403, 'PREMIUM_REQUIRED'));
  }
  next();
}
