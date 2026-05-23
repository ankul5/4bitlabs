import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getMyProfile, uploadImage, updateMyProfile } from '../../services/authService';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, COLORS } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarObj, setAvatarObj] = useState(null); // to hold selected local image uri
  
  // Editable form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    avatarUrl: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setForm({
          name: data?.name || user?.name || '',
          email: data?.email || user?.email || '',
          avatarUrl: data?.avatar || user?.avatar || '',
        });
      } catch (error) {
        console.warn('Failed to fetch profile:', error);
        // Fallback to user context
        setForm({
          name: user?.name || '',
          email: user?.email || '',
          avatarUrl: user?.avatar || '',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleImageOption = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose a method to set your new profile picture',
      [
        { text: 'Take Photo', onPress: () => handlePickImage('camera') },
        { text: 'Choose from Gallery', onPress: () => handlePickImage('gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handlePickImage = async (type) => {
    try {
      let result;
      if (type === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') return Alert.alert('Permission needed', 'Camera permission is required');
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') return Alert.alert('Permission needed', 'Gallery permission is required');
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setAvatarObj(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }

    setSaving(true);
    try {
      let latestAvatarUrl = form.avatarUrl;

      // If a new local image was selected, upload it first
      if (avatarObj) {
        const uploadRes = await uploadImage(avatarObj);
        if (uploadRes.url || (uploadRes.data && uploadRes.data.url)) {
          latestAvatarUrl = uploadRes.url || uploadRes.data.url;
        }
      }

      // Update profile details
      await updateMyProfile({
        name: form.name,
        email: form.email,
        avatar: latestAvatarUrl,
      });

      Alert.alert('Success', 'Profile updated successfully.');
      setForm(prev => ({ ...prev, avatarUrl: latestAvatarUrl }));
      setAvatarObj(null); // clear local preview
      
    } catch (error) {
      console.warn('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const displayAvatar = avatarObj || form.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'U')}`;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: COLORS.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: COLORS.surfaceContainerLowest }]}>
        <Text style={[styles.brandText, { color: COLORS.primary }]}>Profile</Text>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroRow}>
            <View style={styles.mainAvatarContainer}>
              <Image 
                source={{ uri: displayAvatar }} 
                style={styles.mainAvatar} 
              />
              <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={handleImageOption}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryContainer]}
                  style={styles.editBtnGradient}
                >
                  <MaterialIcons name="camera-alt" size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Editable Form */}
        <View style={[styles.formCard, { backgroundColor: COLORS.surfaceContainerLowest }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>Personal Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.onSurfaceVariant }]}>FULL NAME</Text>
            <TextInput
              style={[styles.input, { color: COLORS.onSurface, borderColor: COLORS.surfaceContainerHighest }]}
              value={form.name}
              onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.onSurfaceVariant + '80'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.onSurfaceVariant }]}>EMAIL ADDRESS</Text>
            <TextInput
              style={[styles.input, { color: COLORS.onSurface, borderColor: COLORS.surfaceContainerHighest }]}
              value={form.email}
              onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.onSurfaceVariant + '80'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={styles.primaryActionBtn} 
            activeOpacity={0.9} 
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              style={styles.primaryActionGradient}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryActionText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryActionBtn} activeOpacity={0.7} onPress={handleLogout}>
            <Text style={[styles.secondaryActionText, { color: COLORS.error || '#ef4444' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={[styles.quickLinksCard, { backgroundColor: COLORS.surfaceContainerLowest }]}>
          <Text style={[styles.quickLinksTitle, { color: COLORS.onSurface }]}>Preferences</Text>

          <View style={[styles.quickLinkItem]}>
            <MaterialIcons name="dark-mode" size={24} color={COLORS.onSurfaceVariant} style={{ marginRight: 8 }} />
            <Text style={[styles.quickLinkText, { flex: 1, color: COLORS.onSurface }]}>Dark Mode</Text>
            <Switch value={isDark} onValueChange={() => toggleTheme(user?._id || user?.id)} trackColor={{ false: '#767577', true: COLORS.primary }} />
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 16,
    ...SHADOWS.sm,
    zIndex: 10,
    alignItems: 'center',
  },
  brandText: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  scrollContent: { padding: SPACING.xl, paddingTop: SPACING['2xl'] },
  heroSection: { marginBottom: SPACING['2xl'] },
  heroRow: { alignItems: 'center' },
  mainAvatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'transparent',
    ...SHADOWS.md,
  },
  mainAvatar: { width: '100%', height: '100%', borderRadius: 60 },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#ffffff',
    ...SHADOWS.sm,
  },
  editBtnGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: SPACING.lg },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtonsRow: { gap: 12, marginBottom: SPACING.xl },
  primaryActionBtn: { borderRadius: RADIUS.full, ...SHADOWS.primaryGlow },
  primaryActionGradient: { paddingVertical: 16, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  secondaryActionBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  secondaryActionText: { fontSize: 16, fontWeight: '700' },
  quickLinksCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 229, 0.5)',
    ...SHADOWS.sm,
  },
  quickLinksTitle: { fontSize: 15, fontWeight: '800', marginBottom: SPACING.lg },
  quickLinkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  quickLinkText: { fontSize: 14, fontWeight: '500' },
});

export default ProfileScreen;
