import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{user?.name ?? 'Profile'}</Text>
      <Text style={styles.sub}>{user?.email}</Text>
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  sub: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  logout: { marginTop: 'auto' as any, padding: spacing.md, alignItems: 'center' },
  logoutText: { ...typography.body, color: colors.error },
});
