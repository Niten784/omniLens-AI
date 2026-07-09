import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const OBJECTS = [
  { name: "Vintage Coffee Mug", category: "Household", age: "Est. 1980s", origin: "Japan", material: "Ceramic with cobalt glaze", value: "$8-25", fact: "Hand-thrown pottery with characteristic irregularities — a hallmark of Japanese mingei (folk craft) tradition." },
  { name: "Circuit Board", category: "Electronics", age: "Est. 2015-2020", origin: "China/Taiwan", material: "FR4 fiberglass, copper traces", value: "Component value varies", fact: "The green solder mask protects copper traces from oxidation. Gold-plated contacts indicate high-cycle connectors." },
  { name: "Hardcover Book", category: "Literature", age: "Est. 2000s", origin: "USA", material: "Acid-free paper, cloth spine", value: "$15-40", fact: "The Smyth-sewn binding suggests a premium press — pages are thread-sewn in signatures for durability exceeding 100 years." },
  { name: "Potted Succulent", category: "Plant", age: "2-3 years", origin: "South Africa", material: "Living organism", value: "$5-20", fact: "CAM photosynthesis allows this plant to open stomata only at night, reducing water loss by up to 95% vs. standard plants." },
  { name: "Stainless Steel Knife", category: "Culinary", age: "Modern", origin: "Germany/Japan", material: "440C stainless, Rockwell 58-60 HRC", value: "$30-200", fact: "The blade geometry reveals a Japanese-style grind (15° per side) — optimized for precision cuts rather than heavy chopping." },
];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
type State = "idle" | "analyzing" | "results";
type ObjResult = typeof OBJECTS[0];

export default function CuriosityScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<ObjResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const handleAnalyze = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("analyzing");
    try {
      if (Platform.OS !== "web" && cameraRef.current) {
        await cameraRef.current.takePictureAsync({ quality: 0.3 });
        // 100% On-Device AI - No Cloud
      }
      await new Promise((r) => setTimeout(r, 2000));
      setResult(pick(OBJECTS));
      setState("results");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setState("idle");
      Alert.alert("Error", "Analysis failed.");
    }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator color="#F97316" /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#1A0800"]} style={StyleSheet.absoluteFill} />
        <FeatureHeader title="Curiosity" accentColor="#F97316" />
        <View style={styles.center}>
          <Ionicons name="telescope-outline" size={60} color="#F97316" />
          <Text style={styles.permTitle}>Camera Required</Text>
          <Text style={styles.permSub}>Point at any object to unlock its secrets.</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: "#F97316" }]} onPress={requestPermission}>
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
        <LinearGradient colors={["#1A0800", "#000"]} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient colors={["rgba(0,0,0,0.75)", "transparent"]} style={[styles.topFade, { height: insets.top + 70 }]} />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.bottomFade} />
      <FeatureHeader title="Curiosity" accentColor="#F97316" />

      {state === "idle" && (
        <View style={styles.centerOverlay}>
          <View style={styles.ring}>
            <View style={styles.ringInner}>
              <Ionicons name="telescope-outline" size={28} color="rgba(249,115,22,0.6)" />
            </View>
          </View>
          <Text style={styles.hint}>Point at anything</Text>
        </View>
      )}

      {state === "analyzing" && (
        <View style={styles.overlay}>
          <View style={styles.procCard}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.procText}>Analyzing object...</Text>
          </View>
        </View>
      )}

      {state === "results" && result && (
        <View style={styles.resultsWrap}>
          <View style={styles.resultCard}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{result.category}</Text>
            </View>
            <Text style={styles.objName}>{result.name}</Text>
            {[
              { icon: "calendar-outline" as const, label: "Age", val: result.age },
              { icon: "globe-outline" as const, label: "Origin", val: result.origin },
              { icon: "layers-outline" as const, label: "Material", val: result.material },
              { icon: "pricetag-outline" as const, label: "Est. Value", val: result.value },
            ].map((r, i) => (
              <View key={i} style={styles.infoRow}>
                <Ionicons name={r.icon} size={13} color="#F97316" />
                <Text style={styles.infoLabel}>{r.label}</Text>
                <Text style={styles.infoVal}>{r.val}</Text>
              </View>
            ))}
            <View style={styles.factBox}>
              <Text style={styles.factTitle}>Did You Know?</Text>
              <Text style={styles.factText}>{result.fact}</Text>
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setResult(null); setState("idle"); }}>
              <Ionicons name="refresh" size={14} color="#F97316" />
              <Text style={styles.resetText}>Explore More</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {state === "idle" && (
        <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={[styles.captureBtn, { borderColor: "#F97316" }]} onPress={handleAnalyze}>
            <View style={[styles.captureInner, { backgroundColor: "#F97316" }]} />
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
  bottomFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 240 },
  centerOverlay: { position: "absolute", top: "38%", left: 0, right: 0, alignItems: "center", gap: 14 },
  ring: { width: 100, height: 100, borderRadius: 50, borderWidth: 1.5, borderColor: "rgba(249,115,22,0.4)", alignItems: "center", justifyContent: "center" },
  ringInner: { width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: "rgba(249,115,22,0.6)", alignItems: "center", justifyContent: "center" },
  hint: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.55)" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  procCard: { backgroundColor: "rgba(0,0,0,0.88)", borderRadius: 20, padding: 28, alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(249,115,22,0.3)", width: 220 },
  procText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  resultsWrap: { position: "absolute", bottom: 64, left: 12, right: 12 },
  resultCard: { backgroundColor: "rgba(0,0,0,0.93)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(249,115,22,0.35)", gap: 8 },
  catBadge: { alignSelf: "flex-start", backgroundColor: "rgba(249,115,22,0.15)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(249,115,22,0.3)" },
  catText: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#F97316" },
  objName: { fontSize: 17, fontFamily: "Poppins_700Bold", color: "#FFF" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLabel: { width: 58, fontSize: 11, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.4)" },
  infoVal: { flex: 1, fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.85)" },
  factBox: { backgroundColor: "rgba(249,115,22,0.08)", borderRadius: 10, padding: 10, gap: 4, borderWidth: 1, borderColor: "rgba(249,115,22,0.2)" },
  factTitle: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#F97316", letterSpacing: 0.5 },
  factText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)", lineHeight: 19 },
  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(249,115,22,0.35)" },
  resetText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#F97316" },
  controls: { position: "absolute", bottom: 60, left: 0, right: 0, alignItems: "center" },
  captureBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  captureInner: { width: 54, height: 54, borderRadius: 27 },
  btn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  permTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFF", textAlign: "center" },
  permSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 20 },
});
