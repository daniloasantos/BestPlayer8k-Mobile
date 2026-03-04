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
import { useLanguage } from '@/contexts';
import { ScreenContainer, Header } from '@/components/layout';

const FRONTEND_URL = process.env.EXPO_PUBLIC_FRONTEND_URL || 'https://bestplayer8k.com';
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

type Phase = 'opening' | 'waiting' | 'confirmed' | 'timeout';

export default function CheckoutScreen() {
  const { planSlug } = useLocalSearchParams<{ planSlug: string }>();
  const colors = useColors();
  const router = useRouter();
  const { t } = useLanguage();
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
          t('common.error'),
          t('checkout.error_browser', { url }),
          [{ text: 'OK' }]
        );
      });
  }, [planSlug, t]);

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
      <Header title={t('checkout.screen_title')} icon={ExternalLink} />

      <View style={styles.content}>
        {phase === 'opening' && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('checkout.opening_title')}</Text>
            <Text style={styles.subtitle}>{t('checkout.opening_desc')}</Text>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('checkout.waiting_title')}</Text>
            <Text style={styles.subtitle}>{t('checkout.waiting_desc')}</Text>

            <View style={styles.noteCard}>
              <Text style={styles.noteText}>{t('checkout.waiting_note')}</Text>
            </View>

            {browserOpened && (
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.7 : 1 }]}
                onPress={handleRetryBrowser}
              >
                <ExternalLink size={16} color={colors.foreground} />
                <Text style={styles.secondaryButtonText}>{t('checkout.btn_reopen_browser')}</Text>
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
                {t('checkout.btn_cancel_back')}
              </Text>
            </Pressable>
          </>
        )}

        {phase === 'confirmed' && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: '#34d39920' }]}>
              <CheckCircle2 size={48} color="#34d399" />
            </View>
            <Text style={styles.title}>{t('checkout.confirmed_title')}</Text>
            <Text style={styles.subtitle}>{t('checkout.confirmed_desc')}</Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.8 : 1 }]}
              onPress={handleGoHome}
            >
              <Text style={styles.primaryButtonText}>{t('checkout.btn_go_home')}</Text>
            </Pressable>
          </>
        )}

        {phase === 'timeout' && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
              <RefreshCw size={48} color={colors.mutedForeground} />
            </View>
            <Text style={styles.title}>{t('checkout.timeout_title')}</Text>
            <Text style={styles.subtitle}>{t('checkout.timeout_desc')}</Text>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.8 : 1 }]}
              onPress={handleRestartPolling}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>{t('checkout.btn_check_again')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.replace('/plans')}
            >
              <ArrowLeft size={16} color={colors.foreground} />
              <Text style={styles.secondaryButtonText}>{t('checkout.btn_back_to_plans')}</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}
