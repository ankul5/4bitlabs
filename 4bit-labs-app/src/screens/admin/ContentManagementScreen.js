import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput,
  ActivityIndicator, RefreshControl, Dimensions, ScrollView, Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { COLORS, FONTS, RADIUS, SHADOWS } from "../../config/theme";
import {
  getLectures, getCourses, getSchools, getAnnouncements,
  createSchool, createCourse, createAnnouncement, createLecture, uploadVideo,
} from "../../services/adminService";
import StitchHeader from "../../components/StitchHeader";

const { width } = Dimensions.get("window");

const ContentManagementScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modal, setModal] = useState(null); // 'school' | 'course' | 'announcement' | 'lecture' | null
  const [schoolForm, setSchoolForm] = useState({ name: '', code: '', city: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '', type: 'general' });
  const [lectureForm, setLectureForm] = useState({ title: '', videoUrl: '', courseId: '' });
  const [saving, setSaving] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, c, a] = await Promise.all([
        getSchools(),
        getCourses(user?.school_id),
        getAnnouncements(user?.school_id),
      ]);
      setSchools(s || []);
      setCourses(c || []);
      setAnnouncements(a || []);
    } catch (e) {
      console.warn("Content fetch error:", e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // ── CRUD Handlers ─────────────────────────────────────────────────────────
  const handleCreateSchool = async () => {
    if (!schoolForm.name.trim() || !schoolForm.code.trim()) {
      return Alert.alert('Error', 'School name and code are required.');
    }
    setSaving(true);
    try {
      await createSchool(schoolForm);
      Alert.alert('Success', 'School added! Students can now select it during registration.');
      setSchoolForm({ name: '', code: '', city: '' });
      setModal(null);
      fetchData();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.body.trim()) {
      return Alert.alert('Error', 'Title and body are required.');
    }
    setSaving(true);
    try {
      await createAnnouncement({ ...announcementForm, school_id: user?.school_id });
      Alert.alert('Success', 'Announcement published! Students will see it on their home screen.');
      setAnnouncementForm({ title: '', body: '', type: 'general' });
      setModal(null);
      fetchData();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission needed', 'Please allow access to your media library.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setVideoFile(asset);
      // Upload immediately
      setUploading(true);
      try {
        const uploadRes = await uploadVideo(asset.uri);
        const url = uploadRes?.data?.url || uploadRes?.url || '';
        setLectureForm(p => ({ ...p, videoUrl: url }));
        Alert.alert('Success', 'Video uploaded!');
      } catch (e) {
        Alert.alert('Upload Error', e.message);
        setVideoFile(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCreateLecture = async () => {
    if (!lectureForm.title.trim() || !lectureForm.courseId) {
      return Alert.alert('Error', 'Select a course and enter lecture title.');
    }
    setSaving(true);
    try {
      await createLecture(lectureForm.courseId, {
        title: lectureForm.title,
        video_url: lectureForm.videoUrl,
        is_published: true,
      });
      Alert.alert('Success', 'Lecture added! Only students enrolled in this course will see it.');
      setLectureForm({ title: '', videoUrl: '', courseId: '' });
      setVideoFile(null);
      setModal(null);
      fetchData();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.surface }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: COLORS.surface }]}>
      <StitchHeader user={user} onSearchPress={() => {}} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View style={styles.content}>
          <Text style={[styles.mainTitle, { color: COLORS.onSurface }]}>Content Manager</Text>
          <Text style={[styles.subTitle, { color: COLORS.onSurfaceVariant }]}>Schools, courses, lectures & announcements</Text>

          {/* Quick Add Actions */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActions} contentContainerStyle={{ gap: 12, paddingRight: 24 }}>
            {[
              { icon: 'add-business', label: 'School', key: 'school' },
              { icon: 'video-library', label: 'Lecture', key: 'lecture' },
              { icon: 'campaign', label: 'Announce', key: 'announcement' },
            ].map(item => (
              <TouchableOpacity key={item.key} style={[styles.quickBtn, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]} onPress={() => setModal(item.key)}>
                <View style={[styles.quickIconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                  <MaterialIcons name={item.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={[styles.quickLabel, { color: COLORS.onSurface }]}>Add {item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Schools Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: COLORS.onSurface }]}>Schools ({schools.length})</Text>
          </View>
          {schools.length === 0 ? (
            <EmptyState icon="business" text="No schools yet. Add one to get started!" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={{ gap: 14, paddingRight: 24 }}>
              {schools.map((s, idx) => (
                <View key={s.id || idx} style={[styles.schoolChip, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
                  <View style={[styles.chipIcon, { backgroundColor: COLORS.primary + '15' }]}>
                    <MaterialIcons name="school" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={[styles.chipTitle, { color: COLORS.onSurface }]}>{s.name}</Text>
                    <Text style={{ fontSize: 10, color: COLORS.onSurfaceVariant }}>{s.code} • {s.studentCount || 0} students</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Courses Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: COLORS.onSurface }]}>Courses ({courses.length})</Text>
          </View>
          {courses.length === 0 ? (
            <EmptyState icon="menu-book" text="No courses yet. Create your first course!" />
          ) : (
            <View style={styles.courseList}>
              {courses.map((c, idx) => (
                <TouchableOpacity key={c.id || idx} style={[styles.courseRow, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
                  <View style={[styles.courseIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                    <MaterialIcons name="auto-stories" size={22} color={COLORS.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.courseTitle, { color: COLORS.onSurface }]}>{c.title}</Text>
                    <Text style={{ fontSize: 11, color: COLORS.onSurfaceVariant }}>{c.category || 'General'} • {c.lectureCount || 0} lectures</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.addLectureBtn, { backgroundColor: COLORS.primary + '15' }]}
                    onPress={() => { setLectureForm(p => ({ ...p, courseId: c.id || c._id })); setModal('lecture'); }}
                  >
                    <MaterialIcons name="add" size={16} color={COLORS.primary} />
                    <Text style={{ fontSize: 10, color: COLORS.primary, fontWeight: '800' }}>LECTURE</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Announcements Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: COLORS.onSurface }]}>Announcements ({announcements.length})</Text>
          </View>
          {announcements.length === 0 ? (
            <EmptyState icon="campaign" text="No announcements. Broadcast one to your students!" />
          ) : (
            <View style={styles.announcementList}>
              {announcements.map((a, idx) => (
                <View key={a.id || idx} style={[styles.announcementRow, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
                  <View style={[styles.announceDot, { backgroundColor: COLORS.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.announceTitle, { color: COLORS.onSurface }]}>{a.title}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.onSurfaceVariant }} numberOfLines={2}>{a.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Create Modals ─────────────────────────────────────────────────────── */}
      {/* School Modal */}
      <Modal visible={modal === 'school'} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
            <Text style={[styles.modalTitle, { color: COLORS.onSurface }]}>Add New School</Text>
            <Text style={[styles.modalSub, { color: COLORS.onSurfaceVariant }]}>This school will appear in the student registration form.</Text>
            <ModalInput placeholder="School Name" value={schoolForm.name} onChangeText={t => setSchoolForm(p => ({ ...p, name: t }))} />
            <ModalInput placeholder="Unique Code (e.g. OAK01)" value={schoolForm.code} onChangeText={t => setSchoolForm(p => ({ ...p, code: t.toUpperCase() }))} autoCapitalize="characters" />
            <ModalInput placeholder="City (optional)" value={schoolForm.city} onChangeText={t => setSchoolForm(p => ({ ...p, city: t }))} />
            <ModalActions onCancel={() => setModal(null)} onSubmit={handleCreateSchool} saving={saving} />
          </View>
        </View>
      </Modal>


      {/* Announcement Modal */}
      <Modal visible={modal === 'announcement'} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
            <Text style={[styles.modalTitle, { color: COLORS.onSurface }]}>New Announcement</Text>
            <Text style={[styles.modalSub, { color: COLORS.onSurfaceVariant }]}>This will be visible on all student home screens.</Text>
            <ModalInput placeholder="Announcement Title" value={announcementForm.title} onChangeText={t => setAnnouncementForm(p => ({ ...p, title: t }))} />
            <ModalInput placeholder="Message body..." value={announcementForm.body} onChangeText={t => setAnnouncementForm(p => ({ ...p, body: t }))} multiline />
            <ModalActions onCancel={() => setModal(null)} onSubmit={handleCreateAnnouncement} saving={saving} />
          </View>
        </View>
      </Modal>

      {/* Lecture Modal */}
      <Modal visible={modal === 'lecture'} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
            <Text style={[styles.modalTitle, { color: COLORS.onSurface }]}>Add Lecture</Text>
            <Text style={[styles.modalSub, { color: COLORS.onSurfaceVariant }]}>Only students enrolled in this course will see this lecture.</Text>

            {/* Course Selector */}
            {courses.length === 0 ? (
              <View style={{ padding: 12, backgroundColor: COLORS.error + '15', borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ color: COLORS.error, fontSize: 12, fontWeight: '600' }}>
                  No courses available! Create a course first.
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
                {courses.map(c => (
                  <TouchableOpacity
                    key={c.id || c._id}
                    style={[styles.courseChip, lectureForm.courseId === (c.id || c._id) && { backgroundColor: COLORS.primary }]}
                    onPress={() => setLectureForm(p => ({ ...p, courseId: c.id || c._id }))}
                  >
                    <Text style={[styles.courseChipText, lectureForm.courseId === (c.id || c._id) && { color: 'white' }]}>
                      {c.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <ModalInput placeholder="Lecture Title" value={lectureForm.title} onChangeText={t => setLectureForm(p => ({ ...p, title: t }))} />

            {/* Video Upload */}
            <TouchableOpacity
              style={[styles.videoPickerBtn, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}
              onPress={pickVideo}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <MaterialIcons name={videoFile ? "check-circle" : "video-library"} size={22} color={COLORS.primary} />
              )}
              <Text style={{ color: COLORS.primary, fontWeight: '800', fontSize: 12 }}>
                {uploading ? 'UPLOADING...' : videoFile ? 'VIDEO UPLOADED ✓' : 'PICK VIDEO FROM DEVICE'}
              </Text>
            </TouchableOpacity>

            <ModalInput placeholder="Or paste Video URL" value={lectureForm.videoUrl} onChangeText={t => setLectureForm(p => ({ ...p, videoUrl: t }))} />
            <ModalActions onCancel={() => { setModal(null); setVideoFile(null); }} onSubmit={handleCreateLecture} saving={saving} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Shared Components ────────────────────────────────────────────────────────
const EmptyState = ({ icon, text }) => (
  <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
    <MaterialIcons name={icon} size={36} color={COLORS.onSurfaceVariant + '40'} />
    <Text style={{ fontSize: 13, color: COLORS.onSurfaceVariant, textAlign: 'center' }}>{text}</Text>
  </View>
);

const ModalInput = ({ placeholder, value, onChangeText, multiline, autoCapitalize }) => (
  <TextInput
    style={[styles.modalInput, { backgroundColor: COLORS.surfaceContainerLowest, color: COLORS.onSurface }, multiline && { height: 80, textAlignVertical: 'top' }]}
    placeholder={placeholder}
    placeholderTextColor={COLORS.onSurfaceVariant + '60'}
    value={value}
    onChangeText={onChangeText}
    multiline={multiline}
    autoCapitalize={autoCapitalize}
  />
);

const ModalActions = ({ onCancel, onSubmit, saving }) => (
  <View style={styles.modalActionRow}>
    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
      <Text style={[styles.cancelText, { color: COLORS.onSurfaceVariant }]}>CANCEL</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.primary }]} onPress={onSubmit} disabled={saving}>
      {saving ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.submitText}>CREATE</Text>}
    </TouchableOpacity>
  </View>
);

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 24, paddingTop: 12 },
  mainTitle: { fontSize: 32, fontFamily: FONTS.headline, fontWeight: '900', letterSpacing: -1 },
  subTitle: { fontSize: 13, fontFamily: FONTS.body, fontWeight: '600', marginTop: 4, marginBottom: 24 },

  quickActions: { marginHorizontal: -24, paddingLeft: 24, marginBottom: 32 },
  quickBtn: { width: 120, padding: 16, borderRadius: 20, alignItems: 'center', gap: 10, borderWidth: 1 },
  quickIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 12, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  sectionLabel: { fontSize: 18, fontFamily: FONTS.headline, fontWeight: '800' },

  hScroll: { marginHorizontal: -24, paddingLeft: 24, marginBottom: 16 },
  schoolChip: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  chipIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chipTitle: { fontSize: 14, fontWeight: '700' },

  courseList: { gap: 12, marginBottom: 16 },
  courseRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, borderWidth: 1 },
  courseIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  courseTitle: { fontSize: 15, fontWeight: '700' },
  addLectureBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },

  announcementList: { gap: 12, marginBottom: 16 },
  announcementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16, borderRadius: 16, borderWidth: 1 },
  announceDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  announceTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 },
  modalBox: { borderRadius: 28, padding: 28, borderWidth: 1 },
  modalTitle: { fontSize: 22, fontFamily: FONTS.headline, fontWeight: '900', marginBottom: 4 },
  modalSub: { fontSize: 12, marginBottom: 20 },
  modalInput: { padding: 16, borderRadius: 14, fontSize: 15, fontWeight: '600', marginBottom: 12 },
  modalActionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 12, fontWeight: '800' },
  submitBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 12, fontWeight: '900' },

  courseChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceContainerHighest },
  courseChipText: { fontSize: 12, fontWeight: '700', color: COLORS.onSurface },
  videoPickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', marginBottom: 12 },
});

export default ContentManagementScreen;
