import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../config/theme';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const AdminHeader = ({ title }) => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-width * 0.75))[0];

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.75,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const navigateTo = (tabName) => {
    closeMenu();
    navigation.navigate(tabName);
  };

  const menuItems = [
    { key: 'Schools', label: 'Schools', icon: 'school' },
    { key: 'Students', label: 'Students', icon: 'people' },
    { key: 'Content', label: 'Content Manager', icon: 'dashboard' },
    { key: 'Overview', label: 'Overview', icon: 'analytics' },
  ];

  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={openMenu} style={styles.menuIcon}>
        <MaterialIcons name="menu" size={26} color={COLORS.onSurface} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />

      <Modal visible={menuVisible} transparent animationType="none">
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeMenu} />
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.logoRow}>
                <Text style={styles.logoMain}>4BIT</Text>
                <Text style={styles.logoSub}>LABS</Text>
              </View>
              <Text style={styles.roleTag}>ADMIN PANEL</Text>
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.full_name?.charAt(0)?.toUpperCase() || 'A'}</Text>
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.profileName} numberOfLines={1}>{user?.full_name || 'Admin'}</Text>
                <Text style={styles.profileSub} numberOfLines={1}>{user?.username || 'admin@4bit'}</Text>
              </View>
              <TouchableOpacity style={styles.inlineLogoutBtn} onPress={() => { closeMenu(); logout(); }}>
                <MaterialIcons name="logout" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>

            {/* Navigation Items */}
            <View style={styles.menuList}>
              {menuItems.map((item) => {
                const isActive = title === item.label || (title === 'Content' && item.key === 'Content');
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => navigateTo(item.key)}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={22}
                      color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
                    />
                    <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  menuIcon: {
    padding: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 42,
  },
  // Modal Drawer
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: width * 0.75,
    height: height,
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingTop: 50,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'flex-start',
    ...SHADOWS.lg,
  },
  drawerHeader: {
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoMain: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  logoSub: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: -1,
  },
  roleTag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 12,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  profileSub: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  menuList: {
    flex: 1,
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
  },
  menuItemActive: {
    backgroundColor: COLORS.primaryFixed,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  menuItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inlineLogoutBtn: {
    padding: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdminHeader;
