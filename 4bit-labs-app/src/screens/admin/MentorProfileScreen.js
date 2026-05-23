import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, TextInput, Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../config/theme';
import { updateProfile } from '../../services/adminService';
import StitchHeader from '../../components/StitchHeader';

const { width } = Dimensions.get('window');

const MentorProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Permission Required', 'Please grant camera roll access to change your photo.');
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setForm(prev => ({ ...prev, avatar: result.assets[0].uri }));
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open image picker');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        avatar: form.avatar,
      });
      if (refreshProfile) await refreshProfile();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const avatarUri = form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'M')}&background=ba0013&color=fff&size=200`;

  return (
    <View style={[styles.container, { backgroundColor: COLORS.surface }]}>
      <StitchHeader user={user} onSearchPress={() => {}} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Profile Hero */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryContainer]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={editing ? pickImage : undefined}
            activeOpacity={editing ? 0.7 : 1}
          >
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            {editing && (
              <View style={styles.editBadge}>
                <MaterialIcons name="camera-alt" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.heroName}>{form.name}</Text>
          <View style={styles.roleBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.roleText}>PLATFORM MENTOR</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Edit/Save Toggle */}
          <View style={styles.editRow}>
            <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>About You</Text>
            {editing ? (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: COLORS.outlineVariant }]}
                  onPress={() => {
                    setEditing(false);
                    setForm({
                      name: user?.name || '', email: user?.email || '',
                      phone: user?.phone || '', bio: user?.bio || '', avatar: user?.avatar || '',
                    });
                  }}
                >
                  <Text style={[styles.cancelText, { color: COLORS.onSurfaceVariant }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.primary }]} onPress={handleSave} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.editToggle, { backgroundColor: COLORS.surfaceContainerHighest }]}
                onPress={() => setEditing(true)}
              >
                <MaterialIcons name="edit" size={16} color={COLORS.onSurface} />
                <Text style={[styles.editToggleText, { color: COLORS.onSurface }]}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Fields */}
          <View style={styles.fieldsCard}>
            <ProfileField
              icon="person"
              label="FULL NAME"
              value={form.name}
              editing={editing}
              onChange={(v) => setForm(p => ({ ...p, name: v }))}
            />
            <View style={[styles.fieldDivider, { backgroundColor: COLORS.tabBarBorder }]} />

            <ProfileField
              icon="email"
              label="EMAIL ADDRESS"
              value={form.email}
              editing={editing}
              keyboardType="email-address"
              onChange={(v) => setForm(p => ({ ...p, email: v }))}
            />
            <View style={[styles.fieldDivider, { backgroundColor: COLORS.tabBarBorder }]} />

            <ProfileField
              icon="phone"
              label="PHONE NUMBER"
              value={form.phone}
              editing={editing}
              keyboardType="phone-pad"
              placeholder="Add phone number"
              onChange={(v) => setForm(p => ({ ...p, phone: v }))}
            />
          </View>

          {/* Preferences Section */}
          <Text style={[styles.sectionTitle, { color: COLORS.onSurface, marginTop: 40 }]}>Preferences</Text>
          <View style={[styles.prefCard, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
            <TouchableOpacity style={styles.prefItem} onPress={toggleTheme}>
              <View style={styles.prefLeft}>
                <MaterialIcons name="dark-mode" size={22} color={COLORS.onSurfaceVariant} />
                <Text style={[styles.prefLabel, { color: COLORS.onSurface }]}>Appearance</Text>
              </View>
              <View style={styles.prefRight}>
                <Text style={[styles.prefValue, { color: COLORS.onSurfaceVariant }]}>{isDark ? 'Dark' : 'Light'}</Text>
                <MaterialIcons name="chevron-right" size={20} color={COLORS.onSurfaceVariant} />
              </View>
            </TouchableOpacity>

            <View style={[styles.fieldDivider, { backgroundColor: COLORS.tabBarBorder, marginHorizontal: 20 }]} />

            <TouchableOpacity style={styles.prefItem}>
              <View style={styles.prefLeft}>
                <MaterialIcons name="notifications-active" size={22} color={COLORS.onSurfaceVariant} />
                <Text style={[styles.prefLabel, { color: COLORS.onSurface }]}>Notifications</Text>
              </View>
              <View style={styles.prefRight}>
                <Text style={[styles.prefValue, { color: COLORS.onSurfaceVariant }]}>Enabled</Text>
                <MaterialIcons name="chevron-right" size={20} color={COLORS.onSurfaceVariant} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: COLORS.onSurfaceVariant }]}>
            4Bit Labs v1.0.0 • Platform Mentor Account
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const ProfileField = ({ icon, label, value, editing, onChange, keyboardType, placeholder }) => (
  <View style={styles.fieldRow}>
    <View style={[styles.fieldIcon, { backgroundColor: COLORS.primary + '12' }]}>
      <MaterialIcons name={icon} size={18} color={COLORS.primary} />
    </View>
    <View style={styles.fieldContent}>
      <Text style={[styles.fieldLabel, { color: COLORS.onSurfaceVariant }]}>{label}</Text>
      {editing ? (
        <TextInput
          style={[styles.fieldInput, { color: COLORS.onSurface, borderBottomColor: COLORS.primary }]}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          placeholder={placeholder || ''}
          placeholderTextColor={COLORS.onSurfaceVariant + '60'}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: COLORS.onSurface }]}>{value || 'Not set'}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 40,
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  heroName: { fontSize: 24, fontFamily: FONTS.headline, fontWeight: '900', color: 'white', letterSpacing: -0.5 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  roleText: { fontSize: 10, fontFamily: FONTS.label, fontWeight: '800', letterSpacing: 1.5, color: 'rgba(255,255,255,0.8)' },

  content: { padding: 24, marginTop: -16 },

  editRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontFamily: FONTS.headline, fontWeight: '800' },
  editActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1 },
  cancelText: { fontSize: 12, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: RADIUS.full },
  saveText: { color: 'white', fontSize: 12, fontWeight: '800' },
  editToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full },
  editToggleText: { fontSize: 12, fontWeight: '700' },

  fieldsCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.tabBarBorder,
    ...SHADOWS.sm,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  fieldIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 9, fontFamily: FONTS.label, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  fieldValue: { fontSize: 15, fontFamily: FONTS.body, fontWeight: '600' },
  fieldInput: { fontSize: 15, fontFamily: FONTS.body, fontWeight: '600', borderBottomWidth: 1, paddingVertical: 4 },
  fieldDivider: { height: 1, marginHorizontal: 16 },

  prefCard: { borderRadius: 24, paddingVertical: 4, borderWidth: 1, marginTop: 16 },
  prefItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  prefLabel: { fontSize: 15, fontWeight: '600' },
  prefRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prefValue: { fontSize: 13, fontWeight: '600' },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, marginTop: 40,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: '#ef444430',
  },
  signOutText: { fontSize: 14, fontWeight: '700', color: '#ef4444' },

  footerText: { textAlign: 'center', fontSize: 11, marginTop: 20, fontWeight: '600' },
});

export default MentorProfileScreen;
