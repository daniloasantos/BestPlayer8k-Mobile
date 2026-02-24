import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../src/components';
import { useLogin } from '../../src/hooks';
import { getErrorMessage } from '../../src/services';
import { useColors, spacing } from '@/theme';
import { useLanguage } from '@/contexts';

export default function LoginScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert(t('common.error'), t('auth.error_fill_all'));
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      router.replace('/(app)/home');
    } catch (error) {
      showAlert(t('common.error'), getErrorMessage(error));
    }
  };

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
            <Image
              source={require('../../assets/icon-login.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.foreground }]}>BestPlayer8k</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {t('auth.login_title')}
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
              placeholder={t('auth.password_label')}
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <Button
              title={t('auth.login_button')}
              onPress={handleLogin}
              loading={loginMutation.isPending}
              style={styles.button}
              fullWidth
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                {t('auth.register_link').split('?')[0]}?{' '}
              </Text>
              <Link href="/(auth)/register">
                <Text style={[styles.link, { color: colors.primary }]}>{t('auth.register_link').split('?')[1]?.trim()}</Text>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
    width: '100%',
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
});
