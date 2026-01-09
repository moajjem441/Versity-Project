


import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router"; // <-- import router
import axios from "axios";

const moods = ["Happy", "Sad", "Anxious", "Stressed", "Angry", "Bored"];

export default function AIMoodGeminiScreen() {
  const router = useRouter(); // <-- initialize router
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("");

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

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setLoading(true);
    setSuggestion("");

    const prompt = `User mood is ${mood}. Suggest a motivational tip, Quran quote, book, or doctor advice in concise way.`;

    const reply = await getGeminiReply(prompt);
    setSuggestion(reply);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/HomeScreen")}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🤖 AI Mood Suggestions</Text>

      <View style={styles.moodGrid}>
        {moods.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.moodButton, selectedMood === m ? styles.selectedMood : {}]}
            onPress={() => handleMoodSelect(m)}
          >
            <Text style={styles.moodText}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color="#1abc9c" style={{ marginTop: 30 }} />}

      {suggestion !== "" && !loading && (
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionTitle}>Suggestion for {selectedMood} mood:</Text>
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: "center", backgroundColor: "#b6e9acff" },
  backButton: { alignSelf: "flex-start", marginBottom: 10, padding: 8 },
  backText: { fontSize: 18, color: "#1abc9c", fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  moodGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", width: "100%" },
  moodButton: { width: "48%", paddingVertical: 16, borderRadius: 12, backgroundColor: "#16a085", marginBottom: 12, alignItems: "center" },
  selectedMood: { backgroundColor: "#1abc9cff" },
  moodText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  suggestionBox: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginTop: 20, width: "100%" },
  suggestionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  suggestionText: { fontSize: 15, color: "#333" },
});
