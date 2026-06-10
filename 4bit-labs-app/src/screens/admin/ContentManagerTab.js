import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Modal, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import {
  getSchools, getContent, createContent, updateContent, deleteContent,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
} from '../../services/adminService';
import AdminHeader from '../../components/AdminHeader';

const SUB_TABS = [
  { key: 'video', label: 'Videos', icon: 'play-circle-outline' },
  { key: 'code', label: 'Code Files', icon: 'code' },
  { key: 'connection', label: 'Connections', icon: 'hub' },
  { key: 'announcement', label: 'Announce', icon: 'campaign' },
];

const ContentManagerTab = () => {
  const insets = useSafeAreaInsets();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSchools();
        const loadedSchools = res.schools || [];
        setSchools(loadedSchools);
        if (loadedSchools.length > 0 && !selectedSchool) {
          setSelectedSchool(loadedSchools[0]);
        }
      } catch (e) { console.warn(e); }
    };
    load();
  }, []);

  const loadItems = useCallback(async () => {
    if (!selectedSchool) { setItems([]); return; }
    setLoading(true);
    try {
      if (activeTab === 'announcement') {
        const res = await getAnnouncements(selectedSchool.id);
        setItems(res.announcements || []);
      } else {
        const res = await getContent(selectedSchool.id, activeTab);
        setItems(res.content || []);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load items.');
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, activeTab]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const isAnnouncement = activeTab === 'announcement';
  const contentLabel = activeTab === 'video' ? 'URL (YouTube/Drive link)' : activeTab === 'code' ? 'Code Content' : activeTab === 'connection' ? 'Plan Content' : 'Message';
  const contentPlaceholder = activeTab === 'video' ? 'https://youtube.com/...' : activeTab === 'code' ? 'Paste code here...' : activeTab === 'connection' ? 'Connection plan details...' : 'Announcement message...';

  const openAdd = () => { setEditing(null); setForm({ title: '', content: '' }); setModalVisible(true); };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      content: isAnnouncement ? item.message : item.url_or_content,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    setSaving(true);
    try {
      if (isAnnouncement) {
        if (editing) {
          await updateAnnouncement(editing.id, { title: form.title.trim(), message: form.content.trim() });
        } else {
          await createAnnouncement({ school_id: selectedSchool.id, title: form.title.trim(), message: form.content.trim() });
        }
      } else {
        if (editing) {
          await updateContent(editing.id, { title: form.title.trim(), url_or_content: form.content.trim() });
        } else {
          await createContent({ school_id: selectedSchool.id, type: activeTab, title: form.title.trim(), url_or_content: form.content.trim() });
        }
      }
      setModalVisible(false);
      loadItems();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete', `Delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            if (isAnnouncement) await deleteAnnouncement(item.id);
            else await deleteContent(item.id);
            loadItems();
          } catch (e) { Alert.alert('Error', 'Failed to delete.'); }
        },
      },
    ]);
  };

  const getItemIcon = () => {
    switch (activeTab) {
      case 'video': return 'play-circle-outline';
      case 'code': return 'code';
      case 'connection': return 'hub';
      case 'announcement': return 'campaign';
      default: return 'article';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <MaterialIcons name={getItemIcon()} size={20} color={COLORS.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.itemSub} numberOfLines={1}>
            {isAnnouncement ? item.message : item.url_or_content}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
          <MaterialIcons name="edit" size={17} color={COLORS.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
          <MaterialIcons name="delete-outline" size={17} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AdminHeader title="Content" />

      {/* School Picker */}
      <TouchableOpacity style={styles.schoolPicker} onPress={() => setShowSchoolPicker(!showSchoolPicker)}>
        <MaterialIcons name="school" size={20} color={COLORS.primary} />
        <Text style={selectedSchool ? styles.schoolText : styles.schoolPlaceholder}>
          {selectedSchool ? selectedSchool.name : 'Select a school to manage...'}
        </Text>
        <Text style={styles.pickerArrow}>▾</Text>
      </TouchableOpacity>
      {showSchoolPicker && (
        <View style={styles.dropdown}>
          {schools.map((s) => (
            <TouchableOpacity key={s.id} style={styles.dropdownItem} onPress={() => { setSelectedSchool(s); setShowSchoolPicker(false); }}>
              <Text style={styles.dropdownText}>{s.name}</Text>
            </TouchableOpacity>
          ))}
          {schools.length === 0 && <Text style={styles.dropdownText}>No schools found</Text>}
        </View>
      )}

      {selectedSchool && (
        <>
          {/* Sub-tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
            {SUB_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialIcons name={tab.icon} size={16} color={activeTab === tab.key ? COLORS.white : COLORS.onSurfaceVariant} />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Add button */}
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <MaterialIcons name="add" size={18} color={COLORS.white} />
            <Text style={styles.addBtnText}>Add {SUB_TABS.find(t => t.key === activeTab)?.label?.replace(/s$/, '')}</Text>
          </TouchableOpacity>

          {/* Items list */}
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.emptyText}>No items yet.</Text>}
            />
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editing ? 'Edit' : 'Add'} {isAnnouncement ? 'Announcement' : SUB_TABS.find(t => t.key === activeTab)?.label?.replace(/s$/, '')}</Text>

            <Text style={styles.fieldLabel}>TITLE</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(v) => setForm(p => ({ ...p, title: v }))}
              placeholder="Title"
              placeholderTextColor={COLORS.onSurfaceVariant}
            />

            <Text style={styles.fieldLabel}>{contentLabel.toUpperCase()}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={form.content}
              onChangeText={(v) => setForm(p => ({ ...p, content: v }))}
              placeholder={contentPlaceholder}
              placeholderTextColor={COLORS.onSurfaceVariant}
              multiline={activeTab !== 'video'}
              numberOfLines={activeTab === 'video' ? 1 : 6}
              textAlignVertical={activeTab === 'video' ? 'center' : 'top'}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveText}>{editing ? 'Update' : 'Create'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.xl },
  screenTitle: { fontSize: 28, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -1, marginTop: SPACING.lg, marginBottom: SPACING.md },
  schoolPicker: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.lg, padding: 14, marginBottom: 4, ...SHADOWS.sm },
  schoolText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.onSurface },
  schoolPlaceholder: { flex: 1, fontSize: 15, color: COLORS.onSurfaceVariant },
  pickerArrow: { fontSize: 16, color: COLORS.onSurfaceVariant },
  dropdown: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.lg, overflow: 'hidden' },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceContainerLow },
  dropdownText: { fontSize: 14, color: COLORS.onSurface, padding: 4 },
  tabBar: { marginTop: SPACING.md, maxHeight: 44 },
  tabBarContent: { gap: 8, paddingRight: 20 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceContainerHigh },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.onSurfaceVariant },
  tabTextActive: { color: COLORS.white },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingVertical: 12, marginTop: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.primaryGlow },
  addBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  list: { paddingBottom: 100 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.lg, padding: 14, marginBottom: 8, ...SHADOWS.sm },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: COLORS.onSurface },
  itemSub: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 2 },
  actionBtn: { padding: 6 },
  emptyText: { textAlign: 'center', color: COLORS.onSurfaceVariant, marginTop: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surfaceContainerLowest, borderTopLeftRadius: RADIUS['2xl'], borderTopRightRadius: RADIUS['2xl'], padding: SPACING['2xl'], maxHeight: '80%' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.onSurface, marginBottom: SPACING.xl, letterSpacing: -0.5 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: COLORS.onSurfaceVariant, marginBottom: SPACING.sm, marginLeft: 4 },
  input: { backgroundColor: COLORS.surfaceContainerLow, borderRadius: RADIUS.lg, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.onSurface, marginBottom: SPACING.lg },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: SPACING.md },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.surfaceContainerHigh, borderRadius: RADIUS.full },
  cancelText: { fontWeight: '700', color: COLORS.onSurface, fontSize: 15 },
  saveBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.full, ...SHADOWS.primaryGlow },
  saveText: { fontWeight: '700', color: COLORS.white, fontSize: 15 },
});

export default ContentManagerTab;
