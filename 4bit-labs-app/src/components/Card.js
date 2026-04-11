import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../config/theme';

const Card = ({ children, variant = 'default', style, padded = true }) => {
  const variantStyle = {
    default: styles.cardDefault,
    elevated: styles.cardElevated,
    low: styles.cardLow,
    container: styles.cardContainer,
  };

  return (
    <View style={[
      styles.cardBase,
      variantStyle[variant] || variantStyle.default,
      padded && styles.padded,
      style,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  padded: {
    padding: SPACING.xl,
  },
  cardDefault: {
    backgroundColor: COLORS.surfaceContainerLowest,
    ...SHADOWS.sm,
  },
  cardElevated: {
    backgroundColor: COLORS.surfaceContainerLowest,
    ...SHADOWS.lg,
  },
  cardLow: {
    backgroundColor: COLORS.surfaceContainerLow,
  },
  cardContainer: {
    backgroundColor: COLORS.surfaceContainer,
  },
});

export default Card;
