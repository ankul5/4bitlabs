import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Linking, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { getContent, getAnnouncements } from '../../services/adminService';
import StudentHeader from '../../components/StudentHeader';

const SchoolTab = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const schoolId = user?.school_id;

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState(null); // 'video' | 'code' | 'connection'
  const [folderItems, setFolderItems] = useState([]);
  const [folderLoading, setFolderLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(null); // item object for code/connection detail

  const loadAnnouncements = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await getAnnouncements(schoolId);
      setAnnouncements(res.announcements || []);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }, [schoolId]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const openFolder = async (type) => {
    setActiveFolder(type);
    setFolderLoading(true);
    try {
      const res = await getContent(schoolId, type);
      setFolderItems(res.content || []);
    } catch (e) { console.warn(e); }
    finally { setFolderLoading(false); }
  }, [schoolId]);

  const handleItemPress = (item) => {
    if (activeFolder === 'video') {
      Linking.openURL(item.url_or_content).catch(() => {});
    } else {
      setDetailModal(item);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const FOLDERS = [
    { type: 'video', label: 'Videos', icon: 'play-circle-outline', color: '#e74c3c' },
    { type: 'code', label: 'Code Files', icon: 'code', color: '#2ecc71' },
    { type: 'connection', label: 'Connection Plans', icon: 'hub', color: '#3498db' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StudentHeader title="My School" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Announcements */}
        <Text style={styles.sectionTitle}>Announcements</Text>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : announcements.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="campaign" size={28} color={COLORS.onSurfaceVariant} />
            <Text style={styles.emptyText}>No announcements yet</Text>
          </View>
        ) : (
          announcements.map((a) => (
            <View key={a.id} style={styles.annCard}>
              <View style={styles.annHeader}>
                <MaterialIcons name="campaign" size={18} color={COLORS.primary} />
                <Text style={styles.annTitle}>{a.title}</Text>
              </View>
              <Text style={styles.annMessage}>{a.message}</Text>
              <Text style={styles.annDate}>{formatDate(a.created_at)}</Text>
            </View>
          ))
        )}

        {/* Materials */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING['2xl'] }]}>Materials</Text>
        <View style={styles.folderGrid}>
          {FOLDERS.map((f) => (
            <TouchableOpacity key={f.type} style={styles.folderCard} onPress={() => openFolder(f.type)} activeOpacity={0.8}>
              <View style={[styles.folderIcon, { backgroundColor: f.color + '20' }]}>
                <MaterialIcons name={f.icon} size={28} color={f.color} />
              </View>
              <Text style={styles.folderLabel}>{f.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Folder Items Modal */}
      <Modal visible={activeFolder !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeFolder === 'video' ? 'Videos' : activeFolder === 'code' ? 'Code Files' : 'Connection Plans'}
              </Text>
              <TouchableOpacity onPress={() => { setActiveFolder(null); setFolderItems([]); }}>
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
            {folderLoading ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : folderItems.length === 0 ? (
              <Text style={styles.emptyModalText}>No items available</Text>
            ) : (
              <FlatList
                data={folderItems}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.listItem} onPress={() => handleItemPress(item)} activeOpacity={0.7}>
                    <MaterialIcons
                      name={activeFolder === 'video' ? 'play-circle-outline' : activeFolder === 'code' ? 'code' : 'hub'}
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.listItemTitle} numberOfLines={2}>{item.title}</Text>
                    <MaterialIcons
                      name={activeFolder === 'video' ? 'open-in-new' : 'visibility'}
                      size={18}
                      color={COLORS.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Detail Modal for Code/Connection */}
      <Modal visible={detailModal !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{detailModal?.title}</Text>
              <TouchableOpacity onPress={() => setDetailModal(null)}>
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.detailScroll}>
              <Text style={[styles.detailText, activeFolder === 'code' && styles.codeText]}>
                {detailModal?.url_or_content}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.xl },
  scroll: { paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.onSurface, marginBottom: SPACING.md, letterSpacing: -0.5, marginTop: SPACING.md },
  // Announcements
  emptyCard: { alignItems: 'center', padding: SPACING['2xl'], backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, ...SHADOWS.sm },
  emptyText: { color: COLORS.onSurfaceVariant, marginTop: 8, fontSize: 14 },
  annCard: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: 10, ...SHADOWS.sm },
  annHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  annTitle: { fontSize: 15, fontWeight: '700', color: COLORS.onSurface, flex: 1 },
  annMessage: { fontSize: 14, color: COLORS.onSurfaceVariant, lineHeight: 20 },
  annDate: { fontSize: 11, color: COLORS.onSurfaceVariant, marginTop: 8, fontWeight: '600' },
  // Folders
  folderGrid: { gap: 10 },
  folderCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOWS.sm },
  folderIcon: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  folderLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.onSurface },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surfaceContainerLowest, borderTopLeftRadius: RADIUS['2xl'], borderTopRightRadius: RADIUS['2xl'], padding: SPACING['2xl'], maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5, flex: 1 },
  emptyModalText: { textAlign: 'center', color: COLORS.onSurfaceVariant, marginTop: 40, fontSize: 14 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surfaceContainerLow, borderRadius: RADIUS.lg, padding: 14, marginBottom: 8 },
  listItemTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.onSurface },
  // Detail
  detailModal: { backgroundColor: COLORS.surfaceContainerLowest, borderTopLeftRadius: RADIUS['2xl'], borderTopRightRadius: RADIUS['2xl'], padding: SPACING['2xl'], maxHeight: '85%' },
  detailScroll: { marginTop: SPACING.md },
  detailText: { fontSize: 14, color: COLORS.onSurface, lineHeight: 22 },
  codeText: { fontFamily: 'monospace', fontSize: 13, backgroundColor: COLORS.surfaceContainerLow, padding: SPACING.lg, borderRadius: RADIUS.lg },
});

export default SchoolTab;
