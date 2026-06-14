import { NavigatorScreenParams } from '@react-navigation/native';

// Root — decides auth vs. app
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth flow
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
};

// Onboarding flow (after signup)
export type OnboardingStackParamList = {
  ProfileSetup: undefined;
  Interests: undefined;
  OnboardingComplete: undefined;
};

// Main tabs
export type MainTabParamList = {
  FeedTab: NavigatorScreenParams<FeedStackParamList>;
  MapTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Feed stack (nested inside FeedTab)
export type FeedStackParamList = {
  Feed: undefined;
  ActivityDetail: { activityId: string };
  CreateActivity: undefined;
  Questionnaire: { activityId: string };
  Suggestions: { activityId: string };
  Chat: { activityId: string; activityTitle: string };
};

// Profile stack
export type ProfileStackParamList = {
  Profile: { userId?: string };
  EditProfile: undefined;
  Friends: undefined;
  Paywall: undefined;
  Settings: undefined;
};
