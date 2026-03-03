import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, X } from 'lucide-react-native';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useColors, spacing, borderRadius, typography } from '@/theme';

// ─── Countdown helpers ────────────────────────────────────────────────────────

function getCountdownLabel(expiresAt: string | null): string {
  if (!expiresAt) return '';
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';

  const days = Math.floor(diff / 86_400_000);
  if (days >= 1) return `${days}d restante${days !== 1 ? 's' : ''}`;

  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours >= 1) return `${hours}h ${mins}min restantes`;

  const secs = Math.floor((diff % 60_000) / 1_000);
  return `${mins}min ${secs}s restantes`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrialBanner() {
  const colors = useColors();
  const router = useRouter();
  const { accessStatus } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [countdown, setCountdown] = useState('');
  const slideAnim = useRef(new Animated.Value(80)).current;

  const isVisible = !dismissed && accessStatus?.isTrial === true;

  // Slide-in animation
  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 80,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || !accessStatus?.expiresAt) return;

    setCountdown(getCountdownLabel(accessStatus.expiresAt));

    const interval = setInterval(() => {
      setCountdown(getCountdownLabel(accessStatus.expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, accessStatus?.expiresAt]);

  if (!isVisible && !accessStatus?.isTrial) return null;

  const styles = StyleSheet.create({
    wrapper: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      // Extra bottom padding for tab bar (avoid covering tabs)
      paddingBottom: Platform.OS === 'ios' ? 84 : 72,
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
          <Text style={styles.titleText}>Trial ativo</Text>
          {countdown ? <Text style={styles.countdownText}>{countdown}</Text> : null}
        </View>

        <Pressable
          style={({ pressed }) => [styles.ctaButton, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.push('/plans')}
        >
          <Text style={styles.ctaText}>Ver planos</Text>
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
