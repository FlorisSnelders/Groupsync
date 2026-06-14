import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { INTEREST_CATEGORIES } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { api } from '@/services/api';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Interests'>;

export default function InterestsScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuthStore();

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDone = async () => {
    if (selected.length < 3) return;
    setLoading(true);
    try {
      await api.put(`/users/${user!.id}`, { interests: selected });
      updateUser({ interests: selected });
      navigation.navigate('OnboardingComplete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What sounds fun? 🎉</Text>
        <Text style={styles.subtitle}>Pick at least 3 — we'll find activities you'll love</Text>

        <View style={styles.grid}>
          {INTEREST_CATEGORIES.map((cat) => {
            const active = selected.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggle(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.doneBtn, selected.length < 3 && styles.doneBtnDisabled]}
          onPress={handleDone}
          disabled={selected.length < 3 || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.doneBtnText}>
            {loading
              ? 'Saving...'
              : selected.length < 3
              ? `Pick ${3 - selected.length} more`
              : "Let's go! 🚀"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipEmoji: { fontSize: 20 },
  chipLabel: { ...typography.label, color: colors.textPrimary },
  chipLabelActive: { color: colors.textInverse },
  doneBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center',
  },
  doneBtnDisabled: { backgroundColor: colors.border },
  doneBtnText: { ...typography.button, color: colors.textInverse, fontSize: 17 },
});
