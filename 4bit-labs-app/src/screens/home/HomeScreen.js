import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { getHomeSummary } from '../../services/courseService';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await getHomeSummary();
      setDashData(data);
    } catch (err) {
      console.warn('Dashboard fetch failed:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  // Derived values from API response (with fallbacks)
  const dashUser = dashData?.user || user || {};
  const attendance = dashData?.attendance ?? 0;
  const announcements = dashData?.announcements ?? [];
  const upcomingQuizzes = dashData?.upcomingQuizzes ?? [];
  const lessonsCompleted = dashData?.lessonsCompleted ?? 0;
  const totalLessons = dashData?.totalLessons ?? 0;
  const progress = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  const renderAttendanceRing = () => {
    const size = 120;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressVal = attendance / 100;
    const strokeDashoffset = circumference * (1 - progressVal);

    return (
      <View style={styles.ringContainer}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.surfaceContainerHighest}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.tertiary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringPercentage}>{attendance}%</Text>
        </View>
      </View>
    );
  };

  const renderAnnouncementCard = ({ item }) => {
    const typeIcons = {
      general: '📢',
      quiz: '📝',
      course: '📚',
      event: '📅',
      maintenance: '🔧',
      urgent: '🚨',
    };
    const typeColors = {
      general: 'rgba(186, 0, 19, 0.1)',
      quiz: 'rgba(55, 85, 195, 0.1)',
      course: 'rgba(0, 97, 144, 0.1)',
      event: 'rgba(55, 85, 195, 0.1)',
      maintenance: 'rgba(93, 63, 60, 0.1)',
      urgent: 'rgba(186, 0, 19, 0.15)',
    };

    return (
      <View style={styles.announcementCard}>
        <View style={[styles.announcementIcon, { backgroundColor: typeColors[item.type] || typeColors.general }]}>
          <Text style={styles.announcementIconText}>
            {typeIcons[item.type] || '📢'}
          </Text>
        </View>
        <Text style={styles.announcementCategory}>{(item.type || 'GENERAL').toUpperCase()}</Text>
        <Text style={styles.announcementTitle}>{item.title}</Text>
        <Text style={styles.announcementDesc} numberOfLines={2}>{item.body}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.onSurfaceVariant, marginTop: 12 }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header user={user || dashUser} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.dashboardLabel}>DASHBOARD</Text>
          <Text style={styles.welcomeTitle}>Welcome, {dashUser.name?.split(' ')[0] || 'Student'}</Text>
          <Text style={styles.welcomeSubtitle}>
            Your learning journey is {progress}% complete this term.
          </Text>
        </View>

        {/* Quiz CTA Card */}
        {upcomingQuizzes.length > 0 ? (
          <Card style={styles.quizCard} variant="default">
            <View style={styles.quizCardContent}>
              <Text style={styles.quizCardTitle}>Ready for your next challenge?</Text>
              <Text style={styles.quizCardDesc}>
                {upcomingQuizzes[0].title} is now available. Complete it to earn points!
              </Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Course', { screen: 'Quiz' })}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quizCTA}
                >
                  <Text style={styles.quizCTAText}>Start Quiz</Text>
                  <Text style={styles.quizCTAArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={styles.quizDecor}>
              <Text style={styles.quizDecorIcon}>🎓</Text>
            </View>
          </Card>
        ) : (
          <Card style={styles.quizCard} variant="default">
            <View style={styles.quizCardContent}>
              <Text style={styles.quizCardTitle}>Keep up the great work!</Text>
              <Text style={styles.quizCardDesc}>
                No upcoming quizzes right now. Continue watching lectures to stay ahead.
              </Text>
            </View>
            <View style={styles.quizDecor}>
              <Text style={styles.quizDecorIcon}>🎓</Text>
            </View>
          </Card>
        )}

        {/* Attendance Card */}
        <Card style={styles.attendanceCard} variant="low">
          <Text style={styles.attendanceLabel}>ATTENDANCE</Text>
          {renderAttendanceRing()}
          <Text style={styles.attendanceNote}>
            {lessonsCompleted} of {totalLessons} lessons completed.
          </Text>
        </Card>

        {/* Announcements */}
        {announcements.length > 0 && (
          <>
            <SectionHeader
              title="Announcements"
              actionText="See All"
              onAction={() => {}}
              style={{ marginTop: SPACING['2xl'] }}
            />
            <FlatList
              data={announcements}
              renderItem={renderAnnouncementCard}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.announcementsList}
              snapToInterval={SCREEN_WIDTH * 0.75 + 16}
              decelerationRate="fast"
            />
          </>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
            <View style={styles.quickActionIconWrap}>
              <Text style={styles.quickActionIcon}>📚</Text>
            </View>
            <View style={styles.quickActionTextWrap}>
              <Text style={styles.quickActionTitle}>Course Materials</Text>
              <Text style={styles.quickActionSub}>{dashData?.courses?.length || 0} enrolled courses</Text>
            </View>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.8}>
            <View style={[styles.quickActionIconWrap, { backgroundColor: 'rgba(0, 97, 144, 0.08)' }]}>
              <Text style={styles.quickActionIcon}>💬</Text>
            </View>
            <View style={styles.quickActionTextWrap}>
              <Text style={styles.quickActionTitle}>Lab Discussions</Text>
              <Text style={styles.quickActionSub}>{dashUser.points || 0} total points earned</Text>
            </View>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  welcomeSection: {
    marginBottom: SPACING['2xl'],
  },
  dashboardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
    lineHeight: 20,
  },
  quizCard: {
    marginBottom: SPACING.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  quizCardContent: {
    zIndex: 1,
  },
  quizCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
    marginBottom: 8,
    lineHeight: 28,
  },
  quizCardDesc: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  quizCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    gap: 8,
    ...SHADOWS.primaryGlow,
  },
  quizCTAText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  quizCTAArrow: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  quizDecor: {
    position: 'absolute',
    right: 16,
    top: 16,
    opacity: 0.1,
  },
  quizDecorIcon: {
    fontSize: 80,
  },
  attendanceCard: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    marginBottom: 0,
  },
  attendanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xl,
  },
  ringContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentage: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  attendanceNote: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: SPACING.lg,
    maxWidth: 220,
  },
  announcementsList: {
    paddingRight: SPACING.xl,
  },
  announcementCard: {
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginRight: SPACING.lg,
    ...SHADOWS.sm,
  },
  announcementIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  announcementIconText: {
    fontSize: 20,
  },
  announcementCategory: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 6,
  },
  announcementDesc: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
  },
  quickActions: {
    marginTop: SPACING['2xl'],
    gap: SPACING.lg,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  quickActionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionTextWrap: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  quickActionSub: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  quickActionArrow: {
    fontSize: 24,
    color: COLORS.onSurfaceVariant,
  },
});

export default HomeScreen;
