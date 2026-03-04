import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, X } from 'lucide-react-native';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts';
import { useColors, spacing, borderRadius, typography } from '@/theme';

// ─── Countdown helpers ────────────────────────────────────────────────────────

type TFn = (key: string, params?: Record<string, string | number>) => string;

function getCountdownLabel(expiresAt: string | null, t: TFn): string {
  if (!expiresAt) return '';
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return t('trial_banner.expired');

  const days = Math.floor(diff / 86_400_000);
  if (days >= 1) return t(days === 1 ? 'trial_banner.days_remaining_one' : 'trial_banner.days_remaining_other', { days });

  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours >= 1) return t('trial_banner.hours_remaining', { hours, mins });

  const secs = Math.floor((diff % 60_000) / 1_000);
  return t('trial_banner.minutes_remaining', { mins, secs });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrialBanner() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { accessStatus } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState('');
  const slideAnim = useRef(new Animated.Value(200)).current;

  const shouldShow = !dismissed && accessStatus?.isTrial === true;

  // Mount/unmount com animação
  useEffect(() => {
    if (shouldShow) {
      setMounted(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else if (mounted) {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 250,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [shouldShow]);

  // Countdown timer
  useEffect(() => {
    if (!shouldShow || !accessStatus?.expiresAt) return;

    setCountdown(getCountdownLabel(accessStatus.expiresAt, t));

    const interval = setInterval(() => {
      setCountdown(getCountdownLabel(accessStatus.expiresAt, t));
    }, 1000);

    return () => clearInterval(interval);
  }, [shouldShow, accessStatus?.expiresAt, t]);

  if (!mounted) return null;

  const styles = StyleSheet.create({
    wrapper: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      // Tab bar height (~78px) + safe area inset (gesture nav bar)
      paddingBottom: 78 + insets.bottom,
      zIndex: 100,
      pointerEvents: 'box-none',
    } as any,
    banner: {
      marginHorizontal: spacing.md,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      // Shadow
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    icon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
    },
    titleText: {
      ...typography.label,
      fontWeight: '700',
      color: '#fff',
    },
    countdownText: {
      ...typography.small,
      color: 'rgba(255,255,255,0.85)',
    },
    ctaButton: {
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    ctaText: {
      ...typography.label,
      fontWeight: '700',
      color: '#fff',
    },
    closeButton: {
      padding: spacing.xs,
    },
  });

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ translateY: slideAnim }] }]}
      pointerEvents="box-none"
    >
      <View style={styles.banner}>
        <View style={styles.icon}>
          <Zap size={18} color="#fff" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{t('trial_banner.active')}</Text>
          {countdown ? <Text style={styles.countdownText}>{countdown}</Text> : null}
        </View>

        <Pressable
          style={({ pressed }) => [styles.ctaButton, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.push('/plans')}
        >
          <Text style={styles.ctaText}>{t('trial_banner.see_plans')}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => setDismissed(true)}
        >
          <X size={16} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>
    </Animated.View>
  );
}
