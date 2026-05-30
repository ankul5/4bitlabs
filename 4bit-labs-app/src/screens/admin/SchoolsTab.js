import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { getSchools, createSchool, deleteSchool, getStudents } from '../../services/adminService';
import AdminHeader from '../../components/AdminHeader';

const SchoolsTab = () => {
  const insets = useSafeAreaInsets();
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSchool, setNewSchool] = useState('');
  const [adding, setAdding] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [schRes, stuRes] = await Promise.all([getSchools(), getStudents()]);
      setSchools(schRes.schools || []);
      setStudents(stuRes.students || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getStudentCount = (schoolId) => {
    return students.filter(s => s.school_id === schoolId).length;
  };

  const handleAdd = async () => {
    if (!newSchool.trim()) return;
    setAdding(true);
    try {
      await createSchool(newSchool.trim());
      setNewSchool('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create school.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (id, name) => {
    const count = getStudentCount(id);
    Alert.alert(
      'Delete School',
      `Delete "${name}"${count > 0 ? ` and its ${count} student(s)` : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteSchool(id);
              loadData();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete.');
            }
          },
        },
      ]
    );
  };

  const renderSchool = ({ item }) => {
    const count = getStudentCount(item.id);
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={styles.schoolIcon}>
            <MaterialIcons name="school" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCount}>
              {count} {count === 1 ? 'student' : 'students'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AdminHeader title="Schools" />

      {/* Add School */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="School name..."
          placeholderTextColor={COLORS.onSurfaceVariant}
          value={newSchool}
          onChangeText={setNewSchool}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={adding}>
          {adding ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <MaterialIcons name="add" size={22} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={schools}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderSchool}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No schools yet. Add one above.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.xl },
  addRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  addInput: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.lg, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.onSurface, ...SHADOWS.sm },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, width: 48, alignItems: 'center', justifyContent: 'center', ...SHADOWS.primaryGlow },
  list: { paddingBottom: 100 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, ...SHADOWS.sm },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  schoolIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '700', color: COLORS.onSurface },
  itemCount: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  deleteBtn: { padding: 8 },
  emptyText: { textAlign: 'center', color: COLORS.onSurfaceVariant, marginTop: 40, fontSize: 14 },
});

export default SchoolsTab;
