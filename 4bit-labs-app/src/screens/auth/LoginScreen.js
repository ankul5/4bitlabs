import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import InputField from '../../components/InputField';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login failed.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.tagContainer}>
            <View style={styles.tagLine} />
            <Text style={styles.tagText}>WELCOME BACK</Text>
          </View>
          <Text style={styles.heroTitle}>
            Sign <Text style={styles.heroItalic}>in</Text> to continue.
          </Text>
          <Text style={styles.heroSubtitle}>
            Access your 4Bit Labs dashboard and resources.
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <InputField
            label="Full Name / Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter full name or admin email"
            icon="person"
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            icon="lock"
            rightIcon={showPassword ? 'visibility' : 'visibility-off'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
            style={styles.loginButtonWrapper}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginButton}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <View style={styles.loginButtonContent}>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Text style={styles.loginButtonArrow}>→</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerLabel}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerBadges}>
          <View style={styles.certBadge}>
            <Text style={styles.certIcon}>✓</Text>
            <Text style={styles.certText}>4BIT LABS</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['5xl'],
  },
  heroSection: {
    marginBottom: SPACING['2xl'],
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tagLine: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(55, 85, 195, 0.3)',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -1.5,
    lineHeight: 42,
    marginBottom: 8,
  },
  heroItalic: {
    fontStyle: 'italic',
    color: COLORS.primary,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    ...SHADOWS.md,
  },
  errorContainer: {
    backgroundColor: COLORS.errorContainer,
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  loginButtonWrapper: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: SPACING.xl,
  },
  loginButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    ...SHADOWS.primaryGlow,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  loginButtonArrow: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  registerLabel: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  footerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING['2xl'],
    paddingHorizontal: 4,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  certIcon: {
    fontSize: 16,
    color: COLORS.tertiary,
  },
  certText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
  },
});

export default LoginScreen;
