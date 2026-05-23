import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions, Animated
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { COLORS, FONTS, SHADOWS, RADIUS } from '../../config/theme';
import { getDashboardStats } from '../../services/adminService';
import StitchHeader from '../../components/StitchHeader';

const { width } = Dimensions.get('window');

const MentorDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    studentsCount: '0',
    coursesCount: '0',
    quizzesCount: '0',
    schoolsCount: '0',
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pingAnim = React.useRef(new Animated.Value(1)).current;

  const fetchData = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats({
        studentsCount: (data.totalStudents || 0).toLocaleString(),
        coursesCount: String(data.totalCourses || 0),
        quizzesCount: String(data.totalQuizzes || 0),
        schoolsCount: String(data.totalSchools || 0),
      });
      setRecentStudents(data.recentStudents || []);
    } catch (e) {
      console.warn('Dashboard fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pingAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pingAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pingAnim]);

  useSocket('student:registered', (data) => {
    if (data && data.student) {
      // Create a student object suitable for the feed
      const newStudent = {
        ...data.student,
        created_at: data.student.createdAt || new Date(),
        school_name: data.student.schoolName || 'A School',
      };
      
      setStats(prev => {
        let currentCount = parseInt(prev.studentsCount.replace(/,/g, ''), 10) || 0;
        return {
          ...prev,
          studentsCount: (currentCount + 1).toLocaleString()
        };
      });
      
      setRecentStudents(prev => {
        const updated = [newStudent, ...prev];
        return updated.slice(0, 5);
      });
    }
  });

  useSocket('school:created', (school) => {
    setStats(prev => {
      let currentCount = parseInt(prev.schoolsCount.replace(/,/g, ''), 10) || 0;
      return {
        ...prev,
        schoolsCount: String(currentCount + 1)
      };
    });
  });

  useSocket('course:created', (course) => {
    setStats(prev => {
      let currentCount = parseInt(prev.coursesCount.replace(/,/g, ''), 10) || 0;
      return {
        ...prev,
        coursesCount: String(currentCount + 1)
      };
    });
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const renderStatCard = (icon, label, value, color) => (
    <View style={[styles.statCard, { backgroundColor: COLORS.surfaceContainer, borderColor: COLORS.tabBarBorder }]}>
      <MaterialIcons name={icon} size={32} color={color} />
      <View>
        <Text style={[styles.statValue, { color: COLORS.onSurface }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: COLORS.onSurfaceVariant }]}>{label}</Text>
      </View>
    </View>
  );

  const renderQuickAction = (icon, label, bgColor, color = 'white', onPress) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIconCircle, { backgroundColor: bgColor }]}>
        <MaterialIcons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: COLORS.onSurfaceVariant }]}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.surface }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.surface }]}>
      <StitchHeader user={user} onSearchPress={() => {}} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeLabel, { color: COLORS.onSurfaceVariant }]}>WELCOME BACK</Text>
            <Text style={[styles.dashboardTitle, { color: COLORS.onSurface }]}>Admin Dashboard</Text>
          </View>

          {/* Stats Grid — REAL DATA */}
          <View style={styles.statsGrid}>
            {renderStatCard('group', 'TOTAL STUDENTS', stats.studentsCount, COLORS.primary)}
            {renderStatCard('auto-stories', 'ACTIVE COURSES', stats.coursesCount, COLORS.secondary)}
            {renderStatCard('quiz', 'TOTAL QUIZZES', stats.quizzesCount, COLORS.tertiary)}
            {renderStatCard('business', 'SCHOOLS', stats.schoolsCount, COLORS.primary)}
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>Quick Actions</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll} contentContainerStyle={{ gap: 20 }}>
            {renderQuickAction('person-add', 'Add Student', COLORS.primary, 'white', () => navigation.navigate('Students'))}
            {renderQuickAction('add-task', 'New Quiz', COLORS.surfaceContainerHighest, 'white', () => navigation.navigate('Quizzes'))}
            {renderQuickAction('campaign', 'Broadcast', COLORS.surfaceContainerHighest, 'white', () => {})}
            {renderQuickAction('school', 'Schools', COLORS.surfaceContainerHighest, 'white', () => navigation.navigate('Schools'))}
          </ScrollView>

          {/* Cloud Node Status */}
          <View style={[styles.statusNode, { backgroundColor: COLORS.surfaceContainerLowest, borderColor: COLORS.tabBarBorder }]}>
            <View style={styles.nodeHeader}>
              <View style={styles.nodeTitleRow}>
                <MaterialCommunityIcons name="cloud" size={20} color={COLORS.primary} />
                <Text style={[styles.nodeTitle, { color: COLORS.onSurface }]}>Cloud Node Status</Text>
              </View>
              <View style={styles.pingContainer}>
                <Animated.View style={[styles.pingCircle, { transform: [{ scale: pingAnim }] }]} />
                <View style={[styles.pingCircle, styles.pingInner]} />
              </View>
            </View>
            
            <View style={styles.metrics}>
              <View style={styles.metricRow}>
                <View style={styles.metricTexts}>
                  <Text style={[styles.metricLabel, { color: COLORS.onSurfaceVariant }]}>CPU USAGE</Text>
                  <Text style={[styles.metricValue, { color: COLORS.onSurface }]}>42%</Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: COLORS.surfaceContainerHighest }]}>
                  <View style={[styles.progressFill, { width: '42%', backgroundColor: COLORS.primary }]} />
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricTexts}>
                  <Text style={[styles.metricLabel, { color: COLORS.onSurfaceVariant }]}>MEMORY</Text>
                  <Text style={[styles.metricValue, { color: COLORS.onSurface }]}>8.4GB / 16GB</Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: COLORS.surfaceContainerHighest }]}>
                  <View style={[styles.progressFill, { width: '52.5%', backgroundColor: COLORS.secondary }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Recent Activity — REAL DATA from student registrations */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>Recent Registrations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Students')}>
              <Text style={[styles.seeAllText, { color: COLORS.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentStudents.length === 0 ? (
              <View style={[styles.activityItem, { backgroundColor: COLORS.surfaceContainer, borderColor: COLORS.tabBarBorder }]}>
                <View style={[styles.activityIconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                  <MaterialIcons name="info" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityUser, { color: COLORS.onSurface }]}>No recent registrations</Text>
                  <Text style={[styles.activityTime, { color: COLORS.onSurfaceVariant }]}>Students will appear here when they register</Text>
                </View>
              </View>
            ) : (
              recentStudents.map((student, idx) => (
                <View key={student.id || idx} style={[styles.activityItem, { backgroundColor: COLORS.surfaceContainer, borderColor: COLORS.tabBarBorder }]}>
                  <View style={[styles.activityIconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                    <MaterialIcons name="person-add" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={{ fontSize: 13, fontFamily: FONTS.body, lineHeight: 18 }}>
                      <Text style={[styles.activityUser, { color: COLORS.onSurface }]}>{student.name || 'Student'} </Text>
                      <Text style={{ color: COLORS.onSurfaceVariant }}>registered from </Text>
                      <Text style={{ color: COLORS.onSurface, fontWeight: '600' }}>{student.school_name || 'No school'}</Text>
                    </Text>
                    <Text style={[styles.activityTime, { color: COLORS.onSurfaceVariant }]}>{formatTimeAgo(student.created_at).toUpperCase()}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24 },
  welcomeSection: { marginBottom: 32 },
  welcomeLabel: { fontSize: 10, fontFamily: FONTS.label, letterSpacing: 2, fontWeight: '800' },
  dashboardTitle: { fontSize: 32, fontFamily: FONTS.headline, fontWeight: '900', letterSpacing: -1 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statCard: {
    width: (width - 48 - 16) / 2,
    aspectRatio: 1,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  statValue: { fontSize: 32, fontFamily: FONTS.headline, fontWeight: '900', letterSpacing: -1.5 },
  statLabel: { fontSize: 9, fontFamily: FONTS.label, fontWeight: '900', letterSpacing: 1 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.headline, fontWeight: '800' },
  seeAllText: { fontSize: 13, fontFamily: FONTS.label, fontWeight: '700' },
  
  actionsScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', ...SHADOWS.md },
  actionLabel: { fontSize: 11, fontFamily: FONTS.label, fontWeight: '800' },
  
  statusNode: {
    padding: 24,
    borderRadius: RADIUS.xl,
    marginTop: 32,
    borderWidth: 1,
    ...SHADOWS.lg,
  },
  nodeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  nodeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nodeTitle: { fontSize: 16, fontFamily: FONTS.headline, fontWeight: '800' },
  pingContainer: { width: 12, height: 12, justifyContent: 'center', alignItems: 'center' },
  pingCircle: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ade80' },
  pingInner: { width: 8, height: 8, borderRadius: 4 },

  metrics: { gap: 16 },
  metricRow: { gap: 8 },
  metricTexts: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 10, fontFamily: FONTS.label, letterSpacing: 1, fontWeight: '900' },
  metricValue: { fontSize: 12, fontFamily: FONTS.body, fontWeight: '800' },
  progressBg: { height: 6, width: '100%', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10 },
  
  activityList: { gap: 12 },
  activityItem: { 
    flexDirection: 'row', gap: 16, padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
  },
  activityIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1, gap: 4 },
  activityUser: { fontWeight: '700' },
  activityTime: { fontSize: 10, fontFamily: FONTS.label, fontWeight: '900' },
});

export default MentorDashboardScreen;
