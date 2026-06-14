import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
} from '../controllers/social.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getFriends);
router.post('/request', requireAuth, sendFriendRequest);
router.post('/:id/accept', requireAuth, acceptFriendRequest);
router.post('/:id/decline', requireAuth, declineFriendRequest);

export default router;
