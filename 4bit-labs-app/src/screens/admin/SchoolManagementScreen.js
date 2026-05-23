import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl, Dimensions, Modal, ScrollView } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../config/theme';
import { getSchools, createSchool } from '../../services/adminService';
import StitchHeader from '../../components/StitchHeader';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SchoolManagementScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: '', code: '', city: '' });
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const data = await getSchools();
      setSchools(data || []);
    } catch (e) { console.warn('Fetch schools error:', e.message); }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAddSchool = async () => {
    if (!newSchool.name.trim() || !newSchool.code.trim()) {
      return Alert.alert('Error', 'Both School Name and unique Code are required.');
    }
    try {
      await createSchool(newSchool);
      Alert.alert('Success', 'School registered successfully!');
      setNewSchool({ name: '', code: '', city: '' });
      setShowAdd(false);
      fetchData();
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const renderSchool = ({ item }) => (
    <View style={[styles.schoolCard, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
      <View style={[styles.cardIconWrap, { backgroundColor: COLORS.primary + '15' }]}>
        <MaterialIcons name="business" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.cardMain}>
        <Text style={[styles.cardTitle, { color: COLORS.onSurface }]}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardCode, { color: COLORS.primary }]}>{item.code}</Text>
          <View style={[styles.dot, { backgroundColor: COLORS.surfaceContainerHighest }]} />
          <Text style={[styles.cardCity, { color: COLORS.onSurfaceVariant }]}>{item.city || 'Regional Hub'}</Text>
        </View>
        {item.studentCount > 0 && (
          <Text style={{ fontSize: 10, color: COLORS.onSurfaceVariant, marginTop: 2 }}>
            {item.studentCount} student{item.studentCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.cardAction}>
        <MaterialIcons name="chevron-right" size={20} color={COLORS.onSurfaceVariant} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.surface }]}>
      <StitchHeader user={user} onSearchPress={() => {}} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={[styles.welcomeLabel, { color: COLORS.onSurfaceVariant }]}>WELCOME BACK, ADMIN</Text>
            <Text style={[styles.mainTitle, { color: COLORS.onSurface }]}>Institutional Partners</Text>
          </View>

          {/* Global Reach Hero */}
          <LinearGradient 
            colors={[COLORS.primary, COLORS.primaryContainer]} 
            style={styles.heroCard}
            start={{x:0, y:0}} end={{x:1, y:1}}
          >
            <View>
              <Text style={styles.heroLabel}>GLOBAL REACH</Text>
              <Text style={styles.heroValue}>{schools.length}</Text>
              <Text style={styles.heroSub}>Partner Institutions</Text>
            </View>
            <MaterialCommunityIcons name="shield-check" size={100} color="white" style={styles.heroIcon} />
          </LinearGradient>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={[styles.searchInputWrapper, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
              <MaterialIcons name="search" size={20} color={COLORS.onSurfaceVariant} />
              <TextInput
                style={[styles.searchInput, { color: COLORS.onSurface }]}
                placeholder="Find a school..."
                placeholderTextColor={COLORS.onSurfaceVariant + '80'}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
             <Text style={[styles.sectionTitle, { color: COLORS.onSurface }]}>Active Schools</Text>
             <View style={[styles.countBadge, { backgroundColor: COLORS.surfaceContainerHighest }]}>
               <Text style={[styles.countText, { color: COLORS.onSurfaceVariant }]}>{schools.length}</Text>
             </View>
          </View>

          <FlatList
            data={schools.filter(s => (s.name || '').toLowerCase().includes((search || '').toLowerCase()))}
            renderItem={renderSchool}
            scrollEnabled={false}
            keyExtractor={item => String(item.id || item._id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialCommunityIcons name="office-building" size={64} color={COLORS.surfaceContainerHighest} />
                <Text style={[styles.emptyText, { color: COLORS.onSurfaceVariant }]}>No institutional records found</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, SHADOWS.primaryGlow]}
        onPress={() => setShowAdd(true)}
      >
        <LinearGradient colors={[COLORS.primary, COLORS.primaryContainer]} style={styles.fabFill}>
           <MaterialIcons name="add-business" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Onboard Modal */}
      <Modal visible={showAdd} animationType="fade" transparent>
         <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: COLORS.surfaceContainerLow, borderColor: COLORS.tabBarBorder }]}>
               <Text style={[styles.modalTitle, { color: COLORS.onSurface }]}>Onboard School</Text>
               
               <TextInput 
                  style={[styles.modalInput, { backgroundColor: COLORS.surfaceContainerLowest, color: COLORS.onSurface }]}
                  placeholder="Full Institution Name"
                  placeholderTextColor={COLORS.onSurfaceVariant + '80'}
                  value={newSchool.name}
                  onChangeText={t => setNewSchool(p => ({ ...p, name: t }))}
               />
               
               <TextInput 
                  style={[styles.modalInput, { backgroundColor: COLORS.surfaceContainerLowest, color: COLORS.onSurface }]}
                  placeholder="Unique School Code (e.g. OAK01)"
                  placeholderTextColor={COLORS.onSurfaceVariant + '80'}
                  autoCapitalize="characters"
                  value={newSchool.code}
                  onChangeText={t => setNewSchool(p => ({ ...p, code: t.toUpperCase() }))}
               />

               <TextInput 
                  style={[styles.modalInput, { backgroundColor: COLORS.surfaceContainerLowest, color: COLORS.onSurface }]}
                  placeholder="City (optional)"
                  placeholderTextColor={COLORS.onSurfaceVariant + '80'}
                  value={newSchool.city}
                  onChangeText={t => setNewSchool(p => ({ ...p, city: t }))}
               />

               <View style={styles.modalActionRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                     <Text style={[styles.cancelText, { color: COLORS.onSurfaceVariant }]}>CANCEL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.primary }]} onPress={handleAddSchool}>
                     <Text style={styles.submitText}>ONBOARD</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 12 },
  titleSection: { marginBottom: 28 },
  welcomeLabel: { fontSize: 10, fontFamily: FONTS.label, letterSpacing: 2, fontWeight: '800' },
  mainTitle: { fontSize: 32, fontFamily: FONTS.headline, fontWeight: '900', letterSpacing: -1 },

  heroCard: { borderRadius: 28, padding: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, overflow: 'hidden', ...SHADOWS.primaryGlow },
  heroLabel: { fontSize: 10, fontFamily: FONTS.label, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 1.5 },
  heroValue: { fontSize: 48, fontFamily: FONTS.headline, color: 'white', fontWeight: '900', letterSpacing: -2, marginTop: 4 },
  heroSub: { fontSize: 14, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginTop: 2 },
  heroIcon: { position: 'absolute', right: -20, bottom: -20, opacity: 0.15 },

  searchSection: { marginBottom: 24 },
  searchInputWrapper: { 
    flexDirection: 'row', alignItems: 'center', gap: 12, 
    paddingHorizontal: 16, height: 52, borderRadius: 16, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: FONTS.body, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.headline, fontWeight: '800' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  countText: { fontSize: 10, fontFamily: FONTS.label, fontWeight: '900' },

  list: { gap: 12 },
  schoolCard: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, 
    borderRadius: 24, borderWidth: 1, gap: 16, ...SHADOWS.sm 
  },
  cardIconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardMain: { flex: 1 },
  cardTitle: { fontSize: 16, fontFamily: FONTS.headline, fontWeight: '800' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  cardCode: { fontSize: 11, fontFamily: FONTS.label, fontWeight: '900' },
  cardCity: { fontSize: 11, fontFamily: FONTS.body, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2 },
  cardAction: { padding: 4 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyText: { fontSize: 14, fontFamily: FONTS.body, fontWeight: '600' },

  fab: { position: 'absolute', bottom: 100, right: 24, width: 64, height: 64, borderRadius: 32 },
  fabFill: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 32 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 },
  modalBox: { borderRadius: 32, padding: 32, borderWidth: 1 },
  modalTitle: { fontSize: 24, fontFamily: FONTS.headline, fontWeight: '900', marginBottom: 24 },
  modalInput: { 
    padding: 20, borderRadius: 16, 
    fontSize: 16, fontFamily: FONTS.body, fontWeight: '600', marginBottom: 16 
  },
  modalActionRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  cancelText: { fontSize: 12, fontFamily: FONTS.label, fontWeight: '800' },
  submitBtn: { flex: 2, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 12, fontFamily: FONTS.label, fontWeight: '900' },
});

export default SchoolManagementScreen;
