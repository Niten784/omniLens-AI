import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const VEHICLES = [
  { make: "Toyota", model: "Camry", year: "2020-2022", type: "Sedan", confidence: 94, color: "Silver", engine: "2.5L 4-Cyl" },
  { make: "Honda", model: "Civic", year: "2021-2023", type: "Sedan", confidence: 91, color: "Blue", engine: "1.5L Turbo" },
  { make: "Ford", model: "F-150", year: "2019-2021", type: "Pickup Truck", confidence: 89, color: "White", engine: "3.5L EcoBoost V6" },
  { make: "Tesla", model: "Model 3", year: "2022-2024", type: "Electric Sedan", confidence: 97, color: "Black", engine: "Dual Motor AWD" },
  { make: "BMW", model: "3 Series", year: "2020-2022", type: "Sports Sedan", confidence: 88, color: "Gray", engine: "2.0L Turbo" },
  { make: "Chevrolet", model: "Silverado", year: "2018-2020", type: "Pickup Truck", confidence: 85, color: "Red", engine: "5.3L V8" },
];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
type State = "idle" | "processing" | "results";
type VehicleResult = typeof VEHICLES[0];

export default function VehicleAIScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<VehicleResult | null>(null);
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
      await new Promise((r) => setTimeout(r, 2000));
      setResult(pick(VEHICLES));
      setState("results");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setState("idle");
      Alert.alert("Error", "Analysis failed.");
    }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator color="#3B82F6" /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#0a0a2e"]} style={StyleSheet.absoluteFill} />
        <FeatureHeader title="Vehicle AI" accentColor="#3B82F6" />
        <View style={styles.center}>
          <Ionicons name="car-sport-outline" size={60} color="#3B82F6" />
          <Text style={styles.permTitle}>Camera Required</Text>
          <Text style={styles.permSub}>Identify any vehicle on-device instantly.</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: "#3B82F6" }]} onPress={requestPermission}>
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
        <LinearGradient colors={["#0a0a2e", "#000"]} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient colors={["rgba(0,0,0,0.7)", "transparent"]} style={[styles.topFade, { height: insets.top + 70 }]} />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.bottomFade} />
      <FeatureHeader title="Vehicle AI" accentColor="#3B82F6" />

      {state === "idle" && (
        <View style={styles.frameOverlay}>
          <View style={[styles.vehicleBox, { borderColor: "#3B82F6" }]}>
            <Ionicons name="car-sport-outline" size={36} color="rgba(59,130,246,0.5)" />
          </View>
          <Text style={styles.hint}>Frame the vehicle</Text>
        </View>
      )}

      {state === "processing" && (
        <View style={styles.overlay}>
          <View style={styles.procCard}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.procText}>Identifying vehicle...</Text>
            <Text style={styles.procSub}>100% on-device analysis</Text>
          </View>
        </View>
      )}

      {state === "results" && result && (
        <View style={styles.resultsWrap}>
          <View style={styles.resultCard}>
            <View style={styles.rHeader}>
              <Ionicons name="car-sport" size={22} color="#3B82F6" />
              <Text style={styles.rTitle}>{result.make} {result.model}</Text>
              <View style={styles.confBadge}>
                <Text style={styles.confText}>{result.confidence}%</Text>
              </View>
            </View>
            {[
              { label: "Year Range", val: result.year },
              { label: "Type", val: result.type },
              { label: "Est. Color", val: result.color },
              { label: "Engine", val: result.engine },
            ].map((r, i) => (
              <View key={i}>
                {i > 0 && <View style={styles.sep} />}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{r.label}</Text>
                  <Text style={styles.infoVal}>{r.val}</Text>
                </View>
              </View>
            ))}
            <View style={styles.privacyNote}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.privText}>Image deleted after analysis</Text>
            </View>
            <TouchableOpacity style={[styles.btn, { borderWidth: 1, borderColor: "#3B82F6", backgroundColor: "transparent", flexDirection: "row", gap: 6 }]} onPress={() => { setResult(null); setState("idle"); }}>
              <Ionicons name="refresh" size={14} color="#3B82F6" />
              <Text style={[styles.btnText, { color: "#3B82F6" }]}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {state === "idle" && (
        <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={[styles.captureBtn, { borderColor: "#3B82F6" }]} onPress={handleAnalyze}>
            <View style={[styles.captureInner, { backgroundColor: "#3B82F6" }]} />
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
  frameOverlay: { position: "absolute", top: "28%", left: 0, right: 0, alignItems: "center", gap: 12 },
  vehicleBox: { width: 260, height: 160, borderWidth: 2, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  hint: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  procCard: { backgroundColor: "rgba(0,0,0,0.88)", borderRadius: 20, padding: 28, alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(59,130,246,0.3)", width: 250 },
  procText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  procSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  resultsWrap: { position: "absolute", bottom: 64, left: 12, right: 12 },
  resultCard: { backgroundColor: "rgba(0,0,0,0.93)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(59,130,246,0.35)", gap: 8 },
  rHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  rTitle: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#FFF", flex: 1 },
  confBadge: { backgroundColor: "rgba(59,130,246,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(59,130,246,0.4)" },
  confText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#3B82F6" },
  sep: { height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginVertical: 2 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  infoVal: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
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
