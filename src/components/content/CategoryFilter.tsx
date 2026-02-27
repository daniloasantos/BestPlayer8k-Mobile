import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
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
  const [open, setOpen] = useState(false);

  const selectedCategory = categories.find((c) => c.id === selectedId);
  const selectedLabel = selectedId == null ? allLabel : (selectedCategory?.name ?? allLabel);

  const handleSelect = (id: string | null) => {
    onSelect(id);
    setOpen(false);
  };

  const styles = StyleSheet.create({
    container: {
      marginVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.card,
    },
    triggerText: {
      ...typography.label,
      color: colors.foreground,
      fontWeight: '500',
      flex: 1,
    },
    chevron: {
      marginLeft: spacing.xs,
    },
    skeletonTrigger: {
      height: 42,
      borderRadius: borderRadius.md,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '60%',
      paddingBottom: spacing.xl,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    sheetTitle: {
      ...typography.label,
      color: colors.mutedForeground,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    closeButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    closeButtonText: {
      ...typography.label,
      color: colors.primary,
      fontWeight: '600',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.cardBorder,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    optionText: {
      ...typography.body,
      color: colors.foreground,
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    countBadge: {
      marginLeft: spacing.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.muted,
    },
    countText: {
      ...typography.small,
      color: colors.mutedForeground,
      fontSize: 10,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton style={styles.skeletonTrigger} />
      </View>
    );
  }

  const allItem = showAll
    ? [{ id: null as string | null, name: allLabel, count: undefined }]
    : [];
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
  const items = [...allItem, ...sortedCategories.map((c) => ({ ...c, id: c.id as string | null }))];

  return (
    <View style={styles.container}>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <ChevronDown
          size={16}
          color={colors.mutedForeground}
          style={styles.chevron}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Categoria</Text>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </Pressable>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item.id ?? '__all__'}
              renderItem={({ item }) => {
                const isSelected = selectedId === item.id;
                return (
                  <Pressable style={styles.option} onPress={() => handleSelect(item.id)}>
                    <View style={styles.optionLeft}>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {item.name}
                      </Text>
                      {item.count !== undefined && item.count > 0 && (
                        <View style={styles.countBadge}>
                          <Text style={styles.countText}>{item.count}</Text>
                        </View>
                      )}
                    </View>
                    {isSelected && (
                      <Check size={16} color={colors.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
