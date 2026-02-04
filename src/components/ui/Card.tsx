import { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useColors } from '@/theme';
import { borderRadius, spacing } from '@/theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: keyof typeof spacing | number;
}

export function Card({
  children,
  variant = 'default',
  style,
  onPress,
  padding = 'lg',
}: CardProps) {
  const colors = useColors();

  const getCardStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: borderRadius['2xl'],
      padding: typeof padding === 'number' ? padding : spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        };
      case 'outlined':
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        };
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: colors.muted,
        };
      default:
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        };
    }
  };

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          getCardStyles(),
          pressed ? styles.pressed : undefined,
          style,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[getCardStyles(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
