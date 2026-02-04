import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw, ChevronLeft } from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';

interface PlayerErrorProps {
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function PlayerError({
  message = 'Erro ao reproduzir o vídeo',
  onRetry,
  onBack,
}: PlayerErrorProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    backButton: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.header,
      color: colors.foreground,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    message: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
    },
    retryText: {
      ...typography.body,
      color: colors.foreground,
      fontWeight: '600',
    },
    errorCode: {
      ...typography.small,
      color: colors.mutedForeground,
      marginTop: spacing.lg,
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      {onBack && (
        <Pressable style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={24} color={colors.foreground} />
        </Pressable>
      )}

      <View style={styles.iconContainer}>
        <AlertTriangle size={40} color={colors.error} />
      </View>

      <Text style={styles.title}>Não foi possível reproduzir</Text>
      <Text style={styles.message}>
        Verifique sua conexão de internet e tente novamente.
      </Text>

      {onRetry && (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={20} color={colors.foreground} />
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      )}

      {message && message !== 'Erro ao reproduzir o vídeo' && (
        <Text style={styles.errorCode}>Erro: {message}</Text>
      )}
    </View>
  );
}
