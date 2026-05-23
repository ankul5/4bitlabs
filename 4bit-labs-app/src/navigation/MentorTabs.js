import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SHADOWS, RADIUS } from '../config/theme';
import { useTheme } from '../context/ThemeContext';

import MentorDashboardScreen from '../screens/admin/MentorDashboardScreen';
import ContentManagementScreen from '../screens/admin/ContentManagementScreen';
import StudentManagementScreen from '../screens/admin/StudentManagementScreen';
import MentorProfileScreen from '../screens/admin/MentorProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, icon, focused }) => {
  const { COLORS: C } = useTheme();

  return (
    <View style={[
      tabStyles.tabItem,
      focused && { backgroundColor: C.primary + '18' },
    ]}>
      <MaterialIcons
        name={icon}
        size={24}
        color={focused ? C.primary : C.onSurfaceVariant}
      />
      <Text
        style={[
          tabStyles.tabLabel,
          { color: focused ? C.primary : C.onSurfaceVariant },
          focused && { fontWeight: '900' },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const MentorTabs = () => {
  const insets = useSafeAreaInsets();
  const { COLORS: C, themeVersion } = useTheme();

  return (
    <Tab.Navigator
      key={`mentor-tabs-${themeVersion}`}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 72 + (Platform.OS === 'ios' ? insets.bottom : 0),
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
          backgroundColor: C.surfaceContainerLowest || C.tabBarBg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: C.outlineVariant || 'rgba(255,255,255,0.08)',
          borderBottomWidth: 0,
          ...SHADOWS.lg,
          elevation: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={MentorDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" icon="home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Content"
        component={ContentManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Content" icon="add-circle" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Students"
        component={StudentManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Students" icon="people" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={MentorProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" icon="person" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    minWidth: 64,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default MentorTabs;
