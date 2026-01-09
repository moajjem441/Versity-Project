
//Mood Tracking


import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from './firebaseConfig';
import { useTheme } from './_ThemeContext';   // ✅ Theme context import




type AnswerOption = { label: string; score: number };

const questions: { question: string; options: AnswerOption[] }[] = [
  {
    question: "Overall Mood",
    options: [
      { label: "😄 Happy", score: 5 },
      { label: "😐 Neutral", score: 3 },
      { label: "😢 Sad", score: 1.1 },
      { label: "😡 Angry", score: 1 },
      { label: "😰 Anxious", score: 2 },
      { label: "😴 Tired", score: 2.1 },
    ],
  },
  {
    question: "Energy Level",
    options: [
      { label: "High", score: 5 },
      { label: "Medium", score: 3 },
      { label: "Low", score: 1 },
    ],
  },
  {
    question: "Sleep Quality",
    options: [
      { label: "Good", score: 5 },
      { label: "Average", score: 3 },
      { label: "Poor", score: 1 },
    ],
  },
  {
    question: "Stress Level",
    options: [
      { label: "None", score: 5 },
      { label: "A little", score: 3 },
      { label: "A lot", score: 1 },
    ],
  },
  {
    question: "Social Interaction",
    options: [
      { label: "Better", score: 5 },
      { label: "No change", score: 3 },
      { label: "Worse", score: 1 },
    ],
  },
  {
    question: "Gratitude / Reflection",
    options: [
      { label: "Yes", score: 5 },
      { label: "Not sure", score: 3 },
      { label: "No", score: 1 },
    ],
  },
];

const moodCategories = [
  {
    minScore: 27,
    maxScore: 30,
    category: "Very Positive 😊",
    suggestion: "Motivational tips, skill-building, gratitude journaling",
    book: "The Power of Now",
    quranSura: "Al-Fajr (89)",
    quranVerse: "Indeed, with hardship comes ease.",
    motivational: "Keep spreading your happiness!",
    doctorAdvice: "No doctor visit needed. Maintain healthy habits."
  },
  {
    minScore: 22,
    maxScore: 26,
    category: "Positive 🙂",
    suggestion: "Light fun activities, mini-games, journaling prompts",
    book: "Mindfulness in Plain English",
    quranSura: "Al-Inshirah (94)",
    quranVerse: "So verily, with the hardship, there is relief.",
    motivational: "Enjoy your day, engage in fun activities!",
    doctorAdvice: "Optional: Short check-in with doctor if stress persists."
  },
  {
    minScore: 17,
    maxScore: 21,
    category: "Neutral 😐",
    suggestion: "Calming exercises, mindfulness, reflective prompts",
    book: "Feeling Good",
    quranSura: "Al-Baqarah (2:286)",
    quranVerse: "Allah does not burden a soul beyond that it can bear.",
    motivational: "Practice mindfulness and stay reflective.",
    doctorAdvice: "Consider consulting a counselor if mood does not improve."
  },
  {
    minScore: 12,
    maxScore: 16,
    category: "Negative 😟",
    suggestion: "Breathing exercises, stress relief games, relaxing music",
    book: "The Relaxation Response",
    quranSura: "Al-Inshirah (94)",
    quranVerse: "Did We not expand for you your breast?",
    motivational: "Take deep breaths and unwind.",
    doctorAdvice: "Strongly consider visiting a mental health professional."
  },
  {
    minScore: 6,
    maxScore: 11,
    category: "Very Negative 😢",
    suggestion: "Calming games, mood booster content, encouragement messages",
    book: "The Happiness Trap",
    quranSura: "Al-Asr (103)",
    quranVerse: "By time, indeed, mankind is in loss.",
    motivational: "Engage in soothing activities and reach out for support.",
    doctorAdvice: "Immediate consultation with a doctor or counselor is recommended."
  },
];

export default function MoodTrackingScreen() {
  const navigation = useNavigation();
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [totalScore, setTotalScore] = useState<number | null>(null);

  // Reset state whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      setAnswers(Array(questions.length).fill(-1));
      setTotalScore(null);
    }, [])
  );

  const handleAnswer = (qIndex: number, score: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[qIndex] = score;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(-1)) {
      alert("Please answer all questions.");
      return;
    }
    const sumScore = answers.reduce((acc, val) => acc + val, 0);
    setTotalScore(sumScore);

    // Save to Firebase
    if (auth.currentUser) {
      try {
        await addDoc(
          collection(db, 'users', auth.currentUser.uid, 'moodTracking'),
          {
            answers,
            totalScore: sumScore,
            createdAt: serverTimestamp(),
          }
        );
      } catch (err) {
        console.error(err);
        alert("Failed to save mood score.");
      }
    }
  };

  const moodResult = totalScore !== null
    ? moodCategories.find(m => totalScore >= m.minScore && totalScore <= m.maxScore)
    : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeScreen')}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🧩 Track Your Mood</Text>

      {questions.map((q, idx) => (
        <View key={idx} style={styles.questionContainer}>
          <Text style={styles.questionText}>{q.question}</Text>
          <View style={styles.optionsContainer}>
            {q.options.map(opt => (
              <TouchableOpacity
                key={opt.label}
                style={[
                  styles.optionButton,
                  answers[idx] === opt.score && styles.selectedOptionButton,
                ]}
                onPress={() => handleAnswer(idx, opt.score)}
              >
                <Text style={[
                  styles.optionText,
                  answers[idx] === opt.score && styles.selectedOptionText
                ]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      {totalScore !== null && moodResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultText}>Total Score: {totalScore} / 30</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(totalScore / 30) * 100}%` }]} />
          </View>
          <Text style={styles.resultText}>Mood: {moodResult.category}</Text>
          <Text style={styles.resultText}>📚 Book: {moodResult.book}</Text>
          <Text style={styles.resultText}>📖 Quran: {moodResult.quranSura} - {moodResult.quranVerse}</Text>
          <Text style={styles.resultText}>💡 Motivation: {moodResult.motivational}</Text>
          <Text style={styles.resultText}>👨‍⚕️ Doctor Advice: {moodResult.doctorAdvice}</Text>
          <Text style={styles.resultText}>Suggestion: {moodResult.suggestion}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#cfb1ceff', alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 10 },
  backText: { fontSize: 20, color: '#04362cff', fontWeight: 'bold' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' },
  questionContainer: { width: '100%', marginBottom: 15 },
  questionText: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  optionButton: { backgroundColor: '#ffffff', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, margin: 5, borderWidth: 1, borderColor: '#ccc' },
  selectedOptionButton: { backgroundColor: '#1abc9c', borderColor: '#16a085' },
  optionText: { fontSize: 14, color: '#2c3e50' },
  selectedOptionText: { color: '#fff', fontWeight: 'bold' },
  submitButton: { marginTop: 20, backgroundColor: '#1abc9c', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultCard: { marginTop: 25, width: '100%', backgroundColor: '#ffffff70', padding: 15, borderRadius: 12, alignItems: 'center' },
  resultText: { fontSize: 19, marginBottom: 8, fontWeight: '600', textAlign: 'center' },
  progressBarBackground: { width: '100%', height: 12, backgroundColor: '#ddd', borderRadius: 6, marginVertical: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#1abc9c', borderRadius: 6 },
});







