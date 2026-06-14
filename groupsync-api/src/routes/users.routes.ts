import { Router } from 'express';
import { getUser, updateUser, getUserActivities, getUserFriends } from '../controllers/users.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id', requireAuth, getUser);
router.put('/:id', requireAuth, updateUser);
router.get('/:id/activities', requireAuth, getUserActivities);
router.get('/:id/friends', requireAuth, getUserFriends);

export default router;
