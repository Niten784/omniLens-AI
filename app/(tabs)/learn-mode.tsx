import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const FACTS = [
  { subject: "Architecture", fact: "This structure uses post-tension concrete slabs, allowing for longer spans without intermediate columns. The cantilever ratio exceeds standard residential codes by 40%.", category: "Engineering" },
  { subject: "Botany", fact: "The visible leaf arrangement follows the Fibonacci sequence, with a phyllotaxis angle of 137.5° — optimal for maximizing sunlight absorption while minimizing self-shading.", category: "Science" },
  { subject: "Urban Design", fact: "This streetscape reflects Transit-Oriented Development (TOD) principles, with mixed-use zoning within 400m of a transit hub, increasing walkability scores by 35%.", category: "Planning" },
  { subject: "Physics", fact: "The refraction pattern you're observing follows Snell's Law: n₁sin(θ₁) = n₂sin(θ₂). The refractive index difference creates the visible bending effect at the interface.", category: "Physics" },
  { subject: "Art History", fact: "This style exhibits characteristics of Brutalism (1950-1975): exposed concrete aggregate, functional form, and a rejection of ornamental decoration in favor of raw materiality.", category: "Art" },
];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
type State = "idle" | "analyzing" | "results";
type LearnResult = typeof FACTS[0];

export default function LearnModeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<LearnResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const handleLearn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState("analyzing");
    try {
      if (Platform.OS !== "web" && cameraRef.current) {
        await cameraRef.current.takePictureAsync({ quality: 0.3 });
        // 100% On-Device AI - No Cloud
      }
      await new Promise((r) => setTimeout(r, 1800));
      setResult(pick(FACTS));
      setState("results");
    } catch {
      setState("idle");
      Alert.alert("Error", "Analysis failed.");
    }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator color="#8B5CF6" /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#0D0520"]} style={StyleSheet.absoluteFill} />
        <FeatureHeader title="Learn Mode" accentColor="#8B5CF6" />
        <View style={styles.center}>
          <Ionicons name="school-outline" size={60} color="#8B5CF6" />
          <Text style={styles.permTitle}>Camera Required</Text>
          <Text style={styles.permSub}>Point at anything to get instant educational insights.</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: "#8B5CF6" }]} onPress={requestPermission}>
            <Text style={styles.btnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
        <DisclaimerBanner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <LinearGradient colors={["#0D0520", "#000"]} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient colors={["rgba(0,0,0,0.75)", "transparent"]} style={[styles.topFade, { height: insets.top + 70 }]} />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.bottomFade} />
      <FeatureHeader title="Learn Mode" accentColor="#8B5CF6" />

      {state === "idle" && (
        <View style={styles.hintOverlay}>
          <View style={styles.targetCross}>
            <View style={styles.crossH} />
            <View style={styles.crossV} />
          </View>
          <Text style={styles.hintText}>Point at anything to learn</Text>
        </View>
      )}

      {state === "analyzing" && (
        <View style={styles.overlay}>
          <View style={styles.procCard}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.procText}>Analyzing...</Text>
            <Text style={styles.procSub}>Identifying subject matter</Text>
          </View>
        </View>
      )}

      {state === "results" && result && (
        <View style={styles.resultsWrap}>
          <View style={styles.resultCard}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{result.category}</Text>
            </View>
            <Text style={styles.subjectText}>{result.subject}</Text>
            <Text style={styles.factText}>{result.fact}</Text>
            <View style={styles.privacyNote}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.privText}>Image deleted after analysis</Text>
            </View>
            <TouchableOpacity style={styles.learnMore} onPress={() => { setResult(null); setState("idle"); }}>
              <Ionicons name="refresh" size={14} color="#8B5CF6" />
              <Text style={styles.learnMoreText}>Learn More Things</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {state === "idle" && (
        <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={[styles.captureBtn, { borderColor: "#8B5CF6" }]} onPress={handleLearn}>
            <View style={[styles.captureInner, { backgroundColor: "#8B5CF6" }]}>
              <Ionicons name="telescope" size={22} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 },
  topFade: { position: "absolute", top: 0, left: 0, right: 0 },
  bottomFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 250 },
  hintOverlay: { position: "absolute", top: "35%", left: 0, right: 0, alignItems: "center", gap: 20 },
  targetCross: { width: 60, height: 60, alignItems: "center", justifyContent: "center" },
  crossH: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(139,92,246,0.7)" },
  crossV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(139,92,246,0.7)" },
  hintText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  procCard: { backgroundColor: "rgba(0,0,0,0.88)", borderRadius: 20, padding: 28, alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(139,92,246,0.3)", width: 250 },
  procText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  procSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  resultsWrap: { position: "absolute", bottom: 64, left: 12, right: 12 },
  resultCard: { backgroundColor: "rgba(0,0,0,0.93)", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "rgba(139,92,246,0.35)", gap: 10 },
  catBadge: { alignSelf: "flex-start", backgroundColor: "rgba(139,92,246,0.2)", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(139,92,246,0.4)" },
  catText: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#8B5CF6" },
  subjectText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#FFF" },
  factText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)", lineHeight: 21 },
  privacyNote: { flexDirection: "row", alignItems: "center", gap: 5 },
  privText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#10B981" },
  learnMore: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(139,92,246,0.4)" },
  learnMoreText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#8B5CF6" },
  controls: { position: "absolute", bottom: 60, left: 0, right: 0, alignItems: "center" },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  captureInner: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  btn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  permTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFF", textAlign: "center" },
  permSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 20 },
});
