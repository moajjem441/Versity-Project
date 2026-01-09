


import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "./firebaseConfig";
import { addDoc, collection, query, orderBy, getDocs, serverTimestamp, Timestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";

interface JournalEntry {
  id?: string;
  text: string;
  createdAt: Timestamp | null;
}

export default function JournalingScreen() {
  const navigation = useNavigation();
  const [entry, setEntry] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      if (auth.currentUser) {
        try {
          const q = query(
            collection(db, "users", auth.currentUser.uid, "journals"),
            orderBy("createdAt", "desc")
          );
          const snap = await getDocs(q);
          const entries: JournalEntry[] = snap.docs.map(doc => ({
            id: doc.id,
            text: doc.data().text as string,
            createdAt: doc.data().createdAt || null
          }));
          setSavedEntries(entries);
        } catch (err) {
          console.error(err);
          Alert.alert("Error", "Failed to load journal entries.");
        }
      }
      setLoading(false);
    };
    fetchEntries();
  }, []);

  const handleSave = async () => {
    if (!entry.trim()) {
      Alert.alert("Empty Entry", "Write something before saving.");
      return;
    }

    if (auth.currentUser) {
      try {
        if (editingId) {
          // Edit existing
          const docRef = doc(db, "users", auth.currentUser.uid, "journals", editingId);
          await updateDoc(docRef, { text: entry });
          setSavedEntries(prev =>
            prev.map(e => (e.id === editingId ? { ...e, text: entry } : e))
          );
          setEditingId(null);
        } else {
          // New entry
          const docRef = await addDoc(collection(db, "users", auth.currentUser.uid, "journals"), {
            text: entry,
            createdAt: serverTimestamp()
          });
          const newEntry: JournalEntry = { id: docRef.id, text: entry, createdAt: Timestamp.now() };
          setSavedEntries([newEntry, ...savedEntries]);
        }
        setEntry("");
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to save entry to Firebase.");
      }
    } else {
      Alert.alert("Not Logged In", "Login to save journal online.");
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (auth.currentUser) {
            try {
              await deleteDoc(doc(db, "users", auth.currentUser.uid, "journals", id));
              setSavedEntries(prev => prev.filter(e => e.id !== id));
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete entry.");
            }
          }
        }
      }
    ]);
  };

  const handleEdit = (e: JournalEntry) => {
    setEntry(e.text);
    setEditingId(e.id || null);
  };

  const formatDate = (ts: Timestamp | null) => {
    if (!ts) return "";
    const date = ts.toDate();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("HomeScreen")}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📝 Journaling</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write your thoughts here..."
          placeholderTextColor="#888"
          value={entry}
          onChangeText={setEntry}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>{editingId ? "✏️ Update" : "💾 Save"}</Text>
        </TouchableOpacity>
      </View>

      {!loading && savedEntries.length === 0 && (
        <Text style={styles.noEntryText}>No entries yet. Start journaling today! 📝</Text>
      )}

      {!loading && savedEntries.length > 0 && (
        <View style={styles.entriesContainer}>
          {savedEntries.map((e, idx) => (
            <View key={idx} style={styles.entryCard}>
              <Text style={styles.entryText}>{e.text}</Text>
              {e.createdAt && <Text style={styles.entryDate}>{formatDate(e.createdAt)}</Text>}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(e)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(e.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#185f5350", alignItems: "center" },
  backButton: { alignSelf: "flex-start", marginBottom: 15, padding: 10 },
  backText: { fontSize: 20, color: "#0f705dff", fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "bold", color: "#1A374D", marginBottom: 20 },
  inputContainer: { width: "100%", marginBottom: 20 },
  input: {
    width: "100%",
    height: 150,          // fixed height for proper display in APK
    padding: 16,          // reduce padding for better view
    borderRadius: 15,
    backgroundColor: "#fffffff6",
    fontSize: 19,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: "#1ABC9C",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  noEntryText: { marginTop: 20, fontSize: 16, color: "#555", textAlign: "center" },
  entriesContainer: { width: "100%" },
  entryCard: {
    backgroundColor: "#ffffffff",
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },
  entryText: { fontSize: 16, color: "#1A374D" },
  entryDate: { fontSize: 12, color: "#888", marginTop: 6, textAlign: "right" },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  editButton: { marginRight: 10, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#FFD700", borderRadius: 8 },
  deleteButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#FF4C4C", borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
