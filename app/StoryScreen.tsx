



"use client";

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { stories } from './stories';
import { Ionicons } from '@expo/vector-icons';

export default function StoryScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');

  // 🎨 Theme system
  const themeStyles = {
    backgroundColor:
      theme === 'light' ? '#fff' : theme === 'dark' ? '#121212' : '#f4ecd8',
    textColor:
      theme === 'light' ? '#000' : theme === 'dark' ? '#f1f1f1' : '#5b4636',
    cardColor:
      theme === 'light'
        ? '#8e44ad'
        : theme === 'dark'
        ? '#2c2c54'
        : '#c1a873',
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: themeStyles.backgroundColor }]}>
      {/* 🔝 Fixed Header */}
      <View style={[styles.headerContainer, { backgroundColor: themeStyles.backgroundColor }]}>
        {/* 🏠 Home Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/HomeScreen')}>
          <Ionicons name="arrow-back" size={24} color={themeStyles.textColor} />
          <Text style={[styles.backText, { color: themeStyles.textColor }]}>Home</Text>
        </TouchableOpacity>

        {/* 📖 Title */}
        <Text style={[styles.header, { color: themeStyles.textColor }]}>
          📖 Motivational Stories
        </Text>

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

      {/* 📜 Scrollable Stories */}
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { backgroundColor: themeStyles.backgroundColor }]}
      >
        {stories.map((story, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.storyCard, { backgroundColor: themeStyles.cardColor }]}
            onPress={() => {
              const title = encodeURIComponent(story.title);
              const content = encodeURIComponent(story.content);
              router.push(`/StoryDetailsScreen?title=${title}&content=${content}`);
            }}
          >
            <Text style={[styles.storyTitle, { color: '#fff' }]}>{story.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 45, // status bar safe area
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
    gap: 5,
  },
  backText: {
    fontSize: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  themeSwitch: {
    flexDirection: 'row',
    gap: 10,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 10,
  },
  storyCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
