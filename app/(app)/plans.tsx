import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, Zap, CheckCircle2, Gift } from 'lucide-react-native';
import { subscriptionService } from '@/services/subscription.service';
import { notificationsService } from '@/services/notifications.service';
import { trialService } from '@/services/trial.service';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { useLanguage } from '@/contexts';
import { ScreenContainer, Header } from '@/components/layout';
import type { Plan } from '@/services/subscription.service';

export default function PlansScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useLanguage();
  const { accessStatus, refresh } = useSubscription();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingTrial, setActivatingTrial] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const getPeriodLabel = (billingCycle: string | undefined, isLifetime: boolean | undefined) => {
    if (isLifetime) return t('plans.period_lifetime');
    switch (billingCycle) {
      case 'MONTHLY':    return t('plans.period_month');
      case 'QUARTERLY':  return t('plans.period_quarter');
      case 'SEMESTER':   return t('plans.period_semester');
      case 'YEARLY':     return t('plans.period_year');
      default:           return '';
    }
  };

  const handleSubscribe = useCallback((plan: Plan) => {
    router.push(`/checkout/${plan.slug}`);
  }, [router]);

  const handleActivateTrial = useCallback(() => {
    const doActivate = async () => {
      setActivatingTrial(true);
      try {
        await trialService.activate();
        await refresh();
        await notificationsService.scheduleTrialNotifications(
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        );
        router.replace('/home');
      } catch {
        Alert.alert(t('common.error'), t('plans.trial_error'));
      } finally {
        setActivatingTrial(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('plans.trial_alert_msg'))) doActivate();
    } else {
      Alert.alert(
        t('plans.trial_alert_title'),
        t('plans.trial_alert_msg'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('plans.trial_alert_activate'), onPress: doActivate },
        ]
      );
    }
  }, [t, refresh, router]);

  const styles = StyleSheet.create({
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl * 2,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    subtitle: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.md,
    },
    sectionTitle: {
      ...typography.header,
      color: colors.foreground,
      marginBottom: spacing.md,
    },
    planCard: {
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    planCardPopular: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    popularBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      marginBottom: spacing.sm,
    },
    popularBadgeText: {
      ...typography.small,
      color: '#fff',
      fontWeight: '700',
    },
    planName: {
      ...typography.header,
      color: colors.foreground,
      fontSize: 18,
    },
    planPrice: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.foreground,
      marginTop: spacing.xs,
    },
    planPeriod: {
      ...typography.body,
      color: colors.mutedForeground,
    },
    planMonthly: {
      ...typography.small,
      color: colors.mutedForeground,
      marginTop: spacing.xs,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    featureText: {
      ...typography.body,
      color: colors.foreground,
    },
    subscribeButton: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      backgroundColor: colors.primary,
      marginTop: spacing.lg,
    },
    subscribeButtonText: {
      ...typography.body,
      fontWeight: '700',
      color: '#fff',
    },
    currentPlanBadge: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      backgroundColor: colors.muted,
      marginTop: spacing.lg,
    },
    currentPlanText: {
      ...typography.body,
      color: colors.mutedForeground,
      fontWeight: '600',
    },
    trialCard: {
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.primary + '60',
      backgroundColor: colors.primary + '10',
      padding: spacing.lg,
      marginBottom: spacing.xl,
      gap: spacing.sm,
    },
    trialRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    trialTitle: {
      ...typography.header,
      color: colors.foreground,
      fontSize: 16,
    },
    trialDesc: {
      ...typography.body,
      color: colors.mutedForeground,
    },
    trialButton: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      backgroundColor: colors.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    trialButtonText: {
      ...typography.body,
      fontWeight: '700',
      color: '#fff',
    },
    paymentNote: {
      ...typography.small,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
    },
  });

  if (loading) {
    return (
      <ScreenContainer>
        <Header title={t('plans.screen_title')} icon={CreditCard} />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const currentPlanSlug = accessStatus?.planSlug;

  return (
    <ScreenContainer>
      <Header title={t('plans.screen_title')} icon={CreditCard} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>{t('plans.subtitle')}</Text>

        {/* Trial card — only if user has no active plan */}
        {!accessStatus?.canAccess && (
          <View style={styles.trialCard}>
            <View style={styles.trialRow}>
              <Gift size={20} color={colors.primary} />
              <Text style={styles.trialTitle}>{t('plans.trial_title')}</Text>
            </View>
            <Text style={styles.trialDesc}>{t('plans.trial_desc')}</Text>
            <Pressable
              style={({ pressed }) => [styles.trialButton, { opacity: pressed ? 0.8 : 1 }]}
              onPress={handleActivateTrial}
              disabled={activatingTrial}
            >
              {activatingTrial ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Zap size={16} color="#fff" />
              )}
              <Text style={styles.trialButtonText}>
                {activatingTrial ? t('plans.trial_btn_loading') : t('plans.trial_btn')}
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t('plans.section_plans')}</Text>

        {plans.map((plan) => {
          const isCurrentPlan = currentPlanSlug === plan.slug;
          const periodLabel = getPeriodLabel(plan.billingCycle, plan.isLifetime);
          const features: string[] = [];
          if (plan.isLifetime) {
            features.push(t('plans.feature_permanent'));
            features.push(t('plans.feature_no_renewal'));
            features.push(t('plans.feature_priority_support'));
          }
          features.push(t('plans.feature_hd_channels'));
          features.push(t('plans.feature_movies_series'));
          features.push(t('plans.feature_multidevice'));
          features.push(t('plans.feature_support'));

          return (
            <View
              key={plan.id}
              style={[styles.planCard, plan.isPopular && styles.planCardPopular]}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>{t('plans.popular_badge')}</Text>
                </View>
              )}
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                R$ {plan.price.toFixed(2).replace('.', ',')}
                <Text style={styles.planPeriod}>{periodLabel}</Text>
              </Text>
              {plan.monthlyEquivalent && !plan.isLifetime && (
                <Text style={styles.planMonthly}>
                  {t('plans.monthly_equiv', { price: `R$ ${plan.monthlyEquivalent.toFixed(2).replace('.', ',')}` })}
                </Text>
              )}

              {features.map((feat) => (
                <View key={feat} style={styles.featureRow}>
                  <CheckCircle2 size={16} color={colors.primary} />
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}

              {isCurrentPlan ? (
                <View style={styles.currentPlanBadge}>
                  <Text style={styles.currentPlanText}>{t('plans.current_plan')}</Text>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.subscribeButton, { opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => handleSubscribe(plan)}
                >
                  <Text style={styles.subscribeButtonText}>{t('plans.btn_subscribe')}</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        <Text style={styles.paymentNote}>{t('plans.payment_note')}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
