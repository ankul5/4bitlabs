import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getMyProfile, uploadImage, updateMyProfile } from '../../services/authService';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, COLORS } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (error) {
        console.warn('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const displayUser = profile || user || {};

  const handleImageOption = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose a method to set your new profile picture',
      [
        { text: 'Take Photo', onPress: () => handlePickImage('camera') },
        { text: 'Choose from Gallery', onPress: () => handlePickImage('gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handlePickImage = async (type) => {
    try {
      let result;
      if (type === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') return Alert.alert('Permission needed', 'Camera permission is required');
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') return Alert.alert('Permission needed', 'Gallery permission is required');
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        const uploadRes = await uploadImage(result.assets[0].uri);
        if (uploadRes.data && uploadRes.data.url) {
           await updateMyProfile({ avatar: uploadRes.data.url });
           const updated = await getMyProfile();
           setProfile(updated);
        }
      }
    } catch (error) {
      console.warn('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Assuming AppNavigator handles auth state routing automatically
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.surface }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: COLORS.surfaceContainerLowest }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: COLORS.surfaceContainerLow }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backIcon, { color: COLORS.primary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.brandText, { color: COLORS.primary }]}>4Bit Labs</Text>
        </View>
        <View style={styles.headerRightAvatarContainer}>
          <Image 
            source={{ uri: displayUser.profileUrl || displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name || 'U')}` }} 
            style={styles.headerAvatar} 
          />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroRow}>
            <View style={styles.mainAvatarContainer}>
              <Image 
                source={{ uri: displayUser.profileUrl || displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name || 'U')}` }} 
                style={styles.mainAvatar} 
              />
              <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={handleImageOption}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryContainer]}
                  style={styles.editBtnGradient}
                >
                  <MaterialIcons name="edit" size={14} color="#fff" style={styles.editIcon} />
                </LinearGradient>
              </TouchableOpacity>
              {loading && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 999, justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              )}
            </View>
            <View style={styles.heroTextContent}>
              <Text style={[styles.profileLabel, { color: COLORS.primary }]}>SCHOLAR PROFILE</Text>
              <Text style={[styles.profileName, { color: COLORS.onSurface }]}>{displayUser.name}</Text>
              <View style={styles.tagsRow}>
                <View style={styles.tagDefault}>
                  <Text style={styles.tagDefaultText}>ROLE: {(displayUser.role || 'STUDENT').toUpperCase()}</Text>
                </View>
                <View style={styles.tagPrimary}>
                  <Text style={styles.tagPrimaryText}>Computer Science</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bento Grid layout flattened for mobile */}
        
        {/* Main Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: COLORS.surfaceContainerLowest, borderLeftColor: COLORS.primary }]}>
          <View style={styles.detailsHeader}>
            <MaterialIcons name="assignment" size={20} color={COLORS.primary} />
            <Text style={[styles.detailsHeaderTitle, { color: COLORS.onSurface }]}>Registration Details</Text>
          </View>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: COLORS.onSurfaceVariant }]}>FULL NAME</Text>
              <Text style={[styles.detailValue, { color: COLORS.onSurface }]}>{displayUser.name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: COLORS.onSurfaceVariant }]}>STUDENT ID</Text>
              <Text style={[styles.detailValue, { color: COLORS.onSurface }]}>{displayUser._id ? displayUser._id.substring(displayUser._id.length - 8).toUpperCase() : 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: COLORS.onSurfaceVariant }]}>SCHOOL NAME</Text>
              <Text style={[styles.detailValue, { color: COLORS.onSurface }]}>{displayUser.schoolId?.name || 'Not assigned'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: COLORS.onSurfaceVariant }]}>COURSES ENROLLED</Text>
              <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: '800' }]}>
                {displayUser.courseIds?.length || 0} Course(s)
              </Text>
            </View>
          </View>

          <View style={styles.receiptRow}>
            <View style={styles.receiptLeft}>
              <MaterialIcons name="date-range" size={20} color={COLORS.tertiary} />
              <View>
                <Text style={styles.detailLabel}>JOIN DATE</Text>
                <Text style={styles.receiptDate}>
                  {displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadBtn}>
              <Text style={styles.downloadText}>Download Receipt</Text>
              <MaterialIcons name="file-download" size={16} color={COLORS.primary} style={{ fontWeight: '800' }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.primaryActionBtn} activeOpacity={0.9} onPress={handleImageOption}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              style={styles.primaryActionGradient}
            >
              <Text style={styles.primaryActionText}>Update Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryActionBtn} activeOpacity={0.7} onPress={handleLogout}>
            <Text style={styles.secondaryActionText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <Text style={styles.statusTitle}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>ACTIVE</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeaderRow}>
              <Text style={[styles.progressLabel, { color: COLORS.onSurfaceVariant }]}>Total Points</Text>
              <Text style={[styles.progressValue, { color: COLORS.tertiary }]}>{displayUser.points || 0}</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: COLORS.surfaceContainerHighest }]}>
              <View style={[styles.progressBarFill, { backgroundColor: COLORS.tertiary, width: `${Math.min(100, ((displayUser.points || 0) / 1000) * 100)}%` }]} />
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={[styles.quickLinksCard, { backgroundColor: COLORS.surfaceContainerLowest }]}>
          <Text style={[styles.quickLinksTitle, { color: COLORS.onSurface }]}>Quick Links</Text>

          <View style={[styles.quickLinkItem, { paddingBottom: 16 }]}>
            <MaterialIcons name="dark-mode" size={24} color={COLORS.onSurfaceVariant} style={{ marginRight: 8 }} />
            <Text style={[styles.quickLinkText, { flex: 1, color: COLORS.onSurface }]}>Dark Mode</Text>
            <Switch value={isDark} onValueChange={() => toggleTheme(displayUser._id)} trackColor={{ false: '#767577', true: COLORS.primary }} />
          </View>
          
          <TouchableOpacity style={styles.quickLinkItem}>
            <MaterialIcons name="help-outline" size={18} color={COLORS.onSurfaceVariant} />
            <Text style={[styles.quickLinkText, { color: COLORS.onSurfaceVariant }]}>Support Center</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickLinkItem}>
            <MaterialIcons name="lock-outline" size={18} color={COLORS.onSurfaceVariant} />
            <Text style={[styles.quickLinkText, { color: COLORS.onSurfaceVariant }]}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickLinkItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={18} color={COLORS.primary} />
            <Text style={[styles.logoutText, { color: COLORS.primary }]}>Logout Session</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    ...SHADOWS.sm,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  headerRightAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: SPACING['2xl'],
  },
  heroSection: {
    marginBottom: SPACING['2xl'],
  },
  heroRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  mainAvatarContainer: {
    position: 'relative',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: COLORS.surfaceContainerLowest,
    ...SHADOWS.md,
  },
  mainAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    ...SHADOWS.sm,
  },
  editBtnGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 16,
  },
  heroTextContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -1,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tagDefault: {
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  tagDefaultText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  tagPrimary: {
    backgroundColor: 'rgba(0, 97, 144, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  tagPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.tertiary,
    letterSpacing: 0.5,
  },
  detailsCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.sm,
    marginBottom: SPACING.xl,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xl,
  },
  detailsHeaderIcon: {
    fontSize: 20,
    color: COLORS.primary,
  },
  detailsHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  detailsGrid: {
    gap: 20,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING['2xl'],
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
  },
  receiptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarIcon: {
    fontSize: 20,
    color: COLORS.tertiary,
  },
  receiptDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  downloadIcon: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
  },
  actionButtonsRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: SPACING.xl,
  },
  primaryActionBtn: {
    borderRadius: RADIUS.full,
    ...SHADOWS.primaryGlow,
  },
  primaryActionGradient: {
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '700',
  },
  statusCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  statusBadge: {
    backgroundColor: '#dcfce7', // green-100
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#166534', // green-800
    letterSpacing: 0.5,
  },
  progressContainer: {
    gap: 8,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.tertiary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.tertiary,
    borderRadius: RADIUS.full,
  },
  quickLinksCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 229, 0.5)',
    ...SHADOWS.sm,
  },
  quickLinksTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
  },
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  quickLinkIcon: {
    fontSize: 18,
    color: COLORS.onSurfaceVariant,
  },
  quickLinkText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  logoutIcon: {
    fontSize: 18,
    color: COLORS.primary,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default ProfileScreen;
