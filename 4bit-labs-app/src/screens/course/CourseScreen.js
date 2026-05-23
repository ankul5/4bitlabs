import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import Header from "../../components/Header";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import { getCourses, getCourse } from "../../services/courseService";
import { getQuizzes } from "../../services/quizService";
import { getLeaderboard } from "../../services/leaderboardService";
import Svg, { Circle } from "react-native-svg";
import * as Linking from "expo-linking";

const CourseScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [buildProjects, setBuildProjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const courses = await getCourses();
      if (courses && courses.length > 0) {
        const firstCourse = courses[0];
        const detail = await getCourse(firstCourse._id || firstCourse.id);
        setCourseData(detail);
        setLectures(detail.lectures || []);
        setBuildProjects(detail.buildProjects || []);

        // Fetch quizzes for this course
        try {
          const quizList = await getQuizzes((firstCourse._id || firstCourse.id));
          setQuizzes(quizList || []);
        } catch {
          setQuizzes([]);
        }

        // Fetch leaderboard
        try {
          const lb = await getLeaderboard((firstCourse._id || firstCourse.id));
          setLeaderboard(lb?.entries?.slice(0, 3) || []);
        } catch {
          setLeaderboard([]);
        }
      }
    } catch (err) {
      console.warn("Course data fetch failed:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useSocket('lecture:added', (data) => {
    if (courseData && (courseData._id === data.courseId || courseData.id === data.courseId)) {
      setLectures(prev => [...prev, data.lecture]);
    }
  });

  useSocket('quiz:created', (newQuiz) => {
    if (courseData && (courseData._id === newQuiz.courseId || courseData.id === newQuiz.courseId)) {
      setQuizzes(prev => [...prev, newQuiz]);
    }
  });

  const completedLectures = lectures.filter((l) => l.completed).length;
  const totalLectures = lectures.length;
  const courseProgress =
    totalLectures > 0
      ? Math.round((completedLectures / totalLectures) * 100)
      : 0;

  const renderProgressOrb = () => {
    const size = 140;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = totalLectures > 0 ? completedLectures / totalLectures : 0;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={styles.orbContainer}>
        <Svg
          width={size}
          height={size}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.surfaceContainer}
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
        <View style={styles.orbCenter}>
          <Text style={styles.orbValue}>
            {completedLectures}/{totalLectures}
          </Text>
          <Text style={styles.orbLabel}>LESSONS</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.onSurfaceVariant, marginTop: 12 }}>
          Loading courses...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header user={user} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Course Hero */}
        <View style={styles.courseHero}>
          <Text style={styles.currentlyLearning}>CURRENTLY LEARNING</Text>
          <Text style={styles.courseTitle}>
            {courseData?.title || "No Course"}
          </Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressPercent}>{courseProgress}%</Text>
            <Text style={styles.progressLabel}>COMPLETE</Text>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${courseProgress}%` }]}
            />
          </View>
        </View>

        {/* Recorded Lectures */}
        <SectionHeader
          title="Recorded Lectures"
          actionText="View All"
          onAction={() => {}}
        />
        <View style={styles.lecturesContainer}>
          {lectures.map((lecture, index) => (
            <TouchableOpacity
              key={lecture._id || index}
              style={[
                styles.lectureItem,
                !lecture.completed &&
                  index === completedLectures &&
                  styles.lectureItemActive,
                index > completedLectures && styles.lectureItemLocked,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                // If there's a videoUrl and it's unlocked, open it
                if (index <= completedLectures && lecture.videoUrl) {
                  Linking.openURL(lecture.videoUrl).catch(err => {
                    console.warn("Couldn't load page", err);
                  });
                }
              }}
            >
              <View style={styles.lectureThumbnail}>
                <Image
                  source={{
                    uri:
                      lecture.thumbnail || "https://via.placeholder.com/80x56",
                  }}
                  style={styles.lectureThumbnailImg}
                />
                <View style={styles.lecturePlayOverlay}>
                  <Text style={styles.lecturePlayIcon}>
                    {index > completedLectures ? "🔒" : "▶"}
                  </Text>
                </View>
              </View>
              <View style={styles.lectureInfo}>
                <Text style={styles.lectureTitle}>{lecture.title}</Text>
                <Text
                  style={[
                    styles.lectureMeta,
                    !lecture.completed &&
                      index === completedLectures &&
                      styles.lectureMetaActive,
                  ]}
                >
                  {!lecture.completed && index === completedLectures
                    ? `Next Up • ${lecture.duration || ""}`
                    : `${lecture.duration || ""}`}
                </Text>
              </View>
              {lecture.completed && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Build Projects */}
        <View style={styles.buildSection}>
          <View style={styles.buildHeader}>
            <View style={styles.buildAccent} />
            <Text style={styles.buildTitle}>Build Projects</Text>
          </View>
          <View style={styles.projectsGrid}>
            {buildProjects.map((project, idx) => (
              <TouchableOpacity
                key={project._id || idx}
                style={styles.projectCard}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.projectIcon,
                    idx === 0
                      ? { backgroundColor: "rgba(0,97,144,0.1)" }
                      : { backgroundColor: "rgba(186,0,19,0.1)" },
                  ]}
                >
                  <Text style={styles.projectIconText}>
                    {idx === 0 ? "⚙️" : "〰️"}
                  </Text>
                </View>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectDesc}>{project.description}</Text>
                <View style={styles.projectFooter}>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>
                      {(project.difficulty || "MEDIUM").toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.projectArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quizzes Section */}
        <SectionHeader
          title="Module Quizzes"
          actionText="View All"
          onAction={() => {}}
        />
        <View style={styles.quizzesContainer}>
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <TouchableOpacity
                key={quiz._id}
                style={styles.quizItemCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("Quiz", { quizId: quiz._id })
                }
              >
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <Text style={styles.quizMeta}>
                    {quiz.questions?.length || 0} Questions • {quiz.duration}{" "}
                    Mins • {quiz.totalMarks} Bits
                  </Text>
                </View>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryContainer]}
                  style={styles.quizStartBtn}
                >
                  <Text style={styles.quizStartText}>Start</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))
          ) : (
            <Text
              style={{
                color: COLORS.onSurfaceVariant,
                textAlign: "center",
                padding: 16,
              }}
            >
              No quizzes available yet.
            </Text>
          )}
        </View>

        {/* Leaderboard Preview */}
        <Card style={styles.leaderboardCard} variant="default">
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>Leaderboard</Text>
            <Text style={styles.leaderboardIcon}>📊</Text>
          </View>
          {leaderboard.slice(0, 2).map((entry, idx) => (
            <View key={entry._id || idx} style={styles.leaderboardEntry}>
              <Text
                style={[
                  styles.leaderboardRank,
                  idx < 2 && { color: COLORS.primary },
                ]}
              >
                {String(idx + 1).padStart(2, "0")}
              </Text>
              <Image
                source={{
                  uri:
                    entry.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name || "U")}`,
                }}
                style={styles.leaderboardAvatar}
              />
              <View style={styles.leaderboardEntryInfo}>
                <Text style={styles.leaderboardName}>{entry.name}</Text>
                <Text style={styles.leaderboardBits}>
                  {(entry.points || 0).toLocaleString()} Bits
                </Text>
              </View>
            </View>
          ))}
          {/* User entry */}
          <View style={styles.userRankEntry}>
            <Text style={styles.userRankNum}>{user?.rank || "–"}</Text>
            <View style={styles.userRankAvatar}>
              <Text style={styles.userRankAvatarText}>👤</Text>
            </View>
            <View style={styles.leaderboardEntryInfo}>
              <Text style={[styles.leaderboardName, { color: COLORS.primary }]}>
                You ({user?.name?.split(" ")[0] || "Me"})
              </Text>
              <Text style={styles.leaderboardBits}>
                {user?.points || 0} Bits
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.fullRankingsBtn}
            onPress={() => navigation.navigate("Leaderboard")}
            activeOpacity={0.8}
          >
            <Text style={styles.fullRankingsBtnText}>Full Rankings</Text>
          </TouchableOpacity>
        </Card>

        {/* Progress Orb */}
        <Card style={styles.orbCard} variant="default">
          {renderProgressOrb()}
          <Text style={styles.orbTitle}>Focused Study</Text>
          <Text style={styles.orbSubtitle}>
            You've maintained a 4-day learning streak. Keep it up!
          </Text>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  courseHero: { marginBottom: SPACING["2xl"] },
  currentlyLearning: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.secondary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.onSurface,
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 12,
  },
  progressPercent: { fontSize: 28, fontWeight: "800", color: COLORS.primary },
  progressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 2,
  },
  progressBarBg: {
    height: 14,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: RADIUS.full },
  lecturesContainer: { gap: 12, marginBottom: SPACING["2xl"] },
  lectureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: 14,
    ...SHADOWS.sm,
  },
  lectureItemActive: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  lectureItemLocked: { opacity: 0.6 },
  lectureThumbnail: {
    width: 80,
    height: 56,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    position: "relative",
  },
  lectureThumbnailImg: { width: "100%", height: "100%" },
  lecturePlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  lecturePlayIcon: { fontSize: 18, color: COLORS.white },
  lectureInfo: { flex: 1, marginLeft: 14 },
  lectureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  lectureMeta: { fontSize: 12, color: COLORS.onSurfaceVariant },
  lectureMetaActive: {
    color: COLORS.primary,
    fontWeight: "500",
    fontStyle: "italic",
  },
  checkIcon: { fontSize: 18, color: COLORS.surfaceContainerHighest },
  buildSection: { marginBottom: SPACING["2xl"] },
  buildHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: SPACING.xl,
  },
  buildAccent: {
    width: 4,
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  buildTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  projectsGrid: { gap: 12 },
  projectCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS["2xl"],
    padding: SPACING.xl,
    ...SHADOWS.sm,
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  projectIconText: { fontSize: 20 },
  projectTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 6,
  },
  projectDesc: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
    marginBottom: SPACING.lg,
  },
  projectFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  difficultyBadge: {
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: COLORS.onSurface,
  },
  projectArrow: { fontSize: 20, color: COLORS.primary, fontWeight: "700" },
  quizzesContainer: { gap: 12, marginBottom: SPACING["2xl"] },
  quizItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    ...SHADOWS.sm,
  },
  quizInfo: { flex: 1 },
  quizTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  quizMeta: { fontSize: 12, fontWeight: "600", color: COLORS.onSurfaceVariant },
  quizStartBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    ...SHADOWS.primaryGlow,
  },
  quizStartText: { color: COLORS.white, fontWeight: "800", fontSize: 13 },
  leaderboardCard: { marginBottom: SPACING.xl },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  leaderboardIcon: { fontSize: 22 },
  leaderboardEntry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  leaderboardRank: {
    width: 28,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainer,
  },
  leaderboardEntryInfo: { flex: 1 },
  leaderboardName: { fontSize: 13, fontWeight: "700", color: COLORS.onSurface },
  leaderboardBits: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  leaderboardChange: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  userRankEntry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(186,0,19,0.05)",
    padding: 12,
    borderRadius: RADIUS["2xl"],
    marginTop: 6,
  },
  userRankNum: {
    width: 28,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  userRankAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  userRankAvatarText: { fontSize: 14, color: COLORS.white },
  fullRankingsBtn: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surfaceContainer,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    alignItems: "center",
  },
  fullRankingsBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  orbCard: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    paddingVertical: SPACING["2xl"],
  },
  orbContainer: {
    position: "relative",
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  orbCenter: { position: "absolute", alignItems: "center" },
  orbValue: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  orbLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 3,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  orbTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.tertiary,
    marginBottom: 6,
  },
  orbSubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
});

export default CourseScreen;
