


// DoctorAppointmentScreen.tsx
// DoctorAppointmentScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, { Event } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { db, auth } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  limit,
  doc,
  deleteDoc,
} from "firebase/firestore";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Ionicons } from "@expo/vector-icons";

type Doctor = {
  name: string;
  specialization: string;
};

const doctors: Doctor[] = [
  { name: "Dr. Ayesha", specialization: "Psychiatrist" },
  { name: "Dr. Rahman", specialization: "Clinical Psychologist" },
  { name: "Dr. Nadia", specialization: "Counselor" },
  { name: "Dr. Farhan", specialization: "Neurologist" },
];

// 1️⃣ Foreground notifications দেখানোর জন্য handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 2️⃣ Register device for notifications
async function registerForNotifications() {
  if (!Device.isDevice) {
    alert("Notifications only work on real devices!");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Permission not granted for notifications!");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  console.log("Notifications permission granted!");
}

// 3️⃣ Schedule a local notification 1 minute before the appointment
async function scheduleAppointmentNotification(
  appointmentDate: Date,
  doctorName: string
) {
  const now = new Date();
  const triggerTime = new Date(appointmentDate.getTime() - 60 * 1000); // 1 minute before
  if (triggerTime <= now) {
    console.log("Appointment too soon, notification skipped");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Appointment Reminder",
      body: `You have an appointment with ${doctorName} in 1 minute.`,
      sound: "default",
    },
    trigger: triggerTime,
  });

  console.log("Notification scheduled for", triggerTime.toLocaleString());
}

export default function DoctorAppointmentScreen() {
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(doctors[0]);
  const [suggestedDoctor, setSuggestedDoctor] = useState<Doctor>(doctors[0]);
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [appointments, setAppointments] = useState<any[]>([]);

  // Countdown logic states
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [showCountdownCard, setShowCountdownCard] = useState<boolean>(false);

  const user = auth.currentUser;

  // Format remaining time
  const formatTimeRemaining = (diff: number) => {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Countdown update
  useEffect(() => {
    if (!nextAppointment) return;

    const interval = setInterval(() => {
      const now = new Date();
      const apptDate = new Date(nextAppointment.datetime);
      const diff = apptDate.getTime() - now.getTime();

      if (diff <= 0) {
        setShowCountdownCard(false);
        clearInterval(interval);
      } else {
        setTimeRemaining(formatTimeRemaining(diff));
        setShowCountdownCard(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextAppointment]);

  // Load saved appointments & remove past automatically
  const loadAppointments = async () => {
    if (!user) return;

    const apptCollection = collection(db, "users", user.uid, "appointments");
    const q = query(apptCollection, orderBy("datetime", "asc"));
    const snapshot = await getDocs(q);

    const list: any[] = [];
    const now = new Date();

    snapshot.forEach((docItem) => {
      const data = docItem.data();
      const apptDate = new Date(data.datetime);
      if (apptDate >= now) {
        list.push({ id: docItem.id, ...data });
      } else {
        deleteDoc(doc(db, "users", user.uid, "appointments", docItem.id)).catch(
          (err) => console.error("Error deleting past appointment:", err.message)
        );
      }
    });

    setAppointments(list);
    setNextAppointment(list[0] || null); // earliest upcoming appointment
  };

  // Suggest doctor based on mood
  const loadSuggestedDoctor = async () => {
    if (!user) return;
    const moodRef = collection(db, "users", user.uid, "moodTracking");
    const q = query(moodRef, orderBy("createdAt", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const latestMood = snapshot.docs[0].data();
      const score: number = latestMood.totalScore;

      let docSuggestion = doctors[0];
      if (score <= 11) {
        docSuggestion = doctors.find((d) => d.specialization === "Psychiatrist")!;
      } else if (score <= 21) {
        docSuggestion = doctors.find(
          (d) => d.specialization === "Clinical Psychologist"
        )!;
      } else {
        docSuggestion = doctors.find((d) => d.specialization === "Counselor")!;
      }

      setSuggestedDoctor(docSuggestion);
      setSelectedDoctor(docSuggestion);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const moodRef = collection(db, "users", auth.currentUser.uid, "moodTracking");
    const q = query(moodRef, orderBy("createdAt", "desc"), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latestMood = snapshot.docs[0].data();
        const score: number = latestMood.totalScore;

        let docSuggestion = doctors[0];
        if (score <= 11) {
          docSuggestion = doctors.find(
            (d) => d.specialization === "Psychiatrist"
          )!;
        } else if (score <= 21) {
          docSuggestion = doctors.find(
            (d) => d.specialization === "Clinical Psychologist"
          )!;
        } else {
          docSuggestion = doctors.find((d) => d.specialization === "Counselor")!;
        }

        setSuggestedDoctor(docSuggestion);
        setSelectedDoctor(docSuggestion);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    registerForNotifications();
    loadAppointments();
    loadSuggestedDoctor();
  }, []);

  const onChange = (_event: Event, selectedValue?: Date) => {
    if (!selectedValue) {
      setShowPicker(false);
      return;
    }

    if (pickerMode === "date") {
      const newDate = new Date(selectedValue);
      setDate(newDate);
      setPickerMode("time");
      setShowPicker(true);
    } else {
      if (date) {
        const newDate = new Date(date);
        newDate.setHours(selectedValue.getHours());
        newDate.setMinutes(selectedValue.getMinutes());
        setDate(newDate);
      }
      setShowPicker(false);
      setPickerMode("date");
    }
  };

  const handleAppointment = async () => {
    if (!date || !user) {
      Alert.alert("Error", "Please select a date & time");
      return;
    }
    try {
      await addDoc(collection(db, "users", user.uid, "appointments"), {
        doctor: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        datetime: date.toISOString(),
      });

      // ✅ Schedule notification 1 min before
      scheduleAppointmentNotification(date, selectedDoctor.name);

      Alert.alert(
        "Appointment Confirmed",
        `${selectedDoctor.name} (${selectedDoctor.specialization})\n${date.toLocaleString()}`
      );

      setDate(null);
      loadAppointments();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const AppointmentCard: React.FC<{ item: any }> = ({ item }) => {
    const [remainingTime, setRemainingTime] = useState<string>("");

    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        const apptDate = new Date(item.datetime);
        const diff = apptDate.getTime() - now.getTime();

        if (diff <= 0) {
          setRemainingTime("Appointment passed");
          clearInterval(interval);
        } else {
          setRemainingTime(formatTimeRemaining(diff));
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [item.datetime]);

    const handleDismiss = async () => {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "appointments", item.id));
      loadAppointments();
    };

    return (
      <View style={styles.appointmentCard}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={styles.appointmentDoctor}>
              {item.doctor} ({item.specialization})
            </Text>
            <Text style={styles.appointmentTime}>
              {new Date(item.datetime).toLocaleString()}
            </Text>
            <Text style={{ color: "#e67e22", marginTop: 4 }}>{remainingTime}</Text>
          </View>
          <TouchableOpacity onPress={handleDismiss}>
            <Ionicons name="close-circle" size={28} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book a Doctor Appointment</Text>

      <Text style={styles.label}>
        Suggested Doctor Based on your latest mood: {suggestedDoctor.name} (
        {suggestedDoctor.specialization})
      </Text>

      <Text style={styles.label}>Select Doctor</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDoctor}
          onValueChange={(itemValue) => setSelectedDoctor(itemValue)}
        >
          {doctors.map((doc) => (
            <Picker.Item
              key={doc.name}
              label={`${doc.name} (${doc.specialization})`}
              value={doc}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, { backgroundColor: "#8e44ad" }]}
        onPress={() =>
          router.push({
            pathname: "./DoctorProfileScreen",
            params: {
              doctorName: selectedDoctor.name,
              specialization: selectedDoctor.specialization,
            },
          })
        }
      >
        <Text style={styles.confirmButtonText}>View Doctor Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => {
          setPickerMode("date");
          setShowPicker(true);
        }}
      >
        <Text style={styles.dateButtonText}>
          {date ? date.toLocaleString() : "Pick Date & Time"}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode={pickerMode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
        />
      )}

      <TouchableOpacity style={styles.confirmButton} onPress={handleAppointment}>
        <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/HomeScreen")}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Saved Appointments</Text>
      {appointments.length === 0 ? (
        <Text style={styles.noAppointments}>No appointments yet.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => <AppointmentCard item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#766c7aea" },
  title: { fontSize: 24, fontWeight: "bold", color: "#020d18ff", marginBottom: 20, textAlign: "center" },
  subtitle: { fontSize: 20, fontWeight: "bold", color: "#020d18ff", marginTop: 10, marginBottom: 10, textAlign: "center" },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#020d18ff" },
  pickerContainer: { borderWidth: 1, borderColor: "#d1d5db96", borderRadius: 12, overflow: "hidden", backgroundColor: "#ffffff73", marginBottom: 15 },
  dateButton: { paddingVertical: 14, borderRadius: 12, backgroundColor: "#3498db", alignItems: "center", marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dateButtonText: { color: "#fff", fontWeight: "bold" },
  confirmButton: { paddingVertical: 14, borderRadius: 12, backgroundColor: "#1abc9c", alignItems: "center", marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 5, elevation: 4 },
  confirmButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  backButton: { paddingVertical: 12, borderRadius: 12, backgroundColor: "#e74c3c", alignItems: "center", marginTop: 10, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  backButtonText: { color: "#fff", fontWeight: "bold" },
  noAppointments: { textAlign: "center", color: "#020d18ff", marginTop: 10 },
  appointmentCard: { backgroundColor: "#fffffff6", padding: 16, borderRadius: 12, marginVertical: 6, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  appointmentDoctor: { fontWeight: "bold", fontSize: 16, color: "#2c3e50" },
  appointmentTime: { color: "#7f8c8d", marginTop: 4 },
});
