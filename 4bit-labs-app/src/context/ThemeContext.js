import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS, setActiveColors } from '../config/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemPrefersDark = Appearance.getColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(true); // default dark
  const [themeVersion, setThemeVersion] = useState(0); // force re-renders

  // Apply theme colors immediately
  const applyTheme = useCallback((dark) => {
    setActiveColors(dark);
    setThemeVersion((v) => v + 1); // force re-render tree
  }, []);

  const loadTheme = useCallback(async (userId) => {
    try {
      const key = userId && typeof userId === 'string' ? `@theme_${userId}` : 'isDark';
      const _isDark = await AsyncStorage.getItem(key);
      if (_isDark !== null) {
        const dark = _isDark === 'true';
        setIsDark(dark);
        applyTheme(dark);
      } else {
        // Default to dark
        setIsDark(true);
        applyTheme(true);
      }
    } catch (e) {
      console.warn('Failed to load theme pref');
    }
  }, [applyTheme]);

  useEffect(() => {
    // Initialize with dark mode
    applyTheme(true);
    loadTheme(null);
  }, [applyTheme, loadTheme]);

  const toggleTheme = useCallback(async (userId) => {
    try {
      const newDark = !isDark;
      setIsDark(newDark);
      applyTheme(newDark);
      const key = userId && typeof userId === 'string' ? `@theme_${userId}` : 'isDark';
      await AsyncStorage.setItem(key, String(newDark));
    } catch (e) {
      console.warn('Failed to save theme pref');
    }
  }, [isDark, applyTheme]);

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, loadTheme, COLORS, themeVersion }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
