import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { api } from '@/services/api';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ProfileSetup'>;

export default function ProfileSetupScreen({ navigation }: Props) {
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuthStore();

  const handleNext = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${user!.id}`, { bio });
      updateUser({ bio });
      navigation.navigate('Interests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progress}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.title}>Show us your vibe 😎</Text>
        <Text style={styles.subtitle}>A quick bio helps people know what you're about</Text>

        <View style={styles.bioContainer}>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="e.g. Always down for tacos and trying new things 🌮"
            multiline
            maxLength={120}
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.bioCount}>{bio.length}/120</Text>
        </View>

        <Text style={styles.examplesLabel}>Need inspiration?</Text>
        {[
          'Foodie & adventure seeker 🌮✈️',
          'New to the city, looking to explore 🆕',
          'Love hiking, board games & brunch 🏔️🎲',
        ].map((ex) => (
          <TouchableOpacity key={ex} style={styles.exampleChip} onPress={() => setBio(ex)}>
            <Text style={styles.exampleText}>{ex}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.nextBtn, loading && { opacity: 0.6 }]}
          onPress={handleNext}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>{loading ? 'Saving...' : 'Next →'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Interests')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  progress: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.primary, width: 24 },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  bioContainer: { position: 'relative' },
  bioInput: {
    ...typography.body,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.md, height: 120,
    textAlignVertical: 'top', color: colors.textPrimary,
  },
  bioCount: {
    ...typography.caption, color: colors.muted,
    position: 'absolute', bottom: spacing.sm, right: spacing.sm,
  },
  examplesLabel: { ...typography.label, color: colors.textSecondary },
  exampleChip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  exampleText: { ...typography.bodySmall, color: colors.textPrimary },
  nextBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, alignItems: 'center', marginTop: spacing.md,
  },
  nextBtnText: { ...typography.button, color: colors.textInverse, fontSize: 17 },
  skipText: { ...typography.body, color: colors.muted, textAlign: 'center' },
});
