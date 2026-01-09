
// //Home Screen



"use client";

import React, { useEffect, useState } from 'react';
import { 
  Alert, BackHandler, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View 
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './_Colors';
import { auth, signOut } from './firebaseConfig';
import { ThemeProvider, useTheme } from './_ThemeContext';

const features = [
  { title: 'Recitation', color: '#21177eff', route: '/QuranRecitationScreen', emoji: '📖🎶' },
  { title: 'Predict My Mood', color: '#00796b', route: '/AIMoodPredictionScreen', emoji: '🤖' },
  { title: 'Mood Tracking', color: '#1ABC9C', route: '/MoodTrackingScreen', emoji: '😊' },
  { title: 'Visual Mood', color: '#16A085', route: '/VisualMood', emoji: '📊' },
  { title: 'Journaling', color: '#3498DB', route: '/JournalingScreen', emoji: '📝' },
  { title: 'Doctor Appointment', color: '#E74C3C', route: '/DoctorAppointmentScreen', emoji: '🏥' },
  { title: 'Relaxation', color: '#9B59B6', route: '/RelaxationScreen', emoji: '🌸' },
  { title: 'Games', color: '#E67E22', route: '/GamesScreen', emoji: '🎮' },
  { title: 'Islamic Motivation', color: '#F39C12', route: '/modal', emoji: '📿' },
  { title: 'Ai Partner', color: '#00796b', route: '/Aichat', emoji: '🤖' },
  
];

const motivationalMessages = [
  "🌟 Stay positive and keep moving forward!",
  "💪 Every small step counts!",
  "🧘 Take a deep breath and relax!",
  "📈 Progress, not perfection.",
  "🌿 You are stronger than you think!",
  "✨ Believe in yourself today!",
  "🌞 Every day is a new opportunity!"
];

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const c = Colors[theme];

  const [currentMessage, setCurrentMessage] = useState<string>("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) router.replace('/LoginScreen');
    });
    return unsubscribe;
  }, []);

  // Header theme toggle
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
          <Ionicons 
            name={theme === 'light' ? 'moon' : 'sunny'} 
            size={22} 
            color="#fff" 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  // Motivational messages interval
  useEffect(() => {
    setCurrentMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    const interval = setInterval(() => {
      const msg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setCurrentMessage(msg);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleExitOrLogout = () => {
    if (Platform.OS === 'android') {
      Alert.alert('Exit App', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: async () => { try { await signOut(auth); } catch(e){} BackHandler.exitApp(); } }
      ]);
    } else {
      Alert.alert('Logout', 'Do you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => { try { await signOut(auth); } catch(e){} router.replace('/LoginScreen'); } }
      ]);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.bg }]}>
      
      {/* Motivation Card */}
      {currentMessage !== "" && (
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>{currentMessage}</Text>
        </View>
      )}

      {/* Title */}
      <Text style={[styles.title, { color: c.text }]}>🌿 Welcome to Mind Refreshment--The Chillzone!</Text>
      <Text style={[styles.subtitle, { color: c.text }]}>
        Your personal space to track your mood, journal, relax, and have fun!
      </Text>

      {/* Full-width Read Motivational Story button */}
      <TouchableOpacity
        style={[styles.storyButton, { backgroundColor: '#4aa714ff' }]}
        activeOpacity={0.8}
        onPress={() => router.push('/StoryScreen')}
      >
        <Text style={styles.storyButtonText}>📖 Read Motivational Story</Text>
      </TouchableOpacity>

      {/* Other features */}
      <View style={styles.grid}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.title}
            style={[styles.buttonCard, { backgroundColor: feature.color }]}
            activeOpacity={0.8}
            onPress={() => router.push(feature.route)}
          >
            <Text style={styles.buttonEmoji}>{feature.emoji}</Text>
            <Text style={styles.buttonText}>{feature.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Exit / Logout button */}
      <TouchableOpacity
        style={[styles.buttonCard, { backgroundColor: c.danger, width: '100%' }]}
        activeOpacity={0.8}
        onPress={handleExitOrLogout}
      >
        <Text style={[styles.buttonText, { fontSize: 18 }]}>{Platform.OS==='android'?'Exit App':'Logout'}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

export const options = {
  title: 'Home',
  headerShown: true,
};

const styles = StyleSheet.create({
  container: { flexGrow:1, justifyContent:'center', alignItems:'center', padding:20 },
  motivationCard: { width:'100%', backgroundColor:'#16a085', padding:15, borderRadius:12, marginBottom:25 },
  motivationText: { color:'#fff', fontSize:16, fontWeight:'bold', textAlign:'center' },
  title: { fontSize:28, fontWeight:'bold', marginBottom:10, textAlign:'center' },
  subtitle: { fontSize:16, textAlign:'center', marginBottom:20, lineHeight:24 },
  storyButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  storyButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  grid: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', width:'100%', marginBottom:20 },
  buttonCard: { width:'48%', paddingVertical:22, borderRadius:16, marginBottom:12, justifyContent:'center', alignItems:'center', elevation:4, shadowColor:'#000', shadowOpacity:0.1, shadowOffset:{width:0,height:3}, shadowRadius:8 },
  buttonText: { color:'#fff', fontSize:16, fontWeight:'bold', marginTop:5 },
  buttonEmoji: { fontSize:26 },
});
