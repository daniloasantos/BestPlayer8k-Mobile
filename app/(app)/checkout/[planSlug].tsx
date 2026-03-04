import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { ExternalLink, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { subscriptionService } from '@/services/subscription.service';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';

const FRONTEND_URL = process.env.EXPO_PUBLIC_FRONTEND_URL || 'https://bestplayer8k.com';
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

type Phase = 'opening' | 'waiting' | 'confirmed' | 'timeout';

export default function CheckoutScreen() {
  const { planSlug } = useLocalSearchParams<{ planSlug: string }>();
  const colors = useColors();
  const router = useRouter();
  const { refresh } = useSubscription();

  const [phase, setPhase] = useState<Phase>('opening');
  const [browserOpened, setBrowserOpened] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Opens the external browser with the checkout URL
  const openBrowser = useCallback(() => {
    const url = `${FRONTEND_URL}/checkout/${planSlug}`;
    Linking.openURL(url)
      .then(() => {
        if (mountedRef.current) {
          setBrowserOpened(true);
          setPhase('waiting');
        }
      })
      .catch(() => {
        Alert.alert(
          'Erro',
          `Não foi possível abrir o navegador. Acesse: ${url}`,
          [{ text: 'OK' }]
        );
      });
  }, [planSlug]);

  // Polls access-status every 5s to detect payment confirmation
  const startPolling = useCallback(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const status = await subscriptionService.getAccessStatus();
        if (!mountedRef.current) return;
        if (status.canAccess) {
          clearInterval(intervalRef.current!);
          clearTimeout(timeoutRef.current!);
          await refresh();
          setPhase('confirmed');
        }
      } catch {
        // silent — keep polling
      }
    }, POLL_INTERVAL_MS);

    // Timeout after 10 minutes
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      clearInterval(intervalRef.current!);
      setPhase('timeout');
    }, POLL_TIMEOUT_MS);
  }, [refresh]);

  useEffect(() => {
    mountedRef.current = true;
    openBrowser();
    startPolling();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [openBrowser, startPolling]);

  const handleGoHome = useCallback(() => {
    router.replace('/home');
  }, [router]);

  const handleRetryBrowser = useCallback(() => {
    setPhase('opening');
    setBrowserOpened(false);
    openBrowser();
  }, [openBrowser]);

  const handleRestartPolling = useCallback(() => {
    setPhase('waiting');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startPolling();
  }, [startPolling]);

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.xl,
    },
    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...typography.header,
      color: colors.foreground,
      textAlign: 'center',
      fontSize: 22,
    },
    subtitle: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 22,
    },
    primaryButton: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      alignSelf: 'stretch',
      justifyContent: 'center',
    },
    primaryButtonText: {
      ...typography.body,
      fontWeight: '700',
      color: '#fff',
    },
    secondaryButton: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      alignSelf: 'stretch',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      ...typography.body,
      color: colors.foreground,
    },
    noteCard: {
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
      padding: spacing.md,
      alignSelf: 'stretch',
    },
    noteText: {
      ...typography.small,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
  });

  return (
    <ScreenContainer>
      <Header title="Checkout" icon={ExternalLink} />

      <View style={styles.content}>
        {phase === 'opening' && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={styles.title}>Abrindo navegador...</Text>
            <Text style={styles.subtitle}>
              Você será redirecionado para concluir o pagamento com segurança.
            </Text>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={styles.title}>Aguardando confirmação...</Text>
            <Text style={styles.subtitle}>
              Conclua o pagamento no navegador. Seu acesso será liberado automaticamente assim que o pagamento for confirmado.
            </Text>

            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                Não feche essa tela. Verificando a cada 5 segundos...
              </Text>
            </View>

            {browserOpened && (
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.7 : 1 }]}
                onPress={handleRetryBrowser}
              >
                <ExternalLink size={16} color={colors.foreground} />
                <Text style={styles.secondaryButtonText}>Reabrir navegador</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                { opacity: pressed ? 0.7 : 1, borderColor: colors.mutedForeground },
              ]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={16} color={colors.mutedForeground} />
              <Text style={[styles.secondaryButtonText, { color: colors.mutedForeground }]}>
                Cancelar e voltar
              </Text>
            </Pressable>
          </>
        )}

        {phase === 'confirmed' && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: '#34d39920' }]}>
              <CheckCircle2 size={48} color="#34d399" />
            </View>
            <Text style={styles.title}>Pagamento confirmado!</Text>
            <Text style={styles.subtitle}>
              Seu acesso foi ativado. Aproveite todos os canais HD e 4K!
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.8 : 1 }]}
              onPress={handleGoHome}
            >
              <Text style={styles.primaryButtonText}>Ir para o início</Text>
            </Pressable>
          </>
        )}

        {phase === 'timeout' && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
              <RefreshCw size={48} color={colors.mutedForeground} />
            </View>
            <Text style={styles.title}>Ainda aguardando...</Text>
            <Text style={styles.subtitle}>
              O pagamento ainda não foi confirmado. Se você já pagou, o acesso será liberado em instantes.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.8 : 1 }]}
              onPress={handleRestartPolling}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>Verificar novamente</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.replace('/plans')}
            >
              <ArrowLeft size={16} color={colors.foreground} />
              <Text style={styles.secondaryButtonText}>Voltar aos planos</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}
