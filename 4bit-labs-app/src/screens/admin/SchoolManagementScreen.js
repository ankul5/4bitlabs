import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, RADIUS, SPACING } from '../../config/theme';
import { getSchools, createSchool } from '../../services/adminService';

const SchoolManagementScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [schools, setSchools] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: '', code: '' });

  const fetchData = async () => {
    try {
      const data = await getSchools();
      setSchools(data || []);
    } catch (e) {
      console.warn('Fetch schools error:', e.message);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAddSchool = async () => {
    if (!newSchool.name.trim() || !newSchool.code.trim()) {
      return Alert.alert('Error', 'Name and Code are required.');
    }
    try {
      await createSchool(newSchool);
      Alert.alert('Success', 'School created successfully');
      setNewSchool({ name: '', code: '' });
      setShowAdd(false);
      fetchData();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const renderSchool = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Ionicons name="school" size={24} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.schoolName}>{item.name}</Text>
        <Text style={styles.schoolCode}>Code: {item.code}</Text>
        <Text style={styles.schoolDate}>Added: {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schools</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(!showAdd)}>
          <Ionicons name={showAdd ? 'close' : 'add'} size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {showAdd && (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Add New School</Text>
          <TextInput
            style={styles.input}
            placeholder="School Name (e.g., XYZ School)"
            value={newSchool.name}
            onChangeText={t => setNewSchool(p => ({ ...p, name: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="School Code"
            autoCapitalize="characters"
            value={newSchool.code}
            onChangeText={t => setNewSchool(p => ({ ...p, code: t.toUpperCase() }))}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleAddSchool}>
            <Text style={styles.submitBtnText}>Create School</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={schools}
        keyExtractor={i => String(i.id || i._id)}
        renderItem={renderSchool}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No schools found. Add one to get started.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', flex: 1, marginLeft: 12 },
  addBtn: { padding: 4, backgroundColor: '#e2e8f0', borderRadius: 8 },
  addForm: { backgroundColor: '#fff', marginHorizontal: 20, padding: 16, borderRadius: RADIUS.xl, marginBottom: 16, ...SHADOWS.sm },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#0f172a' },
  input: { backgroundColor: '#f1f5f9', padding: 14, borderRadius: RADIUS.lg, marginBottom: 10, fontSize: 15 },
  submitBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: RADIUS.xl, marginBottom: 12, gap: 14, ...SHADOWS.sm },
  cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  schoolName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  schoolCode: { fontSize: 13, color: '#6366f1', fontWeight: '600', marginTop: 2 },
  schoolDate: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, color: '#94a3b8', fontSize: 14 }
});

export default SchoolManagementScreen;
