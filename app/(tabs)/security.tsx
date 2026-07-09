import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

interface ToggleItem { id: string; icon: keyof typeof Ionicons.glyphMap; label: string; desc: string; color: string; fixed?: boolean }

const TOGGLES: ToggleItem[] = [
  { id: "ondevice", icon: "phone-portrait-outline", label: "On-Device Processing", desc: "All AI runs locally. Never disabled.", color: "#10B981", fixed: true },
  { id: "nointernet", icon: "cloud-offline-outline", label: "Block Internet for AI", desc: "Camera features have no network access.", color: "#10B981", fixed: true },
  { id: "nodelete", icon: "trash-outline", label: "Auto-Delete Images", desc: "Images erased immediately after analysis.", color: "#10B981", fixed: true },
  { id: "noanalytics", icon: "analytics-outline", label: "Analytics Blocked", desc: "Zero telemetry, no usage tracking.", color: "#10B981", fixed: true },
  { id: "screensec", icon: "shield-outline", label: "Screenshot Protection", desc: "Prevents screenshots of sensitive results.", color: "#9D4EDD" },
  { id: "anonmode", icon: "eye-off-outline", label: "Stealth Mode", desc: "App appears as 'Utility' in recent apps.", color: "#9D4EDD" },
  { id: "haptics", icon: "radio-button-on-outline", label: "Security Haptics", desc: "Haptic feedback on threat detection.", color: "#06B6D4" },
];

export default function SecurityScreen() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    screensec: true,
    anonmode: false,
    haptics: true,
  });
  const insets = useSafeAreaInsets();

  const toggle = (id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isOn = (item: ToggleItem) => item.fixed ? true : (enabled[item.id] ?? false);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000", "#0D0520", "#000"]} style={StyleSheet.absoluteFill} />
      <FeatureHeader title="Security" accentColor="#9D4EDD" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <Ionicons name="shield-checkmark" size={36} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>Fully Secure</Text>
            <Text style={styles.statusSub}>All core protections active</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>100%</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>PROTECTION SETTINGS</Text>

        {TOGGLES.map((item) => (
          <View key={item.id} style={styles.toggleRow}>
            <View style={[styles.iconWrap, { backgroundColor: item.color + "18" }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.toggleLabel}>{item.label}</Text>
              <Text style={styles.toggleDesc}>{item.desc}</Text>
            </View>
            <Switch
              value={isOn(item)}
              onValueChange={() => !item.fixed && toggle(item.id)}
              disabled={!!item.fixed}
              trackColor={{ false: "rgba(255,255,255,0.1)", true: item.color + "80" }}
              thumbColor={isOn(item) ? item.color : "rgba(255,255,255,0.4)"}
            />
          </View>
        ))}

        <View style={styles.encryptionCard}>
          <Ionicons name="key-outline" size={20} color="#F59E0B" />
          <View style={{ flex: 1 }}>
            <Text style={styles.encTitle}>Local Encryption</Text>
            <Text style={styles.encSub}>Vault notes use AES-256 local storage</Text>
          </View>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
        </View>
      </ScrollView>
      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, gap: 10 },
  statusCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(16,185,129,0.08)", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "rgba(16,185,129,0.25)", marginBottom: 4 },
  statusTitle: { fontSize: 17, fontFamily: "Poppins_700Bold", color: "#FFF" },
  statusSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#10B981" },
  scoreBadge: { backgroundColor: "rgba(16,185,129,0.15)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(16,185,129,0.3)" },
  scoreText: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#10B981" },
  sectionLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, marginLeft: 4 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toggleLabel: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#FFF" },
  toggleDesc: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.4)", lineHeight: 16 },
  encryptionCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(245,158,11,0.07)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" },
  encTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  encSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
});
