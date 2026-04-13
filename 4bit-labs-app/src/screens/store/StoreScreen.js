import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { getLabItems } from '../../services/adminService';

const STORE_URL = 'https://4bitlabs.in/shop';

const StoreScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [labItems, setLabItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLab = useCallback(async () => {
    try {
      const items = await getLabItems(user?.school_id);
      setLabItems(items);
    } catch (e) { console.warn('Lab items fetch:', e.message); }
  }, [user]);

  useEffect(() => { fetchLab(); }, [fetchLab]);

  const onRefresh = async () => { setRefreshing(true); await fetchLab(); setRefreshing(false); };

  const openStore = () => {
    Linking.openURL(STORE_URL).catch(() => {
      Linking.openURL('https://4bitlabs.in');
    });
  };

  const statusConfig = {
    available: { color: '#22c55e', bg: '#f0fdf4', label: 'Available', icon: 'check-circle' },
    in_use: { color: '#3b82f6', bg: '#eff6ff', label: 'In Use', icon: 'pending' },
    maintenance: { color: '#f59e0b', bg: '#fffbeb', label: 'Maintenance', icon: 'build' },
    out_of_stock: { color: '#ef4444', bg: '#fef2f2', label: 'Out of Stock', icon: 'cancel' },
  };

  return (
    <View style={styles.container}>
      <Header user={user} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ─── SECTION 1: Online Store ─────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="storefront" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTag}>ONLINE STORE</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={openStore}>
          <LinearGradient
            colors={['#0f172a', '#1e293b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.storeCard}
          >
            <View style={styles.storeIconWrap}>
              <MaterialCommunityIcons name="shopping" size={36} color="#818cf8" />
            </View>
            <Text style={styles.storeTitle}>4BIT LABS Store</Text>
            <Text style={styles.storeDesc}>
              Browse our full catalog of industrial-grade components, kits, and lab equipment.
            </Text>
            <View style={styles.storeLinkRow}>
              <View style={styles.storeUrlBadge}>
                <MaterialIcons name="language" size={14} color="#818cf8" />
                <Text style={styles.storeUrlText}>4bitlabs.in/shop</Text>
              </View>
              <View style={styles.visitBtn}>
                <Text style={styles.visitBtnText}>Visit Store</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick link cards */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={styles.quickCard} onPress={openStore}>
            <View style={[styles.quickIcon, { backgroundColor: '#fef2f2' }]}>
              <MaterialCommunityIcons name="chip" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.quickLabel}>Components</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={openStore}>
            <View style={[styles.quickIcon, { backgroundColor: '#eef2ff' }]}>
              <MaterialCommunityIcons name="package-variant" size={22} color="#6366f1" />
            </View>
            <Text style={styles.quickLabel}>Kits</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={openStore}>
            <View style={[styles.quickIcon, { backgroundColor: '#f0fdf4' }]}>
              <MaterialCommunityIcons name="tools" size={22} color="#22c55e" />
            </View>
            <Text style={styles.quickLabel}>Tools</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={openStore}>
            <View style={[styles.quickIcon, { backgroundColor: '#fffbeb' }]}>
              <MaterialCommunityIcons name="book-open-variant" size={22} color="#f59e0b" />
            </View>
            <Text style={styles.quickLabel}>Books</Text>
          </TouchableOpacity>
        </View>

        {/* ─── SECTION 2: Lab Items ─────────────────────────────────────────── */}
        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="flask" size={20} color="#6366f1" />
          <Text style={styles.sectionTag}>LAB INVENTORY</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{labItems.length}</Text>
          </View>
        </View>

        <View style={styles.labInfoCard}>
          <MaterialIcons name="info-outline" size={18} color="#6366f1" />
          <Text style={styles.labInfoText}>
            These items are available in your school lab. Need something? Order from the store above or request from your mentor.
          </Text>
        </View>

        {labItems.length > 0 ? (
          labItems.map((item, i) => {
            const status = statusConfig[item.status] || statusConfig.available;
            return (
              <View key={item.id || i} style={styles.labCard}>
                <View style={[styles.labIconWrap, { backgroundColor: status.bg }]}>
                  <MaterialCommunityIcons name="flask-outline" size={24} color={status.color} />
                </View>
                <View style={styles.labInfo}>
                  <Text style={styles.labName}>{item.name}</Text>
                  <Text style={styles.labMeta}>
                    {item.category || 'General'} • Qty: {item.quantity}
                  </Text>
                  {item.description ? (
                    <Text style={styles.labDesc} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                </View>
                <View style={[styles.labStatusBadge, { backgroundColor: status.bg }]}>
                  <MaterialIcons name={status.icon} size={12} color={status.color} />
                  <Text style={[styles.labStatusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="flask-empty-outline" size={56} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Lab Items Yet</Text>
            <Text style={styles.emptyDesc}>
              Lab items will appear here once your mentor adds them. You can also order components from our online store.
            </Text>
            <TouchableOpacity style={styles.orderBtn} onPress={openStore}>
              <MaterialIcons name="shopping-cart" size={18} color="#fff" />
              <Text style={styles.orderBtnText}>Order from Store</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

  // Section Headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTag: { fontSize: 12, fontWeight: '800', color: '#0f172a', letterSpacing: 2 },
  countBadge: { backgroundColor: '#6366f1', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Store Card
  storeCard: { borderRadius: 20, padding: 24, marginBottom: 16, ...SHADOWS.lg },
  storeIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(99,102,241,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  storeTitle: { fontSize: 24, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5, marginBottom: 8 },
  storeDesc: { fontSize: 14, color: '#94a3b8', lineHeight: 20, marginBottom: 20 },
  storeLinkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  storeUrlBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(99,102,241,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  storeUrlText: { fontSize: 12, fontWeight: '600', color: '#818cf8' },
  visitBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6366f1', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  visitBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Quick Links
  quickLinks: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickCard: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16, ...SHADOWS.sm },
  quickIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 11, fontWeight: '700', color: '#334155' },

  // Divider
  divider: { height: 1, backgroundColor: '#e2e8f0', marginBottom: 24 },

  // Lab Info
  labInfoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#eef2ff', padding: 14, borderRadius: 14, marginBottom: 16 },
  labInfoText: { flex: 1, fontSize: 13, color: '#4338ca', lineHeight: 18 },

  // Lab Items
  labCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 16, marginBottom: 10, gap: 12, ...SHADOWS.sm },
  labIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  labInfo: { flex: 1 },
  labName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  labMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  labDesc: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  labStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  labStatusText: { fontSize: 10, fontWeight: '700' },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 18, marginBottom: 20, paddingHorizontal: 20 },
  orderBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#6366f1', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  orderBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default StoreScreen;
