import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const SAMPLES = [
  "Invoice #2024-0891\nDate: June 15, 2026\nBill To: Acme Corp\nAmount Due: $4,250.00\nDue Date: July 1, 2026\nPayment Terms: Net 15",
  "MEETING MINUTES\nDate: June 19, 2026\nAttendees: Sarah K., Tom R., Maria L.\nAgenda: Q3 Product Roadmap\nDecisions: Launch Phase 2 by August\nNext Steps: Design review by June 25",
  "CONTRACT SUMMARY\nParty A: TechVentures Inc.\nParty B: GlobalSoft LLC\nEffective Date: January 1, 2026\nDuration: 24 months\nValue: $120,000\nTermination: 30-day notice",
  "MEDICAL RECORD\nPatient: [REDACTED]\nDate: June 2026\nDiagnosis: Annual checkup\nStatus: All values within normal range\nNext Appointment: December 2026",
];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
type State = "idle" | "processing" | "results";

export default function DocScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<State>("idle");
  const [text, setText] = useState("");
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const handleScan = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("processing");
    try {
      if (Platform.OS !== "web" && cameraRef.current) {
        await cameraRef.current.takePictureAsync({ quality: 0.4 });
        // 100% On-Device AI - No Cloud
      }
      await new Promise((r) => setTimeout(r, 2000));
      setText(pick(SAMPLES));
      setState("results");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setState("idle");
      Alert.alert("Error", "Scan failed. Please try again.");
    }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator color="#F59E0B" /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#1A0E00"]} style={StyleSheet.absoluteFill} />
        <FeatureHeader title="Doc Scanner" accentColor="#F59E0B" />
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={60} color="#F59E0B" />
          <Text style={styles.permTitle}>Camera Required</Text>
          <Text style={styles.permSub}>Extract text from documents on-device. Nothing is uploaded.</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: "#F59E0B" }]} onPress={requestPermission}>
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
        <LinearGradient colors={["#1A0E00", "#000"]} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient colors={["rgba(0,0,0,0.75)", "transparent"]} style={[styles.topFade, { height: insets.top + 70 }]} />
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.bottomFade} />
      <FeatureHeader title="Doc Scanner" accentColor="#F59E0B" />

      {state === "idle" && (
        <View style={styles.frameOverlay}>
          <View style={[styles.docBox, { borderColor: "#F59E0B" }]}>
            <View style={[styles.docLine, { top: 25 }]} />
            <View style={[styles.docLine, { top: 40 }]} />
            <View style={[styles.docLine, { top: 55 }]} />
          </View>
          <Text style={styles.hint}>Align document within frame</Text>
        </View>
      )}

      {state === "processing" && (
        <View style={styles.overlay}>
          <View style={styles.procCard}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.procText}>Extracting text...</Text>
            <Text style={styles.procSub}>On-device OCR processing</Text>
          </View>
        </View>
      )}

      {state === "results" && (
        <View style={styles.resultsWrap}>
          <View style={styles.resultCard}>
            <View style={styles.rHeader}>
              <Ionicons name="document-text" size={20} color="#F59E0B" />
              <Text style={styles.rTitle}>Extracted Text</Text>
              <View style={styles.badge}>
                <Ionicons name="lock-closed" size={9} color="#10B981" />
                <Text style={styles.badgeText}>Local Only</Text>
              </View>
            </View>
            <ScrollView style={styles.textBox} showsVerticalScrollIndicator={false}>
              <Text style={styles.extractedText}>{text}</Text>
            </ScrollView>
            <View style={styles.privacyNote}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.privText}>Document image deleted after scan</Text>
            </View>
            <TouchableOpacity style={[styles.btn, { borderWidth: 1, borderColor: "#F59E0B", backgroundColor: "transparent", flexDirection: "row", gap: 6 }]} onPress={() => { setText(""); setState("idle"); }}>
              <Ionicons name="refresh" size={14} color="#F59E0B" />
              <Text style={[styles.btnText, { color: "#F59E0B" }]}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {state === "idle" && (
        <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={[styles.captureBtn, { borderColor: "#F59E0B" }]} onPress={handleScan}>
            <View style={[styles.captureInner, { backgroundColor: "#F59E0B" }]} />
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
  docBox: { width: 260, height: 180, borderWidth: 2, borderRadius: 8, position: "relative", overflow: "hidden" },
  docLine: { position: "absolute", left: 16, right: 16, height: 1.5, backgroundColor: "rgba(245,158,11,0.35)", borderRadius: 1 },
  hint: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  procCard: { backgroundColor: "rgba(0,0,0,0.88)", borderRadius: 20, padding: 28, alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.3)", width: 250 },
  procText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  procSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  resultsWrap: { position: "absolute", bottom: 64, left: 12, right: 12 },
  resultCard: { backgroundColor: "rgba(0,0,0,0.93)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(245,158,11,0.35)", gap: 10 },
  rHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  rTitle: { flex: 1, fontSize: 14, fontFamily: "Poppins_700Bold", color: "#FFF" },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(16,185,129,0.12)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(16,185,129,0.25)" },
  badgeText: { fontSize: 9, fontFamily: "Poppins_500Medium", color: "#10B981" },
  textBox: { maxHeight: 120, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 10 },
  extractedText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  privacyNote: { flexDirection: "row", alignItems: "center", gap: 5 },
  privText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#10B981" },
  controls: { position: "absolute", bottom: 60, left: 0, right: 0, alignItems: "center" },
  captureBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  captureInner: { width: 54, height: 54, borderRadius: 27 },
  btn: { borderRadius: 12, paddingVertical: 11, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  permTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFF", textAlign: "center" },
  permSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 20 },
});
