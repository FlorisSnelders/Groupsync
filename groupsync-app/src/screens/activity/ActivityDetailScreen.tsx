import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FeedStackParamList } from '@/navigation/types';
import { useActivitiesStore } from '@/store/activitiesStore';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';
import { ACTIVITY_CATEGORY_LABELS } from '@/types';

type Props = NativeStackScreenProps<FeedStackParamList, 'ActivityDetail'>;

export default function ActivityDetailScreen({ route, navigation }: Props) {
  const { activityId } = route.params;
  const { selectedActivity, fetchActivity, joinActivity, loading } = useActivitiesStore();

  useEffect(() => { fetchActivity(activityId); }, [activityId]);

  if (!selectedActivity || loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const activity = selectedActivity;
  const catInfo = ACTIVITY_CATEGORY_LABELS[activity.category];
  const spotsLeft = activity.maxParticipants - activity.currentParticipants;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          {activity.photoUrl ? (
            <Image source={{ uri: activity.photoUrl }} style={styles.hero} />
          ) : (
            <View style={[styles.hero, styles.heroPlaceholder]}>
              <Text style={{ fontSize: 72 }}>{catInfo.emoji}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{activity.title}</Text>

          <View style={styles.metaGrid}>
            {activity.scheduledAt && <MetaItem emoji="📅" text={new Date(activity.scheduledAt).toLocaleDateString()} />}
            {activity.locationName && <MetaItem emoji="📍" text={activity.locationName} />}
            <MetaItem emoji="👥" text={`${activity.currentParticipants}/${activity.maxParticipants} spots`} />
          </View>

          {activity.description && (
            <Text style={styles.description}>{activity.description}</Text>
          )}

          {activity.tags?.length > 0 && (
            <View style={styles.tags}>
              {activity.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.spotsInfo}>
            <Text style={styles.spotsEmoji}>{spotsLeft === 0 ? '😔' : spotsLeft <= 2 ? '🔥' : '✅'}</Text>
            <Text style={styles.spotsText}>
              {spotsLeft === 0
                ? "It's full — check back later!"
                : spotsLeft === 1
                ? 'Only 1 spot left!'
                : `${spotsLeft} spots available`}
            </Text>
          </View>

          {/* AI planning + chat */}
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>🤖 Plan it together</Text>
            <Text style={styles.planSub}>
              Answer a few quick questions and our AI suggests 3 plans for the group to vote on.
            </Text>
            <TouchableOpacity
              style={styles.planBtn}
              onPress={() => navigation.navigate('Questionnaire', { activityId: activity.id })}
              activeOpacity={0.85}
            >
              <Text style={styles.planBtnText}>✨ Plan with AI</Text>
            </TouchableOpacity>
            <View style={styles.planRow}>
              <TouchableOpacity
                style={styles.planBtnGhost}
                onPress={() => navigation.navigate('Suggestions', { activityId: activity.id })}
                activeOpacity={0.85}
              >
                <Text style={styles.planBtnGhostText}>🗳️ Suggestions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.planBtnGhost}
                onPress={() => navigation.navigate('Chat', { activityId: activity.id, activityTitle: activity.title })}
                activeOpacity={0.85}
              >
                <Text style={styles.planBtnGhostText}>💬 Group chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Join CTA */}
      {spotsLeft > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={() => joinActivity(activity.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.joinBtnText}>➕ Join This Activity</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function MetaItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text>{emoji}</Text>
      <Text style={{ ...typography.bodySmall, color: colors.textSecondary }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
  heroContainer: { position: 'relative' },
  hero: { width: '100%', height: 280, resizeMode: 'cover' },
  heroPlaceholder: { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    position: 'absolute', top: spacing.md, left: spacing.md,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#fff', fontSize: 20 },
  body: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2, color: colors.textPrimary },
  metaGrid: { gap: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    backgroundColor: colors.surface, paddingHorizontal: spacing.sm,
    paddingVertical: 4, borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  tagText: { ...typography.caption, color: colors.textSecondary },
  spotsInfo: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md,
  },
  spotsEmoji: { fontSize: 24 },
  spotsText: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  planCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  planTitle: { ...typography.h3, color: colors.textPrimary },
  planSub: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  planBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center', marginTop: spacing.xs,
  },
  planBtnText: { ...typography.button, color: colors.textInverse, fontSize: 16 },
  planRow: { flexDirection: 'row', gap: spacing.sm },
  planBtnGhost: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.full,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
  },
  planBtnGhostText: { ...typography.label, color: colors.textPrimary },
  footer: {
    padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  joinBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center',
  },
  joinBtnText: { ...typography.button, color: colors.textInverse, fontSize: 17 },
});
