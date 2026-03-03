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
import * as Linking from 'expo-linking';
import { CreditCard, Star, Zap, CheckCircle2, Gift } from 'lucide-react-native';
import { subscriptionService } from '@/services/subscription.service';
import { trialService } from '@/services/trial.service';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import type { Plan } from '@/services/subscription.service';

const FRONTEND_URL = process.env.EXPO_PUBLIC_FRONTEND_URL || 'https://bestplayer8k.com';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function getPeriodSuffix(plan: Plan): string {
  if (plan.isLifetime) return '/vitalício';
  if (!plan.durationDays) return '';
  if (plan.durationDays <= 31) return '/mês';
  if (plan.durationDays <= 93) return '/trimestre';
  if (plan.durationDays <= 186) return '/semestre';
  return '/ano';
}

function getMonthlyEquivalent(plan: Plan): string | null {
  if (!plan.durationDays || plan.durationDays <= 31 || plan.isLifetime) return null;
  const months = plan.durationDays / 30;
  const monthlyPrice = plan.priceInCents / months;
  return `${formatPrice(Math.round(monthlyPrice))}/mês`;
}

function isPopular(plan: Plan): boolean {
  return plan.slug === 'anual' || plan.slug === 'annual';
}

// ─── PlanCard Component ────────────────────────────────────────────────────

interface PlanCardProps {
  plan: Plan;
  isActive: boolean;
  onSubscribe: (plan: Plan) => void;
  colors: ReturnType<typeof useColors>;
}

function PlanCard({ plan, isActive, onSubscribe, colors }: PlanCardProps) {
  const popular = isPopular(plan);
  const monthlyEq = getMonthlyEquivalent(plan);

  const styles = StyleSheet.create({
    card: {
      marginBottom: spacing.md,
      borderRadius: borderRadius.xl,
      borderWidth: popular ? 2 : 1,
      borderColor: popular ? colors.primary : colors.border,
      backgroundColor: popular ? colors.primary + '10' : colors.card,
      overflow: 'hidden',
    },
    popularBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      alignItems: 'center',
    },
    popularText: {
      ...typography.label,
      color: '#fff',
      fontWeight: '700',
    },
    cardContent: {
      padding: spacing.lg,
    },
    planName: {
      ...typography.header,
      color: colors.foreground,
      marginBottom: spacing.xs,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    price: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.foreground,
    },
    priceSuffix: {
      ...typography.body,
      color: colors.mutedForeground,
    },
    monthlyEq: {
      ...typography.label,
      color: colors.primary,
      marginBottom: spacing.lg,
    },
    features: {
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    featureText: {
      ...typography.body,
      color: colors.foreground,
      flex: 1,
    },
    button: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      backgroundColor: isActive ? colors.muted : colors.primary,
    },
    buttonText: {
      ...typography.body,
      fontWeight: '700',
      color: isActive ? colors.mutedForeground : '#fff',
    },
  });

  const defaultFeatures = plan.isLifetime
    ? ['Acesso permanente', 'Todos os canais HD/4K', 'Sem renovação', 'Suporte prioritário']
    : ['Todos os canais HD/4K', 'Multi-dispositivos', 'Filmes e séries', 'Suporte'];

  const features = (plan as any).features ?? defaultFeatures;

  return (
    <View style={styles.card}>
      {popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MAIS POPULAR</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(plan.priceInCents)}</Text>
          <Text style={styles.priceSuffix}>{getPeriodSuffix(plan)}</Text>
        </View>
        {monthlyEq && <Text style={styles.monthlyEq}>Equivalente a {monthlyEq}</Text>}

        <View style={styles.features}>
          {features.map((f: string, i: number) => (
            <View key={i} style={styles.featureRow}>
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, { opacity: pressed || isActive ? 0.8 : 1 }]}
          onPress={() => !isActive && onSubscribe(plan)}
          disabled={isActive}
        >
          <Text style={styles.buttonText}>
            {isActive ? 'Plano atual' : 'Assinar agora'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PlansScreen() {
  const colors = useColors();
  const router = useRouter();
  const { accessStatus, refresh } = useSubscription();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialEligible, setTrialEligible] = useState(false);

  useEffect(() => {
    Promise.all([
      subscriptionService.getPlans().then(setPlans),
      trialService.getStatus().then((s) => setTrialEligible(s.eligible)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleActivateTrial = useCallback(async () => {
    const doActivate = async () => {
      setTrialLoading(true);
      try {
        await trialService.activate('mobile');
        await refresh();
        router.replace('/home');
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Erro ao ativar trial. Tente novamente.';
        Alert.alert('Erro', msg);
      } finally {
        setTrialLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Ativar seu período de teste gratuito de 3 dias?')) doActivate();
    } else {
      Alert.alert(
        'Ativar trial gratuito',
        'Você terá 3 dias de acesso completo gratuitamente. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ativar', onPress: doActivate },
        ]
      );
    }
  }, [refresh, router]);

  const handleSubscribe = useCallback((plan: Plan) => {
    // Abre o checkout no browser externo (evita taxa Apple/Google)
    const url = `${FRONTEND_URL}/checkout/${plan.slug}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Erro', 'Não foi possível abrir o navegador. Acesse bestplayer8k.com/checkout/' + plan.slug)
    );
  }, []);

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
      marginVertical: spacing.lg,
    },
    trialCard: {
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.primary + '40',
      backgroundColor: colors.primary + '10',
      padding: spacing.lg,
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    trialTitle: {
      ...typography.header,
      color: colors.foreground,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    trialDesc: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    trialButton: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    trialButtonText: {
      ...typography.body,
      fontWeight: '700',
      color: '#fff',
    },
    sectionTitle: {
      ...typography.header,
      color: colors.foreground,
      marginBottom: spacing.lg,
    },
    noteCard: {
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    noteText: {
      ...typography.small,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
  });

  const activeStatus = accessStatus?.status;

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Planos" icon={CreditCard} />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="Planos" icon={CreditCard} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Acesso completo a todos os canais, filmes e séries em HD e 4K.
        </Text>

        {/* Trial CTA */}
        {trialEligible && (
          <View style={styles.trialCard}>
            <Gift size={32} color={colors.primary} />
            <Text style={styles.trialTitle}>Experimente grátis por 3 dias</Text>
            <Text style={styles.trialDesc}>
              Sem necessidade de cartão. Acesse tudo gratuitamente por 3 dias.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.trialButton, { opacity: pressed ? 0.8 : 1 }]}
              onPress={handleActivateTrial}
              disabled={trialLoading}
            >
              {trialLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Zap size={18} color="#fff" />
              }
              <Text style={styles.trialButtonText}>
                {trialLoading ? 'Ativando...' : 'Ativar trial gratuito'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Plans */}
        <Text style={styles.sectionTitle}>Escolha seu plano</Text>
        {plans
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={
                (activeStatus === 'ACTIVE' || activeStatus === 'LIFETIME') &&
                false // comparison with active plan id would require subscription data
              }
              onSubscribe={handleSubscribe}
              colors={colors}
            />
          ))}

        {/* Note about external browser */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            O pagamento será concluído no seu navegador de forma segura.
            Após a confirmação, volte ao app e seu acesso será liberado automaticamente.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
