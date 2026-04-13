import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import api from '../../services/api';

// ─── Utility ─────────────────────────────────────────────────────────────────
const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isOwn }) => (
  <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
    {!isOwn && (
      <Image
        source={{ uri: msg.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'M')}&background=ba0013&color=fff` }}
        style={styles.bubbleAvatar}
      />
    )}
    <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
      {!isOwn && (
        <Text style={styles.bubbleSender}>{msg.senderName}</Text>
      )}
      <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{msg.message}</Text>
      <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>{formatTime(msg.createdAt)}</Text>
    </View>
  </View>
);

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = ({ name }) => (
  <View style={styles.typingRow}>
    <View style={styles.typingBubble}>
      <Text style={styles.typingText}>{name} is typing</Text>
      <View style={styles.typingDots}>
        {[0, 1, 2].map(i => <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />)}
      </View>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MentorChatScreen = ({ route, navigation }) => {
  const { mentor, roomId: routeRoomId } = route?.params || {};
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const roomId = routeRoomId || `free_mentor_${mentor?.id || mentor?._id || 'general'}`;
  const mentorName = mentor?.name || 'Community Mentor';
  const mentorAvatar = mentor?.avatar || '';
  const mentorRole = mentor?.role || 'Mentor';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  // ─── Fetch history ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${roomId}?limit=50`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.warn('Chat history fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [roomId]);

  // ─── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // ─── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);
    setInputText('');

    // Optimistic update
    const optimisticMsg = {
      id: `temp_${Date.now()}`,
      roomId, senderId: user?._id || user?.id,
      senderName: user?.name || 'You', senderAvatar: user?.avatar || '',
      senderRole: user?.role || 'student', message: text, createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await api.post(`/chat/${roomId}`, { message: text });
      // Replace optimistic with real
      setMessages(prev =>
        prev.map(m => m.id === optimisticMsg.id ? (res.data.message || optimisticMsg) : m)
      );
    } catch (err) {
      console.warn('Send failed', err);
    } finally {
      setSending(false);
    }
  }, [inputText, sending, roomId, user]);

  const userId = user?._id || user?.id;

  const renderDateSeparator = (date, prevDate) => {
    if (!prevDate || formatDate(date) !== formatDate(prevDate)) {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateLine} />
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }
    return null;
  };

  const renderItem = ({ item, index }) => {
    const prevMsg = messages[index - 1];
    const isOwn = String(item.senderId) === String(userId);
    return (
      <View>
        {renderDateSeparator(item.createdAt, prevMsg?.createdAt)}
        <MessageBubble msg={item} isOwn={isOwn} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#ba0013', '#8b0000']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={{ uri: mentorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=fff&color=ba0013` }}
          style={styles.headerAvatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{mentorName}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{mentorRole} · Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="videocam-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading chat...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="message-text-outline" size={64} color={COLORS.primary} style={{ opacity: 0.3 }} />
                <Text style={styles.emptyTitle}>Start the conversation!</Text>
                <Text style={styles.emptySubtitle}>Ask your mentor anything — career advice,{'\n'}code reviews, or tech roadblocks.</Text>
              </View>
            }
          />
        )}

        {typingUser && <TypingIndicator name={typingUser} />}

        {/* Input Bar */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="attach" size={22} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your mentor..."
            placeholderTextColor={COLORS.onSurfaceVariant}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.8}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={18} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4F0' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn: { padding: 4 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  headerInfo: { flex: 1 },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' },
  onlineText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  headerAction: { padding: 8 },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, gap: 8 },
  bubbleRowOwn: { flexDirection: 'row-reverse' },
  bubbleAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ddd' },
  bubble: { maxWidth: '72%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, ...SHADOWS.sm },
  bubbleOther: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bubbleOwn: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleSender: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginBottom: 3 },
  bubbleText: { fontSize: 14, color: '#1a1a2e', lineHeight: 20 },
  bubbleTextOwn: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: COLORS.onSurfaceVariant, marginTop: 4, textAlign: 'right' },
  bubbleTimeOwn: { color: 'rgba(255,255,255,0.7)' },
  typingRow: { paddingHorizontal: 16, marginBottom: 4 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', alignSelf: 'flex-start', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, gap: 8, ...SHADOWS.sm },
  typingText: { fontSize: 12, color: COLORS.onSurfaceVariant, fontStyle: 'italic' },
  typingDots: { flexDirection: 'row', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  dateSeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 10 },
  dateLine: { flex: 1, height: 1, backgroundColor: '#E0D9D5' },
  dateText: { fontSize: 11, color: COLORS.onSurfaceVariant, fontWeight: '600', paddingHorizontal: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0EAE8', gap: 10 },
  attachBtn: { paddingBottom: 12 },
  input: { flex: 1, backgroundColor: '#F5F0EE', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#1a1a2e', maxHeight: 120, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  sendBtnDisabled: { backgroundColor: '#ccc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: COLORS.onSurfaceVariant, fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  emptySubtitle: { fontSize: 13, color: COLORS.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
});

export default MentorChatScreen;
