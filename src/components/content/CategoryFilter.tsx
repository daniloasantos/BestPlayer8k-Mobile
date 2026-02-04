import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { Skeleton } from '@/components/ui';
import type { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedId?: string | null;
  onSelect: (categoryId: string | null) => void;
  isLoading?: boolean;
  showAll?: boolean;
  allLabel?: string;
}

export function CategoryFilter({
  categories,
  selectedId,
  onSelect,
  isLoading = false,
  showAll = true,
  allLabel = 'Todos',
}: CategoryFilterProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      marginVertical: spacing.sm,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      flexDirection: 'row',
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.card,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      ...typography.label,
      color: colors.mutedForeground,
    },
    chipTextSelected: {
      color: colors.foreground,
      fontWeight: '600',
    },
    countBadge: {
      marginLeft: spacing.xs,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.muted,
    },
    countBadgeSelected: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    countText: {
      ...typography.small,
      color: colors.mutedForeground,
      fontSize: 10,
    },
    countTextSelected: {
      color: colors.foreground,
    },
    loadingContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    skeletonChip: {
      width: 80,
      height: 36,
      borderRadius: borderRadius.full,
    },
  });

  const isSelected = (categoryId: string | null) => {
    return selectedId === categoryId;
  };

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} style={styles.skeletonChip} />
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderLoadingSkeleton()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showAll && (
          <Pressable
            style={[
              styles.chip,
              isSelected(null) ? styles.chipSelected : undefined,
            ]}
            onPress={() => onSelect(null)}
          >
            <Text
              style={[
                styles.chipText,
                isSelected(null) ? styles.chipTextSelected : undefined,
              ]}
            >
              {allLabel}
            </Text>
          </Pressable>
        )}

        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.chip,
              isSelected(category.id) ? styles.chipSelected : undefined,
            ]}
            onPress={() => onSelect(category.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[
                  styles.chipText,
                  isSelected(category.id) ? styles.chipTextSelected : undefined,
                ]}
                numberOfLines={1}
              >
                {category.name}
              </Text>
              {category.count !== undefined && category.count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    isSelected(category.id) ? styles.countBadgeSelected : undefined,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isSelected(category.id) ? styles.countTextSelected : undefined,
                    ]}
                  >
                    {category.count}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
