import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { useColors } from '@/theme';
import { spacing, iconSizes } from '@/theme';

interface SectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onSeeAll?: () => void;
  onActionPress?: () => void;
  seeAllText?: string;
  actionLabel?: string;
  children: ReactNode;
  noPadding?: boolean;
}

// Helper to check if something is a component (function or forwardRef)
const isComponent = (value: unknown): value is React.ComponentType<any> => {
  if (typeof value === 'function') return true;
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    return '$$typeof' in obj || 'render' in obj;
  }
  return false;
};

export function Section({
  title,
  subtitle,
  icon,
  onSeeAll,
  onActionPress,
  seeAllText = 'Ver tudo',
  actionLabel,
  children,
  noPadding = false,
}: SectionProps) {
  const colors = useColors();

  const handlePress = onActionPress || onSeeAll;
  const buttonLabel = actionLabel || seeAllText;

  const renderIcon = () => {
    if (!icon) return null;
    if (isComponent(icon)) {
      const IconComponent = icon as LucideIcon;
      return (
        <View style={styles.icon}>
          <IconComponent size={18} color={colors.foreground} />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, !noPadding ? styles.padding : undefined]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            {icon && renderIcon()}
            <Text style={[styles.title, { color: colors.foreground }]}>
              {title}
            </Text>
          </View>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {handlePress && (
          <TouchableOpacity
            onPress={handlePress}
            style={styles.seeAllButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              {buttonLabel}
            </Text>
            <ChevronRight size={iconSizes.sm} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  padding: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {},
});
