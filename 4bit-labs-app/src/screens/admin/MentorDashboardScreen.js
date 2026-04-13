import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { getDashboardStats } from '../../services/adminService';

const { width } = Dimensions.get('window');

const MentorDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { COLORS, isDark } = useTheme();
  const [stats, setStats] = useState({ totalStudents: 0, attendance: [], courses: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStats(user?.school_id);
      setStats(data);
    } catch (e) {
      console.warn('Dashboard stats error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: 'people', color: '#6366f1', bg: '#eef2ff' },
    { title: 'Total Schools', value: stats.schools?.length || 0, icon: 'business', color: '#22c55e', bg: '#f0fdf4' },
    { title: 'Active Courses', value: stats.courses?.length || 0, icon: 'menu-book', color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Quizzes', value: stats.quizzes?.length || 0, icon: 'quiz', color: '#ec4899', bg: '#fdf2f8' },
  ];

  const unassignedStudents = (stats.students || []).filter(s => !s.school_id);
  const schoolsWithStudents = (stats.schools || []).map(school => ({
    ...school,
    students: (stats.students || []).filter(s => s.school_id === school.id || s.school_id === school._id)
  }));

  const quickActions = [
    { title: 'Mark Attendance', icon: 'playlist-add-check', screen: 'Students', color: '#6366f1' },
    { title: 'Create Quiz', icon: 'add-circle', screen: 'Quizzes', color: '#22c55e' },
    { title: 'Add Lecture', icon: 'video-library', screen: 'Content', color: '#f59e0b' },
    { title: 'Schools', icon: 'business', screen: 'Schools', color: '#ec4899' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: COLORS.onSurfaceVariant }]}>Welcome back,</Text>
          <Text style={[styles.mentorName, { color: COLORS.onSurface }]}>{user?.name || 'Mentor'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2' }]}>
          <MaterialIcons name="logout" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* Role Badge */}
      <View style={[styles.roleBadge, { backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : '#eef2ff' }]}>
        <MaterialCommunityIcons name="shield-check" size={14} color="#6366f1" />
        <Text style={styles.roleBadgeText}>{(user?.role || 'mentor').toUpperCase()} PANEL</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          {statCards.map((card, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: card.bg }]}>
              <View style={[styles.statIconWrap, { backgroundColor: card.color + '20' }]}>
                <MaterialIcons name={card.icon} size={22} color={card.color} />
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statTitle}>{card.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionCard, { backgroundColor: COLORS.surfaceContainerLowest }]}
              activeOpacity={0.7}
              onPress={() => {
                if (action.screen) navigation.navigate(action.screen);
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <MaterialIcons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={[styles.actionText, { color: COLORS.onSurface }]}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Students by School */}
        <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>Students by School</Text>
        
        {schoolsWithStudents.map((school, idx) => (
          <View key={`school-${idx}`} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <MaterialIcons name="business" size={20} color={COLORS.onSurfaceVariant} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.onSurface, marginLeft: 8 }}>{school.name} ({school.code})</Text>
              <View style={{ marginLeft: 'auto', backgroundColor: COLORS.surfaceContainerLow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.onSurfaceVariant }}>{school.students.length} Students</Text>
              </View>
            </View>
            {school.students.length === 0 ? (
              <Text style={{ fontSize: 13, color: COLORS.onSurfaceVariant, fontStyle: 'italic', marginLeft: 28 }}>No students in this school yet.</Text>
            ) : (
              school.students.map((student, i) => (
                <View key={i} style={[styles.studentRow, { marginLeft: 16, backgroundColor: COLORS.surfaceContainerLowest }]} activeOpacity={0.9}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>{(student.name || 'S')[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentName, { color: COLORS.onSurface }]}>{student.name}</Text>
                    <Text style={[styles.studentEmail, { color: COLORS.onSurfaceVariant }]}>{student.email}</Text>
                  </View>
                  <View style={[styles.pointsBadge, { backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : '#f0fdf4' }]}>
                    <Text style={styles.pointsText}>{student.points || 0} pts</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        ))}

        {unassignedStudents.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <MaterialIcons name="help-outline" size={20} color={COLORS.onSurfaceVariant} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.onSurface, marginLeft: 8 }}>Unassigned</Text>
              <View style={{ marginLeft: 'auto', backgroundColor: COLORS.surfaceContainerLow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.onSurfaceVariant }}>{unassignedStudents.length} Students</Text>
              </View>
            </View>
            {unassignedStudents.map((student, i) => (
               <View key={i} style={[styles.studentRow, { marginLeft: 16, backgroundColor: COLORS.surfaceContainerLowest }]} activeOpacity={0.9}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>{(student.name || 'S')[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentName, { color: COLORS.onSurface }]}>{student.name}</Text>
                    <Text style={[styles.studentEmail, { color: COLORS.onSurfaceVariant }]}>{student.email}</Text>
                  </View>
                  <View style={[styles.pointsBadge, { backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : '#f0fdf4' }]}>
                    <Text style={styles.pointsText}>{student.points || 0} pts</Text>
                  </View>
               </View>
            ))}
          </View>
        )}

        {(!stats.schools || stats.schools.length === 0) && (!stats.students || stats.students.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={COLORS.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: COLORS.onSurfaceVariant }]}>No students or schools registered yet</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  greeting: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  mentorName: { fontSize: 24, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginLeft: 20, marginBottom: 12, backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#6366f1', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: (width - 52) / 2, padding: 16, borderRadius: 16, ...SHADOWS.sm },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  statTitle: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: { width: (width - 52) / 2, backgroundColor: '#fff', padding: 16, borderRadius: 14, alignItems: 'center', ...SHADOWS.sm },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  studentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 8, gap: 12, ...SHADOWS.sm },
  studentAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  studentAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  studentName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  studentEmail: { fontSize: 12, color: '#64748b' },
  pointsBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pointsText: { fontSize: 12, fontWeight: '700', color: '#22c55e' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#94a3b8', marginTop: 8 },
});

export default MentorDashboardScreen;
