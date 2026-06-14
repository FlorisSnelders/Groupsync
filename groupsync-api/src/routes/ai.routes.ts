import { Router } from 'express';
import {
  getQuestionnaire,
  submitQuestionnaire,
  getSuggestions,
  voteOnSuggestion,
} from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id/questionnaire', requireAuth, getQuestionnaire);
router.post('/:id/questionnaire', requireAuth, submitQuestionnaire);
router.get('/:id/suggestions', requireAuth, getSuggestions);
router.post('/:id/vote', requireAuth, voteOnSuggestion);

export default router;
