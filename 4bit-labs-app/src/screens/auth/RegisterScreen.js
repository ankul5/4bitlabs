import React, { useState, useEffect } from 'react';
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
import { getSchools } from '../../services/schoolService';
import { getCourses } from '../../services/courseService';

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    schoolId: '',
    schoolName: '',
    courseIds: [],
    courseName: '',
  });
  const [error, setError] = useState('');
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch schools on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const schoolList = await getSchools();
        setSchools(schoolList || []);
      } catch (err) {
        console.warn('Failed to load schools:', err.message);
        // Fallback: allow registration without school picker
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Fetch courses when school changes (uses public courses list)
  useEffect(() => {
    if (!form.schoolId) return;
    const loadCourses = async () => {
      try {
        // getCourses needs auth, so we show available courses for the school
        // For now, use school detail which includes courses
        const { getSchool } = require('../../services/schoolService');
        const school = await getSchool(form.schoolId);
        setCourses(school?.courses || []);
      } catch (err) {
        setCourses([]);
      }
    };
    loadCourses();
  }, [form.schoolId]);

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      schoolId: form.schoolId || undefined,
      courseIds: form.courseIds.length > 0 ? form.courseIds : undefined,
    });
    if (!result.success) {
      setError(result.error || 'Registration failed');
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
        {/* Hero Header */}
        <View style={styles.heroSection}>
          <View style={styles.tagContainer}>
            <View style={styles.tagLine} />
            <Text style={styles.tagText}>START YOUR JOURNEY</Text>
          </View>
          <Text style={styles.heroTitle}>
            Create <Text style={styles.heroItalic}>your </Text>future.
          </Text>
          <Text style={styles.heroSubtitle}>
            Join 4Bit Labs today and gain access to premium editorial educational resources.
          </Text>
        </View>

        {/* Registration Card */}
        <View style={styles.card}>
          {/* Step Indicators */}
          <View style={styles.stepIndicators}>
            <View style={[styles.stepBar, styles.stepActive]} />
            <View style={[styles.stepBar, step >= 2 && styles.stepActive]} />
            <View style={[styles.stepBar, step >= 3 && styles.stepActive]} />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <InputField
            label="Full Name"
            value={form.name}
            onChangeText={(v) => updateForm('name', v)}
            placeholder="John Doe"
          />

          <InputField
            label="Email Address"
            value={form.email}
            onChangeText={(v) => updateForm('email', v)}
            placeholder="john@example.com"
            keyboardType="email-address"
          />

          <InputField
            label="Phone Number"
            value={form.phone}
            onChangeText={(v) => updateForm('phone', v)}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
          />

          <InputField
            label="Password"
            value={form.password}
            onChangeText={(v) => updateForm('password', v)}
            placeholder="••••••••"
            secureTextEntry
          />

          {/* School Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Select School</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowSchoolPicker(!showSchoolPicker)}
              activeOpacity={0.8}
            >
              <Text style={form.schoolName ? styles.pickerValueText : styles.pickerPlaceholder}>
                {form.schoolName || 'Choose campus...'}
              </Text>
              <Text style={styles.pickerArrow}>▾</Text>
            </TouchableOpacity>
            {showSchoolPicker && (
              <View style={styles.pickerDropdown}>
                {schools.length === 0 ? (
                  <View style={styles.pickerOption}>
                    <Text style={styles.pickerOptionText}>{loadingData ? 'Loading...' : 'No schools found'}</Text>
                  </View>
                ) : (
                  schools.map((school) => (
                    <TouchableOpacity
                      key={school._id}
                      style={styles.pickerOption}
                      onPress={() => {
                        updateForm('schoolId', school._id);
                        updateForm('schoolName', school.name);
                        setShowSchoolPicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{school.name} ({school.code})</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Course Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Select Course</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCoursePicker(!showCoursePicker)}
              activeOpacity={0.8}
            >
              <Text style={form.courseName ? styles.pickerValueText : styles.pickerPlaceholder}>
                {form.courseName || 'Choose module...'}
              </Text>
              <Text style={styles.pickerArrow}>▾</Text>
            </TouchableOpacity>
            {showCoursePicker && (
              <View style={styles.pickerDropdown}>
                {courses.length === 0 ? (
                  <View style={styles.pickerOption}>
                    <Text style={styles.pickerOptionText}>{form.schoolId ? 'No courses available' : 'Select a school first'}</Text>
                  </View>
                ) : (
                  courses.map((course) => (
                    <TouchableOpacity
                      key={course._id}
                      style={styles.pickerOption}
                      onPress={() => {
                        updateForm('courseIds', [course._id]);
                        updateForm('courseName', course.title);
                        setShowCoursePicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{course.title}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.9}
            style={styles.registerButtonWrapper}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.registerButton}
            >
              {isLoading ? (
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

        {/* Footer Badges */}
        <View style={styles.footerBadges}>
          <View style={styles.certBadge}>
            <Text style={styles.certIcon}>✓</Text>
            <Text style={styles.certText}>ISO 27001 CERTIFIED</Text>
          </View>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>PRIVACY</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLinkText}>TERMS</Text>
            </TouchableOpacity>
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
  stepIndicators: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING['2xl'],
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  stepActive: {
    backgroundColor: COLORS.primary,
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
  pickerContainer: {
    marginBottom: SPACING.lg,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.lg,
    padding: 16,
  },
  pickerValueText: {
    fontSize: 15,
    color: COLORS.onSurface,
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: 'rgba(93, 63, 60, 0.4)',
  },
  pickerArrow: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },
  pickerDropdown: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.lg,
    marginTop: 4,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  pickerOptionText: {
    fontSize: 14,
    color: COLORS.onSurface,
  },
  registerButtonWrapper: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: SPACING.xl,
  },
  registerButton: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    ...SHADOWS.primaryGlow,
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  registerButtonArrow: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  loginLabel: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  footerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  footerLinkText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
  },
});

export default RegisterScreen;
