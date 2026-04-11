import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { SidebarProvider } from '../context/SidebarContext';
import SidebarOverlay from '../components/SidebarOverlay';

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? (
        <SidebarProvider>
          <MainStack />
          <SidebarOverlay />
        </SidebarProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
