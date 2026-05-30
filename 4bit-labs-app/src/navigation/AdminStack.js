import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';

import SchoolsTab from '../screens/admin/SchoolsTab';
import StudentsTab from '../screens/admin/StudentsTab';
import ContentManagerTab from '../screens/admin/ContentManagerTab';
import OverviewTab from '../screens/admin/OverviewTab';

const Tab = createBottomTabNavigator();

const AdminStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBg,
          borderTopColor: COLORS.tabBarBorder,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Schools"
        component={SchoolsTab}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="school" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsTab}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="people" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Content"
        component={ContentManagerTab}
        options={{
          tabBarLabel: 'Content',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="dashboard" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Overview"
        component={OverviewTab}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="analytics" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminStack;
