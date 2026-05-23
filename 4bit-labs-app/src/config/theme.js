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

  // Tab bar
  tabBarBg: 'rgba(255, 255, 255, 0.95)',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',
};

export const DARK_COLORS = {
  // Primary Palette (Stitch Red)
  primary: '#e31e24',
  primaryContainer: '#ba0013',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#ffffff',

  // Secondary Palette (Vibrant Indigo/Blue)
  secondary: '#708cfd',
  secondaryContainer: '#3755c3',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#dde1ff',

  // Tertiary Palette (Sky Blue)
  tertiary: '#38bdf8',
  tertiaryContainer: '#007bb5',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#fbfcff',

  // Surface Hierarchy (Stitch Deep Slate)
  surface: '#0f172a',                // Deep Slate background
  surfaceContainerLowest: '#020617', // Pitch black-blue
  surfaceContainerLow: '#0f172a',    // Same as surface
  surfaceContainer: '#1e293b',       // Standard card
  surfaceContainerHigh: '#1e293b',   // High contrast card
  surfaceContainerHighest: '#334155', // Navigation/Tabs background

  // Contextual
  background: '#0f172a',
  onBackground: '#f8fafc',
  onSurface: '#f8fafc',              // High contrast off-white
  onSurfaceVariant: '#94a3b8',       // Mute slate text
  outline: '#94a3b8',
  outlineVariant: '#475569',
  
  // Error
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  // Fixed/Misc
  surfaceTint: '#ba0013',
  inverseSurface: '#f8fafc',
  inverseOnSurface: '#0f172a',

  // Fixed Tokens (mirrored from LIGHT_COLORS)
  tertiaryFixed: '#cbe6ff',
  primaryFixed: '#ffdad6',
  primaryFixedDim: '#ffb4ab',
  secondaryFixed: '#dde1ff',

  // Utility
  white: '#ffffff',
  black: '#191c1e',
  transparent: 'transparent',

  // Semantic
  success: '#4ade80',
  warning: '#fbbf24',

  // Tab bar
  tabBarBg: 'rgba(2, 6, 23, 0.95)',
  tabBarBorder: 'rgba(255, 255, 255, 0.05)',
};

import { StyleSheet } from 'react-native';

// ─── Mutable COLORS object ────────────────────────────────────────────────────
// Start with DARK as default. ThemeContext will call setActiveColors() to update.
export let COLORS = { ...DARK_COLORS };
export let isDarkTheme = true;

/**
 * Update the COLORS export in-place so every file that imported it sees new values.
 * Called by ThemeContext whenever the user toggles theme.
 */
export const setActiveColors = (isDark) => {
  isDarkTheme = isDark;
  const source = isDark ? DARK_COLORS : LIGHT_COLORS;
  Object.keys(source).forEach((key) => {
    COLORS[key] = source[key];
  });
};

const darkToLightMap = {
  '#0f172a': '#f7f9fb',
  '#020617': '#ffffff',
  '#1e293b': '#eceef0',
  '#334155': '#e0e3e5',
  '#f8fafc': '#191c1e',
  '#94a3b8': '#5d3f3c',
  '#475569': '#e7bdb8',
  'rgba(2, 6, 23, 0.95)': 'rgba(255, 255, 255, 0.95)',
  'rgba(255, 255, 255, 0.05)': 'rgba(0, 0, 0, 0.06)',
};

function mapStyleTheme(styleObj) {
  const mapped = {};
  for (const key in styleObj) {
    const val = styleObj[key];
    if (typeof val === 'string') {
      const lowerVal = val.toLowerCase();
      mapped[key] = darkToLightMap[lowerVal] || val;
    } else if (typeof val === 'object' && val !== null) {
      mapped[key] = mapStyleTheme(val);
    } else {
      mapped[key] = val;
    }
  }
  return mapped;
}

const originalCreate = StyleSheet.create;

StyleSheet.create = (styles) => {
  const registered = originalCreate(styles);
  return new Proxy(registered, {
    get(target, prop) {
      const originalStyle = target[prop];
      if (typeof originalStyle === 'object' && originalStyle !== null) {
        if (!isDarkTheme) {
          return mapStyleTheme(originalStyle);
        }
      }
      return originalStyle;
    }
  });
};

export const FONTS = {
  headline: 'Manrope-ExtraBold',
  headlineSemibold: 'Manrope-SemiBold',
  headlineBold: 'Manrope-Bold',
  headlineExtraBold: 'Manrope-ExtraBold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
  label: 'Inter-Bold',
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
