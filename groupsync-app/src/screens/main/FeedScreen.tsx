import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, RefreshControl, ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FeedStackParamList } from '@/navigation/types';
import { useActivitiesStore } from '@/store/activitiesStore';
import { useAuthStore } from '@/store/authStore';
import ActivityCard from '@/components/activity/ActivityCard';
import { Activity, ActivityCategory, ACTIVITY_CATEGORY_LABELS } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<FeedStackParamList, 'Feed'>;

const FILTER_CHIPS: { id: string; label: string; category?: ActivityCategory }[] = [
  { id: 'all', label: '✨ All' },
  { id: 'weekend', label: '📅 Weekend' },
  { id: 'food', label: '🌮 Food', category: 'food' },
  { id: 'outdoors', label: '🌳 Outdoors', category: 'outdoors' },
  { id: 'creative', label: '🎨 Creative', category: 'creative' },
  { id: 'games', label: '🎮 Games', category: 'games' },
  { id: 'fitness', label: '🏃 Fitness', category: 'fitness' },
];

export default function FeedScreen({ navigation }: Props) {
  const { feed, loading, refreshing, fetchFeed, joinActivity, setFilters } = useActivitiesStore();
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = React.useState('all');

  useEffect(() => {
    fetchFeed(true);
  }, []);

  const handleFilterPress = useCallback((chip: typeof FILTER_CHIPS[0]) => {
    setActiveFilter(chip.id);
    setFilters({
      category: chip.category,
      weekend: chip.id === 'weekend',
    });
  }, []);

  const handleJoin = useCallback(async (activity: Activity) => {
    const isPremium = user?.isPremium;
    // TODO: count free tier usage — block at 3/month for non-premium
    try {
      await joinActivity(activity.id);
    } catch (e: any) {
      if (e?.response?.status === 403) {
        navigation.navigate('Profile' as any); // Navigate to paywall via profile stack
      }
    }
  }, [user]);

  const renderItem = useCallback(({ item }: { item: Activity }) => (
    <ActivityCard
      activity={item}
      onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
      onJoin={() => handleJoin(item)}
    />
  ), [navigation, handleJoin]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GroupSync</Text>
        <TouchableOpacity onPress={() => {/* notifications */}}>
          <Text style={styles.headerIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterContainer}
      >
        {FILTER_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={[styles.filterChip, activeFilter === chip.id && styles.filterChipActive]}
            onPress={() => handleFilterPress(chip)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === chip.id && styles.filterChipTextActive,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      <FlatList
        data={feed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFeed(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌴</Text>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to create an activity in your area
              </Text>
            </View>
          ) : null
        }
      />

      {/* FAB — create activity (premium) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateActivity')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  headerIcon: { fontSize: 24 },
  filterContainer: { flexGrow: 0, marginBottom: spacing.sm },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  feedContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: colors.textInverse,
    lineHeight: 32,
  },
});
