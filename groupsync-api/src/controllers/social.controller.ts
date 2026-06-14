import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function getFriends(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const result = await db.query(
      `SELECT u.id, u.name, u.profile_photo_url, f.status, f.created_at
       FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.user1_id = $1 THEN f.user2_id ELSE f.user1_id END
       WHERE (f.user1_id = $1 OR f.user2_id = $1)`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

export async function sendFriendRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { targetUserId, metAtActivityId } = req.body;
    if (userId === targetUserId) return next(new AppError("Can't friend yourself", 400));

    await db.query(
      `INSERT INTO friendships (id, user1_id, user2_id, status, met_at_activity_id)
       VALUES ($1, $2, $3, 'pending', $4)`,
      [uuidv4(), userId, targetUserId, metAtActivityId]
    );
    res.json({ message: 'Friend request sent' });
  } catch (err) { next(err); }
}

export async function acceptFriendRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    await db.query(
      `UPDATE friendships SET status = 'accepted'
       WHERE id = $1 AND user2_id = $2 AND status = 'pending'`,
      [req.params.id, userId]
    );
    res.json({ message: 'Friend request accepted' });
  } catch (err) { next(err); }
}

export async function declineFriendRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    await db.query(
      `UPDATE friendships SET status = 'declined'
       WHERE id = $1 AND user2_id = $2`,
      [req.params.id, userId]
    );
    res.json({ message: 'Request declined' });
  } catch (err) { next(err); }
}
