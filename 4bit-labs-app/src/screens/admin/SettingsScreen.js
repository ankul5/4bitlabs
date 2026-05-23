import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Image, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';
import StitchHeader from '../../components/StitchHeader';

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const renderManagementTile = (icon, label, color) => (
    <TouchableOpacity style={[styles.tile, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
      <View style={[styles.tileIconBox, { backgroundColor: color + '15' }]}>
        <MaterialIcons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.tileLabel, { color: COLORS.onSurface }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderPreferenceItem = (icon, label, value, isDestructive, onPress) => (
    <TouchableOpacity 
      style={styles.prefItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.prefLeft}>
        <MaterialIcons name={icon} size={22} color={isDestructive ? '#ef4444' : COLORS.onSurfaceVariant} />
        <Text style={[styles.prefLabel, { color: isDestructive ? '#ef4444' : COLORS.onSurface }]}>{label}</Text>
      </View>
      <View style={styles.prefRight}>
        {value && <Text style={[styles.prefValue, { color: COLORS.onSurfaceVariant }]}>{value}</Text>}
        <MaterialIcons name="chevron-right" size={20} color={COLORS.onSurfaceVariant} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.surface }]}>
      <StitchHeader user={user} onSearchPress={() => {}} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={[styles.welcomeLabel, { color: COLORS.onSurfaceVariant }]}>WELCOME BACK, ADMIN</Text>
            <Text style={[styles.mainTitle, { color: COLORS.onSurface }]}>Settings & Management</Text>
          </View>

          {/* Management Bento Grid */}
          <View style={styles.tileGrid}>
            {renderManagementTile('security', 'Role Controls', COLORS.primary)}
            {renderManagementTile('analytics', 'Analytics Dashboard', COLORS.secondary)}
            {renderManagementTile('health-and-safety', 'System Health', COLORS.tertiary)}
            {renderManagementTile('vpn-key', 'Security Keys', COLORS.onSurfaceVariant)}
          </View>

          {/* Account Snippet */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: COLORS.onSurface }]}>Account</Text>
          </View>
          <View style={[styles.profileSnippet, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
            <Image 
              source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=ba0013&color=fff` }}
              style={[styles.snippetAvatar, { backgroundColor: COLORS.surfaceContainerHighest }]}
            />
            <View style={styles.snippetInfo}>
              <Text style={[styles.snippetName, { color: COLORS.onSurface }]}>{user?.name || 'Admin User'}</Text>
              <View style={styles.roleRow}>
                <View style={styles.activePing} />
                <Text style={[styles.snippetRole, { color: COLORS.onSurfaceVariant }]}>{(user?.role || 'Administrator').toUpperCase()}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: COLORS.surfaceContainerHighest }]}>
              <Text style={[styles.editBtnText, { color: COLORS.onSurface }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Preferences */}
          <View style={[styles.sectionHeader, { marginTop: 40 }]}>
            <Text style={[styles.sectionLabel, { color: COLORS.onSurface }]}>Personal Preferences</Text>
          </View>
          <View style={[styles.prefList, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
            {renderPreferenceItem('dark-mode', 'Change Theme', isDark ? 'Dark Mode' : 'Light Mode', false, toggleTheme)}
            {renderPreferenceItem('notifications-active', 'Notifications', 'Enabled', false, () => {})}
            {renderPreferenceItem('data-usage', 'Data & Export', null, false, () => {})}
            <View style={[styles.listDivider, { backgroundColor: COLORS.tabBarBorder }]} />
            {renderPreferenceItem('logout', 'Sign Out of Account', null, true, () => {
              Alert.alert('Logout', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
              ]);
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 12 },
  titleSection: { marginBottom: 32 },
  welcomeLabel: { fontSize: 10, fontFamily: FONTS.label, letterSpacing: 2, fontWeight: '800' },
  mainTitle: { fontSize: 32, fontFamily: FONTS.headline, fontWeight: '900', letterSpacing: -1 },

  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 40 },
  tile: { 
    width: (width - 48 - 16) / 2, aspectRatio: 1, 
    borderRadius: 24, 
    padding: 24, justifyContent: 'space-between', borderWidth: 1, 
    ...SHADOWS.md 
  },
  tileIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: 13, fontFamily: FONTS.headline, fontWeight: '800' },

  sectionHeader: { marginBottom: 16 },
  sectionLabel: { fontSize: 18, fontFamily: FONTS.headline, fontWeight: '800' },

  profileSnippet: { 
    flexDirection: 'row', alignItems: 'center', 
    padding: 20, borderRadius: 24, borderWidth: 1, gap: 16 
  },
  snippetAvatar: { width: 64, height: 64, borderRadius: 32 },
  snippetInfo: { flex: 1 },
  snippetName: { fontSize: 18, fontFamily: FONTS.headline, fontWeight: '800' },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  activePing: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  snippetRole: { fontSize: 10, fontFamily: FONTS.label, fontWeight: '900', letterSpacing: 1 },
  editBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full },
  editBtnText: { fontSize: 12, fontFamily: FONTS.label, fontWeight: '800' },

  prefList: { borderRadius: 24, paddingVertical: 8, borderWidth: 1 },
  prefItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  prefLabel: { fontSize: 15, fontFamily: FONTS.body, fontWeight: '600' },
  prefRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prefValue: { fontSize: 13, fontFamily: FONTS.body, fontWeight: '600' },
  listDivider: { height: 1, marginHorizontal: 20, marginVertical: 4 },
});

export default SettingsScreen;
