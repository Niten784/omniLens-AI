import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
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
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: W } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const SPEED_HISTORY_MAX = 20;

export default function SpeedRadarScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [peakSpeed, setPeakSpeed] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [speedLimit, setSpeedLimit] = useState("60");
  const [alertFired, setAlertFired] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [objectCount, setObjectCount] = useState(0);
  const speedInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedHistory = useRef<number[]>([]);
  const radarAngle = useSharedValue(0);
  const needle = useSharedValue(0);

  useEffect(() => { Notifications.requestPermissionsAsync(); }, []);

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-90 + needle.value * 180}deg` }],
  }));

  const radarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarAngle.value * 360}deg` }],
  }));

  const notifyOverspeed = useCallback(async (spd: number, limit: number) => {
    setAlertFired(true);
    Vibration.vibrate([0, 200, 100, 200, 100, 400]);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚡ Speed Limit Exceeded!",
        body: `Vehicle detected at ${spd} km/h — limit is ${limit} km/h. OmniLens Speed Radar alert.`,
        sound: true,
      },
      trigger: null,
    });
    setTimeout(() => setAlertFired(false), 4000);
  }, []);

  const startRadar = useCallback(() => {
    setActive(true);
    radarAngle.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);

    speedInterval.current = setInterval(() => {
      const baseSpeed = 25 + Math.random() * 80;
      const noise = (Math.random() - 0.5) * 12;
      const spd = Math.max(0, Math.round(baseSpeed + noise));

      setSpeed(spd);
      needle.value = withSpring(Math.min(spd / 160, 1), { damping: 10 });
      setObjectCount((c) => c + (Math.random() > 0.6 ? 1 : 0));

      speedHistory.current = [...speedHistory.current.slice(-SPEED_HISTORY_MAX + 1), spd];
      const avg = Math.round(speedHistory.current.reduce((a, b) => a + b, 0) / speedHistory.current.length);
      const peak = Math.max(...speedHistory.current);
      setAvgSpeed(avg);
      setPeakSpeed(peak);
      setHistory([...speedHistory.current]);

      const limit = parseInt(speedLimit) || 60;
      if (spd > limit) {
        notifyOverspeed(spd, limit);
      }
    }, 800);
  }, [needle, radarAngle, speedLimit, notifyOverspeed]);

  const stopRadar = useCallback(() => {
    setActive(false);
    setSpeed(0);
    needle.value = withSpring(0);
    radarAngle.value = withTiming(0);
    if (speedInterval.current) clearInterval(speedInterval.current);
  }, [needle, radarAngle]);

  useEffect(() => () => {
    if (speedInterval.current) clearInterval(speedInterval.current);
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#0D0520"]} style={StyleSheet.absoluteFill} />
        <View style={styles.permBox}>
          <Ionicons name="speedometer-outline" size={64} color="#F97316" />
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const overLimit = speed > (parseInt(speedLimit) || 60);
  const speedColor = overLimit ? "#EF4444" : speed > 40 ? "#F59E0B" : "#10B981";

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      <LinearGradient
        colors={["rgba(0,0,0,0.88)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.88)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { stopRadar(); router.back(); }} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Speed Radar</Text>
        <View style={[styles.activeChip, active && styles.activeChipOn]}>
          <Text style={[styles.activeText, active && styles.activeTextOn]}>
            {active ? "● LIVE" : "○ OFF"}
          </Text>
        </View>
      </View>

      {active && (
        <Animated.View style={styles.radarMini} pointerEvents="none">
          <Animated.View style={[styles.radarSweep, radarStyle]} />
          {[1, 2, 3].map((r) => (
            <View key={r} style={[styles.radarRing, { width: r * 44, height: r * 44, borderRadius: r * 22 }]} />
          ))}
        </Animated.View>
      )}

      <View style={styles.gaugeWrap} pointerEvents="none">
        <View style={styles.gauge}>
          <View style={styles.gaugeArc} />
          <Animated.View style={[styles.needle, needleStyle]} />
          <View style={styles.gaugeCenter} />
          <Text style={[styles.speedVal, { color: speedColor }]}>{active ? speed : "--"}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
        {overLimit && active && (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.overLimitBadge}>
            <Text style={styles.overLimitText}>⚡ OVER LIMIT</Text>
          </Animated.View>
        )}
      </View>

      <Animated.View entering={FadeInDown.delay(100)} style={styles.bottomPanel}>
        <View style={styles.limitRow}>
          <Ionicons name="speedometer-outline" size={18} color="#F97316" />
          <Text style={styles.limitLabel}>Speed Limit (km/h)</Text>
          <TextInput
            style={styles.limitInput}
            value={speedLimit}
            onChangeText={setSpeedLimit}
            keyboardType="number-pad"
            maxLength={3}
            editable={!active}
          />
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: speedColor + "55" }]}>
            <Text style={[styles.statBig, { color: speedColor }]}>{active ? speed : 0}</Text>
            <Text style={styles.statSub}>Current km/h</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statBig, { color: "#F59E0B" }]}>{peakSpeed}</Text>
            <Text style={styles.statSub}>Peak km/h</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statBig, { color: "#8B5CF6" }]}>{avgSpeed}</Text>
            <Text style={styles.statSub}>Avg km/h</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statBig, { color: "#06B6D4" }]}>{objectCount}</Text>
            <Text style={styles.statSub}>Vehicles</Text>
          </View>
        </View>

        {history.length > 1 && (
          <View style={styles.histBar}>
            {history.slice(-12).map((s, i) => (
              <View
                key={i}
                style={[
                  styles.histBarItem,
                  {
                    height: Math.max(4, (s / 160) * 36),
                    backgroundColor: s > (parseInt(speedLimit) || 60) ? "#EF4444" : "#10B981",
                    opacity: 0.4 + (i / 12) * 0.6,
                  },
                ]}
              />
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.radarBtn, active && styles.radarBtnStop]}
          onPress={active ? stopRadar : startRadar}
        >
          <Ionicons name={active ? "stop-circle" : "radio-outline"} size={24} color="#fff" />
          <Text style={styles.radarBtnText}>{active ? "Stop Radar" : "Activate Speed Radar"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: {
    position: "absolute", top: Platform.OS === "web" ? 20 : 52,
    left: 0, right: 0, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  title: { flex: 1, fontSize: 17, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  activeChip: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  activeChipOn: { backgroundColor: "rgba(239,68,68,0.2)", borderColor: "#EF4444" },
  activeText: { fontSize: 10, fontFamily: "Poppins_700Bold", color: "rgba(255,255,255,0.5)" },
  activeTextOn: { color: "#EF4444" },
  radarMini: {
    position: "absolute", top: "14%", alignSelf: "center",
    width: 132, height: 132, alignItems: "center", justifyContent: "center",
  },
  radarSweep: {
    position: "absolute", width: 66, height: 2,
    backgroundColor: "rgba(249,115,22,0.8)", left: 66, transformOrigin: "0% 50%",
  },
  radarRing: {
    position: "absolute", borderWidth: 1, borderColor: "rgba(249,115,22,0.2)",
  },
  gaugeWrap: {
    position: "absolute", top: "28%", alignSelf: "center", alignItems: "center", gap: 8,
  },
  gauge: {
    width: W * 0.5, height: W * 0.27, alignItems: "center", justifyContent: "flex-end",
    position: "relative",
  },
  gaugeArc: {
    position: "absolute", bottom: 0, width: W * 0.5, height: W * 0.25,
    borderTopLeftRadius: W * 0.25, borderTopRightRadius: W * 0.25,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.15)", borderBottomWidth: 0,
  },
  needle: {
    position: "absolute", bottom: 0, width: W * 0.23, height: 3,
    backgroundColor: "#F97316", borderRadius: 2, left: W * 0.25 - 2, transformOrigin: "100% 50%",
  },
  gaugeCenter: {
    position: "absolute", bottom: -6, width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#F97316",
  },
  speedVal: { fontSize: 40, fontFamily: "Poppins_700Bold", lineHeight: 44 },
  speedUnit: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  overLimitBadge: {
    backgroundColor: "rgba(239,68,68,0.85)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  overLimitText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: "#fff" },
  bottomPanel: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.92)", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, gap: 14, paddingBottom: Platform.OS === "web" ? 20 : 38,
  },
  limitRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  limitLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.7)" },
  limitInput: {
    width: 56, textAlign: "center", fontSize: 16, fontFamily: "Poppins_700Bold",
    color: "#F97316", backgroundColor: "rgba(249,115,22,0.1)",
    borderRadius: 8, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(249,115,22,0.3)",
  },
  statsGrid: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12,
    padding: 10, alignItems: "center", gap: 2,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  statBig: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  statSub: { fontSize: 9, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.45)", textAlign: "center" },
  histBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 3,
    height: 40, backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10, padding: 4,
  },
  histBarItem: { flex: 1, borderRadius: 3, minHeight: 4 },
  radarBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#F97316", borderRadius: 16, paddingVertical: 16,
  },
  radarBtnStop: { backgroundColor: "#EF4444" },
  radarBtnText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#fff" },
  permBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  permTitle: { fontSize: 20, fontFamily: "Poppins_600SemiBold", color: "#fff", textAlign: "center" },
  permBtn: { backgroundColor: "#F97316", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  permBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#fff" },
});
