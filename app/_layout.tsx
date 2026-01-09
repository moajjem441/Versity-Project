





// app/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { ThemeProvider } from './_ThemeContext'; // তোমার বানানো context

export default function Layout() {
  return (
    <ThemeProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#1ABC9C',
          tabBarInactiveTintColor: '#777',
          tabBarStyle: {
            backgroundColor: '#fff',
            height: -20,
            paddingBottom: 10,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -3 },
            shadowRadius: 5,
            elevation: 5,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          headerShown: true,
          headerStyle: { backgroundColor: '#1ABC9C' },
          headerTintColor: '#fff',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '🏠 Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="MoodTrackingScreen"
          options={{
            title: '😊 Mood',
            tabBarIcon: ({ color, size }) => <Ionicons name="happy" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="JournalingScreen"
          options={{
            title: '📝 Journal',
            tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="RelaxationScreen"
          options={{
            title: '🌸 Relax',
            tabBarIcon: ({ color, size }) => <Ionicons name="flower" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="GamesScreen"
          options={{
            title: '🎮 Games',
            tabBarIcon: ({ color, size }) => <Ionicons name="game-controller" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="modal"
          options={{
            title: '📿 Islamic',
            tabBarIcon: ({ color, size }) => <Ionicons name="bonfire" size={size} color={color} />
          }}
        />

        <Tabs.Screen
          name="StoryScreen"
          options={{
            title: '📖 Stories',
            tabBarIcon: ({ color, size }) => <Ionicons name="bookmarks" size={size} color={color} />
          }}
        />



      </Tabs>



    </ThemeProvider>
  );
}
