import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../config/theme';

import HomeScreen from '../screens/home/HomeScreen';
import CourseScreen from '../screens/course/CourseScreen';
import QuizScreen from '../screens/course/QuizScreen';
import ResultScreen from '../screens/course/ResultScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import MentorScreen from '../screens/mentor/MentorScreen';
import StoreScreen from '../screens/store/StoreScreen';

const Tab = createBottomTabNavigator();
const CourseStack = createNativeStackNavigator();

const CourseStackNavigator = () => {
  return (
    <CourseStack.Navigator screenOptions={{ headerShown: false }}>
      <CourseStack.Screen name="CourseHome" component={CourseScreen} />
      <CourseStack.Screen name="Quiz" component={QuizScreen} />
      <CourseStack.Screen name="Result" component={ResultScreen} />
      <CourseStack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </CourseStack.Navigator>
  );
};

const TabIcon = ({ label, icon, focused }) => (
  <View style={[tabStyles.tabItem, focused && tabStyles.tabItemActive]}>
    <Text style={[tabStyles.tabIcon, focused && tabStyles.tabIconActive]}>
      {icon}
    </Text>
    <Text style={[tabStyles.tabLabel, focused && tabStyles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

const MainTabs = () => {
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
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 0,
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
            <TabIcon label="HOME" icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Course"
        component={CourseStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="COURSE" icon="📖" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Mentor"
        component={MentorScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="MENTOR" icon="👨‍🏫" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Store"
        component={StoreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="STORE" icon="🛍️" focused={focused} />
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
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabItemActive: {
    backgroundColor: 'rgba(186, 0, 19, 0.08)',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
});

export default MainTabs;
