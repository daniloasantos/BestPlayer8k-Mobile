import React, { ReactNode, isValidElement } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, LucideIcon } from 'lucide-react-native';
import { useColors } from '@/theme';
import { spacing, iconSizes, borderRadius } from '@/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon | ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchPress?: () => void;
  rightAction?: ReactNode;
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

export function Header({
  title,
  subtitle,
  icon,
  showBack = false,
  onBack,
  showSearch = false,
  onSearchPress,
  rightAction,
}: HeaderProps) {
  const colors = useColors();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const renderIcon = () => {
    if (!icon) return null;

    if (isValidElement(icon)) {
      return icon;
    }

    if (isComponent(icon)) {
      const IconComponent = icon as LucideIcon;
      return <IconComponent size={22} color={colors.primary} />;
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backButton, { backgroundColor: colors.muted }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={iconSizes.md} color={colors.foreground} />
          </TouchableOpacity>
        )}
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            {renderIcon()}
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rightSection}>
        {showSearch && (
          <TouchableOpacity
            onPress={onSearchPress}
            style={[styles.searchButton, { backgroundColor: colors.muted }]}
          >
            <Search size={iconSizes.md} color={colors.foreground} />
          </TouchableOpacity>
        )}
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
