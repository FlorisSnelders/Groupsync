import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

function generateToken(userId: string, isPremium: boolean): string {
  return jwt.sign({ userId, isPremium }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return next(new AppError('email, password and name are required', 400));
    }
    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters', 400));
    }

    // Check if email taken
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return next(new AppError('Email already in use', 409));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    const result = await db.query(
      `INSERT INTO users (id, email, password_hash, name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, is_premium, verified, created_at`,
      [id, email.toLowerCase(), passwordHash, name]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.is_premium);

    res.status(201).json({ user: formatUser(user), token });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Email and password required', 400));
    }

    const result = await db.query(
      `SELECT id, email, name, password_hash, age, bio, profile_photo_url,
              interests, looking_for, is_premium, premium_expires_at, verified, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Invalid email or password', 401));
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken(user.id, user.is_premium);
    res.json({ user: formatUser(user), token });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  // JWT is stateless — client deletes token; optionally add token blocklist later
  res.json({ message: 'Logged out' });
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const result = await db.query(
      `SELECT id, email, name, age, bio, profile_photo_url,
              interests, looking_for, is_premium, premium_expires_at, verified, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    res.json(formatUser(result.rows[0]));
  } catch (err) {
    next(err);
  }
}

function formatUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    age: row.age,
    bio: row.bio,
    profilePhotoUrl: row.profile_photo_url,
    interests: row.interests ?? [],
    lookingFor: row.looking_for ?? [],
    isPremium: row.is_premium ?? false,
    premiumExpiresAt: row.premium_expires_at,
    verified: row.verified ?? false,
    createdAt: row.created_at,
  };
}
