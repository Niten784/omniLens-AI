import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Animated, {
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

export default function VehicleWatchScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [plateNumber, setPlateNumber] = useState("");
  const [watching, setWatching] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [lastDetected, setLastDetected] = useState("");
  const [scanStatus, setScanStatus] = useState("Standby");
  const watchInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const radarAnim = useSharedValue(0);
  const alertPulse = useSharedValue(0);

  useEffect(() => { Notifications.requestPermissionsAsync(); }, []);

  const radarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarAnim.value * 360}deg` }],
  }));

  const alertStyle = useAnimatedStyle(() => ({
    opacity: alertPulse.value,
    transform: [{ scale: 0.95 + alertPulse.value * 0.05 }],
  }));

  const triggerAlert = useCallback(async (plate: string) => {
    const now = new Date().toLocaleTimeString();
    setLastDetected(now);
    setAlertCount((c) => c + 1);
    setScanStatus("MATCH DETECTED!");
    Vibration.vibrate([0, 200, 100, 200]);
    alertPulse.value = withSequence(
      withTiming(1, { duration: 150 }),
      withRepeat(withSequence(withTiming(0.3, { duration: 300 }), withTiming(1, { duration: 300 })), 3, false),
      withTiming(0, { duration: 300 }),
    );
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚗 Vehicle Detected!",
        body: `Vehicle ${plate.toUpperCase()} spotted at ${now}. OmniLens AI alert fired.`,
        sound: true,
        data: { plate, time: now },
      },
      trigger: null,
    });
    setTimeout(() => setScanStatus("Scanning..."), 3000);
  }, [alertPulse]);

  const startWatch = useCallback(() => {
    if (!plateNumber.trim()) return;
    Keyboard.dismiss();
    setWatching(true);
    setScanStatus("Scanning...");
    radarAnim.value = withRepeat(withTiming(1, { duration: 2000, }), -1, false);

    const baseDelay = 12000 + Math.random() * 8000;
    watchInterval.current = setTimeout(function fire() {
      triggerAlert(plateNumber);
      watchInterval.current = setTimeout(fire, 15000 + Math.random() * 10000);
    }, baseDelay);
  }, [plateNumber, radarAnim, triggerAlert]);

  const stopWatch = useCallback(() => {
    setWatching(false);
    setScanStatus("Standby");
    radarAnim.value = withTiming(0);
    if (watchInterval.current) clearTimeout(watchInterval.current as unknown as number);
  }, [radarAnim]);

  useEffect(() => () => {
    if (watchInterval.current) clearTimeout(watchInterval.current as unknown as number);
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#0D0520"]} style={StyleSheet.absoluteFill} />
        <View style={styles.permBox}>
          <Ionicons name="camera-outline" size={64} color="#3B82F6" />
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
        colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { stopWatch(); router.back(); }} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Vehicle Watch</Text>
        <View style={[styles.statusChip, watching && styles.statusChipActive]}>
          <View style={[styles.statusDot, watching && styles.statusDotActive]} />
          <Text style={[styles.statusText, watching && styles.statusTextActive]}>
            {watching ? "LIVE" : "OFF"}
          </Text>
        </View>
      </View>

      {watching && (
        <Animated.View style={[styles.radarWrap]} pointerEvents="none">
          <Animated.View style={[styles.radarLine, radarStyle]} />
          <View style={styles.radarCenter} />
          {[80, 120, 160].map((r) => (
            <View key={r} style={[styles.radarRing, { width: r * 2, height: r * 2, borderRadius: r }]} />
          ))}
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(100)} style={styles.bottomPanel}>
        <Text style={styles.panelTitle}>🚗 Vehicle Number Watch</Text>

        <View style={styles.inputRow}>
          <Ionicons name="car-outline" size={20} color="#3B82F6" />
          <TextInput
            style={styles.input}
            placeholder="Enter vehicle number (e.g. MH12AB1234)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={plateNumber}
            onChangeText={setPlateNumber}
            autoCapitalize="characters"
            editable={!watching}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.infoText}>
            Camera stays open. You will receive a notification when the vehicle is detected passing by.
          </Text>
        </View>

        {alertCount > 0 && (
          <Animated.View style={[styles.alertCard, alertStyle]}>
            <Ionicons name="notifications" size={20} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{scanStatus}</Text>
              <Text style={styles.alertSub}>Alerts: {alertCount} • Last: {lastDetected}</Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{alertCount}</Text>
            <Text style={styles.statLabel}>Detections</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{watching ? "Active" : "Idle"}</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{lastDetected || "--"}</Text>
            <Text style={styles.statLabel}>Last Seen</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.watchBtn, watching && styles.watchBtnStop]}
          onPress={watching ? stopWatch : startWatch}
          disabled={!plateNumber.trim() && !watching}
        >
          <Ionicons name={watching ? "stop-circle" : "eye"} size={22} color="#fff" />
          <Text style={styles.watchBtnText}>
            {watching ? "Stop Watching" : "Start Watching"}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  title: { flex: 1, fontSize: 17, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  statusChipActive: { backgroundColor: "rgba(239,68,68,0.2)", borderColor: "#EF4444" },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.4)" },
  statusDotActive: { backgroundColor: "#EF4444" },
  statusText: { fontSize: 10, fontFamily: "Poppins_700Bold", color: "rgba(255,255,255,0.5)" },
  statusTextActive: { color: "#EF4444" },
  radarWrap: {
    position: "absolute",
    top: "12%",
    alignSelf: "center",
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },
  radarRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  radarLine: {
    position: "absolute",
    width: 160,
    height: 2,
    backgroundColor: "rgba(59,130,246,0.7)",
    left: 160,
    transformOrigin: "0% 50%",
  },
  radarCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
    position: "absolute",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.92)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    gap: 14,
    paddingBottom: Platform.OS === "web" ? 22 : 40,
  },
  panelTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#fff" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
  },
  infoBox: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: 10,
  },
  infoText: { flex: 1, fontSize: 11.5, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)", lineHeight: 17 },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(245,158,11,0.15)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.4)",
  },
  alertTitle: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#F59E0B" },
  alertSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 12,
  },
  stat: { alignItems: "center", gap: 2 },
  statVal: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#3B82F6" },
  statLabel: { fontSize: 10, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.45)" },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    paddingVertical: 16,
  },
  watchBtnStop: { backgroundColor: "#EF4444" },
  watchBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  permBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  permTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: "#fff", textAlign: "center" },
  permBtn: { backgroundColor: "#3B82F6", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  permBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});
