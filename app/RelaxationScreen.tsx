

// app/RelaxationScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <-- navigation import

const tips = [
  "Take a deep breath and exhale slowly.",
  "Close your eyes and visualize a calm place.",
  "Stretch your arms and neck gently.",
  "Focus on the present moment and release tension.",
  "Listen to soft music and relax your mind.",
  "Drink a glass of water slowly and mindfully.",
];

export default function RelaxationScreen() {
  const navigation = useNavigation(); // <-- navigation hook
  const [tipIndex, setTipIndex] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [breathText, setBreathText] = useState('Inhale 🌬️');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const nextTip = () => setTipIndex((prev) => (prev + 1) % tips.length);

  // ------------------- Breathing Animation -------------------
  useEffect(() => {
    let toggle = false; // false = inhale, true = exhale
    let interval: NodeJS.Timer;
    if (breathing) {
      setBreathText('Inhale 🌬️');
      scaleAnim.setValue(1);
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }).start();

      interval = setInterval(() => {
        toggle = !toggle;
        if (toggle) {
          setBreathText('Exhale 🌫️');
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }).start();
        } else {
          setBreathText('Inhale 🌬️');
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 4000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }).start();
        }
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [breathing]);

  const startBreathing = () => setBreathing(true);
  const stopBreathing = () => {
    setBreathing(false);
    scaleAnim.setValue(1);
    setBreathText('Inhale 🌬️');
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeScreen')}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🧘 Relaxation</Text>

      {/* Breathing Circle */}
      <View style={styles.breathingContainer}>
        <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]} />
        {breathing && <Text style={styles.breathText}>{breathText}</Text>}
      </View>

      {!breathing ? (
        <TouchableOpacity style={styles.button} onPress={startBreathing}>
          <Text style={styles.buttonText}>Start 2-min Breathing 🌬️</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={stopBreathing}>
          <Text style={styles.buttonText}>Stop Breathing ❌</Text>
        </TouchableOpacity>
      )}

      {/* Relaxation Tips */}
      <Text style={styles.tip}>{tips[tipIndex]}</Text>
      <TouchableOpacity style={styles.button} onPress={nextTip}>
        <Text style={styles.buttonText}>Next Tip ➡️</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e6f0fa', // Softer modern background
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 19,
    padding: 8,
  },
  backText: {
    fontSize: 22,
    color: '#4a90e2',
    fontWeight: '600',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },

  breathingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 34,
    marginTop: 25,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#4a90e2',
    opacity: 0.7,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  breathText: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },

  tip: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#34495e',
    fontWeight: '500',
  },

  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 16,
    marginVertical: 7,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
    textAlign: 'center',
  },
});




