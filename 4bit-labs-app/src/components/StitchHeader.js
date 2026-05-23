import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../config/theme';

const StitchHeader = ({ user, onSearchPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: COLORS.surface + 'CC', borderBottomColor: COLORS.tabBarBorder }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          <LinearGradient
            colors={[COLORS.primaryContainer, COLORS.primary]}
            style={styles.logoBadge}
          >
            <MaterialIcons name="account-tree" size={20} color="white" />
          </LinearGradient>
          <Text style={[styles.brandText, { color: COLORS.onSurface }]}>4Bit Labs</Text>
        </View>

        <View style={styles.right}>
          <TouchableOpacity 
            onPress={onSearchPress} 
            style={styles.searchBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="search" size={24} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.8} style={styles.avatarWrapper}>
            <View style={styles.avatarBorder}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.surfaceContainerHighest }]}>
                  <Text style={[styles.avatarText, { color: COLORS.onSurface }]}>{user?.name?.[0] || 'A'}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#ba0013',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  brandText: {
    fontSize: 20,
    fontFamily: FONTS.headline,
    letterSpacing: -0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(227, 30, 36, 0.3)',
  },
  avatarBorder: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
  },
});

export default StitchHeader;
