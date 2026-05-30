import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        const userData = await AsyncStorage.getItem('user');
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.warn('Failed to restore session:', e.message);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (username, password) => {
    try {
      const result = await loginUser(username, password);
      if (result.success) {
        await AsyncStorage.setItem('jwt', result.token);
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.message };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed.';
      return { success: false, error: msg };
    }
  };

  const register = async (data) => {
    try {
      const result = await registerUser(data);
      if (result.success) {
        return { success: true };
      }
      return { success: false, error: result.message };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Registration failed.';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('jwt');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
