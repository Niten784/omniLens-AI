import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const PROBLEMS = [
  { category: "Math", problem: "2x + 5 = 13", solution: "x = 4", steps: ["Subtract 5 from both sides: 2x = 8", "Divide both sides by 2: x = 4", "Verify: 2(4) + 5 = 13 ✓"] },
  { category: "Logic", problem: "What weighs more — a pound of feathers or a pound of gold?", solution: "They weigh the same — both are 1 pound", steps: ["A pound = 0.453 kg regardless of material", "The trick: gold uses troy pounds (12 oz), while feathers use avoirdupois (16 oz)", "By troy measure, gold is actually lighter!"] },
  { category: "Physics", problem: "How long does it take a 100m object to fall from rest?", solution: "t ≈ 4.52 seconds", steps: ["Use: h = ½gt²", "100 = ½(9.81)t²", "t² = 200/9.81 ≈ 20.39", "t = √20.39 ≈ 4.52 seconds"] },
  { category: "Algebra", problem: "Quadratic: x² - 5x + 6 = 0", solution: "x = 2 or x = 3", steps: ["Factor: (x-2)(x-3) = 0", "Set each factor to zero", "x - 2 = 0 → x = 2", "x - 3 = 0 → x = 3"] },
];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

export default function ProblemSolverScreen() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof PROBLEMS[0] | null>(null);
  const insets = useSafeAreaInsets();

  const solve = async () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1600));
    const preset = PROBLEMS.find((p) => p.problem.toLowerCase().includes(input.trim().split(" ")[0]?.toLowerCase() ?? ""));
    setResult(preset ?? pick(PROBLEMS));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000", "#0D0020", "#0D0520"]} style={StyleSheet.absoluteFill} />
      <FeatureHeader title="Problem Solver" accentColor="#A855F7" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.inputCard}>
          <Text style={styles.label}>Enter your problem</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2x + 5 = 13, or type a logic puzzle..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={input}
            onChangeText={setInput}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={[styles.solveBtn, (!input.trim() || loading) && { opacity: 0.5 }]} onPress={solve} disabled={!input.trim() || loading}>
          {loading ? <ActivityIndicator color="#FFF" size="small" /> : (
            <>
              <Ionicons name="bulb" size={18} color="#FFF" />
              <Text style={styles.solveBtnText}>Solve</Text>
            </>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{result.category}</Text>
            </View>
            <Text style={styles.problemText}>{result.problem}</Text>
            <View style={styles.answerBox}>
              <Ionicons name="checkmark-circle" size={20} color="#A855F7" />
              <Text style={styles.answerText}>{result.solution}</Text>
            </View>
            <Text style={styles.stepsTitle}>Step-by-Step</Text>
            {result.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setResult(null); setInput(""); }}>
              <Text style={styles.resetText}>Solve Another</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sampleRow}>
          <Text style={styles.sampleTitle}>Try:</Text>
          {["x² - 5x", "pound of gold", "falling object"].map((s) => (
            <TouchableOpacity key={s} style={styles.sampleChip} onPress={() => setInput(s)}>
              <Text style={styles.sampleText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, gap: 14 },
  label: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#A855F7", marginBottom: 6, letterSpacing: 0.5 },
  inputCard: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(168,85,247,0.2)", gap: 6 },
  input: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#FFF", minHeight: 70, textAlignVertical: "top" },
  solveBtn: { backgroundColor: "#A855F7", borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  solveBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  resultCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "rgba(168,85,247,0.3)", gap: 10 },
  catBadge: { alignSelf: "flex-start", backgroundColor: "rgba(168,85,247,0.15)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(168,85,247,0.35)" },
  catText: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#A855F7" },
  problemText: { fontSize: 15, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.8)" },
  answerBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(168,85,247,0.1)", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "rgba(168,85,247,0.25)" },
  answerText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#FFF" },
  stepsTitle: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.4)", letterSpacing: 0.8 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(168,85,247,0.2)", alignItems: "center", justifyContent: "center" },
  stepNumText: { fontSize: 11, fontFamily: "Poppins_700Bold", color: "#A855F7" },
  stepText: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)", lineHeight: 20 },
  resetBtn: { borderRadius: 12, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "rgba(168,85,247,0.35)" },
  resetText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#A855F7" },
  sampleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  sampleTitle: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.4)" },
  sampleChip: { backgroundColor: "rgba(168,85,247,0.08)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(168,85,247,0.2)" },
  sampleText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(168,85,247,0.9)" },
});
