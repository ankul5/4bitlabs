import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorTabs from './MentorTabs';
import SchoolManagementScreen from '../screens/admin/SchoolManagementScreen';

const Stack = createNativeStackNavigator();

const MentorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MentorRoot" component={MentorTabs} />
      <Stack.Screen name="Schools" component={SchoolManagementScreen} />
    </Stack.Navigator>
  );
};

export default MentorStack;
