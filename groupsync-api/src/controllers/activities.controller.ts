import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const FREE_TIER_MONTHLY_LIMIT = 3;

export async function listActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit = 20, offset = 0, category, weekend } = req.query;

    let where = `WHERE a.status IN ('forming', 'planning', 'confirmed')
                   AND a.current_participants < a.max_participants`;
    const params: any[] = [];
    let paramIdx = 1;

    if (category) {
      where += ` AND a.category = $${paramIdx++}`;
      params.push(category);
    }
    if (weekend === 'true') {
      where += ` AND EXTRACT(DOW FROM a.scheduled_at) IN (0, 6)`;
    }

    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await db.query(
      `SELECT a.*,
              u.name as creator_name, u.profile_photo_url as creator_photo
       FROM activities a
       JOIN users u ON u.id = a.creator_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      params
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM activities a ${where}`,
      params.slice(0, params.length - 2)
    );

    const total = parseInt(countResult.rows[0].count);
    const currentOffset = parseInt(offset as string);

    res.json({
      activities: result.rows.map(formatActivity),
      hasMore: currentOffset + result.rows.length < total,
    });
  } catch (err) {
    next(err);
  }
}

export async function getActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await db.query(
      `SELECT a.*, u.name as creator_name, u.profile_photo_url as creator_photo, u.bio as creator_bio
       FROM activities a
       JOIN users u ON u.id = a.creator_id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return next(new AppError('Activity not found', 404));
    res.json(formatActivity(result.rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function createActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { title, description, category, photoUrl, scheduledAt, locationName, location,
            minParticipants = 3, maxParticipants = 5, tags = [] } = req.body;

    if (!title || !category) {
      return next(new AppError('title and category are required', 400));
    }

    const id = uuidv4();
    const locationPoint = location
      ? `POINT(${location.lng} ${location.lat})`
      : null;

    const result = await db.query(
      `INSERT INTO activities
         (id, creator_id, title, description, category, photo_url, scheduled_at,
          location_name, location, min_participants, max_participants, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [id, userId, title, description, category, photoUrl, scheduledAt,
       locationName, locationPoint, minParticipants, maxParticipants, tags]
    );

    // Creator auto-joins
    await db.query(
      `INSERT INTO activity_participants (id, activity_id, user_id, status)
       VALUES ($1, $2, $3, 'joined')`,
      [uuidv4(), id, userId]
    );

    res.status(201).json(formatActivity(result.rows[0]));
  } catch (err) {
    next(err);
  }
}

export async function joinActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, isPremium } = req as AuthenticatedRequest;
    const activityId = req.params.id;

    // Check free tier limit
    if (!isPremium) {
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const countResult = await db.query(
        `SELECT COUNT(*) FROM activity_participants
         WHERE user_id = $1 AND joined_at >= $2`,
        [userId, thisMonth]
      );
      if (parseInt(countResult.rows[0].count) >= FREE_TIER_MONTHLY_LIMIT) {
        return next(new AppError(`Free tier limit (${FREE_TIER_MONTHLY_LIMIT}/month) reached`, 403, 'PREMIUM_REQUIRED'));
      }
    }

    // Check activity exists + has space
    const activity = await db.query(
      `SELECT id, current_participants, max_participants, status
       FROM activities WHERE id = $1`,
      [activityId]
    );
    if (!activity.rows.length) return next(new AppError('Activity not found', 404));

    const act = activity.rows[0];
    if (act.current_participants >= act.max_participants) {
      return next(new AppError('Activity is full', 400));
    }
    if (act.status === 'cancelled' || act.status === 'completed') {
      return next(new AppError('Activity is no longer available', 400));
    }

    // Check not already joined
    const existing = await db.query(
      `SELECT id FROM activity_participants WHERE activity_id = $1 AND user_id = $2`,
      [activityId, userId]
    );
    if (existing.rows.length) {
      return next(new AppError('Already joined', 400));
    }

    await db.query(
      `INSERT INTO activity_participants (id, activity_id, user_id, status)
       VALUES ($1, $2, $3, 'joined')`,
      [uuidv4(), activityId, userId]
    );

    // Update participant count
    await db.query(
      `UPDATE activities SET current_participants = current_participants + 1 WHERE id = $1`,
      [activityId]
    );

    // Check if min participants reached → trigger planning phase
    const updated = await db.query(
      `SELECT current_participants, min_participants, status FROM activities WHERE id = $1`,
      [activityId]
    );
    const updatedAct = updated.rows[0];
    if (
      updatedAct.current_participants >= updatedAct.min_participants &&
      updatedAct.status === 'forming'
    ) {
      await db.query(
        `UPDATE activities SET status = 'planning' WHERE id = $1`,
        [activityId]
      );
    }

    res.json({ message: "You're in! 🎉" });
  } catch (err) {
    next(err);
  }
}

export async function leaveActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, isPremium } = req as AuthenticatedRequest;
    if (!isPremium) {
      return next(new AppError('Only premium users can leave activities', 403, 'PREMIUM_REQUIRED'));
    }

    await db.query(
      `DELETE FROM activity_participants WHERE activity_id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    await db.query(
      `UPDATE activities SET current_participants = GREATEST(0, current_participants - 1) WHERE id = $1`,
      [req.params.id]
    );
    res.json({ message: 'Left activity' });
  } catch (err) {
    next(err);
  }
}

export async function getParticipants(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.profile_photo_url, ap.status, ap.joined_at
       FROM activity_participants ap
       JOIN users u ON u.id = ap.user_id
       WHERE ap.activity_id = $1
       ORDER BY ap.joined_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function rateActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { rating, wouldRecommend, feedback } = req.body;

    await db.query(
      `INSERT INTO activity_ratings (id, activity_id, user_id, rating, would_recommend, feedback)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (activity_id, user_id) DO UPDATE
       SET rating=$4, would_recommend=$5, feedback=$6`,
      [uuidv4(), req.params.id, userId, rating, wouldRecommend, feedback]
    );
    res.json({ message: 'Rating saved' });
  } catch (err) {
    next(err);
  }
}

export async function getMyActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const result = await db.query(
      `SELECT a.* FROM activities a
       JOIN activity_participants ap ON ap.activity_id = a.id
       WHERE ap.user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );
    res.json(result.rows.map(formatActivity));
  } catch (err) {
    next(err);
  }
}

function formatActivity(row: any) {
  return {
    id: row.id,
    creatorId: row.creator_id,
    creator: row.creator_name
      ? { id: row.creator_id, name: row.creator_name, profilePhotoUrl: row.creator_photo }
      : undefined,
    title: row.title,
    description: row.description,
    category: row.category,
    photoUrl: row.photo_url,
    scheduledAt: row.scheduled_at,
    locationName: row.location_name,
    minParticipants: row.min_participants,
    maxParticipants: row.max_participants,
    currentParticipants: row.current_participants ?? 0,
    status: row.status,
    tags: row.tags ?? [],
    createdAt: row.created_at,
  };
}
