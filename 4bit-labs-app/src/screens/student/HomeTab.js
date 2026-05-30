import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { getContent, getAnnouncements } from '../../services/adminService';

const CountCard = ({ icon, label, count, color }) => (
  <View style={styles.countCard}>
    <View style={[styles.countIcon, { backgroundColor: color + '20' }]}>
      <MaterialIcons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.countNum}>{count}</Text>
    <Text style={styles.countLabel}>{label}</Text>
  </View>
);

const HomeTab = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ videos: 0, code: 0, connections: 0, announcements: 0 });

  const isVerified = !!user?.is_verified;

  useEffect(() => {
    const load = async () => {
      try {
        const schoolId = user?.school_id;
        if (!schoolId) { setLoading(false); return; }
        const [vidRes, codeRes, connRes, annRes] = await Promise.all([
          getContent(schoolId, 'video'),
          getContent(schoolId, 'code'),
          getContent(schoolId, 'connection'),
          getAnnouncements(schoolId),
        ]);
        setCounts({
          videos: vidRes.content?.length || 0,
          code: codeRes.content?.length || 0,
          connections: connRes.content?.length || 0,
          announcements: annRes.announcements?.length || 0,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeTag}>WELCOME BACK</Text>
          <Text style={styles.welcomeName}>{user?.full_name || 'Student'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.schoolBadge}>
              <MaterialIcons name="school" size={14} color={COLORS.primary} />
              <Text style={styles.schoolBadgeText}>{user?.school_name || 'Your School'}</Text>
            </View>
            <View style={[styles.verifyBadge, isVerified ? styles.verifyBadgeGreen : styles.verifyBadgeOrange]}>
              <MaterialIcons
                name={isVerified ? 'verified' : 'hourglass-empty'}
                size={13}
                color={isVerified ? '#fff' : '#fff'}
              />
              <Text style={styles.verifyBadgeText}>
                {isVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={22} color={COLORS.error} onPress={logout} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Your Resources</Text>
          <View style={styles.grid}>
            <CountCard icon="play-circle-outline" label="Videos" count={counts.videos} color="#e74c3c" />
            <CountCard icon="code" label="Code Files" count={counts.code} color="#2ecc71" />
            <CountCard icon="hub" label="Connections" count={counts.connections} color="#3498db" />
            <CountCard icon="campaign" label="Announcements" count={counts.announcements} color="#f39c12" />
          </View>
        </>
      )}

      {/* Verification Status Footer */}
      <View style={[styles.statusFooter, isVerified ? styles.statusFooterVerified : styles.statusFooterPending]}>
        <View style={styles.statusFooterIcon}>
          <MaterialIcons
            name={isVerified ? 'verified' : 'hourglass-empty'}
            size={28}
            color={isVerified ? '#2ecc71' : '#f39c12'}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusFooterLabel}>VERIFICATION STATUS</Text>
          <Text style={[styles.statusFooterValue, { color: isVerified ? '#2ecc71' : '#f39c12' }]}>
            {isVerified ? 'Verified Student' : 'Pending Verification'}
          </Text>
          <Text style={styles.statusFooterHint}>
            {isVerified
              ? 'Your account has been approved by an administrator.'
              : 'Your account is awaiting approval from an administrator.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: SPACING.lg, marginBottom: SPACING['2xl'] },
  welcomeTag: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: COLORS.secondary, marginBottom: 4 },
  welcomeName: { fontSize: 28, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  schoolBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryFixed, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  schoolBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  verifyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full },
  verifyBadgeGreen: { backgroundColor: '#2ecc71' },
  verifyBadgeOrange: { backgroundColor: '#f39c12' },
  verifyBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  logoutBtn: { padding: 10, backgroundColor: COLORS.errorContainer, borderRadius: RADIUS.full },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.onSurface, marginBottom: SPACING.md, letterSpacing: -0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  countCard: { width: '47%', backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOWS.sm },
  countIcon: { width: 42, height: 42, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  countNum: { fontSize: 28, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -1 },
  countLabel: { fontSize: 11, fontWeight: '600', color: COLORS.onSurfaceVariant, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  // Footer
  statusFooter: { marginTop: SPACING['2xl'], borderRadius: RADIUS.xl, padding: SPACING.xl, flexDirection: 'row', alignItems: 'center', gap: 16 },
  statusFooterVerified: { backgroundColor: '#2ecc7110', borderWidth: 1, borderColor: '#2ecc7130' },
  statusFooterPending: { backgroundColor: '#f39c1210', borderWidth: 1, borderColor: '#f39c1230' },
  statusFooterIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' },
  statusFooterLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: COLORS.onSurfaceVariant, marginBottom: 2 },
  statusFooterValue: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  statusFooterHint: { fontSize: 11, color: COLORS.onSurfaceVariant, marginTop: 4, lineHeight: 16 },
});

export default HomeTab;
