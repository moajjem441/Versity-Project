

import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Mobile-friendly YouTube player
let YoutubePlayer: any = null;
if (Platform.OS !== "web") {
  // @ts-ignore
  YoutubePlayer = require("react-native-youtube-iframe").default;
}

const videos = [
  { id: 1, name: "📢 Part Of Adhan", videoId: "mCswUNqeZC0" },
  { id: 2, name: "🕌 Dua-kunut", videoId: "bIkULBUKFQ0" },
  { id: 3, name: "🕋 Takbeer", videoId: "4Zcp7dewydo" },
  { id: 4, name: "🕋 Ruqyah 💫", videoId: "hNhkRaTYPSM" },
  { id: 5, name: "🕋 Ayatul-Kursi", videoId: "eIrRj6vDddU" }
];

export default function QuranRecitationScreen() {
  const navigation = useNavigation();
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const screenWidth = Dimensions.get("window").width;

  const closeVideo = () => setCurrentVideo(null);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      closeVideo();
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("HomeScreen")}>
        <Text style={styles.backText}>⬅️ </Text>
      </TouchableOpacity>

      <Text style={styles.title}>📖 Qur’an Videos</Text>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.videoButton} onPress={() => setCurrentVideo(item.videoId)}>
            <Text style={styles.videoText}>▶ {item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {currentVideo && (
        <View style={styles.videoContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeVideo}>
            <Text style={styles.closeText}>⬅ Close</Text>
          </TouchableOpacity>

          {Platform.OS === "web" ? (
            <iframe
              width={screenWidth * 0.9}
              height={300}
              src={`https://www.youtube.com/embed/${currentVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            YoutubePlayer && (
              <YoutubePlayer
                height={300}
                width={screenWidth * 0.9}
                play={true}
                videoId={currentVideo}
                onChangeState={onStateChange}
              />
            )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 50, backgroundColor: "#E8F5E9" },
  backButton: { position: "absolute", top: 50, left: 20, padding: 10, backgroundColor: "#B2DFDB", borderRadius: 10, zIndex: 1 },
  backText: { fontSize: 16, fontWeight: "bold", color: "#004D40" },
  title: { fontSize: 26, fontWeight: "bold", color: "#00695C", marginBottom: 20 },
  videoButton: { backgroundColor: "#1976D2", padding: 15, marginVertical: 8, width: 280, borderRadius: 15, alignItems: "center" },
  videoText: { color: "white", fontSize: 18, fontWeight: "600" },
  videoContainer: { position: "absolute", top: 100, left: 0, right: 0, alignItems: "center", padding: 20, backgroundColor: "#E8F5E9" },
  closeButton: { marginBottom: 10, padding: 8, backgroundColor: "#B2DFDB", borderRadius: 10 },
  closeText: { fontSize: 16, fontWeight: "bold", color: "#004D40" },
});
