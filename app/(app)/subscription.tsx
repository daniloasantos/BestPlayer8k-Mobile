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
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react-native';
import { subscriptionService } from '@/services/subscription.service';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import type { Subscription, SubscriptionStatus } from '@/services/subscription.service';

// ─── Types / Helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  ACTIVE:        { label: 'Ativa',                 color: '#34d399', icon: CheckCircle2 },
  LIFETIME:      { label: 'Vitalícia',             color: '#fbbf24', icon: CheckCircle2 },
  TRIAL:         { label: 'Trial gratuito',        color: '#60a5fa', icon: CheckCircle2 },
  TRIAL_EXPIRED: { label: 'Trial expirado',        color: '#94a3b8', icon: XCircle },
  PAST_DUE:      { label: 'Pagamento pendente',    color: '#fbbf24', icon: AlertTriangle },
  CANCELED:      { label: 'Cancelada',             color: '#f87171', icon: XCircle },
  EXPIRED:       { label: 'Expirada',              color: '#94a3b8', icon: XCircle },
  PENDING:       { label: 'Aguardando pagamento',  color: '#fbbf24', icon: Clock },
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
}

// ─── InfoRow Component ────────────────────────────────────────────────────────

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={{ ...typography.small, color: colors.mutedForeground }}>{label}</Text>
      <Text style={{ ...typography.body, color: accent || colors.foreground, fontWeight: '600' }}>
        {value}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SubscriptionScreen() {
  const colors = useColors();
  const router = useRouter();
  const { refresh } = useSubscription();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSubscription = useCallback(async () => {
    try {
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data.subscription ?? null);
    } catch {
      // Silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleCancel = useCallback(async () => {
    const doCancel = async () => {
      setCanceling(true);
      setError('');
      try {
        await subscriptionService.cancel(cancelReason || undefined);
        setSuccess('Assinatura cancelada. Seu acesso permanece até o fim do período pago.');
        setShowCancelConfirm(false);
        await refresh();
        await loadSubscription();
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Erro ao cancelar. Tente novamente.';
        setError(msg);
      } finally {
        setCanceling(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Confirmar cancelamento da assinatura?')) doCancel();
    } else {
      Alert.alert(
        'Cancelar assinatura',
        `Ao cancelar, você mantém acesso até ${formatDate(subscription?.expiresAt)}. Confirmar?`,
        [
          { text: 'Manter assinatura', style: 'cancel' },
          { text: 'Cancelar assinatura', style: 'destructive', onPress: doCancel },
        ]
      );
    }
  }, [cancelReason, refresh, loadSubscription, subscription]);

  const statusConfig = subscription
    ? (STATUS_CONFIG[subscription.status] ?? { label: subscription.status, color: colors.mutedForeground, icon: Clock })
    : null;

  const canCancel =
    subscription && ['ACTIVE', 'TRIAL', 'PAST_DUE'].includes(subscription.status);

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
    emptyCard: {
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.xl,
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    emptyText: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    statusCard: {
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    statusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    cardTitle: {
      ...typography.header,
      color: colors.foreground,
    },
    badgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: colors.muted,
    },
    badgeText: {
      ...typography.small,
      fontWeight: '700',
    },
    infoGrid: {
      gap: spacing.sm,
    },
    actionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    primaryButton: {
      flex: 1,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      ...typography.body,
      fontWeight: '700',
      color: '#fff',
    },
    dangerButton: {
      flex: 1,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.1)',
    },
    dangerButtonText: {
      ...typography.body,
      fontWeight: '600',
      color: '#ef4444',
    },
    cancelCard: {
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.08)',
      padding: spacing.lg,
      marginTop: spacing.md,
      gap: spacing.md,
    },
    cancelTitle: {
      ...typography.header,
      color: '#ef4444',
    },
    cancelDesc: {
      ...typography.body,
      color: colors.mutedForeground,
    },
    textInput: {
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
      padding: spacing.md,
      ...typography.body,
      color: colors.foreground,
      minHeight: 72,
      textAlignVertical: 'top',
    },
    cancelActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    alertCard: {
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    alertText: {
      ...typography.body,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      alignSelf: 'flex-end',
      paddingVertical: spacing.sm,
    },
    refreshText: {
      ...typography.label,
      color: colors.primary,
    },
  });

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Minha Assinatura" icon={CreditCard} />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="Minha Assinatura" icon={CreditCard} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Alerts */}
        {error ? (
          <View style={[styles.alertCard, { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: '#ef4444' }]}>
            <Text style={[styles.alertText, { color: '#ef4444' }]}>{error}</Text>
          </View>
        ) : null}
        {success ? (
          <View style={[styles.alertCard, { backgroundColor: 'rgba(52,211,153,0.1)', borderWidth: 1, borderColor: '#34d399' }]}>
            <Text style={[styles.alertText, { color: '#34d399' }]}>{success}</Text>
          </View>
        ) : null}

        {/* Refresh */}
        <Pressable
          style={({ pressed }) => [styles.refreshButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={async () => {
            setLoading(true);
            await loadSubscription();
          }}
        >
          <RefreshCw size={14} color={colors.primary} />
          <Text style={styles.refreshText}>Atualizar</Text>
        </Pressable>

        {!subscription ? (
          /* No subscription */
          <View style={styles.emptyCard}>
            <CreditCard size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { marginTop: spacing.md }]}>
              Você não possui uma assinatura ativa.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.8 : 1, alignSelf: 'stretch' }]}
              onPress={() => router.push('/plans')}
            >
              <Text style={styles.primaryButtonText}>Ver planos disponíveis</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Status card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.cardTitle}>Status da assinatura</Text>
                {statusConfig && (
                  <View style={styles.badgeContainer}>
                    <statusConfig.icon size={14} color={statusConfig.color} />
                    <Text style={[styles.badgeText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.infoGrid}>
                <InfoRow label="Plano" value={subscription.plan?.name ?? 'Trial'} />
                <InfoRow label="Início" value={formatDate(subscription.startedAt)} />
                {!subscription.plan?.isLifetime && (
                  <InfoRow label="Expira em" value={formatDate(subscription.expiresAt)} />
                )}
                {subscription.gracePeriodEndsAt && (
                  <InfoRow
                    label="Carência até"
                    value={formatDate(subscription.gracePeriodEndsAt)}
                    accent="#fbbf24"
                  />
                )}
                {subscription.canceledAt && (
                  <InfoRow
                    label="Cancelada em"
                    value={formatDate(subscription.canceledAt)}
                    accent="#f87171"
                  />
                )}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <Pressable
                style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => router.push('/plans')}
              >
                <Text style={styles.primaryButtonText}>
                  {subscription.status === 'ACTIVE' || subscription.status === 'LIFETIME'
                    ? 'Mudar de plano'
                    : 'Ver planos'}
                </Text>
              </Pressable>

              {canCancel && !showCancelConfirm && (
                <Pressable
                  style={({ pressed }) => [styles.dangerButton, { opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      handleCancel();
                    } else {
                      setShowCancelConfirm(true);
                    }
                  }}
                >
                  <Text style={styles.dangerButtonText}>Cancelar</Text>
                </Pressable>
              )}
            </View>

            {/* Cancel confirmation (web only) */}
            {showCancelConfirm && Platform.OS === 'web' && (
              <View style={styles.cancelCard}>
                <Text style={styles.cancelTitle}>Confirmar cancelamento</Text>
                <Text style={styles.cancelDesc}>
                  Ao cancelar, você mantém acesso até{' '}
                  <Text style={{ fontWeight: '700', color: colors.foreground }}>
                    {formatDate(subscription.expiresAt)}
                  </Text>
                  . Após essa data o acesso será encerrado.
                </Text>
                <TextInput
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  placeholder="Motivo do cancelamento (opcional)"
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  style={styles.textInput}
                />
                <View style={styles.cancelActions}>
                  <Pressable
                    style={({ pressed }) => [styles.dangerButton, { flex: 1, opacity: canceling || pressed ? 0.8 : 1 }]}
                    onPress={handleCancel}
                    disabled={canceling}
                  >
                    {canceling
                      ? <ActivityIndicator size="small" color="#ef4444" />
                      : <Text style={styles.dangerButtonText}>Confirmar</Text>
                    }
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryButton,
                      { flex: 1, opacity: pressed ? 0.8 : 1, backgroundColor: colors.muted },
                    ]}
                    onPress={() => setShowCancelConfirm(false)}
                  >
                    <Text style={[styles.primaryButtonText, { color: colors.foreground }]}>
                      Manter
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
