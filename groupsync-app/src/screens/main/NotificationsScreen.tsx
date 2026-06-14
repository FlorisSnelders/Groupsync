import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Notifications</Text></View>
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🔔</Text>
        <Text style={styles.emptyText}>You're all caught up!</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.h2, color: colors.textPrimary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyText: { ...typography.body, color: colors.textSecondary },
});
