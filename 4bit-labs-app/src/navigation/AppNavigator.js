import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import MentorStack from './MentorStack';
import { SidebarProvider } from '../context/SidebarContext';
import SidebarOverlay from '../components/SidebarOverlay';

const ADMIN_ROLES = ['mentor', 'teacher', 'school_admin', 'super_admin'];

const AppNavigator = () => {
  const { user } = useAuth();
  const { loadTheme } = useTheme();

  useEffect(() => {
    if (user) {
      loadTheme(user._id || user.id);
    }
  }, [user]);

  const isMentor = user && ADMIN_ROLES.includes(user.role);

  return (
    <NavigationContainer>
      {user ? (
        isMentor ? (
          <MentorStack />
        ) : (
          <SidebarProvider>
            <MainStack />
            <SidebarOverlay />
          </SidebarProvider>
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
