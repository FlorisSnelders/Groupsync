import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, FeedStackParamList, ProfileStackParamList } from './types';
import { colors } from '@/theme';

// Screens
import FeedScreen from '@/screens/main/FeedScreen';
import MapScreen from '@/screens/main/MapScreen';
import NotificationsScreen from '@/screens/main/NotificationsScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';
import ActivityDetailScreen from '@/screens/activity/ActivityDetailScreen';
import CreateActivityScreen from '@/screens/activity/CreateActivityScreen';
import QuestionnaireScreen from '@/screens/activity/QuestionnaireScreen';
import SuggestionsScreen from '@/screens/activity/SuggestionsScreen';
import ChatScreen from '@/screens/activity/ChatScreen';
import EditProfileScreen from '@/screens/main/EditProfileScreen';
import FriendsScreen from '@/screens/main/FriendsScreen';
import PaywallScreen from '@/screens/main/PaywallScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const FeedStack = createNativeStackNavigator<FeedStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function FeedStackNavigator() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="Feed" component={FeedScreen} />
      <FeedStack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <FeedStack.Screen name="CreateActivity" component={CreateActivityScreen} />
      <FeedStack.Screen name="Questionnaire" component={QuestionnaireScreen} />
      <FeedStack.Screen name="Suggestions" component={SuggestionsScreen} />
      <FeedStack.Screen name="Chat" component={ChatScreen} />
    </FeedStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Friends" component={FriendsScreen} />
      <ProfileStack.Screen name="Paywall" component={PaywallScreen} />
    </ProfileStack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedStackNavigator}
        options={{ tabBarLabel: 'Discover', tabBarIcon: () => null /* TODO: icons */ }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{ tabBarLabel: 'Map', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Notifications', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile', tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}
