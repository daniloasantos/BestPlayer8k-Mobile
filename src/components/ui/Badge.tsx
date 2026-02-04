import { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/theme';
import { borderRadius, spacing } from '@/theme';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'muted';

export type { BadgeVariant };
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const colors = useColors();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return `${colors.primary}20`;
      case 'secondary':
        return colors.muted;
      case 'success':
        return `${colors.success}20`;
      case 'warning':
        return `${colors.warning}20`;
      case 'error':
        return `${colors.error}20`;
      case 'outline':
        return 'transparent';
      case 'muted':
        return colors.muted;
      default:
        return `${colors.primary}20`;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.mutedForeground;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'outline':
        return colors.foreground;
      case 'muted':
        return colors.mutedForeground;
      default:
        return colors.primary;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return colors.border;
    return 'transparent';
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 2,
          paddingHorizontal: spacing.sm,
        };
      case 'lg':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        };
      default:
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 9;
      case 'lg':
        return 12;
      default:
        return 10;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        getSizeStyles(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: getFontSize(),
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
