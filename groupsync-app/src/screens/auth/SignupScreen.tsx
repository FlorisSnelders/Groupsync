import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const { signup, loading, error, clearError } = useAuthStore();

  const handleSignup = async () => {
    if (!name || !email || !password || !age) {
      Alert.alert('Oops', 'Please fill in all fields');
      return;
    }
    if (parseInt(age) < 18) {
      Alert.alert('Age requirement', 'You must be 18 or older to use GroupSync');
      return;
    }
    try {
      await signup(email.trim(), password, name.trim());
    } catch {
      // Error set in store
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Join the fun 🎉</Text>
          <Text style={styles.subtitle}>Find your people through activities</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}><Text style={styles.errorClose}>✕</Text></TouchableOpacity>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="What do people call you?"
                autoCapitalize="words"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Must be 18+"
                keyboardType="number-pad"
                maxLength={3}
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry
                placeholderTextColor={colors.muted}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Creating account...' : "Let's go 🚀"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              By signing up you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.lg },
  backBtn: { marginBottom: spacing.xl },
  backText: { ...typography.body, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  errorBanner: {
    backgroundColor: '#FFF0F0',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  errorText: { ...typography.bodySmall, color: colors.error, flex: 1 },
  errorClose: { color: colors.error, fontWeight: '700', marginLeft: spacing.sm },
  form: { gap: spacing.md },
  fieldGroup: { gap: spacing.xs },
  label: { ...typography.label, color: colors.textSecondary },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { ...typography.button, color: colors.textInverse, fontSize: 17 },
  terms: { ...typography.caption, color: colors.muted, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { ...typography.body, color: colors.primary, fontWeight: '600' },
});
