import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await db.query(
      `SELECT id, name, age, bio, profile_photo_url, interests, looking_for,
              is_premium, verified, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return next(new AppError('User not found', 404));
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    if (req.params.id !== userId) return next(new AppError('Forbidden', 403));

    const { bio, interests, lookingFor, age } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (bio !== undefined) { updates.push(`bio = $${idx++}`); values.push(bio); }
    if (interests !== undefined) { updates.push(`interests = $${idx++}`); values.push(interests); }
    if (lookingFor !== undefined) { updates.push(`looking_for = $${idx++}`); values.push(lookingFor); }
    if (age !== undefined) { updates.push(`age = $${idx++}`); values.push(age); }

    if (!updates.length) return res.json({ message: 'No changes' });

    values.push(userId);
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function getUserActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await db.query(
      `SELECT a.* FROM activities a
       JOIN activity_participants ap ON ap.activity_id = a.id
       WHERE ap.user_id = $1 ORDER BY a.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

export async function getUserFriends(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.profile_photo_url, f.created_at as friends_since,
              act.title as met_at_activity
       FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.user1_id = $1 THEN f.user2_id ELSE f.user1_id END
       LEFT JOIN activities act ON act.id = f.met_at_activity_id
       WHERE (f.user1_id = $1 OR f.user2_id = $1) AND f.status = 'accepted'`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}
