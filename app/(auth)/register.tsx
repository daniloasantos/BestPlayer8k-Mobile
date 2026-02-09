import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../src/components';
import { useRegister } from '../../src/hooks';
import { getErrorMessage } from '../../src/services';
import { useColors, spacing } from '@/theme';
import { useLanguage } from '@/contexts';

export default function RegisterScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const registerMutation = useRegister();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      showAlert(t('common.error'), t('auth.error_fill_all'));
      return;
    }

    if (password.length < 6) {
      showAlert(t('common.error'), t('auth.password_min_length'));
      return;
    }

    if (password !== confirmPassword) {
      showAlert(t('common.error'), t('auth.passwords_not_match'));
      return;
    }

    try {
      await registerMutation.mutateAsync({ email, password });
      setRegistrationSuccess(true);
    } catch (error) {
      showAlert(t('common.error'), getErrorMessage(error));
    }
  };

  if (registrationSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            {t('auth.verify_email_title')}
          </Text>
          <Text style={[styles.successText, { color: colors.mutedForeground }]}>
            {t('auth.verify_email_message', { email })}
          </Text>
          <Button
            title={t('auth.go_to_login')}
            onPress={() => router.replace('/(auth)/login')}
            style={styles.successButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {t('auth.create_account_title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {t('auth.create_account_subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.email_label')}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label={t('auth.password_label')}
              placeholder={t('change_password.min_chars')}
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <Input
              label={t('auth.confirm_password_label')}
              placeholder={t('auth.confirm_password_label')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
            />

            <Button
              title={t('auth.register_button')}
              onPress={handleRegister}
              loading={registerMutation.isPending}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                {t('auth.login_link').split('?')[0]}?{' '}
              </Text>
              <Link href="/(auth)/login">
                <Text style={[styles.link, { color: colors.primary }]}>
                  {t('auth.login_link').split('?')[1]?.trim()}
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  successButton: {
    width: '100%',
  },
});
