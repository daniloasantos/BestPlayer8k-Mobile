import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { qualityColors } from '@/theme';
import { borderRadius } from '@/theme';

type QualityLevel = 'UHD_4K' | 'FHD' | 'HD' | 'SD' | 'H265';
type BadgeSize = 'sm' | 'md' | 'lg';

interface QualityBadgeProps {
  quality: QualityLevel;
  size?: BadgeSize;
}

export function QualityBadge({ quality, size = 'md' }: QualityBadgeProps) {
  const config = qualityColors[quality];

  const getLabel = () => {
    switch (quality) {
      case 'UHD_4K':
        return '4K';
      case 'FHD':
        return 'FHD';
      case 'HD':
        return 'HD';
      case 'SD':
        return 'SD';
      case 'H265':
        return 'H265';
      default:
        return quality;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 2,
          paddingHorizontal: 4,
          fontSize: 8,
        };
      case 'lg':
        return {
          paddingVertical: 6,
          paddingHorizontal: 10,
          fontSize: 12,
        };
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: 6,
          fontSize: 10,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // SD doesn't have gradient
  if ('solid' in config) {
    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: config.solid,
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: config.text,
              fontSize: sizeStyles.fontSize,
            },
          ]}
        >
          {getLabel()}
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={config.gradient as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.badge,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {getLabel()}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
