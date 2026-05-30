import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import InputField from '../../components/InputField';
import { useAuth } from '../../context/AuthContext';
import { getSchools } from '../../services/adminService';

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    password: '',
    phone: '',
    school_id: '',
    school_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const result = await getSchools();
        setSchools(result.schools || []);
      } catch (err) {
        console.warn('Failed to load schools:', err.message);
      } finally {
        setLoadingSchools(false);
      }
    };
    loadSchools();
  }, []);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (!form.full_name.trim() || !form.password || !form.school_id || !form.phone.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setError('');
    setLoading(true);
    const result = await register({
      full_name: form.full_name.trim(),
      password: form.password,
      school_id: form.school_id,
      phone: form.phone.trim(),
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.tagContainer}>
            <View style={styles.tagLine} />
            <Text style={styles.tagText}>START YOUR JOURNEY</Text>
          </View>
          <Text style={styles.heroTitle}>
            Create <Text style={styles.heroItalic}>your </Text>account.
          </Text>
          <Text style={styles.heroSubtitle}>
            Join 4Bit Labs and access your school resources.
          </Text>
        </View>

        {/* Registration Card */}
        <View style={styles.card}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <InputField
            label="Full Name"
            value={form.full_name}
            onChangeText={(v) => updateForm('full_name', v)}
            placeholder="John Doe"
            icon="person"
          />

          <InputField
            label="Password"
            value={form.password}
            onChangeText={(v) => updateForm('password', v)}
            placeholder="••••••••"
            secureTextEntry
            icon="lock"
          />

          <InputField
            label="Phone Number"
            value={form.phone}
            onChangeText={(v) => updateForm('phone', v)}
            placeholder="e.g. +91 98765 43210"
            keyboardType="phone-pad"
            icon="phone"
          />

          {/* School Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>SELECT SCHOOL</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowSchoolPicker(!showSchoolPicker)}
              activeOpacity={0.8}
            >
              <Text style={form.school_name ? styles.pickerValueText : styles.pickerPlaceholder}>
                {form.school_name || 'Choose your school...'}
              </Text>
              <Text style={styles.pickerArrow}>▾</Text>
            </TouchableOpacity>
            {showSchoolPicker && (
              <View style={styles.pickerDropdown}>
                {loadingSchools ? (
                  <View style={styles.pickerOption}>
                    <Text style={styles.pickerOptionText}>Loading...</Text>
                  </View>
                ) : schools.length === 0 ? (
                  <View style={styles.pickerOption}>
                    <Text style={styles.pickerOptionText}>No schools available</Text>
                  </View>
                ) : (
                  schools.map((school) => (
                    <TouchableOpacity
                      key={school.id}
                      style={[
                        styles.pickerOption,
                        form.school_id === school.id && styles.pickerOptionActive,
                      ]}
                      onPress={() => {
                        updateForm('school_id', school.id);
                        updateForm('school_name', school.name);
                        setShowSchoolPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        form.school_id === school.id && styles.pickerOptionTextActive,
                      ]}>{school.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.9}
            style={styles.registerButtonWrapper}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.registerButton}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <View style={styles.registerButtonContent}>
                  <Text style={styles.registerButtonText}>Register Now</Text>
                  <Text style={styles.registerButtonArrow}>→</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingBottom: SPACING['5xl'] },
  heroSection: { marginBottom: SPACING['2xl'] },
  tagContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tagLine: { width: 32, height: 1, backgroundColor: 'rgba(55, 85, 195, 0.3)' },
  tagText: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: COLORS.secondary, textTransform: 'uppercase' },
  heroTitle: { fontSize: 36, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -1.5, lineHeight: 42, marginBottom: 8 },
  heroItalic: { fontStyle: 'italic', color: COLORS.primary },
  heroSubtitle: { fontSize: 14, color: COLORS.onSurfaceVariant, lineHeight: 20 },
  card: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, padding: SPACING['2xl'], ...SHADOWS.md },
  errorContainer: { backgroundColor: COLORS.errorContainer, padding: 12, borderRadius: RADIUS.md, marginBottom: SPACING.lg },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  pickerContainer: { marginBottom: SPACING.lg },
  pickerLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: COLORS.onSurfaceVariant, marginBottom: SPACING.sm, marginLeft: 4 },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surfaceContainerLow, borderRadius: RADIUS.lg, padding: 16 },
  pickerValueText: { fontSize: 15, color: COLORS.onSurface },
  pickerPlaceholder: { fontSize: 15, color: 'rgba(93, 63, 60, 0.4)' },
  pickerArrow: { fontSize: 16, color: COLORS.onSurfaceVariant },
  pickerDropdown: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.lg, marginTop: 4, ...SHADOWS.lg, overflow: 'hidden' },
  pickerOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceContainerLow },
  pickerOptionActive: { backgroundColor: COLORS.primaryFixed },
  pickerOptionText: { fontSize: 14, color: COLORS.onSurface },
  pickerOptionTextActive: { color: COLORS.primary, fontWeight: '700' },
  registerButtonWrapper: { borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.xl },
  registerButton: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, ...SHADOWS.primaryGlow },
  registerButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  registerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  registerButtonArrow: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  loginRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xl },
  loginLabel: { fontSize: 14, color: COLORS.onSurfaceVariant },
  loginLink: { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
});

export default RegisterScreen;
