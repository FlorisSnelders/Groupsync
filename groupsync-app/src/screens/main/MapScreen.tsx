import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.subtitle}>Nearby activities — coming soon</Text>
      {/* TODO: Integrate react-native-maps */}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary },
});
