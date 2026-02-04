import { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useColors } from '@/theme';
import { borderRadius, spacing } from '@/theme';

export interface SegmentOption {
  id?: string;
  value?: string;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  selectedId?: string;
  value?: string;
  onChange: (id: string) => void;
  fullWidth?: boolean;
  scrollable?: boolean;
}

export function SegmentedControl({
  options,
  selectedId,
  value,
  onChange,
  fullWidth = false,
  scrollable = false,
}: SegmentedControlProps) {
  const colors = useColors();
  const currentValue = value || selectedId;

  const getOptionId = (option: SegmentOption): string => {
    return option.value || option.id || option.label;
  };

  const renderSegments = () => (
    <View style={[styles.container, { backgroundColor: colors.muted }]}>
      {options.map((option) => {
        const optionId = getOptionId(option);
        const isSelected = optionId === currentValue;
        return (
          <TouchableOpacity
            key={optionId}
            style={[
              styles.segment,
              fullWidth ? styles.segmentFullWidth : undefined,
              isSelected ? [
                styles.segmentSelected,
                { backgroundColor: colors.card },
              ] : undefined,
            ]}
            onPress={() => onChange(optionId)}
            activeOpacity={0.7}
          >
            {option.icon && (
              <View style={styles.icon}>
                {option.icon}
              </View>
            )}
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? colors.foreground : colors.mutedForeground,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderSegments()}
      </ScrollView>
    );
  }

  return renderSegments();
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  segmentFullWidth: {
    flex: 1,
  },
  segmentSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
