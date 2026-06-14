export type ActivityStatus =
  | 'forming'     // waiting for min participants
  | 'planning'    // AI questionnaire phase
  | 'confirmed'   // voted and confirmed
  | 'completed'   // activity happened
  | 'cancelled';

export type ActivityCategory =
  | 'food'
  | 'outdoors'
  | 'creative'
  | 'games'
  | 'entertainment'
  | 'fitness'
  | 'music'
  | 'other';

export interface Activity {
  id: string;
  creatorId: string;
  creator?: {
    id: string;
    name: string;
    profilePhotoUrl?: string;
  };
  title: string;
  description?: string;
  category: ActivityCategory;
  photoUrl?: string;
  scheduledAt?: string;       // null if flexible
  locationName?: string;
  location?: { lat: number; lng: number };
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  status: ActivityStatus;
  tags: string[];
  createdAt: string;
  participants?: ActivityParticipant[];
}

export interface ActivityParticipant {
  userId: string;
  name: string;
  profilePhotoUrl?: string;
  status: 'interested' | 'joined' | 'confirmed' | 'attended';
  joinedAt: string;
}

export interface QuestionnaireQuestion {
  id: string;
  question: string;
  emoji?: string;
  options: {
    label: string;
    emoji?: string;
    value: string;
  }[];
}

export interface AISuggestion {
  index: number;
  title: string;
  description: string;
  venue?: string;
  time?: string;
  pricePerPerson?: string;
  tags: string[];
  voteCount: number;
  hasVoted: boolean;
}

export interface ActivityRating {
  activityId: string;
  rating: number;
  wouldRecommend: boolean;
  feedback?: string;
}

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, { emoji: string; label: string }> = {
  food: { emoji: '🌮', label: 'Food' },
  outdoors: { emoji: '🌳', label: 'Outdoors' },
  creative: { emoji: '🎨', label: 'Creative' },
  games: { emoji: '🎮', label: 'Games' },
  entertainment: { emoji: '🎭', label: 'Entertainment' },
  fitness: { emoji: '🏃', label: 'Fitness' },
  music: { emoji: '🎵', label: 'Music' },
  other: { emoji: '✨', label: 'Other' },
};
