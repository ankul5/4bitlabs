import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../config/theme';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  rightIcon,
  onRightIconPress,
  error,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {icon && (
          <MaterialIcons name={icon} style={styles.icon} />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={'rgba(93, 63, 60, 0.4)'}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            error && styles.inputError,
          ]}
        />
        {rightIcon && (
          <TouchableOpacity style={styles.rightIconWrapper} onPress={onRightIconPress}>
            <MaterialIcons name={rightIcon} style={styles.rightIcon} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.onSurface,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputError: {
    backgroundColor: '#fef2f2',
  },
  icon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    fontSize: 20,
    color: 'rgba(93, 63, 60, 0.5)',
  },
  rightIconWrapper: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  rightIcon: {
    fontSize: 20,
    color: 'rgba(93, 63, 60, 0.5)',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default InputField;
