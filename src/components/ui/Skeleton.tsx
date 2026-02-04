import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';
import { useColors } from '@/theme';
import { borderRadius } from '@/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.md,
  style,
  circle = false,
}: SkeletonProps) {
  const colors = useColors();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const sizeValue = typeof height === 'number' ? height : 20;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: circle ? sizeValue : width,
          height,
          borderRadius: circle ? sizeValue / 2 : radius,
          backgroundColor: colors.muted,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Preset skeleton components
export function SkeletonText({ lines = 1, width = '100%' }: { lines?: number; width?: DimensionValue }) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? '60%' : width}
          height={14}
          style={i < lines - 1 ? styles.textLine : undefined}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={150} borderRadius={borderRadius.xl} />
      <View style={styles.cardContent}>
        <Skeleton width="80%" height={16} />
        <Skeleton width="50%" height={12} style={styles.cardSubtitle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  textContainer: {},
  textLine: {
    marginBottom: 8,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    paddingTop: 12,
  },
  cardSubtitle: {
    marginTop: 8,
  },
});
