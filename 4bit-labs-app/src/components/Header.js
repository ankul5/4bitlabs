import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, SHADOWS } from '../config/theme';
import { useSidebar } from '../context/SidebarContext';

const Header = ({ user }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { toggleSidebar } = useSidebar();

  const handleMenuPress = () => toggleSidebar();
  const handleProfilePress = () => navigation.navigate('Profile');

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        <TouchableOpacity onPress={handleMenuPress} activeOpacity={0.7}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.brandText}>4BIT LABS</Text>
      </View>
      <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 12,
    ...SHADOWS.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    fontSize: 22,
    color: COLORS.primary,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: 'rgba(186, 0, 19, 0.1)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
});

export default Header;
