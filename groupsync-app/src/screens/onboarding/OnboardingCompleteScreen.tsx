import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

export default function OnboardingCompleteScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>You're all set!</Text>
      <Text style={styles.subtitle}>
        Time to find your first activity. We'll show you things that match your vibe.
      </Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {/* RootNavigator will redirect once interests are set */}}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>Start exploring</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emoji: { fontSize: 80, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['2xl'] },
  btn: {
    backgroundColor: colors.primary, paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'], borderRadius: borderRadius.full,
  },
  btnText: { ...typography.button, color: colors.textInverse, fontSize: 17 },
});
