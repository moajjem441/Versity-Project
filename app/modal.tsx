
//QuranAyatScreen.tsx


import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function QuranAyatScreen() {
  const navigation = useNavigation();

  const ayatList = [
    "Indeed, Allah is with those who fear Him and those who are doers of good. (Quran 16:128)",
    "So remember Me; I will remember you. (Quran 2:152)",
    "Indeed, with hardship [will be] ease. (Quran 94:6)",
    "And We have certainly made the Qur'an easy to remember. (Quran 54:17)",
    "Allah does not burden a soul beyond that it can bear. (Quran 2:286)",
    "Indeed, Allah commands justice and good conduct. (Quran 16:90)",
    "So whoever does righteous deeds while he is a believer - no denial will there be for his effort. (Quran 41:46)",
    "And seek help through patience and prayer. (Quran 2:45)",
    "Verily, in the remembrance of Allah do hearts find rest. (Quran 13:28)",
    "And your Lord is going to give you, and you will be satisfied. (Quran 93:5)",
    "Indeed, prayer prohibits immorality and wrongdoing. (Quran 29:45)",
    "So whoever relies upon Allah - then He is sufficient for him. (Quran 65:3)",
    "And We have already sent messengers before you, [O Muhammad]. (Quran 43:6)",
    "Indeed, Allah is Forgiving and Merciful. (Quran 39:53)",
    "And He found you lost and guided [you]. (Quran 93:7)",
    "And We have not sent you, [O Muhammad], except as a mercy to the worlds. (Quran 21:107)",
    "Say, 'My Lord has commanded justice.' (Quran 7:29)",
    "Indeed, Allah loves those who rely upon Him. (Quran 3:159)",
    "Indeed, Allah is the best of planners. (Quran 8:30)",
    "So be patient. Indeed, the promise of Allah is truth. (Quran 30:60)",
  ];

  const goHome = () => {
    navigation.navigate('HomeScreen' as never);
  };

  return (
    <LinearGradient colors={['#16A085', '#1ABC9C']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>💫 Daily Quran Ayat</Text>

        {ayatList.map((ayat, index) => (
          <View key={index} style={styles.ayatCard}>
            <Text style={styles.ayatText}>{ayat}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={goHome}>
          <Text style={styles.buttonText}>🏠 Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  headerTitle: {
  fontSize: 28,
  fontWeight: '900',
  color: '#fff',
  marginBottom: 25,
  textAlign: 'center',
  textShadowColor: 'rgba(0,0,0,0.3)',
  textShadowOffset: { width: 1, height: 2 },
  textShadowRadius: 4,
},

  ayatCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  ayatText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1ABC9C',
  },
});




