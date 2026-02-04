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

export default function RegisterScreen() {
  const colors = useColors();
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
      showAlert('Erro', 'Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      showAlert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      await registerMutation.mutateAsync({ email, password });
      setRegistrationSuccess(true);
    } catch (error) {
      showAlert('Erro', getErrorMessage(error));
    }
  };

  if (registrationSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Verifique seu e-mail
          </Text>
          <Text style={[styles.successText, { color: colors.mutedForeground }]}>
            Enviamos um link de verificação para {email}.
            Clique no link para ativar sua conta.
          </Text>
          <Button
            title="Ir para Login"
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
            <Text style={[styles.title, { color: colors.foreground }]}>Criar Conta</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Preencha seus dados
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <Input
              label="Confirmar Senha"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
            />

            <Button
              title="Cadastrar"
              onPress={handleRegister}
              loading={registerMutation.isPending}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                Já tem uma conta?{' '}
              </Text>
              <Link href="/(auth)/login">
                <Text style={[styles.link, { color: colors.primary }]}>Fazer login</Text>
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
