import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FeedStackParamList } from '@/navigation/types';
import { activitiesService } from '@/services/activities';
import { AISuggestion } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

type Props = NativeStackScreenProps<FeedStackParamList, 'Suggestions'>;

export default function SuggestionsScreen({ navigation, route }: Props) {
  const { activityId } = route.params;
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [activityTitle, setActivityTitle] = useState('Group chat');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempts = useRef(0);

  const load = useCallback(async () => {
    try {
      const data = await activitiesService.getSuggestions(activityId);
      setSuggestions(data);
      setStatus('ready');
    } catch (e: any) {
      // 404 = AI still generating → poll a few times before giving up
      if (e?.response?.status === 404 && attempts.current < 8) {
        attempts.current += 1;
        pollRef.current = setTimeout(load, 2000);
      } else {
        setStatus('error');
      }
    }
  }, [activityId]);

  useEffect(() => {
    load();
    activitiesService.getActivity(activityId).then((a) => setActivityTitle(a.title)).catch(() => {});
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [activityId, load]);

  const vote = async (index: number) => {
    // optimistic
    setSuggestions((prev) =>
      prev.map((s) => ({
        ...s,
        hasVoted: s.index === index,
        voteCount: s.index === index ? s.voteCount + (s.hasVoted ? 0 : 1) : s.voteCount,
      }))
    );
    try {
      await activitiesService.voteOnSuggestion(activityId, index);
      const fresh = await activitiesService.getSuggestions(activityId);
      setSuggestions(fresh);
    } catch {
      /* keep optimistic state */
    }
  };

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingTitle}>Our AI is planning… 🤖</Text>
        <Text style={styles.loadingSub}>Crafting 3 options from everyone's answers</Text>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 48 }}>🤔</Text>
        <Text style={styles.loadingTitle}>Plans aren't ready yet</Text>
        <Text style={styles.loadingSub}>Everyone needs to finish the questionnaire first.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { attempts.current = 0; setStatus('loading'); load(); }}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const topVotes = Math.max(0, ...suggestions.map((s) => s.voteCount));
  const hasVotedAny = suggestions.some((s) => s.hasVoted);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI plans</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>🗳️ Vote for your favourite — the group decides together.</Text>

        {suggestions.map((s) => {
          const leading = topVotes > 0 && s.voteCount === topVotes;
          return (
            <View key={s.index} style={[styles.card, s.hasVoted && styles.cardChosen]}>
              {leading && (
                <View style={styles.leadBadge}>
                  <Text style={styles.leadBadgeText}>👑 Leading</Text>
                </View>
              )}
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardDesc}>{s.description}</Text>

              <View style={styles.metaList}>
                {s.venue ? <Text style={styles.meta}>📍 {s.venue}</Text> : null}
                {s.time ? <Text style={styles.meta}>🕒 {s.time}</Text> : null}
                {s.pricePerPerson ? <Text style={styles.meta}>💸 {s.pricePerPerson}</Text> : null}
              </View>

              {s.tags?.length > 0 && (
                <View style={styles.tags}>
                  {s.tags.map((t) => (
                    <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                  ))}
                </View>
              )}

              <View style={styles.voteRow}>
                <Text style={styles.voteCount}>
                  {s.voteCount} {s.voteCount === 1 ? 'vote' : 'votes'}
                </Text>
                <TouchableOpacity
                  style={[styles.voteBtn, s.hasVoted && styles.voteBtnActive]}
                  onPress={() => vote(s.index)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.voteBtnText, s.hasVoted && styles.voteBtnTextActive]}>
                    {s.hasVoted ? '✓ Your pick' : 'Vote'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {hasVotedAny && (
          <TouchableOpacity
            style={styles.chatCta}
            onPress={() => navigation.navigate('Chat', { activityId, activityTitle })}
            activeOpacity={0.85}
          >
            <Text style={styles.chatCtaText}>💬 Open group chat</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.background, padding: spacing.xl },
  loadingTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' },
  loadingSub: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, marginTop: spacing.md,
  },
  retryText: { ...typography.button, color: colors.textInverse },
  backLink: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerBack: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  intro: { ...typography.body, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, gap: spacing.sm, borderWidth: 2, borderColor: 'transparent',
    ...shadows.sm,
  },
  cardChosen: { borderColor: colors.primary },
  leadBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full,
  },
  leadBadgeText: { ...typography.caption, color: colors.dark, fontWeight: '700' },
  cardTitle: { ...typography.h3, color: colors.textPrimary },
  cardDesc: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  metaList: { gap: 4, marginTop: spacing.xs },
  meta: { ...typography.bodySmall, color: colors.textPrimary },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: {
    backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
  },
  tagText: { ...typography.caption, color: colors.textSecondary },
  voteRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  voteCount: { ...typography.label, color: colors.textSecondary },
  voteBtn: {
    backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.primary,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full,
  },
  voteBtnActive: { backgroundColor: colors.primary },
  voteBtnText: { ...typography.label, color: colors.primary },
  voteBtnTextActive: { color: colors.textInverse },
  chatCta: {
    backgroundColor: colors.secondary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center', marginTop: spacing.sm,
  },
  chatCtaText: { ...typography.button, color: colors.textInverse, fontSize: 17 },
});
