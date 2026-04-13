import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS } from '../config/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemPrefersDark = Appearance.getColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(systemPrefersDark);

  const loadTheme = async (userId) => {
    try {
      const key = userId ? `@theme_${userId}` : 'isDark';
      const _isDark = await AsyncStorage.getItem(key);
      if (_isDark !== null) {
        setIsDark(_isDark === 'true');
      } else {
        // Fallback to system preference if no user preference
        setIsDark(Appearance.getColorScheme() === 'dark');
      }
    } catch (e) {
      console.warn('Failed to load theme pref');
    }
  };

  useEffect(() => {
    loadTheme(null);
  }, []);

  const toggleTheme = async (userId) => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      const key = userId ? `@theme_${userId}` : 'isDark';
      await AsyncStorage.setItem(key, String(newTheme));
    } catch (e) {
      console.warn('Failed to save theme pref');
    }
  };

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, loadTheme, COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
