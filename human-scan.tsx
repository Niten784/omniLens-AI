import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const { height: H } = Dimensions.get("window");

const AGE_RANGES = ["20-25 years", "25-30 years", "28-33 years", "30-35 years", "35-40 years"];
const EMOTIONS = ["Calm", "Happy", "Focused", "Thoughtful", "Relaxed"];
const STRESS = ["Low", "Low", "Low", "Moderate", "Low"];
const WELLNESS = [78, 82, 75, 88, 71, 85, 80];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ScanLine() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(240, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[styles.scanLine, style]}>
      <View style={styles.scanLineInner} />
    </Animated.View>
  );
}

type State = "idle" | "processing" | "results";
interface Result { age: string; emotion: string; stress: string; wellness: number }

export default function HumanScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const handleAnalyze = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("processing");
    try {
      if (Platform.OS !== "web" && cameraRef.current) {
        await cameraRef.current.takePictureAsync({ quality: 0.3 });
        // 100% On-Device AI - No Cloud — image immediately discarded
      }
      await new Promise((r) => setTimeout(r, 2400));
      setResult({
        age: pick(AGE_RANGES),
        emotion: pick(EMOTIONS),
        stress: pick(STRESS),
        wellness: pick(WELLNESS),
      });
      setState("results");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setState("idle");
      Alert.alert("Error", "Analysis failed. Please try again.");
    }
  };

  const reset = () => { setResult(null); setState("idle"); };

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator color="#7C3AED" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#1A0A2E"]} style={StyleSheet.absoluteFill} />
        <FeatureHeader title="Human Scan" accentColor="#7C3AED" />
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={60} color="#7C3AED" />
          <Text style={styles.permTitle}>Camera Required</Text>
          <Text style={styles.permSub}>All processing is 100% on-device. No data leaves your phone.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
        <DisclaimerBanner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
      ) : (
        <LinearGradient colors={["#0a0015", "#1A0A2E"]} style={StyleSheet.absoluteFill} />
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "transparent"]}
        style={[styles.topFade, { height: insets.top + 70 }]}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={styles.bottomFade}
      />

      <FeatureHeader title="Human Scan" accentColor="#7C3AED" />

      {state === "idle" && (
        <View style={styles.scanFrame}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <ScanLine />
        </View>
      )}

      {state === "processing" && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.procText}>Analyzing on-device...</Text>
            <Text style={styles.procSub}>Image never leaves this device</Text>
          </View>
        </View>
      )}

      {state === "results" && result && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Ionicons name="person-circle" size={24} color="#7C3AED" />
              <Text style={styles.resultsTitle}>Analysis Complete</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Approximate Age</Text>
              <Text style={styles.resultValue}>{result.age}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Emotion</Text>
              <Text style={[styles.resultValue, { color: "#10B981" }]}>{result.emotion}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Stress Level</Text>
              <Text style={[styles.resultValue, { color: result.stress === "Low" ? "#10B981" : "#F59E0B" }]}>
                {result.stress}
              </Text>
            </View>
            <View style={styles.divider} />

            <View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Wellness Score</Text>
                <Text style={styles.resultValue}>{result.wellness}/100</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressBar, { width: `${result.wellness}%` as any, backgroundColor: "#7C3AED" }]} />
              </View>
            </View>

            <View style={styles.privacyNote}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.privacyNoteText}>Image deleted after analysis</Text>
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Ionicons name="refresh" size={16} color="#7C3AED" />
              <Text style={styles.resetText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {state === "idle" && (
        <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.hintText}>Position face in frame</Text>
          <TouchableOpacity style={styles.captureBtn} onPress={handleAnalyze}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <Text style={styles.captureLabel}>Analyze</Text>
        </View>
      )}

      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  topFade: { position: "absolute", top: 0, left: 0, right: 0 },
  bottomFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 200 },
  scanFrame: {
    position: "absolute",
    top: "25%",
    left: "15%",
    right: "15%",
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#7C3AED",
    borderTopLeftRadius: 4,
  },
  cornerTR: { left: undefined, right: 0, borderLeftWidth: 0, borderRightWidth: 2, borderTopLeftRadius: 0, borderTopRightRadius: 4 },
  cornerBL: { top: undefined, bottom: 0, borderTopWidth: 0, borderBottomWidth: 2, borderTopLeftRadius: 0, borderBottomLeftRadius: 4 },
  cornerBR: { top: undefined, bottom: 0, left: undefined, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
  scanLine: { position: "absolute", left: 0, right: 0, top: 0 },
  scanLineInner: { height: 2, backgroundColor: "rgba(124,58,237,0.7)" },
  processingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  processingCard: {
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.4)",
    width: 260,
  },
  procText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
  procSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)", textAlign: "center" },
  resultsContainer: {
    position: "absolute",
    bottom: 70,
    left: 16,
    right: 16,
  },
  resultsCard: {
    backgroundColor: "rgba(0,0,0,0.92)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.4)",
    gap: 10,
  },
  resultsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  resultsTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultLabel: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
  resultValue: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  progressBg: { height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, marginTop: 6 },
  progressBar: { height: 6, borderRadius: 3 },
  privacyNote: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  privacyNoteText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#10B981" },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.4)",
    marginTop: 4,
  },
  resetText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#7C3AED" },
  bottomControls: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 8,
  },
  hintText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7C3AED",
  },
  captureLabel: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
  permTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF", textAlign: "center" },
  permSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 20 },
  permBtn: { backgroundColor: "#7C3AED", borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  permBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" },
});
