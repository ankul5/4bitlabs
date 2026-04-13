import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ScrollView, RefreshControl } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../config/theme';
import { getQuizzes, createQuiz, deleteQuiz, addQuestion } from '../../services/adminService';

const QuizManagementScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { COLORS, isDark } = useTheme();
  const [quizzes, setQuizzes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddQ, setShowAddQ] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [form, setForm] = useState({ title: '', duration: '15', total_marks: '100', passing_marks: '40', type: 'mcq' });
  const [qForm, setQForm] = useState({ 
    type: 'mcq', // 'mcq' or 'written'
    question: '', optA: '', optB: '', optC: '', optD: '', correct: 'A', points: '10' 
  });

  const fetchQuizzes = useCallback(async () => {
    try {
      const data = await getQuizzes(user?.school_id);
      setQuizzes(data);
    } catch (e) { console.warn('Quiz fetch error:', e.message); }
  }, [user]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);
  const onRefresh = async () => { setRefreshing(true); await fetchQuizzes(); setRefreshing(false); };

  const handleCreate = async () => {
    if (!form.title.trim()) return Alert.alert('Error', 'Quiz title is required');
    try {
      await createQuiz({
        title: form.title,
        school_id: user?.school_id,
        created_by: user?.id || user?._id,
        duration: parseInt(form.duration) || 15,
        total_marks: parseInt(form.total_marks) || 100,
        passing_marks: parseInt(form.passing_marks) || 40,
        status: 'draft',
        quiz_type: form.type,
      });
      setShowCreate(false);
      setForm({ title: '', duration: '15', total_marks: '100', passing_marks: '40', type: 'mcq' });
      fetchQuizzes();
      Alert.alert('Success', 'Quiz created!');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Quiz', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteQuiz(id); fetchQuizzes(); } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const handleAddQuestion = async () => {
    if (!qForm.question.trim()) return Alert.alert('Error', 'Question text required');
    try {
      const options = JSON.stringify([
        { label: 'A', text: qForm.optA },
        { label: 'B', text: qForm.optB },
        { label: 'C', text: qForm.optC },
        { label: 'D', text: qForm.optD },
      ]);
      await addQuestion(selectedQuiz.id, {
        question: qForm.question,
        type: qForm.type,
        options: qForm.type === 'mcq' ? options : '[]',
        correct_answer: qForm.type === 'mcq' ? qForm.correct : '',
        points: parseInt(qForm.points) || 10,
      });
      setQForm({ type: 'mcq', question: '', optA: '', optB: '', optC: '', optD: '', correct: 'A', points: '10' });
      Alert.alert('Success', 'Question added!');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const statusColor = { draft: '#f59e0b', published: '#22c55e', closed: '#ef4444' };

  const renderQuiz = ({ item }) => (
    <View style={[styles.quizCard, { backgroundColor: COLORS.surfaceContainerLowest }]}>
      <View style={{ flex: 1 }}>
        <View style={styles.quizHeader}>
          <Text style={[styles.quizTitle, { color: COLORS.onSurface }]}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: (statusColor[item.status] || '#94a3b8') + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor[item.status] || '#94a3b8' }]}>
              {(item.status || 'draft').toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.quizMeta}>
          <Text style={styles.metaText}><MaterialIcons name="timer" size={14} color="#64748b" /> {item.duration || 15} min</Text>
          <Text style={styles.metaText}><MaterialIcons name="stars" size={14} color="#64748b" /> {item.total_marks || 0} marks</Text>
        </View>
      </View>
      <View style={styles.quizActions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => { setSelectedQuiz(item); setShowAddQ(true); }}>
          <Ionicons name="add-circle" size={28} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.surface }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.screenTitle, { color: COLORS.onSurface }]}>Quizzes</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.createBtnText}>New Quiz</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={quizzes}
        renderItem={renderQuiz}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="quiz" size={48} color={COLORS.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: COLORS.onSurfaceVariant }]}>No quizzes yet</Text>
            <Text style={[styles.emptySubtext, { color: COLORS.onSurfaceVariant }]}>Tap "New Quiz" to create one</Text>
          </View>
        }
      />

      {/* Create Quiz Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.surfaceContainerLowest }]}>
            <Text style={[styles.modalTitle, { color: COLORS.onSurface }]}>Create Quiz</Text>

            <View style={[styles.tabRow, { backgroundColor: COLORS.surfaceContainerLow }]}>
              <TouchableOpacity style={[styles.tabBtn, form.type === 'mcq' && [styles.tabBtnActive, { backgroundColor: COLORS.surface }]]} onPress={() => setForm(p => ({...p, type: 'mcq'}))}>
                <Text style={[styles.tabText, { color: COLORS.onSurfaceVariant }, form.type === 'mcq' && [styles.tabTextActive, { color: COLORS.onSurface }]]}>MCQ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, form.type === 'written' && [styles.tabBtnActive, { backgroundColor: COLORS.surface }]]} onPress={() => setForm(p => ({...p, type: 'written'}))}>
                <Text style={[styles.tabText, { color: COLORS.onSurfaceVariant }, form.type === 'written' && [styles.tabTextActive, { color: COLORS.onSurface }]]}>Written Answer</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Quiz Title" value={form.title} onChangeText={t => setForm(p => ({ ...p, title: t }))} />
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, { flex: 1, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Duration (min)" keyboardType="numeric" value={form.duration} onChangeText={t => setForm(p => ({ ...p, duration: t }))} />
              <TextInput style={[styles.input, { flex: 1, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Total Marks" keyboardType="numeric" value={form.total_marks} onChangeText={t => setForm(p => ({ ...p, total_marks: t }))} />
            </View>
            <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Passing Marks" keyboardType="numeric" value={form.passing_marks} onChangeText={t => setForm(p => ({ ...p, passing_marks: t }))} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: COLORS.surfaceContainerLow }]} onPress={() => setShowCreate(false)}>
                <Text style={[styles.cancelText, { color: COLORS.onSurfaceVariant }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
                <Text style={styles.submitText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Question Modal */}
      <Modal visible={showAddQ} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={[styles.modalContent, { backgroundColor: COLORS.surfaceContainerLowest }]}>
              <Text style={[styles.modalTitle, { color: COLORS.onSurface }]}>Add Question</Text>
              <Text style={[styles.modalSubtitle, { color: COLORS.onSurfaceVariant }]}>Quiz: {selectedQuiz?.title}</Text>
              
              <View style={[styles.tabRow, { backgroundColor: COLORS.surfaceContainerLow }]}>
                <TouchableOpacity style={[styles.tabBtn, qForm.type === 'mcq' && [styles.tabBtnActive, { backgroundColor: COLORS.surface }]]} onPress={() => setQForm(p => ({...p, type: 'mcq'}))}>
                  <Text style={[styles.tabText, { color: COLORS.onSurfaceVariant }, qForm.type === 'mcq' && [styles.tabTextActive, { color: COLORS.onSurface }]]}>MCQ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabBtn, qForm.type === 'written' && [styles.tabBtnActive, { backgroundColor: COLORS.surface }]]} onPress={() => setQForm(p => ({...p, type: 'written'}))}>
                  <Text style={[styles.tabText, { color: COLORS.onSurfaceVariant }, qForm.type === 'written' && [styles.tabTextActive, { color: COLORS.onSurface }]]}>Written Answer</Text>
                </TouchableOpacity>
              </View>

              <TextInput style={[styles.input, { height: 80, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Question text" multiline value={qForm.question} onChangeText={t => setQForm(p => ({ ...p, question: t }))} />
              
              {qForm.type === 'mcq' && (
                <>
                  <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Option A" value={qForm.optA} onChangeText={t => setQForm(p => ({ ...p, optA: t }))} />
                  <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Option B" value={qForm.optB} onChangeText={t => setQForm(p => ({ ...p, optB: t }))} />
                  <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Option C" value={qForm.optC} onChangeText={t => setQForm(p => ({ ...p, optC: t }))} />
                  <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Option D" value={qForm.optD} onChangeText={t => setQForm(p => ({ ...p, optD: t }))} />
                  <View style={styles.inputRow}>
                    <View style={[styles.input, { flex: 2, paddingVertical: 8, backgroundColor: COLORS.surfaceContainerLow }]}>
                      <Text style={{ color: COLORS.onSurfaceVariant, fontSize: 12, marginBottom: 4 }}>Correct Answer</Text>
                      <View style={styles.correctRow}>
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <TouchableOpacity
                            key={opt}
                            style={[styles.correctOpt, qForm.correct === opt && styles.correctOptActive]}
                            onPress={() => setQForm(p => ({ ...p, correct: opt }))}
                          >
                            <Text style={[styles.correctOptText, qForm.correct === opt && { color: '#fff' }]}>{opt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <TextInput style={[styles.input, { flex: 1, marginTop: 18, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Points" keyboardType="numeric" value={qForm.points} onChangeText={t => setQForm(p => ({ ...p, points: t }))} />
                  </View>
                </>
              )}

              {qForm.type === 'written' && (
                <View style={styles.inputRow}>
                  <TextInput style={[styles.input, { flex: 1, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Points" keyboardType="numeric" value={qForm.points} onChangeText={t => setQForm(p => ({ ...p, points: t }))} />
                  <View style={{flex:2}}></View>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: COLORS.surfaceContainerLow }]} onPress={() => setShowAddQ(false)}>
                  <Text style={[styles.cancelText, { color: COLORS.onSurfaceVariant }]}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleAddQuestion}>
                  <Text style={styles.submitText}>Add Question</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 4 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  quizCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 10, ...SHADOWS.sm },
  quizHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  quizTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  quizMeta: { flexDirection: 'row', gap: 16 },
  metaText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  quizActions: { justifyContent: 'center', gap: 4 },
  iconBtn: { padding: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#64748b', fontWeight: '600', marginTop: 8 },
  emptySubtext: { fontSize: 13, color: '#94a3b8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
  modalScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0f172a', marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10 },
  correctRow: { flexDirection: 'row', gap: 8 },
  correctOpt: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  correctOptActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  correctOptText: { fontWeight: '700', color: '#64748b' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#64748b' },
  submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center' },
  submitText: { fontWeight: '700', color: '#fff' },
  tabRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#fff', ...SHADOWS.sm },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#0f172a' },
});

export default QuizManagementScreen;
