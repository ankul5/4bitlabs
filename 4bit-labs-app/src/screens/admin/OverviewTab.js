import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { getSchools, getStudents, getContent, getAnnouncements } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../../components/AdminHeader';

const StatCard = ({ icon, label, count, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const OverviewTab = () => {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    schools: 0, students: 0, videos: 0, code: 0, connections: 0, announcements: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const [schRes, stuRes, vidRes, codeRes, connRes, annRes] = await Promise.all([
        getSchools(),
        getStudents(),
        getContent(null, 'video'),
        getContent(null, 'code'),
        getContent(null, 'connection'),
        getAnnouncements(),
      ]);
      setStats({
        schools: schRes.schools?.length || 0,
        students: stuRes.students?.length || 0,
        videos: vidRes.content?.length || 0,
        code: codeRes.content?.length || 0,
        connections: connRes.content?.length || 0,
        announcements: annRes.announcements?.length || 0,
      });
    } catch (e) {
      console.warn('Failed to load stats:', e.message);
    }
  }, []);

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await loadStats();
      setLoading(false);
    };
    initLoad();
  }, [loadStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]} 
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <AdminHeader title="Overview" />
      <View style={{ marginVertical: SPACING.sm }}>
        <Text style={styles.subtitle}>Overview of all system statistics</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard icon="school" label="Schools" count={stats.schools} color={COLORS.primary} />
            <StatCard icon="people" label="Students" count={stats.students} color={COLORS.secondary} />
            <StatCard icon="play-circle-outline" label="Videos" count={stats.videos} color="#e74c3c" />
            <StatCard icon="code" label="Code Files" count={stats.code} color="#2ecc71" />
            <StatCard icon="hub" label="Connections" count={stats.connections} color="#3498db" />
            <StatCard icon="campaign" label="Announcements" count={stats.announcements} color="#f39c12" />
          </View>

          <View style={styles.adminFooter}>
            <View style={styles.adminFooterAvatar}>
              <Text style={styles.adminFooterAvatarText}>{user?.full_name?.charAt(0)?.toUpperCase() || 'A'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.adminFooterLabel}>LOGGED IN ADMIN</Text>
              <Text style={styles.adminFooterName}>{user?.full_name || 'Admin'} ({user?.username})</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING['2xl'] },
  greeting: { fontSize: 28, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: COLORS.onSurfaceVariant, marginTop: 4 },
  logoutBtn: { padding: 10, backgroundColor: COLORS.errorContainer, borderRadius: RADIUS.full },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOWS.sm },
  statIcon: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  statCount: { fontSize: 32, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -1 },
  statLabel: { fontSize: 12, fontWeight: '600', color: COLORS.onSurfaceVariant, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  adminFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surfaceContainerLow, padding: 16, borderRadius: RADIUS.xl, marginTop: SPACING['2xl'] },
  adminFooterAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  adminFooterAvatarText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  adminFooterLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: COLORS.onSurfaceVariant, marginBottom: 2 },
  adminFooterName: { fontSize: 14, fontWeight: '700', color: COLORS.onSurface },
});

export default OverviewTab;
