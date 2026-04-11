import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import Svg, { Circle } from 'react-native-svg';

const ResultScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { score = 7, total = 10, timeSpent = 420 } = route?.params || {};
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 60;

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  const renderScoreRing = () => {
    const size = 180;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = score / total;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={styles.ringContainer}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size/2} cy={size/2} r={radius} stroke={COLORS.surfaceContainerHigh} strokeWidth={strokeWidth} fill="transparent" />
          <Circle cx={size/2} cy={size/2} r={radius} stroke={passed ? COLORS.tertiary : COLORS.primary} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.scoreText}>{score}/{total}</Text>
          <Text style={styles.scoreLabel}>{percentage}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.content}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, passed ? styles.passedBadge : styles.failedBadge]}>
          <Text style={styles.statusIcon}>{passed ? '🏆' : '📝'}</Text>
          <Text style={[styles.statusText, passed ? styles.passedText : styles.failedText]}>
            {passed ? 'QUIZ PASSED' : 'KEEP PRACTICING'}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {passed ? 'Excellent Work!' : 'Almost There!'}
        </Text>
        <Text style={styles.subtitle}>
          {passed
            ? 'You\'ve demonstrated strong understanding of Basic Electronics.'
            : 'Review the topics and try again. You\'re making progress!'
          }
        </Text>

        {/* Score Ring */}
        {renderScoreRing()}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{total - score}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatTime(timeSpent)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </View>

        {/* Points Earned */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsIcon}>⚡</Text>
          <View>
            <Text style={styles.pointsValue}>+{(route?.params?.pointsEarned !== undefined) ? route.params.pointsEarned : (score * 10)} Bits Earned</Text>
            <Text style={styles.pointsLabel}>Added to your leaderboard score</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CourseHome')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Back to Course</Text>
          </LinearGradient>
        </TouchableOpacity>

        {!passed && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.replace('Quiz', { quizId: route?.params?.quizId })}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry Quiz</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING['2xl'], justifyContent: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, marginBottom: SPACING.xl },
  passedBadge: { backgroundColor: 'rgba(0, 97, 144, 0.1)' },
  failedBadge: { backgroundColor: 'rgba(186, 0, 19, 0.1)' },
  statusIcon: { fontSize: 16 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  passedText: { color: COLORS.tertiary },
  failedText: { color: COLORS.primary },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -1, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.onSurfaceVariant, textAlign: 'center', lineHeight: 20, maxWidth: 280, marginBottom: SPACING['2xl'] },
  ringContainer: { position: 'relative', width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING['2xl'] },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  scoreText: { fontSize: 36, fontWeight: '900', color: COLORS.onSurface, letterSpacing: -2 },
  scoreLabel: { fontSize: 14, fontWeight: '600', color: COLORS.onSurfaceVariant },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: SPACING['2xl'] },
  statCard: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, paddingVertical: 16, alignItems: 'center', ...SHADOWS.sm },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.onSurface, marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: COLORS.onSurfaceVariant, letterSpacing: 0.5 },
  pointsCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(186, 0, 19, 0.05)', paddingHorizontal: 20, paddingVertical: 16, borderRadius: RADIUS.xl, width: '100%' },
  pointsIcon: { fontSize: 24 },
  pointsValue: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  pointsLabel: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  actions: { paddingHorizontal: SPACING['2xl'], gap: 12 },
  primaryButton: { paddingVertical: 18, borderRadius: RADIUS.full, alignItems: 'center', ...SHADOWS.primaryGlow },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  retryButton: { paddingVertical: 16, borderRadius: RADIUS.full, alignItems: 'center', backgroundColor: COLORS.surfaceContainerLow },
  retryButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.onSurface },
});

export default ResultScreen;
