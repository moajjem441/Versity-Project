



import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from './firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

export default function VisualMood() {
  const router = useRouter();
  const [pastScores, setPastScores] = useState<{ totalScore: number; date: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPastScores = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const q = query(
        collection(db, 'users', auth.currentUser.uid, 'moodTracking'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const scores: { totalScore: number; date: string }[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.createdAt?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                     || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        scores.push({ totalScore: data.totalScore, date });
      });

      setPastScores(scores.slice(0, 30).reverse());
    } catch (err) {
      console.log("Error fetching mood data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastScores();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/HomeScreen')}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📊 Your Mood Progress</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1abc9c" style={{ marginTop: 50 }} />
      ) : pastScores.length > 0 ? (
        <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 10 }}>
          <View style={styles.chartCard}>
            <LineChart
              data={{
                labels: pastScores.map(s => s.date),
                datasets: [{ data: pastScores.map(s => s.totalScore) }],
              }}
              width={Math.max(screenWidth, pastScores.length * 60)}
              height={260}
              yAxisSuffix=" pts"
              fromZero
              chartConfig={{
                backgroundGradientFrom: "#84fab0",
                backgroundGradientTo: "#8fd3f4",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: "6", strokeWidth: "2", stroke: "#1abc9c" },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
            <Text style={styles.noteText}>Higher score = Better mood</Text>
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.noDataText}>No mood data found. Track your mood first!</Text>
      )}

      {/* Optional Refresh */}
      <TouchableOpacity onPress={fetchPastScores} style={{ marginTop: 20, backgroundColor: '#1abc9c', padding: 12, borderRadius: 12 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: 'center', backgroundColor: '#b6e9acff' },
  backButton: { alignSelf: 'flex-start', marginBottom: 15, backgroundColor: '#fff', padding: 10, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
  backText: { fontSize: 18, color: '#1abc9c', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  chartCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 5, alignItems: 'center' },
  noteText: { fontSize: 17, color: '#555', marginTop: 8 },
  noDataText: { fontSize: 16, marginTop: 20, color: '#555' },
});
