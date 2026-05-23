import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import Header from '../../components/Header';
import { getSchool } from '../../services/schoolService';
import { getAnnouncements } from '../../services/announcementService';

const StudentSchoolScreen = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [schoolData, setSchoolData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const schoolId = typeof user?.schoolId === 'object' ? user.schoolId._id || user.schoolId.id : user?.schoolId;
      if (!schoolId) {
        setLoading(false);
        return;
      }
      
      const [schoolDetail, annList] = await Promise.all([
        getSchool(schoolId),
        getAnnouncements({ schoolId })
      ]);

      if (schoolDetail) {
        setSchoolData(schoolDetail);
        setCourses(schoolDetail.courses || []);
      }
      if (annList) {
        setAnnouncements(annList);
      }
    } catch (err) {
      console.warn("Failed to fetch school data:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.schoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useSocket('school:updated', (updatedSchool) => {
    const schoolId = typeof user?.schoolId === 'object' ? user.schoolId._id || user.schoolId.id : user?.schoolId;
    if (updatedSchool._id === schoolId || updatedSchool.id === schoolId) {
      setSchoolData(prev => ({ ...prev, ...updatedSchool }));
    }
  });

  useSocket('course:created', (newCourse) => {
    setCourses(prev => [...prev, newCourse]);
  });

  useSocket('course:updated', (updatedCourse) => {
    setCourses(prev => prev.map(c => 
      (c._id === updatedCourse._id || c.id === updatedCourse.id) ? { ...c, ...updatedCourse } : c
    ));
  });

  useSocket('course:deleted', (data) => {
    setCourses(prev => prev.filter(c => c._id !== data.id && c.id !== data.id));
  });

  useSocket('announcement:created', (newAnnouncement) => {
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.onSurfaceVariant, marginTop: 12 }}>Loading school...</Text>
      </View>
    );
  }

  if (!schoolData) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: COLORS.onSurfaceVariant }}>You are not registered to a school.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header user={user} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.preTitle}>MY SCHOOL</Text>
          <Text style={styles.schoolName}>{schoolData.name}</Text>
          <Text style={styles.schoolLocation}>
            {schoolData.city && schoolData.state ? `${schoolData.city}, ${schoolData.state}` : 'Location untracked'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          {announcements.length === 0 ? (
            <Text style={styles.emptyText}>No recent announcements.</Text>
          ) : (
            announcements.map((item, idx) => (
              <View key={item._id || idx} style={styles.announcementCard}>
                <Text style={styles.accTitle}>{item.title}</Text>
                <Text style={styles.accBody}>{item.body}</Text>
                <Text style={styles.accDate}>{new Date(item.createdAt || item.created_at).toLocaleDateString()}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Courses</Text>
          {courses.length === 0 ? (
            <Text style={styles.emptyText}>No courses available for your school.</Text>
          ) : (
            courses.map((course, idx) => (
              <TouchableOpacity
                key={course._id || idx}
                style={styles.courseCard}
                onPress={() => navigation.navigate('CourseHome')}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: course.thumbnailUrl || course.thumbnail_url || 'https://via.placeholder.com/150' }}
                  style={styles.courseImg}
                />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseCategory}>{course.category || 'Course'}</Text>
                  <Text style={styles.viewCourseText}>View Details →</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollContent: { padding: SPACING.xl },
  header: { marginBottom: SPACING['2xl'] },
  preTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primary, letterSpacing: 1.5, marginBottom: 8 },
  schoolName: { fontSize: 28, fontWeight: '800', color: COLORS.onSurface, marginBottom: 4 },
  schoolLocation: { fontSize: 14, color: COLORS.onSurfaceVariant },
  section: { marginBottom: SPACING['2xl'] },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.onSurface, marginBottom: SPACING.lg },
  emptyText: { color: COLORS.onSurfaceVariant, fontStyle: 'italic' },
  announcementCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    ...SHADOWS.sm,
  },
  accTitle: { fontSize: 16, fontWeight: '700', color: COLORS.onSurface, marginBottom: 4 },
  accBody: { fontSize: 14, color: COLORS.onSurfaceVariant, lineHeight: 20, marginBottom: 8 },
  accDate: { fontSize: 11, color: COLORS.tertiary, fontWeight: '600' },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  courseImg: { width: 100, height: 100 },
  courseInfo: { flex: 1, padding: SPACING.lg, justifyContent: 'center' },
  courseTitle: { fontSize: 16, fontWeight: '700', color: COLORS.onSurface, marginBottom: 4 },
  courseCategory: { fontSize: 12, color: COLORS.onSurfaceVariant, marginBottom: 8 },
  viewCourseText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});

export default StudentSchoolScreen;
