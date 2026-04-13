import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const BookMentorScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { COLORS, isDark } = useTheme();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMentors = async () => {
    try {
      const res = await api.get('/mentors');
      setMentors(res.data?.data?.mentors || []);
    } catch (e) {
      console.warn('Mentors fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMentors(); }, []);

  const handleContact = (email) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  const renderMentor = ({ item }) => {
    // If Mentor model joins users table, email should be available
    const email = item.userId?.email || item.email || '';
    const name = item.userId?.name || item.name || 'Mentor';
    const avatar = item.userId?.avatar || item.avatar || null;

    return (
      <View style={[styles.card, { backgroundColor: COLORS.surfaceContainerLowest }]}>
        <View style={styles.cardTop}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.info}>
            <Text style={[styles.name, { color: COLORS.onSurface }]}>{name}</Text>
            <Text style={[styles.designation, { color: COLORS.onSurfaceVariant }]}>{item.designation || 'Platform Mentor'}</Text>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: isDark ? 'rgba(245,158,11,0.2)' : '#fffbeb' }]}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating || '5.0'}</Text>
          </View>
        </View>

        <Text style={[styles.bio, { color: COLORS.onSurfaceVariant }]} numberOfLines={3}>
          {item.bio || 'Experienced mentor ready to assist you in your learning journey.'}
        </Text>

        <View style={[styles.actions, { borderTopColor: COLORS.surfaceContainerHighest }]}>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : '#eef2ff' }]} onPress={() => handleContact(email)}>
            <MaterialIcons name="mail-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.contactText, { color: COLORS.primary }]}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.surface }]}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
         </TouchableOpacity>
         <Text style={[styles.headerTitle, { color: COLORS.onSurface }]}>Our Mentors</Text>
      </View>

      <FlatList
        data={mentors}
        renderItem={renderMentor}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMentors} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={COLORS.onSurfaceVariant} />
              <Text style={[styles.emptyText, { color: COLORS.onSurfaceVariant }]}>No mentors available right now.</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  list: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, ...SHADOWS.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#e2e8f0' },
  avatarPlaceholder: { backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  designation: { fontSize: 13, color: '#64748b', marginTop: 2, fontWeight: '500' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#d97706' },
  bio: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff', paddingVertical: 12, borderRadius: 12, gap: 8 },
  contactText: { fontSize: 14, fontWeight: '700', color: '#6366f1' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#94a3b8', marginTop: 12, fontWeight: '500' }
});

export default BookMentorScreen;
