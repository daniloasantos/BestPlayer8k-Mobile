import React, { ReactNode, isValidElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useColors } from '@/theme';
import { spacing } from '@/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
}

// Helper to check if something is a component (function or forwardRef)
const isComponent = (value: unknown): value is React.ComponentType<any> => {
  if (typeof value === 'function') return true;
  // Check for forwardRef components (objects with $$typeof and render)
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    return '$$typeof' in obj || 'render' in obj;
  }
  return false;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const colors = useColors();

  const renderIcon = () => {
    if (!icon) return null;

    // If it's already a valid React element, render it directly
    if (isValidElement(icon)) {
      return icon;
    }

    // Check if it's a component (function or forwardRef)
    if (isComponent(icon)) {
      const IconComponent = icon as LucideIcon;
      return <IconComponent size={40} color={colors.mutedForeground} />;
    }

    // Otherwise render as ReactNode (shouldn't reach here normally)
    return null;
  };

  const handleAction = onAction || action?.onPress;
  const buttonLabel = actionLabel || action?.label;

  return (
    <View style={styles.container}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
          {renderIcon()}
        </View>
      )}
      <Text style={[styles.title, { color: colors.foreground }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          {description}
        </Text>
      )}
      {handleAction && buttonLabel && (
        <Button
          title={buttonLabel}
          onPress={handleAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});
