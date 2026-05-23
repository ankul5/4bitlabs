import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import MentorChatScreen from '../screens/mentor/MentorChatScreen';
import CourseScreen from '../screens/course/CourseScreen';
import QuizScreen from '../screens/course/QuizScreen';
import ResultScreen from '../screens/course/ResultScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="MentorChat" component={MentorChatScreen} />
      <Stack.Screen name="CourseHome" component={CourseScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
