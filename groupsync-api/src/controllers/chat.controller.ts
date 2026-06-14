import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await db.query(
      `SELECT m.id, m.content, m.sent_at,
              u.id as sender_id, u.name as sender_name, u.profile_photo_url as sender_photo
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.activity_id = $1
       ORDER BY m.sent_at ASC
       LIMIT 100`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

    const result = await db.query(
      `INSERT INTO messages (id, activity_id, sender_id, content)
       VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
      [req.params.id, userId, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}
