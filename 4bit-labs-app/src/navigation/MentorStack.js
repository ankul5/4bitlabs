import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorTabs from './MentorTabs';
import SchoolManagementScreen from '../screens/admin/SchoolManagementScreen';
import QuizManagementScreen from '../screens/admin/QuizManagementScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';

const Stack = createNativeStackNavigator();

const MentorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MentorRoot" component={MentorTabs} />
      <Stack.Screen name="Schools" component={SchoolManagementScreen} />
      <Stack.Screen name="Quizzes" component={QuizManagementScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default MentorStack;
