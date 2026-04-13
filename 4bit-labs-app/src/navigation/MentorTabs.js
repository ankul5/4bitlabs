import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SHADOWS } from '../config/theme';

import MentorDashboardScreen from '../screens/admin/MentorDashboardScreen';
import StudentManagementScreen from '../screens/admin/StudentManagementScreen';
import QuizManagementScreen from '../screens/admin/QuizManagementScreen';
import ContentManagementScreen from '../screens/admin/ContentManagementScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, icon, focused }) => (
  <View style={[tabStyles.tabItem, focused && tabStyles.tabItemActive]}>
    <MaterialIcons
      name={icon}
      size={22}
      style={[tabStyles.tabIcon, focused && tabStyles.tabIconActive]}
    />
    <Text style={[tabStyles.tabLabel, focused && tabStyles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

const MentorTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 0,
          ...SHADOWS.lg,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
            },
            android: { elevation: 20 },
          }),
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={MentorDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="HOME" icon="dashboard" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Students"
        component={StudentManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="STUDENTS" icon="people" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Quizzes"
        component={QuizManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="QUIZZES" icon="quiz" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Content"
        component={ContentManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="CONTENT" icon="library-books" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="MORE" icon="settings" focused={focused} />
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tabItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    color: '#64748b',
  },
  tabIconActive: {
    color: '#818cf8',
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: '#818cf8',
  },
});

export default MentorTabs;
