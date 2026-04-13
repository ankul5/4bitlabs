import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, RefreshControl, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../config/theme';
import * as ImagePicker from 'expo-image-picker';
import { 
  getLectures, createLecture, uploadVideo,
  getCourses, createCourse, 
  getLabItems, createLabItem, deleteLabItem, 
  getAnnouncements, createAnnouncement, deleteAnnouncement,
  getSchools, createSchool
} from '../../services/adminService';

const ContentManagementScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { COLORS, isDark } = useTheme();
  const [tab, setTab] = useState('courses'); // Start with courses/overview
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [labItems, setLabItems] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const s = await getSchools();
      setSchools(s);
      
      const c = await getCourses(user?.school_id);
      setCourses(c);
      
      if (c.length > 0) {
        const l = await getLectures(c[0].id);
        setLectures(l);
      }
      
      const li = await getLabItems(user?.school_id);
      setLabItems(li);
      
      const ann = await getAnnouncements(user?.school_id);
      setAnnouncements(ann);
    } catch (e) { console.warn('Content fetch error:', e.message); }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  const openAdd = () => {
    if (tab === 'schools') setForm({ name: '', code: '', city: '' });
    else if (tab === 'courses') setForm({ title: '', description: '', category: 'General' });
    else if (tab === 'lectures') setForm({ title: '', video_url: '', topic: '', description: '', course_id: courses[0]?.id || '', localVideoUri: null });
    else if (tab === 'lab') setForm({ name: '', quantity: '0', description: '', status: 'available', category: 'General' });
    else setForm({ title: '', body: '', type: 'general', duration_days: '7' });
    setShowModal(true);
  };
  
  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') return Alert.alert('Permission needed', 'Gallery permission is required');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setForm(p => ({ ...p, localVideoUri: result.assets[0].uri }));
      Alert.alert('Success', 'Video selected.');
    }
  };

  const handleSubmit = async () => {
    try {
      if (tab === 'schools') {
        if (!form.name.trim() || !form.code.trim()) return Alert.alert('Error', 'Name and Code required');
        await createSchool({ ...form });
        Alert.alert('Success', 'School added!');
      } else if (tab === 'courses') {
        if (!form.title.trim()) return Alert.alert('Error', 'Title required');
        await createCourse({ ...form, school_id: user?.school_id });
        Alert.alert('Success', 'Course created!');
      } else if (tab === 'lectures') {
        if (!form.title.trim() || !form.course_id || (!form.video_url && !form.localVideoUri)) {
          return Alert.alert('Error', 'Title, Course, and Video (File or URL) are required');
        }
        setIsUploading(true);
        let finalVideoUrl = form.video_url;
        if (form.localVideoUri) {
          const dl = await uploadVideo(form.localVideoUri);
          finalVideoUrl = dl.data?.url || dl.data?.localPath || dl.url;
        }
        await createLecture(form.course_id, { ...form, video_url: finalVideoUrl });
        setIsUploading(false);
        Alert.alert('Success', 'Lecture added!');
      } else if (tab === 'lab') {
        if (!form.name.trim()) return Alert.alert('Error', 'Name required');
        await createLabItem({ ...form, quantity: parseInt(form.quantity) || 0, school_id: user?.school_id });
        Alert.alert('Success', 'Lab item added!');
      } else {
        if (!form.title.trim() || !form.body.trim()) return Alert.alert('Error', 'Title and body required');
        const days = parseInt(form.duration_days) || 7;
        const expires_at = new Date(Date.now() + days * 86400000).toISOString();
        await createAnnouncement({ ...form, school_id: user?.school_id, created_by: user?.id, expires_at });
        Alert.alert('Success', 'Announcement created!');
      }
      setShowModal(false);
      fetchAll();
    } catch (e) {
      setIsUploading(false);
      Alert.alert('Error', e.message || 'Operation failed');
    }
  };

  const handleDeleteLab = (id) => {
    Alert.alert('Delete', 'Remove this lab item?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteLabItem(id); fetchAll(); }},
    ]);
  };

  const handleDeleteAnn = (id) => {
    Alert.alert('Delete', 'Remove this announcement?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteAnnouncement(id); fetchAll(); }},
    ]);
  };

  const tabs = [
    { key: 'schools', label: 'Schools', icon: 'account-balance' },
    { key: 'courses', label: 'Courses', icon: 'library-books' },
    { key: 'lectures', label: 'Lectures', icon: 'video-library' },
    { key: 'lab', label: 'Labs', icon: 'science' },
    { key: 'announce', label: 'Announce', icon: 'campaign' },
  ];

  const statusColors = { available: '#22c55e', in_use: '#3b82f6', maintenance: '#f59e0b', out_of_stock: '#ef4444' };

  const renderContent = () => {
    if (tab === 'schools') {
      return schools.map((s, i) => (
        <View key={i} style={[styles.card, { backgroundColor: COLORS.surfaceContainerLowest }]}>
          <View style={[styles.iconWrap, { backgroundColor: COLORS.primary + '15' }]}>
            <MaterialIcons name="account-balance" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.cardTitle, { color: COLORS.onSurface }]}>{s.name}</Text>
            <Text style={[styles.cardSub, { color: COLORS.onSurfaceVariant }]}>Code: {s.code} • {s.city || 'No City'}</Text>
          </View>
        </View>
      ));
    }
    if (tab === 'courses') {
      return courses.map((c, i) => (
        <View key={i} style={[styles.card, { backgroundColor: COLORS.surfaceContainerLowest }]}>
          <View style={[styles.iconWrap, { backgroundColor: COLORS.secondary + '15' }]}>
            <MaterialIcons name="library-books" size={24} color={COLORS.secondary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.cardTitle, { color: COLORS.onSurface }]}>{c.title}</Text>
            <Text style={[styles.cardSub, { color: COLORS.onSurfaceVariant }]}>{c.category || 'General'} • {c.enrolled_count || 0} Students</Text>
          </View>
        </View>
      ));
    }
    if (tab === 'lectures') {
      return lectures.map((l, i) => (
        <View key={i} style={[styles.card, { backgroundColor: COLORS.surfaceContainerLowest }]}>
          <View style={[styles.iconWrap, { backgroundColor: COLORS.tertiary + '15' }]}>
            <MaterialIcons name="play-circle-filled" size={24} color={COLORS.tertiary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.cardTitle, { color: COLORS.onSurface }]}>{l.title}</Text>
            <Text style={[styles.cardSub, { color: COLORS.onSurfaceVariant }]}>{l.topic || 'General'} • {l.duration || '0 min'}</Text>
          </View>
        </View>
      ));
    }
    if (tab === 'lab') {
      return labItems.map((l, i) => (
        <View key={i} style={[styles.card, { backgroundColor: COLORS.surfaceContainerLowest }]}>
          <View style={[styles.iconWrap, { backgroundColor: COLORS.primary + '15' }]}>
            <MaterialCommunityIcons name="flask" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.cardTitle, { color: COLORS.onSurface }]}>{l.name}</Text>
            <Text style={[styles.cardSub, { color: COLORS.onSurfaceVariant }]}>Qty: {l.quantity} • {l.category}</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: statusColors[l.status] || '#94a3b8' }]} />
          <TouchableOpacity onPress={() => handleDeleteLab(l.id)}>
            <Ionicons name="trash" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ));
    }
    return announcements.map((a, i) => {
      const isExpired = a.expires_at && new Date(a.expires_at) < new Date();
      return (
        <View key={i} style={[styles.card, { backgroundColor: COLORS.surfaceContainerLowest }, isExpired && { opacity: 0.5 }]}>
          <View style={[styles.iconWrap, { backgroundColor: isExpired ? COLORS.onSurfaceVariant + '15' : '#f59e0b15' }]}>
            <MaterialIcons name="campaign" size={24} color={isExpired ? COLORS.onSurfaceVariant : '#f59e0b'} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.cardTitle, { color: COLORS.onSurface }]}>{a.title} {isExpired ? '(Expired)' : ''}</Text>
            <Text style={[styles.cardSub, { color: COLORS.onSurfaceVariant }]} numberOfLines={2}>{a.body}</Text>
            {a.expires_at && <Text style={[styles.cardSub, { color: COLORS.onSurfaceVariant }]}>Expires: {new Date(a.expires_at).toLocaleDateString()}</Text>}
          </View>
          <TouchableOpacity onPress={() => handleDeleteAnn(a.id)}>
            <Ionicons name="trash" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      );
    });
  };

  const renderForm = () => {
    if (tab === 'schools') return (
      <>
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="School Name" value={form.name} onChangeText={t => setForm(p => ({ ...p, name: t }))} />
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="School Code (e.g. SCL001)" value={form.code} onChangeText={t => setForm(p => ({ ...p, code: t }))} autoCapitalize="characters" />
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="City (optional)" value={form.city} onChangeText={t => setForm(p => ({ ...p, city: t }))} />
      </>
    );
    if (tab === 'courses') return (
      <>
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Course Title" value={form.title} onChangeText={t => setForm(p => ({ ...p, title: t }))} />
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Category" value={form.category} onChangeText={t => setForm(p => ({ ...p, category: t }))} />
        <TextInput style={[styles.input, { height: 80, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Description" multiline value={form.description} onChangeText={t => setForm(p => ({ ...p, description: t }))} />
      </>
    );
    if (tab === 'lectures') return (
      <>
        {courses.length === 0 ? (
          <Text style={{color: COLORS.error, marginBottom: 10}}>Please create a course first!</Text>
        ) : (
          <View style={[styles.input, { paddingVertical: 10, backgroundColor: COLORS.surfaceContainerLow }]}>
            <Text style={{fontSize: 12, color: COLORS.onSurfaceVariant, marginBottom: 4}}>Select Course</Text>
            <FlatList 
              horizontal 
              data={courses} 
              keyExtractor={i => i.id} 
              showsHorizontalScrollIndicator={false}
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={[styles.statusChip, form.course_id === item.id && {backgroundColor: COLORS.primary}, { backgroundColor: form.course_id !== item.id ? COLORS.surfaceContainerHighest : COLORS.primary }]}
                  onPress={() => setForm(p => ({...p, course_id: item.id}))}
                >
                  <Text style={[styles.statusChipText, { color: COLORS.onSurfaceVariant }, form.course_id === item.id && {color: '#fff'}]}>{item.title}</Text>
                </TouchableOpacity>
              )} 
            />
          </View>
        )}
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Lecture Title" value={form.title} onChangeText={t => setForm(p => ({ ...p, title: t }))} />
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickVideo}>
            <MaterialIcons name="video-library" size={20} color="#fff" />
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 13}}>Upload Video</Text>
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 12, color: COLORS.onSurfaceVariant }} numberOfLines={1}>
            {form.localVideoUri ? 'Video Selected' : 'No file chosen'}
          </Text>
        </View>
        <Text style={{ textAlign: 'center', marginVertical: 4, color: COLORS.onSurfaceVariant, fontSize: 12 }}>OR</Text>
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Video URL (YouTube/Drive)" value={form.video_url} onChangeText={t => setForm(p => ({ ...p, video_url: t }))} />
        
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Topic" value={form.topic} onChangeText={t => setForm(p => ({ ...p, topic: t }))} />
        <TextInput style={[styles.input, { height: 80, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Description" multiline value={form.description} onChangeText={t => setForm(p => ({ ...p, description: t }))} />
      </>
    );
    if (tab === 'lab') return (
      <>
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Item Name" value={form.name} onChangeText={t => setForm(p => ({ ...p, name: t }))} />
        <View style={styles.inputRow}>
          <TextInput style={[styles.input, { flex: 1, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Quantity" keyboardType="numeric" value={form.quantity} onChangeText={t => setForm(p => ({ ...p, quantity: t }))} />
          <TextInput style={[styles.input, { flex: 1, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Category" value={form.category} onChangeText={t => setForm(p => ({ ...p, category: t }))} />
        </View>
        <TextInput style={[styles.input, { height: 60, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Description" multiline value={form.description} onChangeText={t => setForm(p => ({ ...p, description: t }))} />
        <View style={styles.statusRow}>
          {['available', 'in_use', 'maintenance'].map(s => (
            <TouchableOpacity key={s} style={[styles.statusChip, { backgroundColor: COLORS.surfaceContainerHighest }, form.status === s && { backgroundColor: statusColors[s] }]} onPress={() => setForm(p => ({ ...p, status: s }))}>
              <Text style={[styles.statusChipText, { color: COLORS.onSurfaceVariant }, form.status === s && { color: '#fff' }]}>{s.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
    return (
      <>
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Announcement Title" value={form.title} onChangeText={t => setForm(p => ({ ...p, title: t }))} />
        <TextInput style={[styles.input, { height: 100, backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Announcement Body" multiline value={form.body} onChangeText={t => setForm(p => ({ ...p, body: t }))} />
        <TextInput style={[styles.input, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurface }]} placeholderTextColor={COLORS.onSurfaceVariant} placeholder="Visible for (days)" keyboardType="numeric" value={form.duration_days} onChangeText={t => setForm(p => ({ ...p, duration_days: t }))} />
        <View style={styles.statusRow}>
          {['general', 'quiz', 'course', 'event', 'urgent'].map(s => (
            <TouchableOpacity key={s} style={[styles.statusChip, { backgroundColor: COLORS.surfaceContainerHighest }, form.type === s && { backgroundColor: COLORS.primary }]} onPress={() => setForm(p => ({ ...p, type: s }))}>
              <Text style={[styles.statusChipText, { color: COLORS.onSurfaceVariant }, form.type === s && { color: '#fff' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.surface }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.screenTitle, { color: COLORS.onSurface }]}>Content</Text>
        {((tab === 'schools' && user?.role === 'school_admin' || user?.role === 'super_admin' || user?.role === 'mentor') || tab !== 'schools') && (
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 20, marginBottom: 16 }}
          keyExtractor={t => t.key}
          renderItem={({ item: t }) => (
            <TouchableOpacity style={[styles.tab, { backgroundColor: COLORS.surfaceContainerHighest }, tab === t.key && [styles.tabActive, { backgroundColor: COLORS.primary }]]} onPress={() => setTab(t.key)}>
              <MaterialIcons name={t.icon} size={18} color={tab === t.key ? '#fff' : COLORS.onSurfaceVariant} />
              <Text style={[styles.tabText, { color: COLORS.onSurfaceVariant }, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={[1]} // Dummy to enable RefreshControl
        renderItem={() => <View style={styles.contentList}>{renderContent()}</View>}
        keyExtractor={() => 'content'}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={48} color={COLORS.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: COLORS.onSurfaceVariant }]}>No content yet</Text>
          </View>
        }
      />

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.surfaceContainerLowest }]}>
            <Text style={[styles.modalTitle, { color: COLORS.onSurface }]}>
              Add {tab === 'schools' ? 'School' : tab === 'courses' ? 'Course' : tab === 'lectures' ? 'Lecture' : tab === 'lab' ? 'Lab Item' : 'Announcement'}
            </Text>
            {renderForm()}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: COLORS.surfaceContainerLow }]} onPress={() => setShowModal(false)} disabled={isUploading}>
                <Text style={[styles.cancelText, { color: COLORS.onSurfaceVariant }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.primary }, isUploading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={isUploading}>
                {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Add</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#e2e8f0', marginRight: 8 },
  tabActive: { backgroundColor: '#6366f1' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#fff' },
  contentList: { paddingHorizontal: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, ...SHADOWS.sm },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  cardSub: { fontSize: 13, color: '#64748b' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: '#94a3b8', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0f172a', marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e2e8f0', marginRight: 8 },
  statusChipText: { fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'capitalize' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#64748b' },
  submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center' },
  submitText: { fontWeight: '700', color: '#fff' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', padding: 12, borderRadius: 10, gap: 6 },
});

export default ContentManagementScreen;
