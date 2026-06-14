import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { generateActivitySuggestions, buildQuestionnaire } from '../services/ai.service';

export async function getQuestionnaire(req: Request, res: Response, next: NextFunction) {
  try {
    const activity = await db.query(
      `SELECT id, title, category FROM activities WHERE id = $1`,
      [req.params.id]
    );
    if (!activity.rows.length) return next(new AppError('Activity not found', 404));

    const questions = buildQuestionnaire(activity.rows[0].category);
    res.json(questions);
  } catch (err) {
    next(err);
  }
}

export async function submitQuestionnaire(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const activityId = req.params.id;
    const { responses } = req.body;

    // Upsert questionnaire response
    await db.query(
      `INSERT INTO ai_questionnaires (id, activity_id, user_id, responses)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (activity_id, user_id) DO UPDATE SET responses = $4, submitted_at = NOW()`,
      [uuidv4(), activityId, userId, JSON.stringify(responses)]
    );

    // Check if all participants have submitted → generate suggestions
    const activity = await db.query(
      `SELECT current_participants FROM activities WHERE id = $1`,
      [activityId]
    );
    const submittedCount = await db.query(
      `SELECT COUNT(*) FROM ai_questionnaires WHERE activity_id = $1`,
      [activityId]
    );

    const allSubmitted =
      parseInt(submittedCount.rows[0].count) >= activity.rows[0].current_participants;

    if (allSubmitted) {
      // Fire-and-forget AI generation
      generateAndSaveSuggestions(activityId).catch(console.error);
    }

    res.json({ message: 'Responses saved', allSubmitted });
  } catch (err) {
    next(err);
  }
}

async function generateAndSaveSuggestions(activityId: string) {
  const [activityResult, questionnaireResult] = await Promise.all([
    db.query(`SELECT * FROM activities WHERE id = $1`, [activityId]),
    db.query(`SELECT responses FROM ai_questionnaires WHERE activity_id = $1`, [activityId]),
  ]);

  const activity = activityResult.rows[0];
  const allResponses = questionnaireResult.rows.map((r: any) => r.responses);

  const suggestions = await generateActivitySuggestions(activity, allResponses);

  await db.query(
    `INSERT INTO ai_suggestions (id, activity_id, suggestion_data)
     VALUES ($1, $2, $3)
     ON CONFLICT (activity_id) DO UPDATE SET suggestion_data = $3`,
    [uuidv4(), activityId, JSON.stringify(suggestions)]
  );
}

export async function getSuggestions(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const activityId = req.params.id;

    const result = await db.query(
      `SELECT suggestion_data, votes FROM ai_suggestions WHERE activity_id = $1`,
      [activityId]
    );

    if (!result.rows.length) {
      return next(new AppError('Suggestions not ready yet', 404));
    }

    const { suggestion_data, votes } = result.rows[0];
    const voteCounts: Record<number, number> = {};
    const userVote = votes?.[userId];

    Object.values(votes ?? {}).forEach((v: any) => {
      voteCounts[v] = (voteCounts[v] ?? 0) + 1;
    });

    const suggestions = suggestion_data.map((s: any, i: number) => ({
      ...s,
      index: i,
      voteCount: voteCounts[i] ?? 0,
      hasVoted: userVote === i,
    }));

    res.json(suggestions);
  } catch (err) {
    next(err);
  }
}

export async function voteOnSuggestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { optionIndex } = req.body;

    await db.query(
      `UPDATE ai_suggestions
       SET votes = COALESCE(votes, '{}'::jsonb) || $1::jsonb
       WHERE activity_id = $2`,
      [JSON.stringify({ [userId]: optionIndex }), req.params.id]
    );

    res.json({ message: 'Vote recorded' });
  } catch (err) {
    next(err);
  }
}
