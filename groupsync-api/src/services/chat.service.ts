import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { db } from '../config/database';

export function setupChatSocket(io: SocketServer) {
  // Auth middleware for Socket.io
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, config.jwt.secret) as { userId: string };
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;

    // Join activity chat room
    socket.on('join_activity', (activityId: string) => {
      socket.join(`activity:${activityId}`);
    });

    // Leave activity chat room
    socket.on('leave_activity', (activityId: string) => {
      socket.leave(`activity:${activityId}`);
    });

    // Send message
    socket.on('send_message', async (data: { activityId: string; content: string }) => {
      try {
        const { activityId, content } = data;
        if (!content?.trim()) return;

        // Save to DB
        const result = await db.query(
          `INSERT INTO messages (id, activity_id, sender_id, content)
           VALUES (gen_random_uuid(), $1, $2, $3)
           RETURNING id, sender_id, content, sent_at`,
          [activityId, userId, content.trim()]
        );

        const userResult = await db.query(
          `SELECT name, profile_photo_url FROM users WHERE id = $1`,
          [userId]
        );

        const message = {
          ...result.rows[0],
          sender: {
            id: userId,
            name: userResult.rows[0]?.name,
            profilePhotoUrl: userResult.rows[0]?.profile_photo_url,
          },
        };

        // Broadcast to all in room
        io.to(`activity:${activityId}`).emit('new_message', message);
      } catch (err) {
        console.error('Chat error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      // Could track presence here
    });
  });
}
