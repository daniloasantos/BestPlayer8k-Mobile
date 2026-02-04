import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useColors } from '@/theme';
import { spacing } from '@/theme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  overlay?: boolean;
}

export function Loading({
  message,
  size = 'large',
  fullScreen = true,
  overlay = false,
}: LoadingProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        fullScreen ? styles.fullScreen : undefined,
        overlay ? [styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }] : undefined,
        !overlay ? { backgroundColor: colors.background } : undefined,
      ]}
    >
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.mutedForeground }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  message: {
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: '500',
  },
});
