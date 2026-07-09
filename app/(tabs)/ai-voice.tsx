import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const RESPONSES = [
  "Your current weather shows 72°F, partly cloudy. Great day for outdoor activities.",
  "I've set a reminder for tomorrow at 9am. Is there anything else you need?",
  "The nearest coffee shop is 0.4 miles away — Coffee House on Main St, rated 4.8 stars.",
  "Based on your query, here are 3 key facts: [1] The Earth orbits the Sun in 365.25 days. [2] The Moon is 238,855 miles away. [3] Light takes 8 minutes to reach Earth from the Sun.",
  "Task completed. I've calculated that the optimal route saves you 12 minutes compared to alternatives.",
];

function WaveBar({ delay, active }: { delay: number; active: boolean }) {
  const anim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 4 + Math.random() * 28, duration: 300 + Math.random() * 200, useNativeDriver: false, delay }),
          Animated.timing(anim, { toValue: 4, duration: 300 + Math.random() * 200, useNativeDriver: false }),
        ])
      ).start();
    } else {
      anim.setValue(4);
    }
  }, [active]);

  return <Animated.View style={[styles.bar, { height: anim }]} />;
}

export default function AIVoiceScreen() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const BARS = 20;
  const delays = useRef(Array.from({ length: BARS }, (_, i) => i * 25)).current;

  const handleMicPress = async () => {
    if (recording) {
      setRecording(false);
      setProcessing(true);
      await new Promise((r) => setTimeout(r, 1800));
      setTranscript("What's the weather like today and where's the nearest coffee shop?");
      setResponse(RESPONSES[Math.floor(Math.random() * RESPONSES.length)]);
      setProcessing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setResponse(null);
      setTranscript(null);
      setRecording(true);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000", "#001A1A", "#0D0520"]} style={StyleSheet.absoluteFill} />
      <FeatureHeader title="AI Voice" accentColor="#14B8A6" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.micArea}>
          <View style={styles.waveform}>
            {delays.map((d, i) => <WaveBar key={i} delay={d} active={recording} />)}
          </View>

          <TouchableOpacity style={[styles.micBtn, recording && styles.micBtnActive]} onPress={handleMicPress}>
            <View style={[styles.micBtnInner, recording && styles.micBtnInnerActive]}>
              <Ionicons name={recording ? "stop" : "mic"} size={36} color="#FFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.micHint}>
            {recording ? "Listening... tap to stop" : processing ? "Processing..." : "Tap to speak"}
          </Text>
        </View>

        {transcript && (
          <View style={styles.transcriptCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="mic" size={14} color="#14B8A6" />
              <Text style={styles.cardLabel}>You said</Text>
            </View>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        )}

        {response && (
          <View style={[styles.transcriptCard, { borderColor: "rgba(20,184,166,0.35)" }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="eye" size={14} color="#9D4EDD" />
              <Text style={[styles.cardLabel, { color: "#9D4EDD" }]}>OmniLens AI</Text>
            </View>
            <Text style={styles.responseText}>{response}</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={() => { setResponse(null); setTranscript(null); }}>
              <Ionicons name="refresh" size={13} color="#14B8A6" />
              <Text style={styles.clearText}>New Query</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.noteBox}>
          <Ionicons name="lock-closed" size={12} color="#9D4EDD" />
          <Text style={styles.noteText}>Voice processed on-device. No audio recorded or stored.</Text>
        </View>
      </ScrollView>
      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 20, gap: 16, alignItems: "stretch" },
  micArea: { alignItems: "center", paddingVertical: 32, gap: 20 },
  waveform: { flexDirection: "row", alignItems: "center", height: 60, gap: 3 },
  bar: { width: 3, backgroundColor: "#14B8A6", borderRadius: 2 },
  micBtn: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "#14B8A6", alignItems: "center", justifyContent: "center" },
  micBtnActive: { borderColor: "#EF4444" },
  micBtnInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#14B8A6", alignItems: "center", justifyContent: "center" },
  micBtnInnerActive: { backgroundColor: "#EF4444" },
  micHint: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  transcriptCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(20,184,166,0.2)", gap: 8 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#14B8A6", letterSpacing: 0.5 },
  transcriptText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)", lineHeight: 22 },
  responseText: { fontSize: 15, fontFamily: "Poppins_400Regular", color: "#FFF", lineHeight: 24 },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", marginTop: 4 },
  clearText: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#14B8A6" },
  noteBox: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 8 },
  noteText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(157,78,221,0.7)", flex: 1 },
});
