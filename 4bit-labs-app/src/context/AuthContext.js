import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithEmail, registerUser, logoutUser, getMyProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while checking stored JWT
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // ─── On mount: try to restore session from stored JWT ────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const jwt = await AsyncStorage.getItem('jwt');
        if (jwt) {
          const profile = await getMyProfile();
          setUser(profile);
        }
      } catch (error) {
        // Token invalid or expired — clear it
        await AsyncStorage.removeItem('jwt');
        console.log('Session restore failed:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ─── Login with Email + Password ─────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setIsAuthenticating(true);
    try {
      const userData = await loginWithEmail(email, password);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.log('Login error:', JSON.stringify(error, null, 2));
      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Check your internet connection.';
      } else if (error.response?.status === 404) {
        message = 'Account not registered. Please register first.';
      } else if (error.response?.status === 429) {
        message = 'Too many attempts. Please wait a few minutes.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message?.includes('Network Error')) {
        message = 'Cannot reach backend server. Make sure the backend is running.';
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, error: message };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    setIsAuthenticating(true);
    try {
      const newUser = await registerUser(userData);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      console.log('Registration error:', JSON.stringify(error, null, 2));
      let message = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Check your internet connection.';
      } else if (error.response?.status === 429) {
        message = 'Too many attempts. Please wait a few minutes and try again.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message?.includes('Network Error')) {
        message = 'Cannot reach backend server. Make sure the backend is running and your IP is correct in api.js.';
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, error: message };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.warn('Logout error:', error.message);
    } finally {
      setUser(null);
    }
  }, []);

  // ─── Refresh profile from backend ────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.warn('Profile refresh failed:', error.message);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || isAuthenticating,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
