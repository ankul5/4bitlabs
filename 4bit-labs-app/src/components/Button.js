import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS } from '../config/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | tertiary | outline
  size = 'lg',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  children,
}) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[styles.buttonBase, styles[`size_${size}`], style]}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, styles[`size_${size}`], SHADOWS.primaryGlow]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={[styles.primaryText, textStyle]}>{title}</Text>
              {icon && <Text style={styles.iconText}>{icon}</Text>}
              {children}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: {
      container: styles.secondaryContainer,
      text: styles.secondaryText,
    },
    tertiary: {
      container: styles.tertiaryContainer,
      text: styles.tertiaryText,
    },
    outline: {
      container: styles.outlineContainer,
      text: styles.outlineText,
    },
  };

  const v = variantStyles[variant] || variantStyles.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.buttonBase, styles[`size_${size}`], v.container, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'tertiary' ? COLORS.secondary : COLORS.onSurface} />
      ) : (
        <>
          <Text style={[v.text, textStyle]}>{title}</Text>
          {children}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  iconText: {
    color: COLORS.white,
    fontSize: 18,
    marginLeft: 8,
  },
  secondaryContainer: {
    backgroundColor: COLORS.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: COLORS.onSecondaryContainer,
    fontWeight: '700',
    fontSize: 14,
  },
  tertiaryContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  outlineContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: COLORS.onSurface,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default Button;
