import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export default function EditProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary },
});
