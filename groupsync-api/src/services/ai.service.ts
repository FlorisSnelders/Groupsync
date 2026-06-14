import OpenAI from 'openai';
import { config } from '../config/env';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export interface AISuggestion {
  title: string;
  description: string;
  venue?: string;
  time?: string;
  pricePerPerson?: string;
  tags: string[];
}

// Per-category concrete questionnaire questions
export function buildQuestionnaire(category: string) {
  const base = [
    {
      id: 'time_pref',
      question: 'When works best?',
      emoji: '📅',
      options: [
        { label: 'Weekday evening', emoji: '🌆', value: 'weekday_evening' },
        { label: 'Saturday daytime', emoji: '☀️', value: 'saturday_day' },
        { label: 'Sunday daytime', emoji: '🌅', value: 'sunday_day' },
        { label: 'Weekend evening', emoji: '🌃', value: 'weekend_evening' },
      ],
    },
    {
      id: 'budget',
      question: 'What\'s your budget vibe?',
      emoji: '💰',
      options: [
        { label: 'Free / Low cost', emoji: '🆓', value: 'free' },
        { label: 'Under $20', emoji: '$', value: 'budget' },
        { label: '$20-50', emoji: '$$', value: 'mid' },
        { label: 'Splurge-worthy', emoji: '$$$', value: 'premium' },
      ],
    },
  ];

  const categoryQuestions: Record<string, any[]> = {
    food: [
      {
        id: 'food_type',
        question: 'What sounds good?',
        emoji: '🍽️',
        options: [
          { label: 'Street food / casual', emoji: '🌮', value: 'casual' },
          { label: 'Sit-down restaurant', emoji: '🍷', value: 'restaurant' },
          { label: 'Brunch', emoji: '🥞', value: 'brunch' },
          { label: 'Food market', emoji: '🛒', value: 'market' },
        ],
      },
      {
        id: 'spice',
        question: 'Spice tolerance?',
        emoji: '🌶️',
        options: [
          { label: 'Mild only', emoji: '😌', value: 'mild' },
          { label: 'Medium is nice', emoji: '🔥', value: 'medium' },
          { label: 'The spicier the better', emoji: '🌶️🌶️', value: 'spicy' },
        ],
      },
    ],
    outdoors: [
      {
        id: 'activity_level',
        question: 'How active are we getting?',
        emoji: '🏃',
        options: [
          { label: 'Leisurely stroll', emoji: '🚶', value: 'easy' },
          { label: 'Moderate hike', emoji: '🥾', value: 'moderate' },
          { label: 'Challenging adventure', emoji: '🏔️', value: 'hard' },
        ],
      },
    ],
    games: [
      {
        id: 'game_type',
        question: 'What kind of games?',
        emoji: '🎮',
        options: [
          { label: 'Board games / trivia', emoji: '🎲', value: 'board' },
          { label: 'Escape room', emoji: '🔐', value: 'escape' },
          { label: 'Arcade / bowling', emoji: '🎳', value: 'arcade' },
          { label: 'Outdoor games', emoji: '⛳', value: 'outdoor' },
        ],
      },
    ],
    creative: [
      {
        id: 'creative_type',
        question: 'What creative thing?',
        emoji: '🎨',
        options: [
          { label: 'Painting / drawing', emoji: '🖌️', value: 'visual' },
          { label: 'Pottery / ceramics', emoji: '🏺', value: 'pottery' },
          { label: 'Photography walk', emoji: '📷', value: 'photo' },
          { label: 'Cooking class', emoji: '👨‍🍳', value: 'cooking' },
        ],
      },
    ],
  };

  return [...(categoryQuestions[category] ?? []), ...base];
}

export async function generateActivitySuggestions(
  activity: { title: string; category: string; location_name?: string },
  allResponses: any[]
): Promise<AISuggestion[]> {
  const responseSummary = allResponses
    .map((r, i) => `Person ${i + 1}: ${JSON.stringify(r)}`)
    .join('\n');

  const prompt = `You are planning a fun group activity for ${allResponses.length} people.

Activity type: ${activity.title} (${activity.category})
${activity.location_name ? `Location: ${activity.location_name}` : ''}

Group preferences:
${responseSummary}

Generate exactly 3 specific, concrete activity suggestions. Each should be DIFFERENT from the others in style/vibe.
Make them fun, specific, and actionable (real venue types, estimated prices, clear plan).
Do NOT suggest the same kind of place twice.

Respond ONLY with a JSON array of 3 objects, each with:
- title: string (catchy name with emoji)
- description: string (1-2 sentences, exciting)
- venue: string (specific type of place or venue name style)
- time: string (e.g. "Saturday 2pm, ~3 hours")
- pricePerPerson: string (e.g. "$10-20 per person")
- tags: string[] (2-3 vibe tags, e.g. ["Casual", "Foodie", "Walkable"])`;

  try {
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content ?? '{"suggestions":[]}';
    const parsed = JSON.parse(content);
    const suggestions = Array.isArray(parsed) ? parsed : parsed.suggestions ?? [];

    // Ensure exactly 3
    return suggestions.slice(0, 3);
  } catch (err) {
    console.error('AI generation error:', err);
    // Fallback suggestions
    return [
      {
        title: `🎯 ${activity.title} — Option A`,
        description: 'A classic choice for your group.',
        tags: ['Casual', 'Fun'],
      },
      {
        title: `⚡ ${activity.title} — Option B`,
        description: 'A more adventurous take on the activity.',
        tags: ['Active', 'Adventure'],
      },
      {
        title: `✨ ${activity.title} — Option C`,
        description: 'The premium experience for the group.',
        tags: ['Premium', 'Memorable'],
      },
    ];
  }
}
