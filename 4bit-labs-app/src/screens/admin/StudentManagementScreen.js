import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../config/theme';
import { getStudents, markAttendance, getAttendance, manuallyUpdatePoints } from '../../services/adminService';

const StudentManagementScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tab, setTab] = useState('list'); // list | attendance
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pointsOverride, setPointsOverride] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const data = await getStudents(user?.school_id);
      setStudents(data);
      const att = await getAttendance({ schoolId: user?.school_id, date: selectedDate });
      const map = {};
      att.forEach(a => { map[a.user_id] = a.status; });
      setAttendanceMap(map);
    } catch (e) { console.warn('Fetch students error:', e.message); }
  }, [user, selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      await markAttendance({ userId: studentId, date: selectedDate, status, schoolId: user?.school_id });
      setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handlePointsOverride = async () => {
    if (!selectedStudent || !pointsOverride.trim()) return;
    try {
      await manuallyUpdatePoints(selectedStudent.id, { points: pointsOverride, reason: 'Manual Override' });
      Alert.alert('Success', 'Points updated!');
      setPointsOverride('');
      setSelectedStudent(null);
      fetchData(); // refresh list
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderStudent = ({ item }) => {
    const attStatus = attendanceMap[item.id];
    return (
      <View style={styles.studentCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{(item.name || 'S')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentDetail}>{item.email}</Text>
          <Text style={styles.studentDetail}>{item.phone || 'No phone'}</Text>
        </View>

        {tab === 'attendance' ? (
          <View style={styles.attButtons}>
            <TouchableOpacity
              style={[styles.attBtn, attStatus === 'present' && styles.attBtnPresent]}
              onPress={() => handleMarkAttendance(item.id, 'present')}
            >
              <Ionicons name="checkmark" size={18} color={attStatus === 'present' ? '#fff' : '#22c55e'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.attBtn, attStatus === 'absent' && styles.attBtnAbsent]}
              onPress={() => handleMarkAttendance(item.id, 'absent')}
            >
              <Ionicons name="close" size={18} color={attStatus === 'absent' ? '#fff' : '#ef4444'} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
             style={[styles.pointsBadge, {flexDirection: 'row', alignItems: 'center'}]}
             onPress={() => setSelectedStudent(item)}
          >
            <Text style={styles.pointsText}>{item.points || 0} pts  </Text>
            <Ionicons name="pencil" size={12} color="#22c55e" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Students</Text>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['list', 'attendance'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <MaterialIcons name={t === 'list' ? 'people' : 'playlist-add-check'} size={18} color={tab === t ? '#fff' : '#64748b'} />
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'list' ? 'All Students' : 'Attendance'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {tab === 'attendance' && (
        <View style={styles.dateBar}>
          <MaterialIcons name="event" size={18} color="#6366f1" />
          <Text style={styles.dateText}>Date: {selectedDate}</Text>
          <View style={styles.attSummary}>
            <Text style={styles.attSummaryText}>
              {Object.values(attendanceMap).filter(v => v === 'present').length}/{filtered.length} present
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={filtered}
        renderItem={renderStudent}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        }
      />

      {/* Override Modal */}
      {selectedStudent && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Override Points</Text>
            <Text style={styles.modalDesc}>Modifying points for {selectedStudent.name}. Currently has {selectedStudent.points || 0} pts.</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 50 or -10"
              keyboardType="numeric"
              value={pointsOverride}
              onChangeText={setPointsOverride}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setSelectedStudent(null); setPointsOverride(''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handlePointsOverride}>
                <Text style={styles.submitText}>Save Points</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { fontSize: 24, fontWeight: '800', color: '#0f172a', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#e2e8f0' },
  tabActive: { backgroundColor: '#6366f1' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, gap: 8, marginBottom: 8, ...SHADOWS.sm },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a' },
  dateBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#eef2ff', borderRadius: 12, gap: 8, marginBottom: 12 },
  dateText: { fontSize: 13, fontWeight: '600', color: '#6366f1', flex: 1 },
  attSummary: { backgroundColor: '#6366f1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  attSummaryText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  studentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 8, gap: 12, ...SHADOWS.sm },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  studentName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  studentDetail: { fontSize: 12, color: '#64748b' },
  attButtons: { flexDirection: 'row', gap: 6 },
  attBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  attBtnPresent: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  attBtnAbsent: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  pointsBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pointsText: { fontSize: 12, fontWeight: '700', color: '#22c55e' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: '#94a3b8', marginTop: 8 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20, zIndex: 100 },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 20, ...SHADOWS.lg },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  modalDesc: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  modalInput: { backgroundColor: '#f1f5f9', padding: 14, borderRadius: 12, fontSize: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#64748b' },
  submitBtn: { flex: 1, padding: 14, backgroundColor: '#6366f1', borderRadius: 12, alignItems: 'center' },
  submitText: { fontWeight: '700', color: '#fff' },
});

export default StudentManagementScreen;
