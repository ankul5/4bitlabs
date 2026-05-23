import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSidebar } from '../context/SidebarContext';
import { useTheme } from '../context/ThemeContext';
import SidebarContent from './SidebarContent';

const SidebarOverlay = () => {
  const { isOpen, closeSidebar, translateX, backdropOpacity, SIDEBAR_WIDTH } = useSidebar();
  const { COLORS } = useTheme();

  // Don't render anything when sidebar is fully closed and not animating
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={closeSidebar}
        />
      </Animated.View>

      {/* Sidebar Panel */}
      <Animated.View
        style={[
          styles.sidebarWrapper,
          { width: SIDEBAR_WIDTH, transform: [{ translateX }] },
          { backgroundColor: COLORS.surfaceContainerLowest },
        ]}
      >
        <SidebarContent onClose={closeSidebar} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
    zIndex: 998,
  },
  sidebarWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
});

export default SidebarOverlay;
