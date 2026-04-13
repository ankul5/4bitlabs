// 4Bit Labs Design System — "The Precise Catalyst"
// Based on DESIGN.md: Editorial Scholar design system

export const LIGHT_COLORS = {
  // Primary Palette
  primary: '#ba0013',
  primaryContainer: '#e31e24',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#fffafa',

  // Secondary (Blue — minimal use, for progress/logic/success)
  secondary: '#3755c3',
  secondaryContainer: '#708cfd',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#00217a',

  // Tertiary (Calm blue — progress tracking)
  tertiary: '#006190',
  tertiaryContainer: '#007bb5',
  onTertiary: '#ffffff',
  tertiaryFixed: '#cbe6ff',

  // Surface Hierarchy (Nested Depth approach)
  surface: '#f7f9fb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',

  // On-Surface
  onSurface: '#191c1e',
  onSurfaceVariant: '#5d3f3c',
  onBackground: '#191c1e',

  // Outline
  outline: '#926f6b',
  outlineVariant: '#e7bdb8',

  // Error
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',

  // Inverse
  inverseSurface: '#2d3133',
  inverseOnSurface: '#eff1f3',

  // Fixed
  primaryFixed: '#ffdad6',
  primaryFixedDim: '#ffb4ab',
  secondaryFixed: '#dde1ff',

  // Misc
  surfaceTint: '#c00014',
  background: '#f7f9fb',

  // Utility
  white: '#ffffff',
  black: '#191c1e',
  transparent: 'transparent',
  
  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
};

export const DARK_COLORS = {
  ...LIGHT_COLORS,
  surface: '#121212',
  surfaceContainerLowest: '#1e1e1e',
  surfaceContainerLow: '#242424',
  surfaceContainer: '#2c2c2c',
  surfaceContainerHigh: '#323232',
  surfaceContainerHighest: '#383838',

  onSurface: '#e1e3e4',
  onSurfaceVariant: '#a89d9c',
  onBackground: '#e1e3e4',
  
  background: '#121212',
  
  inverseSurface: '#e1e3e4',
  inverseOnSurface: '#191c1e',
};

export const COLORS = LIGHT_COLORS;

export const FONTS = {
  headline: 'Manrope',
  headlineBold: 'Manrope-Bold',
  headlineExtraBold: 'Manrope-ExtraBold',
  body: 'Inter',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
  label: 'Inter',
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  display: 48,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#191c1e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#191c1e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#191c1e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  primaryGlow: {
    shadowColor: '#ba0013',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
};

export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
};
