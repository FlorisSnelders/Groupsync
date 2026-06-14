import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FeedStackParamList } from '@/navigation/types';
import { activitiesService } from '@/services/activities';
import { QuestionnaireQuestion } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<FeedStackParamList, 'Questionnaire'>;

export default function QuestionnaireScreen({ navigation, route }: Props) {
  const { activityId } = route.params;
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    activitiesService
      .getQuestionnaire(activityId)
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [activityId]);

  const select = (questionId: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await activitiesService.submitQuestionnaire(activityId, answers);
      navigation.replace('Suggestions', { activityId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan the hangout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          🤖 A few quick taps and our AI will craft plans the whole group will love.
        </Text>

        {questions.map((q, qi) => (
          <View key={q.id} style={styles.question}>
            <Text style={styles.questionText}>
              {q.emoji ? `${q.emoji} ` : ''}{q.question}
            </Text>
            <View style={styles.options}>
              {q.options.map((opt) => {
                const active = answers[q.id] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => select(q.id, opt.value)}
                    activeOpacity={0.8}
                  >
                    {opt.emoji ? <Text style={styles.optEmoji}>{opt.emoji}</Text> : null}
                    <Text style={[styles.optLabel, active && styles.optLabelActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, (!allAnswered || submitting) && styles.ctaDisabled]}
          onPress={handleSubmit}
          disabled={!allAnswered || submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {submitting ? 'Asking the AI…' : allAnswered ? '✨ Generate plans' : 'Answer all to continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerBack: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
  intro: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  question: { gap: spacing.sm },
  questionText: { ...typography.h4, color: colors.textPrimary },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optEmoji: { fontSize: 18 },
  optLabel: { ...typography.label, color: colors.textPrimary },
  optLabelActive: { color: colors.textInverse },
  footer: {
    padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cta: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center',
  },
  ctaDisabled: { backgroundColor: colors.border },
  ctaText: { ...typography.button, color: colors.textInverse, fontSize: 17 },
});
