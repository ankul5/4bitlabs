import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { getMentors, createOrder } from '../../services/mentorService';

const TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '04:00 PM',
  '06:00 PM'
];

const MentorScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('02:00 PM');

  const dates = [
    { day: 'TODAY', date: '24', month: 'OCT' },
    { day: 'FRI', date: '25', month: 'OCT' },
    { day: 'SAT', date: '26', month: 'OCT' },
  ];

  React.useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await getMentors();
        setMentors(data);
        if (data && data.length > 0) setSelectedMentor(data[0]._id);
      } catch (error) {
        console.warn('Failed to fetch mentors', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const selectedMentorData = mentors.find(m => m._id === selectedMentor);

  const handleBooking = async () => {
    // Basic booking flow
    try {
      if (!selectedMentor) return Alert.alert('Error', 'Please select a mentor.');
      const slot = `${dates[selectedDate].month} ${dates[selectedDate].date} ${selectedTime}`;
      await createOrder(selectedMentor, slot);
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Session with ${selectedMentorData?.userId?.name || 'Mentor'}\n${dates[selectedDate].day} ${dates[selectedDate].date} ${dates[selectedDate].month} at ${selectedTime}\nTotal: ₹50.00`,
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Booking Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Header user={user} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Cards */}
        <View style={styles.bannersSection}>
          {/* Free Chat Banner */}
          <View style={styles.freeChatCard}>
            <View style={styles.bannerContent}>
              <View style={styles.quickHelpBadge}>
                <Text style={styles.quickHelpText}>QUICK HELP</Text>
              </View>
              <Text style={styles.bannerTitle}>Free Chat with Mentor</Text>
              <Text style={styles.bannerDesc}>Get instant answers to your technical roadblocks from our community experts.</Text>
              <TouchableOpacity style={styles.chatCTA} activeOpacity={0.8}>
                <Text style={styles.chatCTAText}>Start Chatting</Text>
                <Text style={styles.chatCTAArrow}>→</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.bannerDecorIcon}>💬</Text>
          </View>

          {/* Paid Mentorship Banner */}
          <TouchableOpacity activeOpacity={0.95}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.paidCard}
            >
              <View style={styles.bannerContent}>
                <View style={styles.deepDiveBadge}>
                  <Text style={styles.deepDiveText}>DEEP DIVE</Text>
                </View>
                <Text style={styles.paidTitle}>1:1 Private Mentorship</Text>
                <Text style={styles.paidDesc}>Personalized guidance, career roadmap, and code reviews at just ₹50/hr.</Text>
                <View style={styles.bookSessionBtn}>
                  <Text style={styles.bookSessionText}>Book Session</Text>
                </View>
              </View>
              <Text style={styles.paidDecorIcon}>🏆</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Select Mentor */}
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
              <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading mentors...</Text>
            ) : mentors.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>No mentors available.</Text>
            ) : (
              mentors.map((mentor) => {
                const isSelected = selectedMentor === mentor._id;
                return (
                  <TouchableOpacity
                    key={mentor._id}
                    style={[styles.mentorCard, isSelected && styles.mentorCardSelected]}
                    onPress={() => setSelectedMentor(mentor._id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.mentorInfo}>
                      <Image 
                        source={{ uri: mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name || 'M')}` }} 
                        style={styles.mentorAvatar} 
                      />
                    <View style={styles.mentorDetails}>
                      <View style={styles.mentorNameRow}>
                        <Text style={styles.mentorName}>{mentor.userId?.name || mentor.name}</Text>
                        {mentor.isVerified && <Text style={styles.verifiedIcon}>✓</Text>}
                      </View>
                      <Text style={styles.mentorRole}>{mentor.role}</Text>
                      <View style={styles.ratingRow}>
                        <Text style={styles.starIcon}>★</Text>
                        <Text style={styles.ratingText}>{mentor.rating} ({mentor.reviewCount} reviews)</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.skillTags}>
                    {mentor.skills.map((skill) => (
                      <View key={skill} style={styles.skillTag}>
                        <Text style={styles.skillTagText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                    onPress={() => setSelectedMentor(mentor._id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.selectBtnText, isSelected && styles.selectBtnTextActive]}>
                      {isSelected ? 'Selected' : 'Select Profile'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }))}
          </View>
        </View>

        {/* Time Slot Picker */}
        <View style={styles.timeSection}>
          <Text style={styles.timeTitle}>Pick a Time Slot</Text>
          <Text style={styles.timeSubtitle}>Sessions are 60 minutes long. All times in IST.</Text>

          <View style={styles.timeCard}>
            {/* Date Selector */}
            <View style={styles.dateSelector}>
              {dates.map((d, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dateChip, selectedDate === idx && styles.dateChipActive]}
                  onPress={() => setSelectedDate(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateDay, selectedDate === idx && styles.dateDayActive]}>{d.day}</Text>
                  <Text style={[styles.dateNum, selectedDate === idx && styles.dateNumActive]}>{d.date}</Text>
                  <Text style={[styles.dateMonth, selectedDate === idx && styles.dateMonthActive]}>{d.month}</Text>
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
                  <Text style={[styles.timeSlotText, selectedTime === slot && styles.timeSlotTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Booking Summary */}
        <View style={styles.bookingSummary}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIconWrap}>
              <Text style={styles.summaryIcon}>📅</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Session Summary</Text>
              <Text style={styles.summaryValue}>
                {selectedMentorData?.name} • {dates[selectedDate].month} {dates[selectedDate].date} • {selectedTime}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <View style={styles.summaryPriceWrap}>
              <Text style={styles.summaryPriceLabel}>Total Amount</Text>
              <Text style={styles.summaryPrice}>₹50.00</Text>
            </View>
            <TouchableOpacity onPress={handleBooking} activeOpacity={0.9}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmBtnText}>Confirm Booking</Text>
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
  quickHelpBadge: { backgroundColor: COLORS.tertiaryFixed, paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.lg },
  quickHelpText: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: '#004b71' },
  bannerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5, marginBottom: 8, lineHeight: 32 },
  bannerDesc: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 19, maxWidth: 240, marginBottom: SPACING.xl },
  chatCTA: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chatCTAText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  chatCTAArrow: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  bannerDecorIcon: { position: 'absolute', right: -8, bottom: -8, fontSize: 100, opacity: 0.08 },
  paidCard: { borderRadius: RADIUS.xl, padding: SPACING['2xl'], position: 'relative', overflow: 'hidden', ...SHADOWS.primaryGlow },
  deepDiveBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.lg },
  deepDiveText: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: COLORS.white },
  paidTitle: { fontSize: 26, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5, marginBottom: 8, lineHeight: 32 },
  paidDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 19, maxWidth: 240, marginBottom: SPACING.xl },
  bookSessionBtn: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  bookSessionText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  paidDecorIcon: { position: 'absolute', right: -12, top: -12, fontSize: 120, opacity: 0.15 },
  mentorSection: { marginBottom: SPACING['3xl'] },
  mentorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xl },
  mentorSectionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5 },
  mentorSubtitle: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 4 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: COLORS.secondary },
  mentorsList: { gap: SPACING.xl },
  mentorCard: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOWS.sm },
  mentorCardSelected: { borderWidth: 1, borderColor: 'rgba(186,0,19,0.2)' },
  mentorInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  mentorAvatar: { width: 56, height: 56, borderRadius: 28 },
  mentorDetails: { flex: 1 },
  mentorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mentorName: { fontSize: 17, fontWeight: '700', color: COLORS.onSurface },
  verifiedIcon: { fontSize: 14, color: COLORS.primary },
  mentorRole: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  starIcon: { fontSize: 12, color: COLORS.tertiary },
  ratingText: { fontSize: 10, fontWeight: '700', color: COLORS.tertiary },
  skillTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  skillTag: { backgroundColor: COLORS.surfaceContainerLow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  skillTagText: { fontSize: 10, fontWeight: '500', color: COLORS.onSurface },
  selectBtn: { backgroundColor: COLORS.surfaceContainerLow, paddingVertical: 10, borderRadius: RADIUS.lg, alignItems: 'center' },
  selectBtnActive: { backgroundColor: COLORS.primary },
  selectBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.onSurface },
  selectBtnTextActive: { color: COLORS.white },
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
  dateNumActive: { color: COLORS.white },
  dateMonth: { fontSize: 9, fontWeight: '700', color: COLORS.onSurfaceVariant, marginTop: 2 },
  dateMonthActive: { color: 'rgba(255,255,255,0.8)' },
  timeSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { width: '47%', paddingVertical: 14, borderRadius: RADIUS.xl, backgroundColor: COLORS.surfaceContainerLowest, alignItems: 'center' },
  timeSlotActive: { backgroundColor: COLORS.primary },
  timeSlotText: { fontSize: 14, fontWeight: '600', color: COLORS.onSurface },
  timeSlotTextActive: { color: COLORS.white, fontWeight: '700' },
  bookingSummary: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS['2xl'], padding: SPACING.xl, ...SHADOWS.sm },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: SPACING.xl },
  summaryIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  summaryIcon: { fontSize: 20 },
  summaryLabel: { fontSize: 11, color: COLORS.onSurfaceVariant, fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: COLORS.onSurface, marginTop: 2 },
  summaryRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryPriceWrap: {},
  summaryPriceLabel: { fontSize: 11, color: COLORS.onSurfaceVariant },
  summaryPrice: { fontSize: 22, fontWeight: '900', color: COLORS.onSurface },
  confirmBtn: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: RADIUS.full, ...SHADOWS.primaryGlow },
  confirmBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
});

export default MentorScreen;
