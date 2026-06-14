import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { colors, spacing, typography, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.logo}>GroupSync</Text>
        <Text style={styles.tagline}>Meet people through activities{'\n'}you actually want to do</Text>
      </View>

      {/* Value Props */}
      <View style={styles.valueProps}>
        {[
          { emoji: '🌮', text: 'Pick an activity, not a profile' },
          { emoji: '🤖', text: 'AI plans the perfect hangout' },
          { emoji: '👥', text: 'Small groups, big vibes (3-5 people)' },
        ].map((item) => (
          <View key={item.text} style={styles.valuePropRow}>
            <Text style={styles.valuePropEmoji}>{item.emoji}</Text>
            <Text style={styles.valuePropText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get started — it's free</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.08,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.md,
    letterSpacing: -1,
  },
  tagline: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  valueProps: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  valuePropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  valuePropEmoji: {
    fontSize: 28,
  },
  valuePropText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontSize: 17,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});
