



"use client";

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function StoryDetailsScreen() {
  const router = useRouter();
  const { title, content } = useLocalSearchParams<{ title?: string; content?: string }>();

  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');

  // Theme styles
  const themeStyles = {
    backgroundColor:
      theme === 'light' ? '#fff' : theme === 'dark' ? '#121212' : '#f4ecd8',
    textColor:
      theme === 'light' ? '#000' : theme === 'dark' ? '#f1f1f1' : '#5b4636',
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: themeStyles.backgroundColor }]}>
      {/* 🔙 Fixed Header */}
      <View style={[styles.header, { backgroundColor: themeStyles.backgroundColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/StoryScreen')}>
          <Ionicons name="arrow-back" size={24} color={themeStyles.textColor} />
          <Text style={[styles.backText, { color: themeStyles.textColor }]}>Back</Text>
        </TouchableOpacity>

        {/* 🌗 Theme Switch */}
        <View style={styles.themeSwitch}>
          <TouchableOpacity onPress={() => setTheme('light')}>
            <Ionicons name="sunny" size={22} color={theme === 'light' ? '#f4b400' : '#888'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTheme('dark')}>
            <Ionicons name="moon" size={22} color={theme === 'dark' ? '#fff' : '#888'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTheme('sepia')}>
            <Ionicons name="color-filter" size={22} color={theme === 'sepia' ? '#b68948' : '#888'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 📖 Scrollable Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { backgroundColor: themeStyles.backgroundColor }]}
      >
        <Text style={[styles.title, { color: themeStyles.textColor }]}>
          {decodeURIComponent(title || '')}
        </Text>
        <View style={[styles.divider, { backgroundColor: theme === 'dark' ? '#444' : '#ccc' }]} />
        <Text style={[styles.content, { color: themeStyles.textColor }]}>
          {decodeURIComponent(content || '')}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 45, // status bar space
    paddingBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
  },
  themeSwitch: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 10,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  divider: { height: 1, marginVertical: 10 },
  content: { fontSize: 16, lineHeight: 24, textAlign: 'justify' },
});
