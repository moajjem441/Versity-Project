// DoctorProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { db, auth } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Doctor = {
  name: string;
  specialization: string;
  education: string;
  availableDays: string;
  availableTimes: string;
};

const doctors: Doctor[] = [
  { name: "Dr. Ayesha", specialization: "Psychiatrist", education: "MBBS, MD", availableDays: "Mon, Wed, Fri", availableTimes: "10:00 AM - 2:00 PM" },
  { name: "Dr. Rahman", specialization: "Clinical Psychologist", education: "PhD", availableDays: "Tue, Thu", availableTimes: "1:00 PM - 4:00 PM" },
  { name: "Dr. Nadia", specialization: "Counselor", education: "MA in Psychology", availableDays: "Mon-Fri", availableTimes: "9:00 AM - 5:00 PM" },
  { name: "Dr. Farhan", specialization: "Neurologist", education: "MBBS, MD Neurology", availableDays: "Wed, Sat", availableTimes: "11:00 AM - 3:00 PM" },
];

export default function DoctorProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patientId, setPatientId] = useState<string>("");
  const [currentProblem, setCurrentProblem] = useState<string>("");
  const [previousProblem, setPreviousProblem] = useState<{ problem: string; timestamp: string } | null>(null);

  // Load current and previous problem
  useEffect(() => {
    const loadProblems = async () => {
      if (!user || !selectedDoctor || !patientId) {
        setPreviousProblem(null);
        setCurrentProblem("");
        return;
      }
      try {
        const docRef = doc(db, "users", user.uid, "doctorProfiles", `${selectedDoctor.name}_${patientId}`);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          setPreviousProblem(null);
          setCurrentProblem("");
          return;
        }
        const data = docSnap.data();
        const history: { problem: string; timestamp: string }[] = data?.history ?? [];

        const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const todayEntry = history.find(h => h.timestamp.split("T")[0] === todayStr);
        const previousEntries = history.filter(h => h.timestamp.split("T")[0] !== todayStr);

        setCurrentProblem(todayEntry?.problem ?? "");
        if (previousEntries.length > 0) {
          const lastPrevious = previousEntries[previousEntries.length - 1];
          setPreviousProblem(lastPrevious);
        } else {
          setPreviousProblem(null);
        }
      } catch (err: any) {
        console.error("Error loading doctor profile:", err.message);
      }
    };
    loadProblems();
  }, [selectedDoctor, patientId, user]);

  const handleSaveProfile = async () => {
    if (!user || !selectedDoctor) {
      Alert.alert("Error", "User not logged in or doctor not selected");
      return;
    }
    if (!patientId || !currentProblem) {
      Alert.alert("Missing info", "Please fill out all fields.");
      return;
    }
    try {
      const docRef = doc(db, "users", user.uid, "doctorProfiles", `${selectedDoctor.name}_${patientId}`);
      const docSnap = await getDoc(docRef);
      let history: { problem: string; timestamp: string }[] = [];
      if (docSnap.exists()) {
        const data = docSnap.data();
        history = data?.history ?? [];
      }

      const timestamp = new Date().toISOString();
      const todayStr = timestamp.split("T")[0];

      // Check if today's entry exists, replace it
      const existingIndex = history.findIndex(h => h.timestamp.split("T")[0] === todayStr);
      if (existingIndex >= 0) {
        history[existingIndex].problem = currentProblem;
        history[existingIndex].timestamp = timestamp;
      } else {
        history.push({ problem: currentProblem, timestamp });
      }

      await setDoc(docRef, {
        patientId,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        history,
        lastUpdated: timestamp,
      });

      Alert.alert("Saved", "Profile info saved successfully!");
      // Update previous problem
      const previousEntries = history.filter(h => h.timestamp.split("T")[0] !== todayStr);
      if (previousEntries.length > 0) {
        setPreviousProblem(previousEntries[previousEntries.length - 1]);
      }
      setCurrentProblem(""); // clear input
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleBack = () => {
    if (selectedDoctor) {
      setSelectedDoctor(null);
    } else {
      router.push("/DoctorAppointmentScreen");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!selectedDoctor ? (
        <>
          <Text style={styles.title}>Select a Doctor</Text>
          {doctors.map((doc) => (
            <TouchableOpacity key={doc.name} style={styles.doctorCard} onPress={() => setSelectedDoctor(doc)}>
              <Text style={styles.cardName}>{doc.name}</Text>
              <Text style={styles.cardSpecialization}>{doc.specialization}</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <>
          <Text style={styles.title}>{selectedDoctor.name}</Text>
          <Text style={styles.subText}>{selectedDoctor.specialization}</Text>
          <Text style={styles.detailText}>Education: {selectedDoctor.education}</Text>
          <Text style={styles.detailText}>Available Days: {selectedDoctor.availableDays}</Text>
          <Text style={styles.detailText}>Available Times: {selectedDoctor.availableTimes}</Text>

          <Text style={styles.label}>Patient ID (Set once)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your patient ID"
            value={patientId}
            onChangeText={setPatientId}
          />

          <Text style={styles.label}>Current Problem</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Type your current problem here..."
            value={currentProblem}
            onChangeText={setCurrentProblem}
            multiline
          />

          {previousProblem ? (
            <View style={styles.previousBox}>
              <Text style={styles.prevTitle}>Previous Problem:</Text>
              <Text style={styles.prevText}>{previousProblem.problem}</Text>
              <Text style={styles.prevText}>Date: {new Date(previousProblem.timestamp).toLocaleString()}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Current Problem</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>{selectedDoctor ? "Back to Doctor List" : "Back to Appointments"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#766c7aea", flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: "#020d18ff", textAlign: "center", marginBottom: 10 },
  subText: { fontSize: 16, textAlign: "center", color: "#020d18ff", marginBottom: 10 },
  detailText: { fontSize: 15, color: "#020d18ff", marginBottom: 5, marginLeft: 5 },
  label: { fontSize: 16, fontWeight: "600", color: "#020d18ff", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#d1d5db96", borderRadius: 12, padding: 10, marginTop: 6, backgroundColor: "#ffffff73" },
  previousBox: { backgroundColor: "#ecf0f1", borderRadius: 12, padding: 12, marginTop: 10 },
  prevTitle: { fontWeight: "bold", marginBottom: 4, color: "#020d18ff" },
  prevText: { color: "#020d18ff" },
  saveButton: { paddingVertical: 14, borderRadius: 12, backgroundColor: "#1abc9c", alignItems: "center", marginTop: 20, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 5, elevation: 4 },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  backButton: { paddingVertical: 12, borderRadius: 12, backgroundColor: "#e74c3c", alignItems: "center", marginTop: 15, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  backButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  doctorCard: { backgroundColor: "#ffffff73", padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardName: { fontSize: 18, fontWeight: "bold", color: "#020d18ff" },
  cardSpecialization: { fontSize: 14, color: "#020d18ff", marginTop: 2 },
});
