import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import InputField from '../../components/InputField';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
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
        {/* Brand Logo */}
        <View style={styles.brandSection}>
          <Text style={styles.brandText}>4BIT LABS</Text>
          <View style={styles.brandUnderline} />
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Continue your learning journey</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <InputField
            label="Email or Phone"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email or phone"
            keyboardType="email-address"
            icon="person"
          />

          {/* Password Input */}
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            icon="lock"
            rightIcon={showPassword ? 'visibility-off' : 'visibility'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.9}
            style={styles.loginButtonWrapper}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginButton}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Login to Dashboard</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Google Sign In */}
          <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Links */}
        <View style={styles.bottomLinks}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerRow}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.registerLabel}>New to 4Bit Labs? </Text>
            <Text style={styles.registerLink}>Register →</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.mentorHint}>
          <MaterialIcons name="admin-panel-settings" size={16} color="#6366f1" />
          <Text style={styles.mentorHintText}>Mentors & Teachers: Login with your admin credentials</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>4BIT LABS © 2026</Text>
        </View>
      </ScrollView>

      {/* Decorative blurs — non-interactive */}
      <View style={styles.decorBlobLeft} pointerEvents="none" />
      <View style={styles.decorBlobRight} pointerEvents="none" />
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
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -2,
    marginBottom: 8,
  },
  brandUnderline: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    ...SHADOWS.md,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
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
    marginTop: 8,
  },
  loginButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    ...SHADOWS.primaryGlow,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(231, 189, 184, 0.1)',
    marginVertical: SPACING['2xl'],
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    gap: 12,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  googleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  bottomLinks: {
    alignItems: 'center',
    marginTop: SPACING['2xl'],
    gap: 12,
  },
  forgotText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING['4xl'],
    opacity: 0.4,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.onSurfaceVariant,
  },
  decorBlobLeft: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 200,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(186, 0, 19, 0.03)',
  },
  decorBlobRight: {
    position: 'absolute',
    bottom: -80,
    right: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 97, 144, 0.03)',
  },
  mentorHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  mentorHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
});

export default LoginScreen;
