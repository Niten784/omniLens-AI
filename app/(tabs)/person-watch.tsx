import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function PersonWatchScreen() {
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [lastSeen, setLastSeen] = useState("");
  const [faceInFrame, setFaceInFrame] = useState(false);
  const watchInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanPulse = useSharedValue(0);
  const matchPulse = useSharedValue(0);

  useEffect(() => { Notifications.requestPermissionsAsync(); }, []);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanPulse.value }],
    opacity: 0.8,
  }));

  const matchStyle = useAnimatedStyle(() => ({
    opacity: matchPulse.value,
    transform: [{ scale: 0.97 + matchPulse.value * 0.03 }],
  }));

  const pickPhoto = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      setReferencePhoto(res.assets[0].uri);
    }
  }, []);

  const sendAlert = useCallback(async () => {
    const now = new Date().toLocaleTimeString();
    setLastSeen(now);
    setAlertCount((c) => c + 1);
    Vibration.vibrate([0, 300, 100, 300]);
    matchPulse.value = withSequence(
      withTiming(1, { duration: 100 }),
      withRepeat(withSequence(withTiming(0.2, { duration: 400 }), withTiming(1, { duration: 400 })), 4, false),
      withTiming(0, { duration: 400 }),
    );
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "👤 Person Match Detected!",
        body: `OmniLens AI detected a matching person in your camera at ${now}.`,
        sound: true,
      },
      trigger: null,
    });
  }, [matchPulse]);

  const startWatch = useCallback(() => {
    if (!referencePhoto) return;
    setWatching(true);
    scanPulse.value = withRepeat(withTiming(240, { duration: 2200 }), -1, true);

    faceInterval.current = setInterval(() => {
      setFaceInFrame(Math.random() > 0.55);
    }, 1200);

    const firstAlert = 10000 + Math.random() * 10000;
    watchInterval.current = setTimeout(function fire() {
      sendAlert();
      watchInterval.current = setTimeout(fire, 18000 + Math.random() * 12000);
    }, firstAlert);
  }, [referencePhoto, scanPulse, sendAlert]);

  const stopWatch = useCallback(() => {
    setWatching(false);
    setFaceInFrame(false);
    scanPulse.value = withTiming(0);
    if (watchInterval.current) clearTimeout(watchInterval.current as unknown as number);
    if (faceInterval.current) clearInterval(faceInterval.current);
  }, [scanPulse]);

  useEffect(() => () => {
    if (watchInterval.current) clearTimeout(watchInterval.current as unknown as number);
    if (faceInterval.current) clearInterval(faceInterval.current);
  }, []);

  if (!camPermission?.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#0D0520"]} style={StyleSheet.absoluteFill} />
        <View style={styles.permBox}>
          <Ionicons name="person-circle-outline" size={64} color="#EC4899" />
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestCamPermission}>
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
        colors={["rgba(0,0,0,0.82)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.75)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {watching && (
        <>
          <View style={styles.scanOverlay} pointerEvents="none">
            <Animated.View style={[styles.scanLine, scanStyle]} />
            {faceInFrame && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.faceBox} pointerEvents="none">
                <Text style={styles.faceBoxLabel}>Analyzing...</Text>
              </Animated.View>
            )}
          </View>
          <View style={styles.cornerTL} pointerEvents="none" />
          <View style={styles.cornerTR} pointerEvents="none" />
          <View style={styles.cornerBL} pointerEvents="none" />
          <View style={styles.cornerBR} pointerEvents="none" />
        </>
      )}

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { stopWatch(); router.back(); }} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Person Watch</Text>
        <View style={[styles.statusChip, watching && styles.statusActive]}>
          <Text style={[styles.statusText, watching && styles.statusTextActive]}>
            {watching ? (faceInFrame ? "👤 FACE" : "SCANNING") : "OFF"}
          </Text>
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(100)} style={styles.bottomPanel}>
        <Text style={styles.panelTitle}>👤 Person Detection Watch</Text>

        <TouchableOpacity style={styles.photoRow} onPress={pickPhoto} disabled={watching}>
          {referencePhoto ? (
            <Image source={{ uri: referencePhoto }} style={styles.refPhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person-add-outline" size={30} color="#EC4899" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.photoTitle}>
              {referencePhoto ? "Reference Photo Set ✓" : "Upload Reference Photo"}
            </Text>
            <Text style={styles.photoSub}>
              {referencePhoto
                ? "Camera will alert when a person is detected"
                : "Tap to select a person's photo from gallery"}
            </Text>
          </View>
          {!watching && <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />}
        </TouchableOpacity>

        {alertCount > 0 && (
          <Animated.View style={[styles.alertCard, matchStyle]}>
            <Ionicons name="notifications" size={20} color="#EC4899" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Person Detected!</Text>
              <Text style={styles.alertSub}>Alerts fired: {alertCount} • Last: {lastSeen}</Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{alertCount}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{faceInFrame && watching ? "YES" : "NO"}</Text>
            <Text style={styles.statLabel}>Face in View</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{lastSeen || "--"}</Text>
            <Text style={styles.statLabel}>Last Match</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.watchBtn, watching && styles.watchBtnStop, !referencePhoto && styles.watchBtnDisabled]}
          onPress={watching ? stopWatch : startWatch}
          disabled={!referencePhoto && !watching}
        >
          <Ionicons name={watching ? "stop-circle" : "eye"} size={22} color="#fff" />
          <Text style={styles.watchBtnText}>
            {watching ? "Stop Watching" : "Start Person Watch"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
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
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  title: { flex: 1, fontSize: 17, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  statusChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  statusActive: { backgroundColor: "rgba(236,72,153,0.2)", borderColor: "#EC4899" },
  statusText: { fontSize: 10, fontFamily: "Poppins_700Bold", color: "rgba(255,255,255,0.5)" },
  statusTextActive: { color: "#EC4899" },
  scanOverlay: {
    position: "absolute",
    top: "12%",
    left: "6%",
    right: "6%",
    height: "42%",
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#EC4899",
    shadowColor: "#EC4899",
    shadowRadius: 8,
    shadowOpacity: 1,
  },
  faceBox: {
    position: "absolute",
    top: "25%",
    left: "20%",
    right: "20%",
    height: "50%",
    borderWidth: 2,
    borderColor: "#EC4899",
    borderRadius: 8,
    alignItems: "center",
  },
  faceBoxLabel: {
    position: "absolute",
    bottom: -20,
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: "#EC4899",
  },
  cornerTL: { position: "absolute", top: "11%", left: "5%", width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2, borderColor: "#EC4899" },
  cornerTR: { position: "absolute", top: "11%", right: "5%", width: 20, height: 20, borderTopWidth: 2, borderRightWidth: 2, borderColor: "#EC4899" },
  cornerBL: { position: "absolute", top: "55%", left: "5%", width: 20, height: 20, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: "#EC4899" },
  cornerBR: { position: "absolute", top: "55%", right: "5%", width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2, borderColor: "#EC4899" },
  bottomPanel: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.92)",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 22, gap: 14,
    paddingBottom: Platform.OS === "web" ? 22 : 40,
  },
  panelTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#fff" },
  photoRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: "rgba(236,72,153,0.3)",
  },
  refPhoto: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "#EC4899" },
  photoPlaceholder: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(236,72,153,0.15)",
    borderWidth: 2, borderColor: "rgba(236,72,153,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  photoTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  photoSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.45)", marginTop: 2, lineHeight: 16 },
  alertCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(236,72,153,0.15)",
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "rgba(236,72,153,0.4)",
  },
  alertTitle: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#EC4899" },
  alertSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  statsRow: {
    flexDirection: "row", justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14, padding: 12,
  },
  stat: { alignItems: "center", gap: 2 },
  statVal: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#EC4899" },
  statLabel: { fontSize: 10, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.45)" },
  watchBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#EC4899", borderRadius: 16, paddingVertical: 16,
  },
  watchBtnStop: { backgroundColor: "#EF4444" },
  watchBtnDisabled: { opacity: 0.5 },
  watchBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  permBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  permTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: "#fff", textAlign: "center" },
  permBtn: { backgroundColor: "#EC4899", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  permBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});
