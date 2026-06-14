import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FeedStackParamList } from '@/navigation/types';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<FeedStackParamList, 'Chat'>;

const BASE_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:3000';

interface ChatMessage {
  id: string;
  content: string;
  sentAt: string;
  senderId: string;
  senderName: string;
}

// Normalize the two shapes the backend sends (REST history vs. socket broadcast)
function normalize(raw: any): ChatMessage {
  return {
    id: raw.id,
    content: raw.content,
    sentAt: raw.sent_at ?? raw.sentAt,
    senderId: raw.sender_id ?? raw.sender?.id,
    senderName: raw.sender_name ?? raw.sender?.name ?? 'Someone',
  };
}

export default function ChatScreen({ navigation, route }: Props) {
  const { activityId, activityTitle } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    let socket: Socket;

    (async () => {
      // 1) Load message history over REST
      try {
        const history = await api.get<any[]>(`/activities/${activityId}/messages`);
        setMessages(history.map(normalize));
      } catch {
        /* empty history is fine */
      }

      // 2) Connect the real-time socket
      const token = await SecureStore.getItemAsync('auth_token');
      socket = io(BASE_URL, { auth: { token }, transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('join_activity', activityId);
      });
      socket.on('disconnect', () => setConnected(false));
      socket.on('new_message', (msg: any) => {
        setMessages((prev) => [...prev, normalize(msg)]);
      });
    })();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_activity', activityId);
        socketRef.current.disconnect();
      }
    };
  }, [activityId]);

  const send = () => {
    const text = draft.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit('send_message', { activityId, content: text });
    setDraft('');
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const mine = item.senderId === user?.id;
    return (
      <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          {!mine && <Text style={styles.sender}>{item.senderName}</Text>}
          <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{activityTitle}</Text>
          <Text style={styles.headerSub}>{connected ? '🟢 Live' : '… connecting'}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>👋</Text>
              <Text style={styles.emptyText}>Say hi and break the ice!</Text>
            </View>
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Message the group…"
            placeholderTextColor={colors.muted}
            multiline
            onSubmitEditing={send}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.8}>
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  headerBack: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  headerSub: { ...typography.caption, color: colors.textSecondary },
  messages: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm, paddingTop: 80 },
  emptyText: { ...typography.body, color: colors.textSecondary },
  bubbleRow: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  sender: { ...typography.caption, color: colors.primary, fontWeight: '700', marginBottom: 2 },
  bubbleText: { ...typography.body, color: colors.textPrimary },
  bubbleTextMine: { color: colors.textInverse },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1, ...typography.body, color: colors.textPrimary,
    backgroundColor: colors.background, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxHeight: 100,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnText: { color: colors.textInverse, fontSize: 18 },
});
