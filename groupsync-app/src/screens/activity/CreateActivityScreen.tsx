import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FeedStackParamList } from '@/navigation/types';
import { activitiesService } from '@/services/activities';
import { useActivitiesStore } from '@/store/activitiesStore';
import { ActivityCategory, ACTIVITY_CATEGORY_LABELS } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<FeedStackParamList, 'CreateActivity'>;

const CATEGORIES = Object.entries(ACTIVITY_CATEGORY_LABELS) as [
  ActivityCategory,
  { emoji: string; label: string }
][];

// Quick "when" presets → computed ISO date (keeps the form simple, no date picker dep)
const WHEN_PRESETS: { id: string; label: string; date: () => Date | null }[] = [
  { id: 'flexible', label: '🤷 Flexible', date: () => null },
  {
    id: 'tonight',
    label: '🌙 Tonight',
    date: () => { const d = new Date(); d.setHours(19, 0, 0, 0); return d; },
  },
  {
    id: 'tomorrow',
    label: '☀️ Tomorrow',
    date: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(15, 0, 0, 0); return d; },
  },
  {
    id: 'weekend',
    label: '📅 This weekend',
    date: () => {
      const d = new Date();
      const day = d.getDay();
      const daysUntilSat = (6 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + daysUntilSat);
      d.setHours(14, 0, 0, 0);
      return d;
    },
  },
];

export default function CreateActivityScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory | null>(null);
  const [locationName, setLocationName] = useState('');
  const [when, setWhen] = useState('flexible');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [loading, setLoading] = useState(false);

  const { fetchFeed } = useActivitiesStore();

  const handleCreate = async () => {
    if (!title.trim() || !category) {
      Alert.alert('Almost there', 'Give your activity a title and pick a category.');
      return;
    }
    setLoading(true);
    try {
      const preset = WHEN_PRESETS.find((w) => w.id === when);
      const scheduled = preset?.date() ?? null;

      const activity = await activitiesService.createActivity({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        locationName: locationName.trim() || undefined,
        scheduledAt: scheduled ? scheduled.toISOString() : undefined,
        minParticipants: 3,
        maxParticipants,
      });

      await fetchFeed(true);
      navigation.replace('ActivityDetail', { activityId: activity.id });
    } catch (e: any) {
      if (e?.response?.status === 403) {
        Alert.alert('Premium feature', 'Creating activities is a Premium perk. Upgrade to host your own hangouts!');
      } else {
        Alert.alert('Something went wrong', e?.response?.data?.error ?? e.message ?? 'Could not create activity');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New activity</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <Text style={styles.label}>What are you up to? *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Taco crawl in the city center 🌮"
            placeholderTextColor={colors.muted}
            maxLength={80}
          />

          {/* Category */}
          <Text style={styles.label}>Category *</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(([key, info]) => {
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => setCategory(key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.catEmoji}>{info.emoji}</Text>
                  <Text style={[styles.catLabel, active && styles.catLabelActive]}>{info.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell people what to expect and why it'll be fun…"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={300}
          />

          {/* Location */}
          <Text style={styles.label}>Where</Text>
          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="e.g. Breda city center"
            placeholderTextColor={colors.muted}
          />

          {/* When */}
          <Text style={styles.label}>When</Text>
          <View style={styles.whenRow}>
            {WHEN_PRESETS.map((w) => {
              const active = when === w.id;
              return (
                <TouchableOpacity
                  key={w.id}
                  style={[styles.whenChip, active && styles.whenChipActive]}
                  onPress={() => setWhen(w.id)}
                >
                  <Text style={[styles.whenText, active && styles.whenTextActive]}>{w.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Group size */}
          <Text style={styles.label}>Max group size</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setMaxParticipants((n) => Math.max(3, n - 1))}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{maxParticipants} people</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setMaxParticipants((n) => Math.min(20, n + 1))}
            >
              <Text style={styles.stepperBtnText}>＋</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Small groups (3–5) make for the best vibes ✨</Text>
        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cta, loading && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{loading ? 'Creating…' : 'Create activity 🚀'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerBack: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  label: { ...typography.label, color: colors.textSecondary, marginTop: spacing.md },
  input: {
    ...typography.body,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    color: colors.textPrimary,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catEmoji: { fontSize: 18 },
  catLabel: { ...typography.label, color: colors.textPrimary },
  catLabelActive: { color: colors.textInverse },
  whenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  whenChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  whenChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  whenText: { ...typography.label, color: colors.textSecondary },
  whenTextActive: { color: colors.textInverse },
  stepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.sm,
  },
  stepperBtn: {
    width: 40, height: 40, borderRadius: borderRadius.full,
    backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center',
  },
  stepperBtnText: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  stepperValue: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  hint: { ...typography.caption, color: colors.muted },
  footer: {
    padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cta: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center',
  },
  ctaText: { ...typography.button, color: colors.textInverse, fontSize: 17 },
});
