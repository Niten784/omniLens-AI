import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const METRICS = [
  { label: "Cloud Uploads", value: "0", unit: "total", icon: "cloud-offline-outline" as const, color: "#10B981", good: true },
  { label: "Images Deleted", value: "∞", unit: "immediately", icon: "trash-outline" as const, color: "#10B981", good: true },
  { label: "Network Calls", value: "0", unit: "for AI features", icon: "wifi-outline" as const, color: "#10B981", good: true },
  { label: "Analytics Events", value: "0", unit: "sent", icon: "analytics-outline" as const, color: "#10B981", good: true },
  { label: "Data Sold", value: "Never", unit: "guaranteed", icon: "ban-outline" as const, color: "#10B981", good: true },
  { label: "Third Parties", value: "0", unit: "integrated", icon: "people-outline" as const, color: "#10B981", good: true },
];

const PRINCIPLES = [
  { icon: "phone-portrait-outline" as const, title: "On-Device First", desc: "Every ML model runs 100% on your device. Your images never leave your phone.", color: "#7C3AED" },
  { icon: "eye-off-outline" as const, title: "Zero Surveillance", desc: "No behavioral tracking, no session recording, no heatmaps, no A/B testing on you.", color: "#EC4899" },
  { icon: "lock-closed-outline" as const, title: "Encrypted Storage", desc: "Any persistent data (Vault notes, settings) is encrypted using device-level security.", color: "#EF4444" },
  { icon: "shield-checkmark-outline" as const, title: "Open by Design", desc: "OmniLens AI is built with privacy as the foundation — not an afterthought.", color: "#10B981" },
];

export default function PrivacyDashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000", "#001A0D", "#0D0520"]} style={StyleSheet.absoluteFill} />
      <FeatureHeader title="Privacy Dashboard" accentColor="#10B981" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <LinearGradient colors={["rgba(16,185,129,0.15)", "rgba(124,58,237,0.1)"]} style={StyleSheet.absoluteFill} />
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>100</Text>
            <Text style={styles.scoreLabel}>Privacy Score</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scoreTitle}>Maximum Privacy</Text>
            <Text style={styles.scoreSub}>Your data is 100% private. Nothing is shared, sold, or stored remotely.</Text>
            <View style={styles.nitenBadge}>
              <Text style={styles.nitenText}>Guaranteed by NITEN</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>PRIVACY METRICS</Text>

        <View style={styles.metricsGrid}>
          {METRICS.map((m, i) => (
            <View key={i} style={styles.metricCard}>
              <Ionicons name={m.icon} size={20} color={m.color} />
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricUnit}>{m.unit}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>PRIVACY PRINCIPLES</Text>

        {PRINCIPLES.map((p, i) => (
          <View key={i} style={styles.principleCard}>
            <View style={[styles.princIconWrap, { backgroundColor: p.color + "18" }]}>
              <Ionicons name={p.icon} size={20} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.princTitle}>{p.title}</Text>
              <Text style={styles.princDesc}>{p.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Ionicons name="eye" size={18} color="#9D4EDD" />
          <Text style={styles.footerText}>© 2026 OmniLens AI — Developed by NITEN{"\n"}Privacy is not a feature. It's a right.</Text>
        </View>
      </ScrollView>
      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, gap: 12 },
  scoreCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(16,185,129,0.3)", flexDirection: "row", alignItems: "center", gap: 16, overflow: "hidden" },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(16,185,129,0.15)", borderWidth: 2, borderColor: "#10B981", alignItems: "center", justifyContent: "center" },
  scoreNumber: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#10B981" },
  scoreLabel: { fontSize: 8, fontFamily: "Poppins_500Medium", color: "#10B981", letterSpacing: 0.5 },
  scoreTitle: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#FFF" },
  scoreSub: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.65)", lineHeight: 17, marginTop: 4 },
  nitenBadge: { marginTop: 8, alignSelf: "flex-start", backgroundColor: "rgba(157,78,221,0.2)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(157,78,221,0.4)" },
  nitenText: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#9D4EDD" },
  sectionLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, marginLeft: 4, marginTop: 4 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { width: "30%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "rgba(16,185,129,0.15)", alignItems: "center", gap: 4, flexGrow: 1 },
  metricValue: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  metricLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.7)", textAlign: "center" },
  metricUnit: { fontSize: 9, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.35)", textAlign: "center" },
  principleCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  princIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  princTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  princDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.55)", lineHeight: 18, marginTop: 2 },
  footer: { flexDirection: "row", alignItems: "flex-start", gap: 8, justifyContent: "center", marginTop: 8 },
  footerText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 18 },
});
