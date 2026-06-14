export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  bio?: string;
  profilePhotoUrl?: string;
  location?: {
    lat: number;
    lng: number;
    city?: string;
  };
  interests: string[];
  lookingFor: LookingForBadge[];
  isPremium: boolean;
  premiumExpiresAt?: string;
  verified: boolean;
  createdAt: string;
}

export type LookingForBadge =
  | 'new_to_city'
  | 'activity_buddy'
  | 'gym_partner'
  | 'foodie_friend'
  | 'study_buddy'
  | 'adventure_partner';

export const LOOKING_FOR_LABELS: Record<LookingForBadge, string> = {
  new_to_city: '🆕 New to the city',
  activity_buddy: '🤝 Activity buddy',
  gym_partner: '💪 Gym partner',
  foodie_friend: '🍕 Foodie friend',
  study_buddy: '📚 Study buddy',
  adventure_partner: '🏕️ Adventure partner',
};

export const INTEREST_CATEGORIES = [
  { id: 'food', emoji: '🌮', label: 'Food' },
  { id: 'outdoors', emoji: '🌳', label: 'Outdoors' },
  { id: 'creative', emoji: '🎨', label: 'Creative' },
  { id: 'games', emoji: '🎮', label: 'Games' },
  { id: 'fitness', emoji: '🏃', label: 'Fitness' },
  { id: 'music', emoji: '🎵', label: 'Music' },
  { id: 'film', emoji: '🎬', label: 'Film' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'sports', emoji: '⚽', label: 'Sports' },
  { id: 'art', emoji: '🖼️', label: 'Art' },
  { id: 'tech', emoji: '💻', label: 'Tech' },
  { id: 'wellness', emoji: '🧘', label: 'Wellness' },
] as const;
