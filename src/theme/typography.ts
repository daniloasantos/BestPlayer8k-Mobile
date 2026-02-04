import { TextStyle } from 'react-native';

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
};

export const lineHeights = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
};

export const letterSpacings = {
  tighter: -1,
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

export const typography = {
  // Large titles (page headers)
  title: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.black,
    letterSpacing: letterSpacings.tighter,
    textTransform: 'uppercase',
  } as TextStyle,

  // Section headers
  header: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.black,
    letterSpacing: letterSpacings.tight,
  } as TextStyle,

  // Subheaders
  subheader: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  } as TextStyle,

  // Body text
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.md * lineHeights.normal,
  } as TextStyle,

  // Small body text
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,

  // Labels (uppercase, spaced)
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.black,
    letterSpacing: letterSpacings.widest,
    textTransform: 'uppercase',
  } as TextStyle,

  // Caption text
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  } as TextStyle,

  // Mini text (badges, etc)
  mini: {
    fontSize: 9,
    fontWeight: fontWeights.black,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase',
  } as TextStyle,

  // Button text
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.wide,
    textTransform: 'uppercase',
  } as TextStyle,

  // Input text
  input: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  } as TextStyle,

  // Small text alias
  small: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  } as TextStyle,
};

export type TypographyVariant = keyof typeof typography;
