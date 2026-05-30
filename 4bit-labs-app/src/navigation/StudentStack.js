import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';

import HomeTab from '../screens/student/HomeTab';
import SchoolTab from '../screens/student/SchoolTab';

const Tab = createBottomTabNavigator();

const StudentStack = () => {
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
        name="Home"
        component={HomeTab}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="School"
        component={SchoolTab}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="menu-book" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default StudentStack;
