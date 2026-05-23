import React from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../config/theme';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/home/HomeScreen';
import MentorScreen from '../screens/mentor/MentorScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import StudentSchoolScreen from '../screens/home/StudentSchoolScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, icon, focused }) => {
  const { COLORS: C } = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[
      tabStyles.tabItem,
      focused && { backgroundColor: C.primary + '15' },
      { transform: [{ scale }] },
    ]}>
      <MaterialIcons
        name={icon}
        size={24}
        color={focused ? C.primary : C.onSurfaceVariant}
      />
      {focused && (
        <Text style={[tabStyles.tabLabel, { color: C.primary }]}>
          {label}
        </Text>
      )}
    </Animated.View>
  );
};

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { COLORS: C, themeVersion } = useTheme();

  return (
    <Tab.Navigator
      key={`main-tabs-${themeVersion}`}
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
          backgroundColor: C.tabBarBg || C.surfaceContainerLowest,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: C.tabBarBorder || 'rgba(255,255,255,0.05)',
          borderBottomWidth: 0,
          ...SHADOWS.lg,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
            },
            android: {
              elevation: 16,
            },
          }),
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="HOME" icon="home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Mentor"
        component={MentorScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="MENTOR" icon="people" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="PROFILE" icon="person" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="School"
        component={StudentSchoolScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="SCHOOL" icon="school" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    gap: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default MainTabs;
