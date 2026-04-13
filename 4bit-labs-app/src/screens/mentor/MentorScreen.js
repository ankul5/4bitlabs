import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { getMentors, createOrder } from '../../services/mentorService';

// ─── Dynamic real dates ────────────────────────────────────────────────────────
const getDates = () => {
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return [0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      day: offset === 0 ? 'TODAY' : DAYS[d.getDay()],
      date: String(d.getDate()).padStart(2, '0'),
      month: MONTHS[d.getMonth()],
      fullDate: d.toISOString().split('T')[0], // 'YYYY-MM-DD'
    };
  });
};

const TIME_SLOTS = ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];

const MentorScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState('02:00 PM');

  const dates = getDates();

  React.useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await getMentors();
        setMentors(data || []);
        if (data && data.length > 0) setSelectedMentor(data[0]._id || data[0].id);
      } catch (error) {
        console.warn('Failed to fetch mentors', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const selectedMentorData = mentors.find(m => (m._id || m.id) === selectedMentor);

  const handleBooking = async () => {
    try {
      if (!selectedMentor) return Alert.alert('Error', 'Please select a mentor.');
      const slot = {
        date: dates[selectedDateIdx].fullDate,
        time: selectedTime,
      };
      await createOrder(selectedMentor, slot);
      Alert.alert(
        'Booking Confirmed!',
        `Session with ${selectedMentorData?.name || 'Mentor'}\n${dates[selectedDateIdx].day}, ${dates[selectedDateIdx].date} ${dates[selectedDateIdx].month} at ${selectedTime}\nTotal: ₹${selectedMentorData?.sessionPrice || 50}.00`,
        [{ text: 'OK' }],
      );
    } catch (e) {
      Alert.alert('Booking Error', e.message);
    }
  };

  const handleOpenChat = () => {
    navigation.navigate('MentorChat', { mentor: selectedMentorData });
  };

  return (
    <View style={styles.container}>
      <Header user={user} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Banner Cards ───────────────────────────────────────────────── */}
        <View style={styles.bannersSection}>

          {/* Free Chat Banner */}
          <View style={styles.freeChatCard}>
            <View style={styles.bannerContent}>
              <View style={styles.quickHelpBadge}>
                <MaterialCommunityIcons name="lightning-bolt" size={10} color="#004b71" />
                <Text style={styles.quickHelpText}>QUICK HELP</Text>
              </View>
              <Text style={styles.bannerTitle}>Free Chat{'\n'}with Mentor</Text>
              <Text style={styles.bannerDesc}>Get instant answers to your technical roadblocks from community experts.</Text>
              <TouchableOpacity style={styles.chatCTA} activeOpacity={0.8} onPress={handleOpenChat}>
                <MaterialCommunityIcons name="message-text" size={16} color={COLORS.primary} />
                <Text style={styles.chatCTAText}>Start Chatting</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <MaterialCommunityIcons name="comment-multiple-outline" size={90} color={COLORS.primary} style={styles.bannerDecorIcon} />
          </View>

          {/* Paid Mentorship Banner */}
          <TouchableOpacity activeOpacity={0.95}>
            <LinearGradient colors={[COLORS.primary, '#5c000b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.paidCard}>
              <View style={styles.bannerContent}>
                <View style={styles.deepDiveBadge}>
                  <FontAwesome5 name="star" size={9} color="#fff" />
                  <Text style={styles.deepDiveText}>DEEP DIVE</Text>
                </View>
                <Text style={styles.paidTitle}>1:1 Private{'\n'}Mentorship</Text>
                <Text style={styles.paidDesc}>Personalized guidance, career roadmap & code reviews at just ₹50/hr.</Text>
                <View style={styles.bookSessionBtn}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.bookSessionText}>Book Session</Text>
                </View>
              </View>
              <FontAwesome5 name="trophy" size={80} color="rgba(255,255,255,0.12)" style={styles.paidDecorIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Select Mentor ──────────────────────────────────────────────── */}
        <View style={styles.mentorSection}>
          <View style={styles.mentorHeader}>
            <View>
              <Text style={styles.mentorSectionTitle}>Select your Mentor</Text>
              <Text style={styles.mentorSubtitle}>Expert educators ready to guide your journey.</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mentorsList}>
            {loading ? (
              <View style={styles.loadingRow}>
                <MaterialCommunityIcons name="account-search" size={24} color={COLORS.onSurfaceVariant} />
                <Text style={styles.loadingText}>Loading mentors...</Text>
              </View>
            ) : (
              [...mentors.slice(0, 5), ...Array.from({ length: Math.max(0, 5 - mentors.length) }).map((_, i) => ({
                id: `placeholder-${i}`,
                name: 'Mentor Spot Available',
                role: 'Platform Mentor',
                email: 'contact@4bitlabs.in',
                phone: '+91 0000000000',
                rating: 5.0,
                reviewCount: 0,
                isPlaceholder: true,
              }))].map((mentor) => {
                const mid = mentor._id || mentor.id;
                const isSelected = selectedMentor === mid;
                return (
                  <TouchableOpacity
                    key={mid}
                    style={[styles.mentorCard, isSelected && styles.mentorCardSelected, mentor.isPlaceholder && { opacity: 0.7 }]}
                    onPress={() => !mentor.isPlaceholder && setSelectedMentor(mid)}
                    activeOpacity={0.8}
                    disabled={mentor.isPlaceholder}
                  >
                    <View style={styles.mentorInfo}>
                      <Image
                        source={{ uri: mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name || 'M')}&background=ba0013&color=fff` }}
                        style={styles.mentorAvatar}
                      />
                      <View style={styles.mentorDetails}>
                        <View style={styles.mentorNameRow}>
                          <Text style={styles.mentorName}>{mentor.name}</Text>
                          {mentor.isVerified && (
                            <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.primary} />
                          )}
                        </View>
                        <Text style={styles.mentorRole}>{mentor.designation || mentor.role}</Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <MaterialCommunityIcons name="email-outline" size={12} color={COLORS.onSurfaceVariant} />
                          <Text style={{ fontSize: 11, color: COLORS.onSurfaceVariant }}>{mentor.user_email || mentor.email || 'No email provided'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <MaterialCommunityIcons name="phone-outline" size={12} color={COLORS.onSurfaceVariant} />
                          <Text style={{ fontSize: 11, color: COLORS.onSurfaceVariant }}>{mentor.phone || 'No phone provided'}</Text>
                        </View>

                        <View style={styles.ratingRow}>
                          <FontAwesome5 name="star" size={10} color="#f59e0b" solid />
                          <Text style={styles.ratingText}>{mentor.rating} ({mentor.reviewCount} reviews)</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.skillTags}>
                      {(mentor.skills || []).map((skill) => (
                        <View key={skill} style={styles.skillTag}>
                          <Text style={styles.skillTagText}>{skill}</Text>
                        </View>
                      ))}
                    </View>

                    {!mentor.isPlaceholder && (
                      <TouchableOpacity
                        style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                        onPress={() => setSelectedMentor(mid)}
                        activeOpacity={0.8}
                      >
                        {isSelected
                          ? <Ionicons name="checkmark-circle" size={16} color="#fff" />
                          : <Ionicons name="person-add-outline" size={16} color={COLORS.onSurface} />
                        }
                        <Text style={[styles.selectBtnText, isSelected && styles.selectBtnTextActive]}>
                          {isSelected ? 'Selected' : 'Select Profile'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* ── Time Slot Picker ───────────────────────────────────────────── */}
        <View style={styles.timeSection}>
          <Text style={styles.timeTitle}>Pick a Time Slot</Text>
          <Text style={styles.timeSubtitle}>Sessions are 60 minutes long. All times in IST.</Text>

          <View style={styles.timeCard}>
            {/* Date Selector */}
            <View style={styles.dateSelector}>
              {dates.map((d, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dateChip, selectedDateIdx === idx && styles.dateChipActive]}
                  onPress={() => setSelectedDateIdx(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateDay, selectedDateIdx === idx && styles.dateDayActive]}>{d.day}</Text>
                  <Text style={[styles.dateNum, selectedDateIdx === idx && styles.dateNumActive]}>{d.date}</Text>
                  <Text style={[styles.dateMonth, selectedDateIdx === idx && styles.dateMonthActive]}>{d.month}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time Slots */}
            <View style={styles.timeSlots}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeSlot, selectedTime === slot && styles.timeSlotActive]}
                  onPress={() => setSelectedTime(slot)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="time-outline" size={12} color={selectedTime === slot ? '#fff' : COLORS.onSurfaceVariant} />
                  <Text style={[styles.timeSlotText, selectedTime === slot && styles.timeSlotTextActive]}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── Booking Summary ────────────────────────────────────────────── */}
        <View style={styles.bookingSummary}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIconWrap}>
              <Ionicons name="calendar" size={22} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Session Summary</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {selectedMentorData?.name || 'Select mentor'} {'·'} {dates[selectedDateIdx].date} {dates[selectedDateIdx].month} {'·'} {selectedTime}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <View style={styles.summaryPriceWrap}>
              <Text style={styles.summaryPriceLabel}>Total</Text>
              <Text style={styles.summaryPrice}>₹{selectedMentorData?.sessionPrice || 50}</Text>
            </View>
            <TouchableOpacity onPress={handleBooking} activeOpacity={0.9}>
              <LinearGradient colors={[COLORS.primary, '#8b0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmBtn}>
                <Ionicons name="checkmark-done" size={16} color="#fff" />
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  bannersSection: { gap: SPACING.xl, marginBottom: SPACING['3xl'] },
  freeChatCard: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, padding: SPACING['2xl'], position: 'relative', overflow: 'hidden', ...SHADOWS.md },
  bannerContent: { zIndex: 1 },
  quickHelpBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.tertiaryFixed, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.lg },
  quickHelpText: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: '#004b71' },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5, marginBottom: 8, lineHeight: 29 },
  bannerDesc: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 19, maxWidth: 240, marginBottom: SPACING.xl },
  chatCTA: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chatCTAText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  bannerDecorIcon: { position: 'absolute', right: -8, bottom: -8, opacity: 0.06 },
  paidCard: { borderRadius: RADIUS.xl, padding: SPACING['2xl'], position: 'relative', overflow: 'hidden', ...SHADOWS.primaryGlow },
  deepDiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.lg },
  deepDiveText: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: '#fff' },
  paidTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 8, lineHeight: 29 },
  paidDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 19, maxWidth: 240, marginBottom: SPACING.xl },
  bookSessionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 11, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  bookSessionText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  paidDecorIcon: { position: 'absolute', right: -16, top: -10 },
  mentorSection: { marginBottom: SPACING['3xl'] },
  mentorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xl },
  mentorSectionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5 },
  mentorSubtitle: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 4 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: COLORS.secondary },
  mentorsList: { gap: SPACING.xl },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20 },
  loadingText: { color: COLORS.onSurfaceVariant, fontSize: 14 },
  mentorCard: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOWS.sm },
  mentorCardSelected: { borderWidth: 1.5, borderColor: `${COLORS.primary}33` },
  mentorInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  mentorAvatar: { width: 56, height: 56, borderRadius: 28 },
  mentorDetails: { flex: 1 },
  mentorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mentorName: { fontSize: 17, fontWeight: '700', color: COLORS.onSurface },
  mentorRole: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 10, fontWeight: '700', color: '#f59e0b' },
  skillTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  skillTag: { backgroundColor: COLORS.surfaceContainerLow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  skillTagText: { fontSize: 10, fontWeight: '500', color: COLORS.onSurface },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.surfaceContainerLow, paddingVertical: 10, borderRadius: RADIUS.lg },
  selectBtnActive: { backgroundColor: COLORS.primary },
  selectBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.onSurface },
  selectBtnTextActive: { color: '#fff' },
  timeSection: { marginBottom: SPACING['3xl'] },
  timeTitle: { fontSize: 22, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5, marginBottom: 4 },
  timeSubtitle: { fontSize: 13, color: COLORS.onSurfaceVariant, marginBottom: SPACING.xl },
  timeCard: { backgroundColor: COLORS.surfaceContainerLow, borderRadius: RADIUS['2xl'], padding: SPACING['2xl'] },
  dateSelector: { flexDirection: 'row', gap: 12, marginBottom: SPACING['2xl'] },
  dateChip: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS['2xl'], backgroundColor: COLORS.surfaceContainerLowest },
  dateChipActive: { backgroundColor: COLORS.primary },
  dateDay: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: COLORS.onSurfaceVariant, marginBottom: 4 },
  dateDayActive: { color: 'rgba(255,255,255,0.8)' },
  dateNum: { fontSize: 22, fontWeight: '900', color: COLORS.onSurface },
  dateNumActive: { color: '#fff' },
  dateMonth: { fontSize: 9, fontWeight: '700', color: COLORS.onSurfaceVariant, marginTop: 2 },
  dateMonthActive: { color: 'rgba(255,255,255,0.8)' },
  timeSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, width: '47%', paddingVertical: 13, borderRadius: RADIUS.xl, backgroundColor: COLORS.surfaceContainerLowest },
  timeSlotActive: { backgroundColor: COLORS.primary },
  timeSlotText: { fontSize: 13, fontWeight: '600', color: COLORS.onSurface },
  timeSlotTextActive: { color: '#fff', fontWeight: '700' },
  bookingSummary: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS['2xl'], padding: SPACING.xl, ...SHADOWS.sm },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: SPACING.xl },
  summaryIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontSize: 11, color: COLORS.onSurfaceVariant, fontWeight: '500' },
  summaryValue: { fontSize: 13, fontWeight: '700', color: COLORS.onSurface, marginTop: 2, maxWidth: 200 },
  summaryRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryPriceWrap: {},
  summaryPriceLabel: { fontSize: 11, color: COLORS.onSurfaceVariant },
  summaryPrice: { fontSize: 22, fontWeight: '900', color: COLORS.onSurface },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 14, borderRadius: RADIUS.full, ...SHADOWS.primaryGlow },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
});

export default MentorScreen;
