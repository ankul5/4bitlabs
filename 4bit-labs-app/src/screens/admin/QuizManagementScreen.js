import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Alert, Modal, ScrollView, RefreshControl, Dimensions, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../config/theme';
import { getQuizzes, createQuiz, deleteQuiz, addQuestion, getCourses } from '../../services/adminService';
import StitchHeader from '../../components/StitchHeader';

const { width } = Dimensions.get('window');

const QuizManagementScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Create quiz modal
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', duration: '15', courseId: '' });
  const [questions, setQuestions] = useState([]);
  
  // Add question form
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [q, c] = await Promise.all([
        getQuizzes(user?.school_id),
        getCourses(user?.school_id),
      ]);
      setQuizzes(q || []);
      setCourses(c || []);
    } catch (e) {
      console.warn('Quiz fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const addQuestionToList = () => {
    if (!questionText.trim()) return Alert.alert('Error', 'Enter the question text.');
    const filledOptions = options.filter(o => o.trim());
    if (filledOptions.length < 2) return Alert.alert('Error', 'Enter at least 2 options.');
    if (!options[correctIndex].trim()) return Alert.alert('Error', 'The correct answer option cannot be empty.');

    setQuestions(prev => [...prev, {
      question: questionText.trim(),
      options: options.map(o => o.trim()),
      correctAnswer: options[correctIndex].trim(),
      points: 10,
    }]);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
  };

  const removeQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!quizForm.title.trim()) return Alert.alert('Error', 'Quiz title is required.');
    if (!quizForm.courseId) return Alert.alert('Error', 'Select a course for this quiz.');
    if (questions.length === 0) return Alert.alert('Error', 'Add at least one question.');
    
    setSaving(true);
    try {
      await createQuiz({
        title: quizForm.title,
        course_id: quizForm.courseId,
        school_id: user?.school_id,
        duration: parseInt(quizForm.duration) || 15,
        status: 'published',
        questions,
      });
      setShowCreate(false);
      setQuizForm({ title: '', duration: '15', courseId: '' });
      setQuestions([]);
      fetchData();
      Alert.alert('Success', 'Quiz created! Students enrolled in this course will see it.');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = (quizId) => {
    Alert.alert('Delete Quiz', 'Are you sure? This will delete the quiz and all student attempts.', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteQuiz(quizId);
          fetchData();
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const getCourseName = (courseId) => {
    const c = courses.find(c => (c.id || c._id) === courseId);
    return c?.title || 'Unknown Course';
  };

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
          <Text style={[styles.mainTitle, { color: COLORS.onSurface }]}>Quiz Management</Text>
          <Text style={[styles.subTitle, { color: COLORS.onSurfaceVariant }]}>Create and manage assessments for your courses</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.statCard}>
              <Text style={styles.statLabel}>TOTAL QUIZZES</Text>
              <Text style={styles.statValue}>{quizzes.length}</Text>
            </LinearGradient>
            <View style={[styles.statCard, { backgroundColor: COLORS.surfaceContainer }]}>
              <Text style={[styles.statLabel, { color: COLORS.onSurfaceVariant }]}>TOTAL QUESTIONS</Text>
              <Text style={[styles.statValue, { color: COLORS.onSurface }]}>
                {quizzes.reduce((s, q) => s + (q.questions?.length || 0), 0)}
              </Text>
            </View>
          </View>

          {/* Search */}
          <View style={[styles.searchWrapper, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.outlineVariant }]}>
            <MaterialIcons name="search" size={20} color={COLORS.onSurfaceVariant} />
            <TextInput
              style={[styles.searchInput, { color: COLORS.onSurface }]}
              placeholder="Search quizzes..."
              placeholderTextColor={COLORS.onSurfaceVariant + '80'}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Quiz List */}
          <View style={styles.quizList}>
            {quizzes.filter(q => (q.title || '').toLowerCase().includes((search || '').toLowerCase())).map(item => (
              <View key={item.id || item._id} style={[styles.quizCard, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.outlineVariant }]}>
                <View style={styles.cardInfo}>
                  <Text style={[styles.quizTitle, { color: COLORS.onSurface }]}>{item.title}</Text>
                  <Text style={[styles.courseBadge, { color: COLORS.tertiary, backgroundColor: COLORS.tertiary + '15' }]}>
                    {item.courseId ? getCourseName(item.courseId) : 'No Course'}
                  </Text>
                  <View style={styles.quizMeta}>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="help-outline" size={14} color={COLORS.onSurfaceVariant} />
                      <Text style={[styles.metaText, { color: COLORS.onSurfaceVariant }]}>{item.questions?.length || 0} Questions</Text>
                    </View>
                    <View style={[styles.metaDivider, { backgroundColor: COLORS.outlineVariant }]} />
                    <View style={styles.metaItem}>
                      <MaterialIcons name="timer" size={14} color={COLORS.onSurfaceVariant} />
                      <Text style={[styles.metaText, { color: COLORS.onSurfaceVariant }]}>{item.duration}m</Text>
                    </View>
                    <View style={[styles.metaDivider, { backgroundColor: COLORS.outlineVariant }]} />
                    <View style={styles.metaItem}>
                      <MaterialIcons name="star" size={14} color={COLORS.onSurfaceVariant} />
                      <Text style={[styles.metaText, { color: COLORS.onSurfaceVariant }]}>{item.totalMarks || 0} pts</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id || item._id)}>
                  <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
            {quizzes.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
                <MaterialIcons name="quiz" size={48} color={COLORS.onSurfaceVariant + '40'} />
                <Text style={{ color: COLORS.onSurfaceVariant, fontSize: 14 }}>No quizzes yet. Create one!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, SHADOWS.primaryGlow]} onPress={() => setShowCreate(true)}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.fabFill}>
          <MaterialIcons name="add" size={32} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Quiz Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.outlineVariant }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: COLORS.onSurface }]}>Create New Quiz</Text>

              {/* Quiz Title */}
              <TextInput
                style={[styles.input, { backgroundColor: COLORS.surfaceContainerLowest, color: COLORS.onSurface }]}
                placeholder="Quiz Title"
                placeholderTextColor={COLORS.onSurfaceVariant + '60'}
                value={quizForm.title}
                onChangeText={t => setQuizForm(p => ({ ...p, title: t }))}
              />

              {/* Duration */}
              <TextInput
                style={[styles.input, { backgroundColor: COLORS.surfaceContainerLowest, color: COLORS.onSurface }]}
                placeholder="Duration (minutes)"
                placeholderTextColor={COLORS.onSurfaceVariant + '60'}
                value={quizForm.duration}
                onChangeText={t => setQuizForm(p => ({ ...p, duration: t }))}
                keyboardType="numeric"
              />

              {/* Course Selector */}
              <Text style={[styles.sectionLabel, { color: COLORS.onSurface }]}>Select Course *</Text>
              {courses.length === 0 ? (
                <View style={{ padding: 16, backgroundColor: COLORS.error + '15', borderRadius: 12, marginBottom: 20 }}>
                  <Text style={{ color: COLORS.error, fontSize: 13, fontWeight: '700' }}>
                    No courses available! You must create a course in the Content tab first before you can create a quiz.
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }} contentContainerStyle={{ gap: 8 }}>
                  {courses.map(c => (
                    <TouchableOpacity
                      key={c.id || c._id}
                      style={[
                        styles.courseChip,
                        { backgroundColor: COLORS.surfaceContainerHighest },
                        quizForm.courseId === (c.id || c._id) && { backgroundColor: COLORS.primary },
                      ]}
                      onPress={() => setQuizForm(p => ({ ...p, courseId: c.id || c._id }))}
                    >
                      <Text style={[
                        styles.courseChipText, { color: COLORS.onSurface },
                        quizForm.courseId === (c.id || c._id) && { color: 'white' },
                      ]}>{c.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Added Questions */}
              {questions.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={[styles.sectionLabel, { color: COLORS.onSurface }]}>Questions Added ({questions.length})</Text>
                  {questions.map((q, idx) => (
                    <View key={idx} style={[styles.addedQuestion, { backgroundColor: COLORS.surfaceContainerLowest, borderColor: COLORS.outlineVariant }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.addedQText, { color: COLORS.onSurface }]}>Q{idx + 1}: {q.question}</Text>
                        <Text style={{ fontSize: 11, color: COLORS.tertiary, marginTop: 2 }}>✓ {q.correctAnswer}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeQuestion(idx)} style={{ padding: 4 }}>
                        <MaterialIcons name="close" size={18} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Add Question Section */}
              <View style={[styles.addQuestionSection, { backgroundColor: COLORS.surfaceContainerLowest, borderColor: COLORS.outlineVariant }]}>
                <Text style={[styles.sectionLabel, { color: COLORS.onSurface, marginBottom: 12 }]}>Add a Question</Text>
                
                <TextInput
                  style={[styles.input, { backgroundColor: COLORS.surfaceContainer, color: COLORS.onSurface }]}
                  placeholder="Enter question text"
                  placeholderTextColor={COLORS.onSurfaceVariant + '60'}
                  value={questionText}
                  onChangeText={setQuestionText}
                  multiline
                />

                {options.map((opt, idx) => (
                  <View key={idx} style={styles.optionRow}>
                    <TouchableOpacity
                      style={[
                        styles.radioCircle,
                        { borderColor: COLORS.outlineVariant },
                        correctIndex === idx && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                      ]}
                      onPress={() => setCorrectIndex(idx)}
                    >
                      {correctIndex === idx && <MaterialIcons name="check" size={12} color="white" />}
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.optionInput, { backgroundColor: COLORS.surfaceContainer, color: COLORS.onSurface }]}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      placeholderTextColor={COLORS.onSurfaceVariant + '60'}
                      value={opt}
                      onChangeText={t => {
                        const newOpts = [...options];
                        newOpts[idx] = t;
                        setOptions(newOpts);
                      }}
                    />
                  </View>
                ))}
                <Text style={{ fontSize: 10, color: COLORS.onSurfaceVariant, marginTop: 4 }}>Tap the circle to mark the correct answer</Text>

                <TouchableOpacity
                  style={[styles.addQBtn, { backgroundColor: COLORS.secondary }]}
                  onPress={addQuestionToList}
                >
                  <MaterialIcons name="add" size={18} color="white" />
                  <Text style={styles.addQBtnText}>ADD QUESTION</Text>
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowCreate(false); setQuestions([]); setQuizForm({ title: '', duration: '15', courseId: '' }); }}>
                  <Text style={[styles.cancelText, { color: COLORS.onSurfaceVariant }]}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.primary }]} onPress={handleCreate} disabled={saving}>
                  {saving ? <ActivityIndicator size="small" color="white" /> : (
                    <Text style={styles.submitText}>CREATE QUIZ ({questions.length} Q)</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingTop: 12 },
  mainTitle: { fontSize: 32, fontFamily: FONTS.headline, fontWeight: '900', letterSpacing: -1 },
  subTitle: { fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 24 },

  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, padding: 20, borderRadius: 20, ...SHADOWS.sm },
  statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: 'rgba(255,255,255,0.7)' },
  statValue: { fontSize: 32, fontWeight: '900', color: 'white', marginTop: 4 },

  searchWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, height: 48, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600' },

  quizList: { gap: 14 },
  quizCard: { padding: 18, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'flex-start' },
  cardInfo: { flex: 1 },
  quizTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  courseBadge: { fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8, overflow: 'hidden' },
  quizMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600' },
  metaDivider: { width: 3, height: 3, borderRadius: 2 },
  deleteBtn: { padding: 8 },

  fab: { position: 'absolute', bottom: 100, right: 24, width: 60, height: 60, borderRadius: 30 },
  fabFill: { flex: 1, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '92%', borderWidth: 1 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 20 },

  input: { padding: 16, borderRadius: 14, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 },

  courseChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.full },
  courseChipText: { fontSize: 12, fontWeight: '700' },

  addedQuestion: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  addedQText: { fontSize: 13, fontWeight: '600' },

  addQuestionSection: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },

  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  optionInput: { flex: 1, padding: 12, borderRadius: 10, fontSize: 13, fontWeight: '600' },

  addQBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, marginTop: 12 },
  addQBtnText: { color: 'white', fontSize: 11, fontWeight: '900' },

  modalActionRow: { flexDirection: 'row', gap: 12, marginTop: 8, paddingBottom: 20 },
  cancelBtn: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  cancelText: { fontSize: 12, fontWeight: '800' },
  submitBtn: { flex: 2, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 12, fontWeight: '900' },
});

export default QuizManagementScreen;
