import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

const FEATURES = [
  '✨ Unlimited activities',
  '🎨 Create your own events',
  '👀 See who\'s coming before joining',
  '🤖 Priority AI matching',
  '🔍 Advanced filters',
  '📊 Stats & memories',
];

export default function PaywallScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.subtitle}>Everything you need to build your social life</Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <Text key={f} style={styles.feature}>{f}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.cta} activeOpacity={0.8}>
          <Text style={styles.ctaText}>Start free 7-day trial</Text>
          <Text style={styles.ctaSub}>No credit card required</Text>
        </TouchableOpacity>

        <Text style={styles.price}>Only $11.99/month after trial · Cancel anytime</Text>

        <View style={styles.testimonial}>
          <Text style={styles.testimonialText}>"Best investment for my social life!"</Text>
          <Text style={styles.testimonialAuthor}>⭐⭐⭐⭐⭐ — Sarah, LA</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, alignItems: 'center', paddingBottom: spacing['2xl'] },
  closeBtn: { alignSelf: 'flex-end', padding: spacing.sm },
  closeText: { fontSize: 20, color: colors.textSecondary },
  emoji: { fontSize: 64, marginTop: spacing.lg, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  features: { width: '100%', gap: spacing.sm, marginBottom: spacing.xl },
  feature: { ...typography.body, color: colors.textPrimary, paddingVertical: spacing.xs },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.full,
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  ctaText: { ...typography.button, color: colors.textInverse, fontSize: 18 },
  ctaSub: { ...typography.caption, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  price: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  testimonial: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    width: '100%',
  },
  testimonialText: { ...typography.body, color: colors.textPrimary, fontStyle: 'italic', marginBottom: spacing.xs },
  testimonialAuthor: { ...typography.caption, color: colors.textSecondary },
});
