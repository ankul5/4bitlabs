import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboard, getMyRanks } from '../../services/leaderboardService';
import { getCourses } from '../../services/courseService';
import Svg, { Line, Path, Circle as SvgCircle } from 'react-native-svg';

const LeaderboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Get first course to pull leaderboard for
      const courses = await getCourses();
      if (courses && courses.length > 0) {
        const data = await getLeaderboard(courses[0]._id, 1, 20);
        setEntries(data?.entries || data?.leaderboard || []);
      }

      // Get user's rank
      try {
        const ranks = await getMyRanks();
        if (ranks && ranks.length > 0) setMyRank(ranks[0]);
      } catch { /* ok */ }
    } catch (err) {
      console.warn('Leaderboard fetch failed:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const renderTrendGraph = () => {
    // Simple placeholder trend if we don't have weekly data
    const width = 300;
    const height = 120;
    const padding = 10;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Generate simple trend from rank data
    const trendData = [20, 18, 15, 16, 14, 12, myRank?.rank || 10];
    const minRank = Math.min(...trendData);
    const maxRank = Math.max(...trendData);
    const range = maxRank - minRank || 1;

    const points = trendData.map((rank, i) => {
      const x = padding + (i / (trendData.length - 1)) * graphWidth;
      const y = padding + ((rank - minRank) / range) * graphHeight;
      return { x, y };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <>
        <View style={styles.graphContainer}>
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <Line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke={COLORS.surfaceContainerLow} strokeWidth="1" />
            <Line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke={COLORS.surfaceContainerLow} strokeWidth="1" />
            <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={COLORS.surfaceContainerLow} strokeWidth="1" />
            <Path d={pathData} fill="none" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <SvgCircle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={COLORS.primary} stroke={i === points.length - 1 ? COLORS.white : 'none'} strokeWidth={i === points.length - 1 ? 2 : 0} />
            ))}
          </Svg>
        </View>
        <View style={styles.xAxisLabels}>
          {days.map((d) => (
            <Text key={d} style={styles.xLabel}>{d}</Text>
          ))}
        </View>
      </>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.onSurfaceVariant, marginTop: 12 }}>Loading rankings...</Text>
      </View>
    );
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toUpperCase();
  const currentRank = myRank?.rank || user?.rank || '–';

  return (
    <View style={styles.container}>
      <Header user={user} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Global Rankings Header */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Global Rankings</Text>
          <Text style={styles.sessionLabel}>{currentMonth} SESSION</Text>
        </View>

        {/* Column Headers */}
        <View style={styles.columnHeaders}>
          <Text style={styles.colLabel}>RANK</Text>
          <Text style={[styles.colLabel, { flex: 1 }]}>STUDENT</Text>
          <Text style={[styles.colLabel, { textAlign: 'right' }]}>SCORE</Text>
        </View>

        {/* Rankings List */}
        <View style={styles.rankingsList}>
          {entries.length > 0 ? entries.map((entry, idx) => {
            const isUser = entry.userId?._id === user?._id || entry._id === user?._id;
            return (
              <View
                key={entry._id || idx}
                style={[styles.rankEntry, isUser && styles.userEntry]}
              >
                <Text style={[styles.rankNum, isUser && styles.userRankNum]}>
                  {idx + 1}
                </Text>
                <View style={styles.studentInfo}>
                  <Image
                    source={{ uri: entry.avatar || entry.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name || entry.userId?.name || 'U')}` }}
                    style={[styles.avatar, isUser && styles.userAvatar]}
                  />
                  <View style={styles.studentDetails}>
                    <Text style={[styles.studentName, isUser && styles.userName]}>
                      {entry.name || entry.userId?.name || 'Student'}{isUser ? ' (You)' : ''}
                    </Text>
                    <Text style={[styles.studentMeta, isUser && styles.userMeta]}>
                      {entry.school || entry.userId?.schoolId?.name || ''}
                    </Text>
                    {isUser && (
                      <Text style={styles.userBadge}>TOP {Math.round((idx + 1) / entries.length * 100)}% OF STUDENTS</Text>
                    )}
                  </View>
                </View>
                <Text style={[styles.scoreText, isUser && styles.userScore]}>
                  {(entry.points || entry.score || 0).toLocaleString()}
                </Text>
              </View>
            );
          }) : (
            <Text style={{ color: COLORS.onSurfaceVariant, textAlign: 'center', padding: 24 }}>No rankings available yet.</Text>
          )}
        </View>

        {/* Rank Trend Section */}
        <View style={styles.trendSection}>
          <View style={styles.trendHeader}>
            <Text style={styles.sectionTitle}>Rank Trend</Text>
            <Text style={styles.trendPeriod}>LAST 7 DAYS</Text>
          </View>

          <View style={styles.trendCard}>
            <View style={styles.trendStats}>
              <View>
                <Text style={styles.trendStatLabel}>CURRENT STANDING</Text>
                <View style={styles.trendCurrentRow}>
                  <Text style={styles.trendCurrentRank}>#{currentRank}</Text>
                  <View style={styles.trendBadge}>
                    <Text style={styles.trendBadgeText}>↗ rising</Text>
                  </View>
                </View>
              </View>
              <View style={styles.trendPrev}>
                <Text style={styles.trendStatLabel}>POINTS</Text>
                <Text style={styles.trendPrevRank}>{user?.points || 0}</Text>
              </View>
            </View>

            {renderTrendGraph()}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5 },
  sessionLabel: { fontSize: 11, fontWeight: '600', color: COLORS.onSurfaceVariant, letterSpacing: 2 },
  columnHeaders: { flexDirection: 'row', paddingHorizontal: SPACING.xl, paddingVertical: 8, marginBottom: 8 },
  colLabel: { fontSize: 10, fontWeight: '700', color: COLORS.onSurfaceVariant, letterSpacing: 2, width: 50 },
  rankingsList: { gap: 10, marginBottom: SPACING.xl },
  rankEntry: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xl, paddingVertical: 14, ...SHADOWS.sm },
  userEntry: { backgroundColor: COLORS.primary, transform: [{ scale: 1.02 }] },
  rankNum: { fontSize: 18, fontWeight: '800', color: COLORS.onSurfaceVariant, width: 36 },
  userRankNum: { color: COLORS.white },
  studentInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceContainer },
  userAvatar: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  studentDetails: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '700', color: COLORS.onSurface },
  userName: { color: COLORS.white },
  studentMeta: { fontSize: 11, color: COLORS.onSurfaceVariant, marginTop: 1 },
  userMeta: { color: 'rgba(255,255,255,0.8)' },
  userBadge: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  scoreText: { fontSize: 16, fontWeight: '700', color: COLORS.tertiary },
  userScore: { color: COLORS.white },
  viewAllBtn: { backgroundColor: COLORS.surfaceContainerLow, paddingVertical: 16, borderRadius: RADIUS.xl, alignItems: 'center', marginBottom: SPACING['3xl'] },
  viewAllText: { fontSize: 13, fontWeight: '700', color: COLORS.onSurfaceVariant, letterSpacing: 1 },
  trendSection: { marginBottom: SPACING['2xl'] },
  trendHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: SPACING.xl },
  trendPeriod: { fontSize: 12, fontWeight: '700', color: COLORS.primary, letterSpacing: 2 },
  trendCard: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS['2xl'], padding: SPACING.xl, ...SHADOWS.md },
  trendStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
  trendStatLabel: { fontSize: 10, fontWeight: '700', color: COLORS.onSurfaceVariant, letterSpacing: 2, marginBottom: 4 },
  trendCurrentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trendCurrentRank: { fontSize: 32, fontWeight: '900', color: COLORS.primary },
  trendBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  trendBadgeText: { fontSize: 12, fontWeight: '700', color: '#22c55e' },
  trendPrev: { alignItems: 'flex-end' },
  trendPrevRank: { fontSize: 22, fontWeight: '700', color: COLORS.onSurfaceVariant },
  graphContainer: { alignItems: 'center', marginVertical: SPACING.lg },
  xAxisLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  xLabel: { fontSize: 9, fontWeight: '700', color: COLORS.onSurfaceVariant, letterSpacing: 0.5, textTransform: 'uppercase' },
});

export default LeaderboardScreen;
