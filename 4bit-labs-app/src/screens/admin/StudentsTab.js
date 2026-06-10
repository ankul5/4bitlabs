import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Modal, ScrollView, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { getStudents, createStudent, updateStudent, deleteStudent, getSchools, verifyStudent } from '../../services/adminService';
import AdminHeader from '../../components/AdminHeader';

const StudentsTab = () => {
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [form, setForm] = useState({ full_name: '', password: '', phone: '', school_id: '', school_name: '' });
  const [viewMode, setViewMode] = useState('unverified'); // 'unverified' | 'verified'

  const loadData = useCallback(async () => {
    try {
      const [studRes, schRes] = await Promise.all([getStudents(), getSchools()]);
      setStudents(studRes.students || []);
      setSchools(schRes.schools || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load data.');
    }
  }, []);

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    initLoad();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setForm({ full_name: '', password: '', phone: '', school_id: '', school_name: '' });
    setEditing(null);
    setShowSchoolPicker(false);
  };

  const openAdd = () => { resetForm(); setModalVisible(true); };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      full_name: student.full_name,
      password: '',
      phone: student.phone || '',
      school_id: student.school_id,
      school_name: student.school_name || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.school_id || !form.phone.trim()) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    if (!editing && !form.password) {
      Alert.alert('Error', 'Password is required for new students.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        full_name: form.full_name.trim(),
        school_id: form.school_id,
        phone: form.phone.trim(),
      };
      if (form.password) data.password = form.password;

      if (editing) {
        await updateStudent(editing.id, data);
      } else {
        await createStudent(data);
      }
      setModalVisible(false);
      resetForm();
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Student', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await deleteStudent(id); loadData(); }
          catch (err) { Alert.alert('Error', 'Failed to delete.'); }
        },
      },
    ]);
  };

  const handleVerify = (id, name) => {
    Alert.alert('Verify Student', `Approve "${name}" as a verified student?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Verify', style: 'default',
        onPress: async () => {
          try { await verifyStudent(id); loadData(); }
          catch (err) { Alert.alert('Error', 'Failed to verify.'); }
        },
      },
    ]);
  };

  const filteredStudents = students.filter(s => viewMode === 'verified' ? !!s.is_verified : !s.is_verified);

  const renderStudent = ({ item }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <View style={[styles.avatar, item.is_verified && styles.avatarVerified]}>
          <Text style={[styles.avatarText, item.is_verified && styles.avatarTextVerified]}>
            {item.full_name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.itemName}>{item.full_name}</Text>
            {item.is_verified && (
              <MaterialIcons name="verified" size={14} color="#2ecc71" />
            )}
          </View>
          <Text style={styles.itemSub}>{item.school_name || 'No school'}</Text>
          {item.phone ? <Text style={styles.itemPhone}>📱 {item.phone}</Text> : null}
        </View>
      </View>
      <View style={styles.actions}>
        {!item.is_verified && (
          <TouchableOpacity onPress={() => handleVerify(item.id, item.full_name)} style={styles.verifyBtn}>
            <MaterialIcons name="check-circle-outline" size={18} color="#2ecc71" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
          <MaterialIcons name="edit" size={18} color={COLORS.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.full_name)} style={styles.actionBtn}>
          <MaterialIcons name="delete-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const unverifiedCount = students.filter(s => !s.is_verified).length;
  const verifiedCount = students.filter(s => !!s.is_verified).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AdminHeader title="Students" />

      {/* Toggle tabs */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'unverified' && styles.toggleBtnActive]}
          onPress={() => setViewMode('unverified')}
        >
          <MaterialIcons name="hourglass-empty" size={14} color={viewMode === 'unverified' ? COLORS.white : COLORS.onSurfaceVariant} />
          <Text style={[styles.toggleText, viewMode === 'unverified' && styles.toggleTextActive]}>
            Unverified ({unverifiedCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'verified' && styles.toggleBtnActiveGreen]}
          onPress={() => setViewMode('verified')}
        >
          <MaterialIcons name="verified" size={14} color={viewMode === 'verified' ? COLORS.white : COLORS.onSurfaceVariant} />
          <Text style={[styles.toggleText, viewMode === 'verified' && styles.toggleTextActive]}>
            Verified ({verifiedCount})
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.addHeaderBtn} onPress={openAdd}>
          <MaterialIcons name="person-add" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderStudent}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name={viewMode === 'verified' ? 'verified' : 'hourglass-empty'} size={40} color={COLORS.onSurfaceVariant} />
              <Text style={styles.emptyText}>
                {viewMode === 'verified' ? 'No verified students yet.' : 'No pending students.'}
              </Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editing ? 'Edit Student' : 'Add Student'}</Text>

              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                value={form.full_name}
                onChangeText={(v) => setForm(p => ({ ...p, full_name: v }))}
                placeholder="Full Name"
                placeholderTextColor={COLORS.onSurfaceVariant}
              />

              <Text style={styles.fieldLabel}>{editing ? 'NEW PASSWORD (LEAVE BLANK TO KEEP)' : 'PASSWORD'}</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(v) => setForm(p => ({ ...p, password: v }))}
                placeholder="••••••••"
                placeholderTextColor={COLORS.onSurfaceVariant}
                secureTextEntry
              />

              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(v) => setForm(p => ({ ...p, phone: v }))}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor={COLORS.onSurfaceVariant}
                keyboardType="phone-pad"
              />

              <Text style={styles.fieldLabel}>SCHOOL</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSchoolPicker(!showSchoolPicker)}
              >
                <Text style={form.school_name ? styles.pickerValue : styles.pickerPlaceholder}>
                  {form.school_name || 'Select school...'}
                </Text>
                <Text style={styles.pickerArrow}>▾</Text>
              </TouchableOpacity>
              {showSchoolPicker && (
                <View style={styles.pickerDropdown}>
                  {schools.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.pickerOption}
                      onPress={() => {
                        setForm(p => ({ ...p, school_id: s.id, school_name: s.name }));
                        setShowSchoolPicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.saveText}>{editing ? 'Update' : 'Create'}</Text>
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
  container: { flex: 1, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.xl },
  // Toggle
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: SPACING.md },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceContainerHigh },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  toggleBtnActiveGreen: { backgroundColor: '#2ecc71' },
  toggleText: { fontSize: 12, fontWeight: '700', color: COLORS.onSurfaceVariant },
  toggleTextActive: { color: COLORS.white },
  addHeaderBtn: { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.primaryGlow },
  // List
  list: { paddingBottom: 100 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, ...SHADOWS.sm },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  avatarVerified: { backgroundColor: '#2ecc7120' },
  avatarText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  avatarTextVerified: { color: '#2ecc71' },
  itemName: { fontSize: 15, fontWeight: '700', color: COLORS.onSurface },
  itemSub: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  itemPhone: { fontSize: 11, color: COLORS.onSurfaceVariant, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 2 },
  verifyBtn: { padding: 8, backgroundColor: '#2ecc7115', borderRadius: RADIUS.full },
  actionBtn: { padding: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { textAlign: 'center', color: COLORS.onSurfaceVariant, fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surfaceContainerLowest, borderTopLeftRadius: RADIUS['2xl'], borderTopRightRadius: RADIUS['2xl'], padding: SPACING['2xl'], maxHeight: '85%' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.onSurface, marginBottom: SPACING.xl, letterSpacing: -0.5 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: COLORS.onSurfaceVariant, marginBottom: SPACING.sm, marginLeft: 4 },
  input: { backgroundColor: COLORS.surfaceContainerLow, borderRadius: RADIUS.lg, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.onSurface, marginBottom: SPACING.lg },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surfaceContainerLow, borderRadius: RADIUS.lg, padding: 16, marginBottom: 4 },
  pickerValue: { fontSize: 15, color: COLORS.onSurface },
  pickerPlaceholder: { fontSize: 15, color: COLORS.onSurfaceVariant },
  pickerArrow: { fontSize: 16, color: COLORS.onSurfaceVariant },
  pickerDropdown: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, ...SHADOWS.lg, overflow: 'hidden' },
  pickerOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceContainerLow },
  pickerOptionText: { fontSize: 14, color: COLORS.onSurface },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: SPACING.xl },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.surfaceContainerHigh, borderRadius: RADIUS.full },
  cancelText: { fontWeight: '700', color: COLORS.onSurface, fontSize: 15 },
  saveBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.full, ...SHADOWS.primaryGlow },
  saveText: { fontWeight: '700', color: COLORS.white, fontSize: 15 },
});

export default StudentsTab;
