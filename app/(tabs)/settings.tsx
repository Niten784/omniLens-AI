import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Row({
  icon,
  label,
  value,
  color = "#9D4EDD",
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const showAbout = () => {
    Alert.alert(
      "OmniLens AI",
      "Version 1.0.0\n\nDeveloped by NITEN\n\n© 2026 NITEN. All rights reserved.\nAll AI processing happens on-device.\n\nNo data is ever stored, uploaded, or shared.",
      [{ text: "Close", style: "cancel" }]
    );
  };

  const showPrivacy = () => {
    Alert.alert(
      "Privacy Policy",
      "OmniLens AI is built with privacy as the foundation:\n\n• Zero cloud processing\n• No user data collection\n• No analytics or tracking\n• No internet access for AI features\n• Images deleted immediately after analysis\n• All storage is local and encrypted\n\nDeveloped by NITEN — Privacy by Design.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000000", "#0D0520", "#1A0A2E"]} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* NITEN Branding Card */}
        <BlurView intensity={Platform.OS === "ios" ? 20 : 0} tint="dark" style={styles.nitenCard}>
          <View style={styles.nitenInner}>
            <Ionicons name="eye" size={36} color="#9D4EDD" />
            <View style={{ flex: 1 }}>
              <Text style={styles.nitenAppName}>OmniLens AI</Text>
              <Text style={styles.nitenDev}>Developed by NITEN</Text>
            </View>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>v1.0.0</Text>
            </View>
          </View>
        </BlurView>

        {/* On-Device Badge */}
        <View style={styles.onDeviceBanner}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.onDeviceText}>All data processed on-device</Text>
          <Ionicons name="lock-closed" size={14} color="#10B981" />
        </View>

        <Text style={styles.sectionLabel}>APP INFO</Text>

        <BlurView intensity={Platform.OS === "ios" ? 14 : 0} tint="dark" style={styles.section}>
          <View style={[styles.sectionInner, { backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(20,0,40,0.9)" }]}>
            <Row icon="information-circle-outline" label="App Version" value="1.0.0" color="#7C3AED" />
            <View style={styles.separator} />
            <Row icon="person-outline" label="Developer" value="NITEN" color="#9D4EDD" />
            <View style={styles.separator} />
            <Row icon="code-slash-outline" label="Build" value="Production" color="#8B5CF6" />
          </View>
        </BlurView>

        <Text style={styles.sectionLabel}>PRIVACY & SECURITY</Text>

        <BlurView intensity={Platform.OS === "ios" ? 14 : 0} tint="dark" style={styles.section}>
          <View style={[styles.sectionInner, { backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(20,0,40,0.9)" }]}>
            <Row icon="cloud-offline-outline" label="Cloud Storage" value="Never" color="#EF4444" />
            <View style={styles.separator} />
            <Row icon="analytics-outline" label="Analytics" value="Disabled" color="#EF4444" />
            <View style={styles.separator} />
            <Row icon="wifi-outline" label="Network Access" value="None (AI)" color="#10B981" />
            <View style={styles.separator} />
            <Row icon="trash-outline" label="Image Retention" value="0 seconds" color="#10B981" />
          </View>
        </BlurView>

        <Text style={styles.sectionLabel}>LEGAL</Text>

        <BlurView intensity={Platform.OS === "ios" ? 14 : 0} tint="dark" style={styles.section}>
          <View style={[styles.sectionInner, { backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(20,0,40,0.9)" }]}>
            <Row icon="document-text-outline" label="Privacy Policy" color="#06B6D4" onPress={showPrivacy} />
            <View style={styles.separator} />
            <Row icon="help-circle-outline" label="About OmniLens AI" color="#9D4EDD" onPress={showAbout} />
          </View>
        </BlurView>

        <Text style={styles.footer}>© 2026 Developed by NITEN{"\n"}All AI processing is 100% on-device</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10 },
  nitenCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(147,51,234,0.35)",
    marginBottom: 4,
  },
  nitenInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 14,
    backgroundColor: "rgba(60,0,120,0.3)",
  },
  nitenAppName: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },
  nitenDev: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#9D4EDD",
  },
  versionBadge: {
    backgroundColor: "rgba(147,51,234,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(147,51,234,0.4)",
  },
  versionText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#9D4EDD",
  },
  onDeviceBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(16,185,129,0.12)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
    marginBottom: 4,
  },
  onDeviceText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#10B981",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.2,
    marginLeft: 4,
    marginTop: 4,
  },
  section: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(147,51,234,0.18)",
  },
  sectionInner: { borderRadius: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#FFFFFF",
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.45)",
    marginRight: 4,
  },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginLeft: 58 },
  footer: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 12,
  },
});
