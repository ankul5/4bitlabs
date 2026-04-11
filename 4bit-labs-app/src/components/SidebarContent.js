import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { USER_DATA } from '../data/mockData';

const SidebarContent = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  
  const displayUser = user || USER_DATA;

  const navigateTo = (screen, params) => {
    onClose();
    // Assuming navigation stack is MainTabs or similar
    if (screen === 'Profile') {
      navigation.navigate('Profile');
    } else {
      navigation.navigate(screen, params);
    }
  };

  const NavItem = ({ label, icon, active, screen }) => (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      activeOpacity={0.7}
      onPress={() => navigateTo(screen)}
    >
      <Text style={[styles.navIcon, active && styles.navIconActive]}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      {/* Brand */}
      <View style={styles.brandRow}>
        <Text style={styles.brandText}>4Bit Labs</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeaderRow}>
          <Image source={{ uri: displayUser.avatar }} style={styles.profileAvatar} />
          <View style={styles.profileTextCol}>
            <Text style={styles.profileName} numberOfLines={1}>{displayUser.name}</Text>
            <Text style={styles.profileId}>ID: 4B-2024-001</Text>
          </View>
        </View>
        <View style={styles.courseTag}>
          <Text style={styles.courseTagText}>COMPUTER SCIENCE</Text>
        </View>
      </View>

      {/* Nav Links */}
      <View style={styles.navLinks}>
        {/* We derive current active visually from route if possible, defaulting to Home for mockup */}
        <NavItem label="Home" icon="🏠" screen="Home" active={true} />
        <NavItem label="Course" icon="🎓" screen="Course" />
        <NavItem label="Store" icon="🛍️" screen="Store" />
        <NavItem label="Leaderboard" icon="📊" screen="Leaderboard" />
        <NavItem label="Mentorship" icon="👥" screen="Mentor" />
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.logoutBtn} 
          activeOpacity={0.7}
          onPress={() => {
            onClose();
            logout();
          }}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    backgroundColor: '#f8fafc', // slate-50
  },
  brandRow: {
    marginBottom: SPACING.xl,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#b91c1c', // red-700
    letterSpacing: -0.5,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    ...SHADOWS.sm,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef2f2', // red-50
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  profileId: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  courseTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 97, 144, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  courseTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.tertiary,
    letterSpacing: 0.5,
  },
  navLinks: {
    flex: 1,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS['2xl'],
    gap: 16,
  },
  navItemActive: {
    backgroundColor: '#fef2f2', // red-50
  },
  navIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  navLabelActive: {
    color: '#b91c1c', // red-700
    fontWeight: '700',
  },
  bottomSection: {
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS['2xl'],
    gap: 16,
  },
  logoutIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  logoutLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
});

export default SidebarContent;
