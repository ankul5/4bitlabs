import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Modal, TextInput, ActivityIndicator, Switch } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { SHADOWS } from '../../config/theme';
import { updateMyProfile } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();
  const { isDark, toggleTheme, COLORS } = useTheme();
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleExportCSV = () => {
    Alert.alert('Export', 'Attendance CSV export will be available in the next update.');
  };

  const handleSaveProfile = async () => {
    try {
      if (!editForm.name.trim() || !editForm.email.trim()) {
        return Alert.alert('Error', 'Name and Email are required.');
      }
      setIsSaving(true);
      await updateMyProfile(editForm);
      if (refreshUser) await refreshUser();
      Alert.alert('Success', 'Profile updated successfully.');
      setEditModalVisible(false);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { section: 'Account', items: [
      { icon: 'person', label: 'Profile', subtitle: user?.name || 'Mentor', onPress: () => setEditModalVisible(true) },
      { icon: 'email', label: 'Email', subtitle: user?.email || '-', onPress: () => setEditModalVisible(true) },
      { icon: 'phone', label: 'Phone', subtitle: user?.phone || 'Not set', onPress: () => setEditModalVisible(true) },
      { icon: 'school', label: 'Role', subtitle: (user?.role || 'mentor').toUpperCase(), onPress: () => {} },
    ]},
    { section: 'Data', items: [
      { icon: 'file-download', label: 'Export Attendance CSV', subtitle: 'Download attendance records', onPress: handleExportCSV },
      { icon: 'backup', label: 'Backup Data', subtitle: 'Coming soon', onPress: () => {} },
    ]},
    { section: 'App', items: [
      { icon: 'dark-mode', label: 'Dark Mode', subtitle: 'Toggle app theme', isToggle: true, value: isDark, onToggle: toggleTheme },
      { icon: 'info', label: 'Version', subtitle: '2.0.0 (PostgreSQL)', onPress: () => {} },
      { icon: 'help', label: 'Help & Support', subtitle: 'Contact admin', onPress: () => Linking.openURL('mailto:support@4bitlabs.com') },
    ]},
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.surface }]}>
      <Text style={[styles.header, { color: COLORS.onSurface }]}>Settings</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: COLORS.surfaceContainerLowest }]}>
          <View style={[styles.avatarLarge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.avatarLargeText}>{(user?.name || 'M')[0].toUpperCase()}</Text>
          </View>
          <Text style={[styles.profileName, { color: COLORS.onSurface }]}>{user?.name || 'Mentor'}</Text>
          <Text style={[styles.profileEmail, { color: COLORS.onSurfaceVariant }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: COLORS.primaryFixed }]}>
            <MaterialCommunityIcons name="shield-check" size={14} color={COLORS.primary} />
            <Text style={[styles.roleBadgeText, { color: COLORS.primary }]}>{(user?.role || 'mentor').toUpperCase()}</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: COLORS.onSurfaceVariant }]}>{section.section}</Text>
            {section.items.map((item, ii) => (
              <TouchableOpacity key={ii} style={[styles.menuItem, { backgroundColor: COLORS.surfaceContainerLowest }]} onPress={item.onPress} activeOpacity={0.7} disabled={!item.onPress}>
                <View style={[styles.menuIcon, { backgroundColor: COLORS.surfaceContainerLow }]}>
                  <MaterialIcons name={item.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: COLORS.onSurface }]}>{item.label}</Text>
                  <Text style={[styles.menuSubtitle, { color: COLORS.onSurfaceVariant }]}>{item.subtitle}</Text>
                </View>
                {item.isToggle ? (
                  <Switch value={item.value} onValueChange={item.onToggle} trackColor={{ false: '#767577', true: COLORS.primary }} />
                ) : (
                  item.onPress && item.label !== 'Role' && item.label !== 'Version' && (
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.onSurfaceVariant} />
                  )
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => {
          Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
          ]);
        }}>
          <MaterialIcons name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16 }}>
              <View>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={v => setEditForm({ ...editForm, name: v })}
                  placeholder="Enter full name"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={v => setEditForm({ ...editForm, email: v })}
                  placeholder="Enter new email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.inputHint}>This will also update your login credentials.</Text>
              </View>

              <View>
                <Text style={styles.inputLabel}>Phone (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={v => setEditForm({ ...editForm, phone: v })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { fontSize: 24, fontWeight: '800', color: '#0f172a', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  scrollContent: { paddingHorizontal: 20 },
  profileCard: { alignItems: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 20, marginBottom: 24, ...SHADOWS.md },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLargeText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  profileName: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  profileEmail: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, gap: 6 },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#6366f1', letterSpacing: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 6, gap: 12, ...SHADOWS.sm },
  menuIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  menuSubtitle: { fontSize: 12, color: '#64748b' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 14, marginTop: 8, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  inputHint: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a' },
  saveBtn: { backgroundColor: '#6366f1', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default SettingsScreen;
