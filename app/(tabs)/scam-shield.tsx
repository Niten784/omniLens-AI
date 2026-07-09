import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

type Risk = "safe" | "suspicious" | "scam";
interface ScamResult { risk: Risk; score: number; flags: string[]; advice: string }

function analyzeText(text: string): ScamResult {
  const t = text.toLowerCase();
  const scamWords = ["prize", "winner", "free money", "urgent", "click here", "verify account", "limited time", "act now", "congratulations you've won", "crypto", "bitcoin"];
  const suspiciousWords = ["offer", "exclusive", "deal", "discount", "limited", "claim", "reward", "lottery"];
  const flags: string[] = [];
  let score = 20;

  scamWords.forEach((w) => { if (t.includes(w)) { score += 25; flags.push(`Scam keyword: "${w}"`); } });
  suspiciousWords.forEach((w) => { if (t.includes(w)) { score += 10; flags.push(`Suspicious term: "${w}"`); } });
  if (/\d{4,}/.test(text)) { score += 5; flags.push("Contains long number sequences"); }
  if (text.length < 20 && t.includes("http")) { score += 30; flags.push("Short message with link"); }

  score = Math.min(score, 100);
  const risk: Risk = score >= 65 ? "scam" : score >= 35 ? "suspicious" : "safe";
  const advice = risk === "scam" ? "Do not interact. Block sender immediately." : risk === "suspicious" ? "Exercise caution. Verify through official channels." : "Appears legitimate, but always stay vigilant.";

  return { risk, score, flags: flags.slice(0, 4), advice };
}

export default function ScamShieldScreen() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ScamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const analyze = async () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    const res = analyzeText(input);
    setResult(res);
    setLoading(false);
    if (res.risk === "scam") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (res.risk === "suspicious") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const riskColor = result?.risk === "scam" ? "#EF4444" : result?.risk === "suspicious" ? "#F59E0B" : "#10B981";
  const riskIcon: keyof typeof Ionicons.glyphMap = result?.risk === "scam" ? "skull-outline" : result?.risk === "suspicious" ? "warning-outline" : "shield-checkmark-outline";

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000", "#1A0000", "#0D0520"]} style={StyleSheet.absoluteFill} />
      <FeatureHeader title="Scam Shield" accentColor="#EF4444" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.inputCard}>
          <Text style={styles.label}>Paste suspicious message, URL, or text</Text>
          <TextInput
            style={styles.input}
            placeholder={"e.g. \"Congratulations! You've won a prize...\""}

            placeholderTextColor="rgba(255,255,255,0.25)"
            value={input}
            onChangeText={setInput}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={[styles.analyzeBtn, (!input.trim() || loading) && { opacity: 0.5 }]} onPress={analyze} disabled={!input.trim() || loading}>
          {loading ? <ActivityIndicator color="#FFF" size="small" /> : (
            <>
              <Ionicons name="shield-checkmark" size={18} color="#FFF" />
              <Text style={styles.analyzeBtnText}>Analyze for Scams</Text>
            </>
          )}
        </TouchableOpacity>

        {result && (
          <View style={[styles.resultCard, { borderColor: riskColor + "55" }]}>
            <View style={styles.riskHeader}>
              <View style={[styles.riskIconWrap, { backgroundColor: riskColor + "22" }]}>
                <Ionicons name={riskIcon} size={28} color={riskColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.riskLabel, { color: riskColor }]}>
                  {result.risk === "scam" ? "HIGH RISK — SCAM DETECTED" : result.risk === "suspicious" ? "SUSPICIOUS CONTENT" : "APPEARS SAFE"}
                </Text>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Risk Score</Text>
                  <Text style={[styles.scoreVal, { color: riskColor }]}>{result.score}/100</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressBar, { width: `${result.score}%` as any, backgroundColor: riskColor }]} />
                </View>
              </View>
            </View>

            {result.flags.length > 0 && (
              <View style={styles.flagsSection}>
                <Text style={styles.flagsTitle}>Detected Signals</Text>
                {result.flags.map((f, i) => (
                  <View key={i} style={styles.flagRow}>
                    <Ionicons name="alert-circle" size={12} color={riskColor} />
                    <Text style={styles.flagText}>{f}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.adviceBox, { backgroundColor: riskColor + "11", borderColor: riskColor + "33" }]}>
              <Ionicons name="information-circle" size={16} color={riskColor} />
              <Text style={[styles.adviceText, { color: riskColor }]}>{result.advice}</Text>
            </View>
          </View>
        )}

        <View style={styles.localNote}>
          <Ionicons name="lock-closed" size={12} color="#9D4EDD" />
          <Text style={styles.localText}>Analysis performed locally. No data transmitted.</Text>
        </View>
      </ScrollView>
      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, gap: 14 },
  label: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#EF4444", marginBottom: 8, letterSpacing: 0.5 },
  inputCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  input: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#FFF", minHeight: 110, textAlignVertical: "top" },
  analyzeBtn: { backgroundColor: "#EF4444", borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  analyzeBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  resultCard: { backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 18, padding: 18, borderWidth: 1, gap: 14 },
  riskHeader: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  riskIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  riskLabel: { fontSize: 13, fontFamily: "Poppins_700Bold", lineHeight: 18 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  scoreLabel: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)" },
  scoreVal: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  progressBg: { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, marginTop: 4 },
  progressBar: { height: 4, borderRadius: 2 },
  flagsSection: { gap: 6 },
  flagsTitle: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.4)", letterSpacing: 0.8 },
  flagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  flagText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.75)" },
  adviceBox: { borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1 },
  adviceText: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium", lineHeight: 20 },
  localNote: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  localText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(157,78,221,0.7)" },
});
