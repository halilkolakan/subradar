import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getErrorMessage } from '../../src/api/client';
import { FormField } from '../../src/components/FormField';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAuthStore } from '../../src/stores/authStore';
import { colors, spacing } from '../../src/theme';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>SubRadar</Text>
            <Text style={styles.subtitle}>Every renewal, on your radar.</Text>
          </View>

          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="••••••"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton title="Sign in" onPress={() => void handleSubmit()} loading={submitting} />

          <Link href="/register" style={styles.link}>
            New here? <Text style={styles.linkAccent}>Create an account</Text>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, gap: spacing.lg, justifyContent: 'center', padding: spacing.xl },
  header: { gap: spacing.sm, marginBottom: spacing.xl },
  brand: { color: colors.text, fontSize: 34, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 16 },
  error: { color: colors.danger },
  link: { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' },
  linkAccent: { color: colors.primary, fontWeight: '700' },
});
