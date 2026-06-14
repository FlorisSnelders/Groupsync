import { api } from './api';
import { Activity, ActivityCategory, AISuggestion, QuestionnaireQuestion } from '@/types';

interface FeedOptions {
  filters?: { category?: ActivityCategory; weekend?: boolean; nearby?: boolean };
  offset?: number;
  limit?: number;
}

interface FeedResponse {
  activities: Activity[];
  hasMore: boolean;
}

class ActivitiesService {
  async getFeed(options: FeedOptions = {}): Promise<FeedResponse> {
    return api.get<FeedResponse>('/activities', {
      params: {
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
        ...options.filters,
      },
    });
  }

  async getMyActivities(): Promise<Activity[]> {
    return api.get<Activity[]>('/activities/mine');
  }

  async getActivity(id: string): Promise<Activity> {
    return api.get<Activity>(`/activities/${id}`);
  }

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    return api.post<Activity>('/activities', data);
  }

  async joinActivity(id: string): Promise<void> {
    return api.post(`/activities/${id}/join`);
  }

  async leaveActivity(id: string): Promise<void> {
    return api.post(`/activities/${id}/leave`);
  }

  // AI Planning
  async getQuestionnaire(activityId: string): Promise<QuestionnaireQuestion[]> {
    return api.get<QuestionnaireQuestion[]>(`/activities/${activityId}/questionnaire`);
  }

  async submitQuestionnaire(activityId: string, responses: Record<string, string>): Promise<void> {
    return api.post(`/activities/${activityId}/questionnaire`, { responses });
  }

  async getSuggestions(activityId: string): Promise<AISuggestion[]> {
    return api.get<AISuggestion[]>(`/activities/${activityId}/suggestions`);
  }

  async voteOnSuggestion(activityId: string, optionIndex: number): Promise<void> {
    return api.post(`/activities/${activityId}/vote`, { optionIndex });
  }

  async rateActivity(
    activityId: string,
    rating: number,
    wouldRecommend: boolean,
    feedback?: string
  ): Promise<void> {
    return api.post(`/activities/${activityId}/rate`, { rating, wouldRecommend, feedback });
  }
}

export const activitiesService = new ActivitiesService();
