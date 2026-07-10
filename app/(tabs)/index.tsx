import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { analyzeVisionFrame, type VisionTag } from "@/lib/api";

const { width: W, height: H } = Dimensions.get("window");
const CAPTURE_INTERVAL_MS = 3500;

interface Category {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const CATEGORIES: Category[] = [
  { id: "all", label: "All", icon: "sparkles-outline", color: "#9D4EDD" },
  { id: "vehicle", label: "Vehicle", icon: "car-sport-outline", color: "#3B82F6" },
  { id: "person", label: "Person", icon: "person-outline", color: "#10B981" },
  { id: "plant", label: "Plant", icon: "leaf-outline", color: "#22C55E" },
  { id: "document", label: "Document/Text", icon: "document-text-outline", color: "#F59E0B" },
  { id: "animal", label: "Animal", icon: "paw-outline", color: "#F97316" },
  { id: "currency", label: "Currency", icon: "cash-outline", color: "#14B8A6" },
  { id: "landmark", label: "Landmark", icon: "location-outline", color: "#EC4899" },
];

const CATEGORY_COLORS: Record<string, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.color }),
  {} as Record<string, string>,
);

function colorForCategory(category: string): string {
  return CATEGORY_COLORS[category?.toLowerCase()] ?? "#9D4EDD";
}

export default function LiveCameraHub() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [searchText, setSearchText] = useState("");
  const [activeFocus, setActiveFocus] = useState<string | null>(null);
  const [summary, setSummary] = useState("Point your camera at anything to begin.");
  const [tags, setTags] = useState<VisionTag[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(true);

  const cameraRef = useRef<CameraView>(null);
  const inFlight = useRef(false);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.55, { duration: 700 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const runAnalysis = useCallback(async () => {
    if (inFlight.current || !cameraRef.current) return;
    inFlight.current = true;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.35,
        skipProcessing: true,
      });
      if (!photo?.base64) return;
      setAnalyzing(true);
      const result = await analyzeVisionFrame(photo.base64, activeFocus);
      setSummary(result.summary || "Nothing conclusive detected.");
      setTags(result.tags ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
      inFlight.current = false;
    }
  }, [activeFocus]);

  useEffect(() => {
    if (!live || !permission?.granted) return;
    runAnalysis();
    const id = setInterval(runAnalysis, CAPTURE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [live, permission?.granted, runAnalysis]);

  const handleCategoryPress = (cat: Category) => {
    if (cat.id === "all") {
      setActiveFocus(null);
      setSearchText("");
    } else {
      setActiveFocus(cat.label);
      setSearchText(cat.label);
    }
  };

  const handleSubmitSearch = () => {
    const trimmed = searchText.trim();
    setActiveFocus(trimmed.length > 0 ? trimmed : null);
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000000", "#0D0520", "#1A0A2E"]} style={StyleSheet.absoluteFill} />
        <View style={styles.permBox}>
          <Ionicons name="eye" size={72} color="#9D4EDD" />
          <Text style={styles.appName}>OmniLens AI</Text>
          <Text style={styles.permTitle}>Live camera access needed to analyze everything around you in real time.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      <LinearGradient
        colors={["rgba(0,0,0,0.75)", "transparent", "transparent", "rgba(0,0,0,0.9)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Top search bar */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anything... e.g. vehicle, plant, text"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(""); setActiveFocus(null); }}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/home")}>
          <Ionicons name="grid-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Side category rail */}
      <ScrollView
        style={[styles.sideRail, { top: insets.top + 64 }]}
        contentContainerStyle={{ gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => {
          const isActive = (activeFocus ?? "All").toLowerCase() === cat.label.toLowerCase() || (cat.id === "all" && !activeFocus);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.railIcon,
                { borderColor: isActive ? cat.color : "rgba(255,255,255,0.15)" },
                isActive && { backgroundColor: cat.color + "33" },
              ]}
              onPress={() => handleCategoryPress(cat)}
            >
              <Ionicons name={cat.icon} size={18} color={isActive ? cat.color : "#fff"} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Live indicator */}
      <View style={[styles.liveChip, { top: insets.top + 64 }]}>
        <Animated.View style={[styles.liveDot, pulseStyle]} />
        <Text style={styles.liveText}>{analyzing ? "ANALYZING" : "LIVE"}</Text>
      </View>

      {activeFocus && (
        <View style={[styles.focusChip, { top: insets.top + 100 }]}>
          <Text style={styles.focusText}>Focused on: {activeFocus}</Text>
        </View>
      )}

      {/* Bottom results panel */}
      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <View style={styles.summaryRow}>
          {analyzing ? <ActivityIndicator size="small" color="#9D4EDD" /> : <Ionicons name="eye-outline" size={16} color="#9D4EDD" />}
          <Text style={styles.summaryText} numberOfLines={2}>{error ?? summary}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagList}>
          {tags.length === 0 && !analyzing && (
            <Text style={styles.emptyText}>No matches yet — hold steady on the subject.</Text>
          )}
          {tags.map((t, i) => (
            <Animated.View
              key={`${t.label}-${i}`}
              entering={FadeInDown.delay(i * 40)}
              style={[styles.tagChip, { borderColor: colorForCategory(t.category) + "88" }]}
            >
              <View style={[styles.tagDot, { backgroundColor: colorForCategory(t.category) }]} />
              <View>
                <Text style={styles.tagLabel}>{t.label}</Text>
                <Text style={styles.tagDetail} numberOfLines={2}>{t.detail}</Text>
              </View>
              <Text style={[styles.tagConf, { color: colorForCategory(t.category) }]}>{Math.round(t.confidence * 100)}%</Text>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.flipBtn}
            onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          >
            <Ionicons name="camera-reverse-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.scanBtn, live && styles.scanBtnActive]}
            onPress={() => setLive((v) => !v)}
          >
            <Ionicons name={live ? "pause" : "play"} size={20} color="#fff" />
            <Text style={styles.scanBtnText}>{live ? "Pause" : "Resume"} Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.flipBtn} onPress={runAnalysis} disabled={analyzing}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: {
    position: "absolute",
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(20,0,40,0.7)",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderWidth: 1,
    borderColor: "rgba(157,78,221,0.4)",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(20,0,40,0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(157,78,221,0.4)",
  },
  sideRail: {
    position: "absolute",
    right: 12,
    maxHeight: H * 0.5,
  },
  railIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  liveChip: {
    position: "absolute",
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.5)",
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10B981" },
  liveText: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#10B981", letterSpacing: 0.5 },
  focusChip: {
    position: "absolute",
    left: 12,
    backgroundColor: "rgba(124,58,237,0.35)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(157,78,221,0.6)",
  },
  focusText: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#fff" },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(5,0,15,0.92)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryText: { flex: 1, color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Poppins_400Regular" },
  tagList: { flexGrow: 0, minHeight: 56 },
  emptyText: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Poppins_400Regular", alignSelf: "center" },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    maxWidth: 220,
  },
  tagDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  tagLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  tagDetail: { fontSize: 10, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", maxWidth: 150 },
  tagConf: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginLeft: "auto" },
  controlsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7C3AED",
    borderRadius: 24,
    paddingVertical: 14,
  },
  scanBtnActive: { backgroundColor: "#7C3AED" },
  scanBtnText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  permBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  appName: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#fff" },
  permTitle: { fontSize: 15, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.7)", textAlign: "center" },
  permBtn: { backgroundColor: "#7C3AED", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  permBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});
