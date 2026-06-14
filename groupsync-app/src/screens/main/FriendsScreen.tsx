import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export default function FriendsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <Text style={styles.sub}>Meet people at activities to add friends</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  sub: { ...typography.body, color: colors.textSecondary },
});
