import { create } from 'zustand';
import { Activity, ActivityCategory } from '@/types';
import { activitiesService } from '@/services/activities';

interface ActivitiesFilters {
  category?: ActivityCategory;
  weekend?: boolean;
  nearby?: boolean;
}

interface ActivitiesState {
  feed: Activity[];
  myActivities: Activity[];
  selectedActivity: Activity | null;
  filters: ActivitiesFilters;
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;

  // Actions
  fetchFeed: (refresh?: boolean) => Promise<void>;
  fetchMyActivities: () => Promise<void>;
  fetchActivity: (id: string) => Promise<void>;
  joinActivity: (id: string) => Promise<void>;
  leaveActivity: (id: string) => Promise<void>;
  setFilters: (filters: ActivitiesFilters) => void;
  clearSelectedActivity: () => void;
}

export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
  feed: [],
  myActivities: [],
  selectedActivity: null,
  filters: {},
  loading: false,
  refreshing: false,
  hasMore: true,
  error: null,

  fetchFeed: async (refresh = false) => {
    if (refresh) {
      set({ refreshing: true, error: null });
    } else {
      set({ loading: true, error: null });
    }

    try {
      const { activities, hasMore } = await activitiesService.getFeed({
        filters: get().filters,
        offset: refresh ? 0 : get().feed.length,
      });

      set({
        feed: refresh ? activities : [...get().feed, ...activities],
        hasMore,
        loading: false,
        refreshing: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false, refreshing: false });
    }
  },

  fetchMyActivities: async () => {
    set({ loading: true });
    try {
      const activities = await activitiesService.getMyActivities();
      set({ myActivities: activities, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchActivity: async (id: string) => {
    set({ loading: true });
    try {
      const activity = await activitiesService.getActivity(id);
      set({ selectedActivity: activity, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  joinActivity: async (id: string) => {
    await activitiesService.joinActivity(id);
    // Optimistically update the feed
    const updated = get().feed.map((a) =>
      a.id === id ? { ...a, currentParticipants: a.currentParticipants + 1 } : a
    );
    set({ feed: updated });
  },

  leaveActivity: async (id: string) => {
    await activitiesService.leaveActivity(id);
    const updated = get().feed.map((a) =>
      a.id === id ? { ...a, currentParticipants: Math.max(0, a.currentParticipants - 1) } : a
    );
    set({ feed: updated });
  },

  setFilters: (filters: ActivitiesFilters) => {
    set({ filters, feed: [], hasMore: true });
    get().fetchFeed(true);
  },

  clearSelectedActivity: () => set({ selectedActivity: null }),
}));
