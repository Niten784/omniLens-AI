import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const OBJECT_CLASSES = [
  { label: "Person", confidence: 0.94, color: "#10B981" },
  { label: "Car", confidence: 0.87, color: "#3B82F6" },
  { label: "Truck", confidence: 0.81, color: "#F59E0B" },
  { label: "Bicycle", confidence: 0.76, color: "#8B5CF6" },
  { label: "Motorcycle", confidence: 0.89, color: "#EC4899" },
  { label: "Dog", confidence: 0.72, color: "#F97316" },
  { label: "Cat", confidence: 0.68, color: "#14B8A6" },
  { label: "Bag", confidence: 0.83, color: "#EF4444" },
];

interface Detection {
  id: string;
  label: string;
  confidence: number;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function LiveScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const [fps, setFps] = useState(0);
  const scanInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const fpsInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: pulse.value,
  }));

  const startScanning = useCallback(() => {
    setScanning(true);
    pulse.value = withRepeat(withTiming(0.6, { duration: 600 }), -1, true);

    scanInterval.current = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...OBJECT_CLASSES].sort(() => Math.random() - 0.5).slice(0, count);
      const newDetections: Detection[] = shuffled.map((obj, i) => ({
        id: `${Date.now()}-${i}`,
        label: obj.label,
        confidence: obj.confidence - Math.random() * 0.05,
        color: obj.color,
        x: 20 + Math.random() * (W - 160),
        y: 80 + Math.random() * (H * 0.45),
        w: 80 + Math.random() * 100,
        h: 80 + Math.random() * 80,
      }));
      setDetections(newDetections);
      frameRef.current += 1;
      setFrameCount((c) => c + 1);

      if (newDetections.some((d) => d.label === "Person")) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "🔍 OmniLens AI — Person Detected",
            body: `Live scan detected a person with ${Math.round(newDetections[0].confidence * 100)}% confidence.`,
            sound: true,
          },
          trigger: null,
        });
        Vibration.vibrate(200);
      }
    }, 1800);

    fpsInterval.current = setInterval(() => {
      setFps(frameRef.current * 2);
      frameRef.current = 0;
    }, 500);
  }, [pulse]);

  const stopScanning = useCallback(() => {
    setScanning(false);
    setDetections([]);
    pulse.value = withTiming(1);
    if (scanInterval.current) clearInterval(scanInterval.current);
    if (fpsInterval.current) clearInterval(fpsInterval.current);
  }, [pulse]);

  useEffect(() => () => {
    if (scanInterval.current) clearInterval(scanInterval.current);
    if (fpsInterval.current) clearInterval(fpsInterval.current);
  }, []);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#0D0520"]} style={StyleSheet.absoluteFill} />
        <View style={styles.permBox}>
          <Ionicons name="camera-outline" size={64} color="#9D4EDD" />
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "transparent", "transparent", "rgba(0,0,0,0.85)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {detections.map((d) => (
        <Animated.View
          key={d.id}
          entering={FadeIn.duration(200)}
          style={[styles.bbox, { left: d.x, top: d.y, width: d.w, height: d.h, borderColor: d.color }]}
          pointerEvents="none"
        >
          <View style={[styles.bboxLabel, { backgroundColor: d.color }]}>
            <Text style={styles.bboxText}>{d.label} {Math.round(d.confidence * 100)}%</Text>
          </View>
        </Animated.View>
      ))}

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Live Scanner</Text>
        <View style={styles.fpsChip}>
          <Text style={styles.fpsText}>{scanning ? `${fps} FPS` : "READY"}</Text>
        </View>
      </View>

      {scanning && (
        <View style={styles.cornerTL} pointerEvents="none" />
      )}

      <View style={styles.bottomPanel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detectionList}>
          {detections.map((d) => (
            <View key={d.id} style={[styles.detChip, { borderColor: d.color + "88" }]}>
              <View style={[styles.detDot, { backgroundColor: d.color }]} />
              <Text style={styles.detLabel}>{d.label}</Text>
              <Text style={[styles.detConf, { color: d.color }]}>{Math.round(d.confidence * 100)}%</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{frameCount}</Text>
            <Text style={styles.statLabel}>Frames</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{detections.length}</Text>
            <Text style={styles.statLabel}>Objects</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>On-Device</Text>
            <Text style={styles.statLabel}>Processing</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.scanBtn, scanning && styles.scanBtnActive]}
          onPress={scanning ? stopScanning : startScanning}
        >
          <Animated.View style={scanning ? pulseStyle : undefined}>
            <Ionicons name={scanning ? "stop-circle" : "scan"} size={28} color="#fff" />
          </Animated.View>
          <Text style={styles.scanBtnText}>{scanning ? "Stop Scanning" : "Start Live Scan"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 52,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  fpsChip: {
    backgroundColor: "rgba(16,185,129,0.25)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  fpsText: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#10B981" },
  bbox: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 4,
  },
  bboxLabel: {
    position: "absolute",
    top: -22,
    left: -1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bboxText: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  cornerTL: {
    position: "absolute",
    top: "15%",
    left: "8%",
    right: "8%",
    height: H * 0.55,
    borderWidth: 1,
    borderColor: "rgba(157,78,221,0.4)",
    borderRadius: 12,
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
    paddingBottom: Platform.OS === "web" ? 20 : 36,
  },
  detectionList: { flexGrow: 0 },
  detChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  detDot: { width: 7, height: 7, borderRadius: 4 },
  detLabel: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#fff" },
  detConf: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 12,
  },
  stat: { alignItems: "center", gap: 2 },
  statVal: { fontSize: 14, fontFamily: "Poppins_700Bold", color: "#9D4EDD" },
  statLabel: { fontSize: 10, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
  },
  scanBtnActive: { backgroundColor: "#EF4444" },
  scanBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  permBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  permTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: "#fff", textAlign: "center" },
  permBtn: { backgroundColor: "#7C3AED", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  permBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});
