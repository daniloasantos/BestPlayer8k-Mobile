import { ReactNode } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useColors } from '@/theme';
import { borderRadius, spacing } from '@/theme';

type IconButtonVariant = 'default' | 'ghost' | 'outline' | 'filled';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  active?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  active = false,
  disabled = false,
  style,
}: IconButtonProps) {
  const colors = useColors();

  const getBackgroundColor = () => {
    if (disabled) return colors.muted;
    if (active) return `${colors.primary}20`;
    switch (variant) {
      case 'ghost':
        return 'transparent';
      case 'outline':
        return 'transparent';
      case 'filled':
        return colors.muted;
      default:
        return colors.card;
    }
  };

  const getBorderColor = () => {
    if (active) return colors.primary;
    if (variant === 'outline') return colors.border;
    return 'transparent';
  };

  const getSizeValue = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      default:
        return 40;
    }
  };

  const sizeValue = getSizeValue();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: sizeValue,
          height: sizeValue,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' || active ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
