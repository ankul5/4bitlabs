import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  RefreshControl, Image, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../config/theme';
import { getStudents, getCourses, getEnrolledStudents, markStudentAttendance } from '../../services/adminService';
import StitchHeader from '../../components/StitchHeader';
import { useSocket } from '../../hooks/useSocket';

const StudentManagementScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingMap, setMarkingMap] = useState({}); // { [userId]: 'present' | 'absent' | 'loading' }

  const fetchData = useCallback(async () => {
    try {
      const [students, courseList] = await Promise.all([
        getStudents(user?.school_id),
        getCourses(user?.school_id),
      ]);
      setAllStudents(students || []);
      setCourses(courseList || []);
    } catch (e) {
      console.warn('Fetch students error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      if (selectedCourse) fetchEnrolledStudents(selectedCourse);
    }, [fetchData, selectedCourse])
  );

  useSocket('student:registered', (data) => {
    if (data && data.student) {
      const newStudent = {
        id: data.student.id,
        name: data.student.name,
        email: data.student.email,
        school_name: data.student.schoolName || 'A School',
        created_at: data.student.createdAt || new Date(),
      };
      setAllStudents(prev => [newStudent, ...prev]);
    }
  });


  const fetchEnrolledStudents = async (courseId) => {
    try {
      const data = await getEnrolledStudents(courseId);
      setEnrolledStudents(data || []);
    } catch (e) {
      console.warn('Fetch enrolled error:', e.message);
      setEnrolledStudents([]);
    }
  };

  const onCourseSelect = (courseId) => {
    if (selectedCourse === courseId) {
      setSelectedCourse(null);
      setEnrolledStudents([]);
    } else {
      setSelectedCourse(courseId);
      fetchEnrolledStudents(courseId);
    }
    setMarkingMap({});
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    if (selectedCourse) await fetchEnrolledStudents(selectedCourse);
    setRefreshing(false);
  };

  const handleMarkAttendance = async (userId, status) => {
    if (!selectedCourse) return;
    setMarkingMap(prev => ({ ...prev, [userId]: 'loading' }));
    try {
      await markStudentAttendance({ userId, courseId: selectedCourse, status });
      setMarkingMap(prev => ({ ...prev, [userId]: status }));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
      setMarkingMap(prev => { const n = { ...prev }; delete n[userId]; return n; });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Get students to display based on course filter
  const displayStudents = selectedCourse
    ? enrolledStudents.map(e => ({
        id: e.student?.id || e.userId,
        name: e.student?.name || 'Unknown',
        email: e.student?.email || '',
        avatar: e.student?.avatar || '',
        school_name: e.student?.school?.name || 'No School',
        school_code: e.student?.school?.code || '',
        created_at: e.student?.joinedAt,
        progress: e.progress,
        enrolledAt: e.enrolledAt,
      }))
    : allStudents;

  const filtered = displayStudents.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
                         (s.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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
          <Text style={[styles.mainTitle, { color: COLORS.onSurface }]}>Student Directory</Text>
          <Text style={[styles.subTitle, { color: COLORS.onSurfaceVariant }]}>
            {selectedCourse ? 'Showing enrolled students' : 'All registered students'}
          </Text>

          {/* Stats Hero */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryContainer]}
            start={{x:0, y:0}} end={{x:1, y:1}}
            style={styles.heroCard}
          >
            <View style={styles.heroColumn}>
              <Text style={styles.heroLabel}>TOTAL REGISTERED</Text>
              <Text style={styles.heroValue}>{allStudents.length}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroColumn}>
              <Text style={styles.heroLabel}>{selectedCourse ? 'ENROLLED' : 'COURSES'}</Text>
              <Text style={styles.heroValue}>{selectedCourse ? enrolledStudents.length : courses.length}</Text>
            </View>
          </LinearGradient>

          {/* Course Filter */}
          {courses.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.sectionLabel, { color: COLORS.onSurface }]}>Filter by Course</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 24 }}>
                {courses.map(c => {
                  const cid = c.id || c._id;
                  const isSelected = selectedCourse === cid;
                  return (
                    <TouchableOpacity
                      key={cid}
                      style={[
                        styles.courseChip,
                        { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.outlineVariant },
                        isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                      ]}
                      onPress={() => onCourseSelect(cid)}
                    >
                      <Text style={[
                        styles.courseChipText, { color: COLORS.onSurface },
                        isSelected && { color: 'white' },
                      ]}>
                        {c.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Search */}
          <View style={[styles.searchWrapper, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.outlineVariant }]}>
            <MaterialIcons name="search" size={20} color={COLORS.onSurfaceVariant} />
            <TextInput
              style={[styles.searchInput, { color: COLORS.onSurface }]}
              placeholder="Search students..."
              placeholderTextColor={COLORS.onSurfaceVariant + '80'}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Student List */}
          <View style={styles.studentList}>
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
                <MaterialIcons name="people-outline" size={48} color={COLORS.onSurfaceVariant + '40'} />
                <Text style={{ color: COLORS.onSurfaceVariant, fontSize: 14, fontWeight: '600' }}>
                  {selectedCourse ? 'No students enrolled in this course' : 'No students registered yet'}
                </Text>
              </View>
            ) : (
              filtered.map((item, idx) => (
                <View key={item.id || idx} style={[styles.studentCard, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.outlineVariant }]}>
                  <View style={styles.cardHeader}>
                    <Image 
                      source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'S')}&background=ba0013&color=fff` }}
                      style={[styles.avatar, { backgroundColor: COLORS.surfaceContainerHighest }]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.userName, { color: COLORS.onSurface }]}>{item.name}</Text>
                      <Text style={{ fontSize: 11, color: COLORS.onSurfaceVariant, marginTop: 1 }}>{item.email}</Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.schoolBadge, { backgroundColor: COLORS.primary + '15' }]}>
                          <MaterialIcons name="school" size={10} color={COLORS.primary} />
                          <Text style={[styles.schoolText, { color: COLORS.primary }]}>
                            {item.school_name || 'NO SCHOOL'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 10, color: COLORS.onSurfaceVariant }}>
                          {formatDate(item.created_at)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress bar for enrolled students */}
                  {selectedCourse && item.progress !== undefined && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressLabelRow}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.onSurfaceVariant }}>COURSE PROGRESS</Text>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.primary }}>{Math.round(item.progress)}%</Text>
                      </View>
                      <View style={[styles.progressBarBg, { backgroundColor: COLORS.surfaceContainerHighest }]}>
                        <View style={[styles.progressBarFill, { width: `${item.progress || 0}%`, backgroundColor: COLORS.primary }]} />
                      </View>
                    </View>
                  )}

                  {/* Attendance Marking (only when course is selected) */}
                  {selectedCourse && (
                    <View style={styles.attendanceRow}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.onSurfaceVariant, letterSpacing: 1 }}>TODAY'S ATTENDANCE</Text>
                      <View style={styles.attendanceBtns}>
                        {markingMap[item.id] === 'loading' ? (
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.attendBtn,
                                { borderColor: '#22c55e' },
                                markingMap[item.id] === 'present' && { backgroundColor: '#22c55e' },
                              ]}
                              onPress={() => handleMarkAttendance(item.id, 'present')}
                            >
                              <MaterialIcons name="check" size={16} color={markingMap[item.id] === 'present' ? 'white' : '#22c55e'} />
                              <Text style={[styles.attendBtnText, { color: markingMap[item.id] === 'present' ? 'white' : '#22c55e' }]}>PRESENT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.attendBtn,
                                { borderColor: COLORS.error || '#ef4444' },
                                markingMap[item.id] === 'absent' && { backgroundColor: COLORS.error || '#ef4444' },
                              ]}
                              onPress={() => handleMarkAttendance(item.id, 'absent')}
                            >
                              <MaterialIcons name="close" size={16} color={markingMap[item.id] === 'absent' ? 'white' : (COLORS.error || '#ef4444')} />
                              <Text style={[styles.attendBtnText, { color: markingMap[item.id] === 'absent' ? 'white' : (COLORS.error || '#ef4444') }]}>ABSENT</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  )}
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
  content: { padding: 24, paddingTop: 12 },
  mainTitle: { fontSize: 32, fontFamily: FONTS.headline, fontWeight: '900', letterSpacing: -1 },
  subTitle: { fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 24 },

  heroCard: { 
    flexDirection: 'row', padding: 24, borderRadius: 24, 
    marginBottom: 24, alignItems: 'center', ...SHADOWS.primaryGlow 
  },
  heroColumn: { flex: 1 },
  heroLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: 'rgba(255,255,255,0.7)' },
  heroValue: { fontSize: 32, fontWeight: '900', color: 'white', marginVertical: 4 },
  heroDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 20 },

  sectionLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10 },
  courseChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.full, borderWidth: 1 },
  courseChipText: { fontSize: 11, fontWeight: '700' },

  searchWrapper: { 
    flexDirection: 'row', alignItems: 'center', gap: 12, 
    paddingHorizontal: 16, height: 48, borderRadius: 14, borderWidth: 1, marginBottom: 20 
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600' },

  studentList: { gap: 14 },
  studentCard: { borderRadius: 20, padding: 18, borderWidth: 1, ...SHADOWS.sm },
  cardHeader: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  userName: { fontSize: 15, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  schoolBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  schoolText: { fontSize: 9, fontWeight: '900' },

  progressSection: { marginTop: 14 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  attendanceRow: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.1)' },
  attendanceBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  attendBtn: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 
  },
  attendBtnText: { fontSize: 10, fontWeight: '900' },
});

export default StudentManagementScreen;
