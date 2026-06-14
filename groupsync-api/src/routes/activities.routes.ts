import { Router } from 'express';
import {
  listActivities,
  getActivity,
  createActivity,
  joinActivity,
  leaveActivity,
  getParticipants,
  rateActivity,
  getMyActivities,
} from '../controllers/activities.controller';
import { requireAuth, requirePremium } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, listActivities);
router.get('/mine', requireAuth, getMyActivities);
router.post('/', requireAuth, requirePremium, createActivity);
router.get('/:id', requireAuth, getActivity);
router.post('/:id/join', requireAuth, joinActivity);
router.post('/:id/leave', requireAuth, leaveActivity);
router.get('/:id/participants', requireAuth, getParticipants);
router.post('/:id/rate', requireAuth, rateActivity);

export default router;
