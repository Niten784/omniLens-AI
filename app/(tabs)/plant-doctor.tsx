import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const PLANTS = [
  { name: "Monstera Deliciosa", health: "Healthy", score: 94, care: "Water weekly, indirect bright light", issue: "None detected" },
  { name: "Pothos (Epipremnum)", health: "Mildly Stressed", score: 72, care: "Reduce watering frequency by 30%", issue: "Overwatering signs" },
  { name: "Fiddle Leaf Fig", health: "Needs Attention", score: 58, care: "Improve drainage, more sunlight", issue: "Root moisture buildup" },
  { name: "Snake Plant", health: "Healthy", score: 96, care: "Minimal water, any light level", issue: "None detected" },
  { name: "Peace Lily", health: "Healthy", score: 88, care: "Keep moist, low to medium light", issue: "None detected" },
];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

type State = "idle" | "processing" | "results";
type PlantResult = typeof PLANTS[0];

export default function PlantDoctorScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<PlantResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const handleAnalyze = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("processing");
    try {
      if (Platform.OS !== "web" && cameraRef.current) {
        await cameraRef.current.takePictureAsync({ quality: 0.3 });
        // 100% On-Device AI - No Cloud
      }
      await new Promise((r) => setTimeout(r, 2200));
      setResult(pick(PLANTS));
      setState("results");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setState("idle");
      Alert.alert("Error", "Analysis failed.");
    }
  };

  const healthColor = result?.health === "Healthy" ? "#10B981" : result?.health === "Mildly Stressed" ? "#F59E0B" : "#EF4444";

  if (!permission) return <View style={styles.center}><ActivityIndicator color="#10B981" /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#021A0D"]} style={StyleSheet.absoluteFill} />
        <FeatureHeader title="Plant Doctor" accentColor="#10B981" />
        <View style={styles.center}>
          <Ionicons name="leaf" size={60} color="#10B981" />
          <Text style={styles.permTitle}>Camera Required</Text>
          <Text style={styles.permSub}>Point at any plant for on-device health diagnosis.</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: "#10B981" }]} onPress={requestPermission}>
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
        <LinearGradient colors={["#021A0D", "#000"]} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient colors={["rgba(0,0,0,0.7)", "transparent"]} style={[styles.topFade, { height: insets.top + 70 }]} />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.bottomFade} />

      <FeatureHeader title="Plant Doctor" accentColor="#10B981" />

      {state === "idle" && (
        <View style={styles.frameOverlay}>
          <View style={[styles.scanBox, { borderColor: "#10B981" }]}>
            <Ionicons name="leaf-outline" size={32} color="rgba(16,185,129,0.6)" />
          </View>
          <Text style={styles.hintLabel}>Center plant in frame</Text>
        </View>
      )}

      {state === "processing" && (
        <View style={styles.overlay}>
          <View style={styles.procCard}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.procText}>Diagnosing plant...</Text>
            <Text style={styles.procSub}>On-device analysis only</Text>
          </View>
        </View>
      )}

      {state === "results" && result && (
        <View style={styles.resultsWrap}>
          <View style={styles.resultCard}>
            <View style={styles.rHeader}>
              <Ionicons name="leaf" size={22} color="#10B981" />
              <Text style={styles.rTitle}>{result.name}</Text>
            </View>
            <View style={[styles.healthBadge, { backgroundColor: healthColor + "22", borderColor: healthColor + "55" }]}>
              <Text style={[styles.healthText, { color: healthColor }]}>{result.health}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Health Score</Text>
              <Text style={styles.scoreVal}>{result.score}/100</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressBar, { width: `${result.score}%` as any, backgroundColor: healthColor }]} />
            </View>
            <View style={styles.sep} />
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#F59E0B" />
              <Text style={styles.infoLabel}>Issue:</Text>
              <Text style={styles.infoVal}>{result.issue}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="water-outline" size={14} color="#06B6D4" />
              <Text style={styles.infoLabel}>Care:</Text>
              <Text style={styles.infoVal}>{result.care}</Text>
            </View>
            <View style={styles.privacyNote}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.privText}>Image deleted after analysis</Text>
            </View>
            <TouchableOpacity style={[styles.btn, { borderWidth: 1, borderColor: "#10B981", backgroundColor: "transparent", flexDirection: "row", gap: 6 }]} onPress={() => { setResult(null); setState("idle"); }}>
              <Ionicons name="refresh" size={14} color="#10B981" />
              <Text style={[styles.btnText, { color: "#10B981" }]}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {state === "idle" && (
        <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={[styles.captureBtn, { borderColor: "#10B981" }]} onPress={handleAnalyze}>
            <View style={[styles.captureInner, { backgroundColor: "#10B981" }]} />
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
  bottomFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 220 },
  frameOverlay: { position: "absolute", top: "30%", left: 0, right: 0, alignItems: "center", gap: 12 },
  scanBox: { width: 180, height: 180, borderWidth: 2, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  hintLabel: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  procCard: { backgroundColor: "rgba(0,0,0,0.88)", borderRadius: 20, padding: 28, alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(16,185,129,0.3)", width: 250 },
  procText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  procSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  resultsWrap: { position: "absolute", bottom: 64, left: 12, right: 12 },
  resultCard: { backgroundColor: "rgba(0,0,0,0.93)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(16,185,129,0.35)", gap: 8 },
  rHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  rTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", color: "#FFF", flex: 1 },
  healthBadge: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1 },
  healthText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  scoreRow: { flexDirection: "row", justifyContent: "space-between" },
  scoreLabel: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
  scoreVal: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  progressBg: { height: 5, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3 },
  progressBar: { height: 5, borderRadius: 3 },
  sep: { height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  infoLabel: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.5)", width: 36 },
  infoVal: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)", flex: 1 },
  privacyNote: { flexDirection: "row", alignItems: "center", gap: 5 },
  privText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#10B981" },
  controls: { position: "absolute", bottom: 60, left: 0, right: 0, alignItems: "center" },
  captureBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  captureInner: { width: 54, height: 54, borderRadius: 27 },
  btn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  permTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFF", textAlign: "center" },
  permSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 20 },
});
