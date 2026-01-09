


// Aichat.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from './firebaseConfig';
import {
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import axios from 'axios';

export default function Aichat() {
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ id: string; text: string; sender: 'user' | 'ai' }[]>([]);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Load sessions
  useEffect(() => {
    if (!auth.currentUser) return;
    const chatsRef = collection(db, 'users', auth.currentUser.uid, 'chats');
    const q = query(chatsRef, orderBy('lastUpdated', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data: any = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...(doc.data() as any) }));
      setSessions(data);
      if (!currentSessionId && data.length > 0) setCurrentSessionId(data[0].id);
      if (!currentSessionId && data.length === 0) createNewSession();
    });
    return unsubscribe;
  }, []);

  // Load messages
  useEffect(() => {
    if (!auth.currentUser || !currentSessionId) return;
    const messagesRef = collection(db, 'users', auth.currentUser.uid, 'chats', currentSessionId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs: any = [];
      snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [currentSessionId]);

  const createNewSession = async () => {
    if (!auth.currentUser) return;
    const newSessionRef = doc(collection(db, 'users', auth.currentUser.uid, 'chats'));
    await setDoc(newSessionRef, { title: 'New Chat', lastUpdated: serverTimestamp() });
    setCurrentSessionId(newSessionRef.id);
  };

  const sendMessage = async () => {
    if (!input.trim() || !auth.currentUser || !currentSessionId) return;
    const userMsg = input;
    setInput('');
    setLoading(true);

    const messagesRef = collection(db, 'users', auth.currentUser.uid, 'chats', currentSessionId, 'messages');
    await addDoc(messagesRef, { text: userMsg, sender: 'user', createdAt: serverTimestamp() });
    await setDoc(
      doc(db, 'users', auth.currentUser.uid, 'chats', currentSessionId),
      { lastUpdated: serverTimestamp() },
      { merge: true }
    );

    if (messages.length === 0) {
      const shortTitle = userMsg.length > 20 ? userMsg.slice(0, 20) + '...' : userMsg;
      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'chats', currentSessionId),
        { title: shortTitle },
        { merge: true }
      );
    }

    try {
      const aiReply = await getGeminiReply(userMsg);
      await addDoc(messagesRef, { text: aiReply, sender: 'ai', createdAt: serverTimestamp() });
      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'chats', currentSessionId),
        { lastUpdated: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.error('AI Error:', err);
      await addDoc(messagesRef, { text: 'AI error, try again later.', sender: 'ai', createdAt: serverTimestamp() });
    }

    setLoading(false);
  };

  const getGeminiReply = async (message: string) => {
    const API_KEY = 'AIzaSyAaw8MnAK0tX74zlhHeOhoELAl56nVkXdQ';
    const MODEL_NAME = 'gemini-2.5-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    const requestBody = { contents: [{ role: 'user', parts: [{ text: message }] }] };
    try {
      const response = await axios.post(API_URL, requestBody, { headers: { 'Content-Type': 'application/json' } });
      const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      return aiText || 'No response from AI.';
    } catch (error: any) {
      console.error('Gemini API Error:', error.response ? error.response.data : error.message);
      return 'AI error, please try again later.';
    }
  };

  const colors = {
    background: isDarkTheme ? '#121212' : '#f0f0f0',
    container: isDarkTheme ? '#1f1f1f' : '#fff',
    userMsg: '#1abc9c',
    aiMsg: isDarkTheme ? '#333' : '#e0e0e0',
    text: isDarkTheme ? '#fff' : '#000',
    placeholder: isDarkTheme ? '#aaa' : '#888',
    inputBg: isDarkTheme ? '#222' : '#fff',
    buttonBg: isDarkTheme ? '#333' : '#1abc9c',
    buttonText: '#fff',
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80} // header + safe offset
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.container }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/HomeScreen')}>
          <Text style={[styles.backText, { color: colors.userMsg }]}>⬅️</Text>
        </TouchableOpacity>

        <View style={styles.rightButtons}>
          <Switch value={isDarkTheme} onValueChange={setIsDarkTheme} />
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowSessions(true)}>
            <Text style={[styles.backText, { color: colors.userMsg }]}>📄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={createNewSession}>
            <Text style={[styles.backText, { color: colors.userMsg }]}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              {
                backgroundColor: item.sender === 'user' ? colors.userMsg : colors.aiMsg,
                alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start',
              },
            ]}
          >
            <Text style={{ color: colors.text }}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10, paddingBottom: 150 }} // safe space for keyboard
      />

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.container }]}>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg }]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask AI..."
          placeholderTextColor={colors.placeholder}
          editable={!loading}
        />
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.buttonBg }]} onPress={sendMessage} disabled={loading}>
          <Text style={{ color: colors.buttonText }}>{loading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>

      {/* Sessions Modal */}
      <Modal visible={showSessions} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.container }]}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: colors.text }}>Select a Chat</Text>
            <FlatList
              data={sessions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.sessionItem, { backgroundColor: colors.container }]}
                  onPress={() => {
                    setCurrentSessionId(item.id);
                    setShowSessions(false);
                  }}
                >
                  <Text style={{ color: colors.text }}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.sessionItem, { backgroundColor: '#888' }]} onPress={() => setShowSessions(false)}>
              <Text style={{ textAlign: 'center', color: '#fff' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 },
  backButton: { padding: 5 },
  rightButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { padding: 5 },
  backText: { fontSize: 18, fontWeight: 'bold' },
  message: { padding: 10, borderRadius: 12, marginVertical: 5, maxWidth: '80%' },
  inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center', borderTopWidth: 1, borderColor: '#ccc' },
  input: { flex: 1, padding: 12, borderRadius: 12 },
  sendButton: { marginLeft: 10, paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', borderRadius: 12, padding: 15, maxHeight: '70%' },
  sessionItem: { padding: 10, marginVertical: 5, borderRadius: 8 },
});
