import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, logoColors } from '@/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  fallback?: string;
  size?: AvatarSize | number;
  gradient?: boolean;
}

export function Avatar({
  source,
  name,
  fallback,
  size = 'md',
  gradient = true,
}: AvatarProps) {
  const colors = useColors();

  const getSizeValue = (): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  };

  const getFontSize = (): number => {
    const sizeVal = getSizeValue();
    return Math.round(sizeVal * 0.4);
  };

  const sizeValue = getSizeValue();

  const containerStyle = {
    width: sizeValue,
    height: sizeValue,
    borderRadius: sizeValue / 2,
  };

  if (source) {
    return (
      <View style={[styles.container, containerStyle, { backgroundColor: colors.muted }]}>
        <Image
          source={source}
          style={[styles.image, containerStyle]}
          resizeMode="cover"
        />
      </View>
    );
  }

  const initial = (name || fallback)?.charAt(0).toUpperCase() || '?';

  if (gradient) {
    return (
      <LinearGradient
        colors={logoColors.bestPlayer as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, containerStyle]}
      >
        <Text style={[styles.initial, { fontSize: getFontSize() }]}>
          {initial}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, containerStyle, { backgroundColor: colors.primary }]}>
      <Text style={[styles.initial, { fontSize: getFontSize() }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
