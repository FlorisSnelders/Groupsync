import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { Activity, ACTIVITY_CATEGORY_LABELS } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface Props {
  activity: Activity;
  onPress: () => void;
  onJoin?: () => void;
}

const { width } = Dimensions.get('window');

export default function ActivityCard({ activity, onPress, onJoin }: Props) {
  const categoryInfo = ACTIVITY_CATEGORY_LABELS[activity.category];
  const spotsLeft = activity.maxParticipants - activity.currentParticipants;
  const isFull = spotsLeft === 0;
  const fillPercent = activity.currentParticipants / activity.maxParticipants;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {/* Hero image */}
      <View style={styles.imageContainer}>
        {activity.photoUrl ? (
          <Image source={{ uri: activity.photoUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderEmoji}>{categoryInfo.emoji}</Text>
          </View>
        )}
        {/* Category chip */}
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>
            {categoryInfo.emoji} {categoryInfo.label}
          </Text>
        </View>
        {/* Spots indicator */}
        {isFull && (
          <View style={styles.fullBadge}>
            <Text style={styles.fullBadgeText}>Full</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{activity.title}</Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          {activity.scheduledAt && (
            <Text style={styles.metaText}>
              📅 {formatDate(activity.scheduledAt)}
            </Text>
          )}
          {activity.locationName && (
            <Text style={styles.metaText} numberOfLines={1}>
              📍 {activity.locationName}
            </Text>
          )}
        </View>

        {/* Spots progress */}
        <View style={styles.spotsRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${fillPercent * 100}%` }]} />
          </View>
          <Text style={styles.spotsText}>
            {activity.currentParticipants}/{activity.maxParticipants} spots
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <View style={styles.socialActions}>
            <Text style={styles.socialAction}>❤️ 0</Text>
            <Text style={styles.socialAction}>💬 0</Text>
          </View>
          {!isFull && onJoin && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={onJoin}
              activeOpacity={0.8}
            >
              <Text style={styles.joinButtonText}>➕ Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + `, ${time}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderEmoji: {
    fontSize: 56,
  },
  categoryChip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  categoryChipText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  fullBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  fullBadgeText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  spotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  spotsText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 60,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  socialActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialAction: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  joinButtonText: {
    ...typography.label,
    color: colors.textInverse,
  },
});
