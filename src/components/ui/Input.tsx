import { useState, ReactNode } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useColors } from '@/theme';
import { borderRadius, spacing, iconSizes } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hint?: string;
}

export function Input({
  label,
  error,
  isPassword = false,
  leftIcon,
  rightIcon,
  hint,
  style,
  ...props
}: InputProps) {
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.input,
            borderColor: getBorderColor(),
          },
          isFocused ? styles.inputFocused : undefined,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            { color: colors.foreground },
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (isPassword || rightIcon) ? styles.inputWithRightIcon : undefined,
            style,
          ]}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
          autoCorrect={isPassword ? false : props.autoCorrect}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={iconSizes.md} color={colors.mutedForeground} />
            ) : (
              <Eye size={iconSizes.md} color={colors.mutedForeground} />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  inputFocused: {
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontWeight: '500',
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  leftIcon: {
    paddingLeft: spacing.lg,
  },
  rightIcon: {
    paddingRight: spacing.lg,
  },
  eyeButton: {
    paddingRight: spacing.lg,
    paddingLeft: spacing.sm,
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
