import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const LANGS = ["Spanish", "French", "German", "Japanese", "Chinese", "Arabic", "Hindi", "Portuguese", "Russian", "Italian"];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  "Hello, how are you?": {
    Spanish: "Hola, ¿cómo estás?",
    French: "Bonjour, comment allez-vous?",
    German: "Hallo, wie geht es Ihnen?",
    Japanese: "こんにちは、お元気ですか？",
    Chinese: "你好，你好吗？",
    Arabic: "مرحباً، كيف حالك؟",
    Hindi: "नमस्ते, आप कैसे हैं?",
    Portuguese: "Olá, como você está?",
    Russian: "Привет, как дела?",
    Italian: "Ciao, come stai?",
  },
};

type State = "idle" | "translating" | "done";

export default function TranslateScreen() {
  const [input, setInput] = useState("");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [output, setOutput] = useState("");
  const [state, setState] = useState<State>("idle");
  const [showLangs, setShowLangs] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const translate = async () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState("translating");
    await new Promise((r) => setTimeout(r, 1400));
    const preset = TRANSLATIONS[input.trim()]?.[targetLang];
    if (preset) {
      setOutput(preset);
    } else {
      const mock = `[${targetLang} translation of: "${input.slice(0, 30)}${input.length > 30 ? "..." : ""}"]`;
      setOutput(mock);
    }
    setState("done");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000", "#1A0030", "#0D0520"]} style={StyleSheet.absoluteFill} />
      <FeatureHeader title="Live Translate" accentColor="#EC4899" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20, paddingTop: 16 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Source Text (English)</Text>
          <TextInput
            style={styles.input}
            placeholder="Type text to translate..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={input}
            onChangeText={setInput}
            multiline
            textAlignVertical="top"
            numberOfLines={4}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Translate To</Text>
          <TouchableOpacity style={styles.langPicker} onPress={() => setShowLangs(!showLangs)}>
            <Ionicons name="language" size={18} color="#EC4899" />
            <Text style={styles.langText}>{targetLang}</Text>
            <Ionicons name={showLangs ? "chevron-up" : "chevron-down"} size={16} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
          {showLangs && (
            <View style={styles.langGrid}>
              {LANGS.map((l) => (
                <TouchableOpacity key={l} style={[styles.langChip, l === targetLang && styles.langChipActive]} onPress={() => { setTargetLang(l); setShowLangs(false); }}>
                  <Text style={[styles.langChipText, l === targetLang && styles.langChipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.translateBtn, (!input.trim() || state === "translating") && { opacity: 0.5 }]} onPress={translate} disabled={!input.trim() || state === "translating"}>
          {state === "translating" ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Ionicons name="swap-horizontal" size={18} color="#FFF" />
              <Text style={styles.translateBtnText}>Translate</Text>
            </>
          )}
        </TouchableOpacity>

        {state === "done" && (
          <View style={[styles.card, { borderColor: "rgba(236,72,153,0.4)" }]}>
            <View style={styles.outputHeader}>
              <Text style={styles.cardLabel}>{targetLang} Translation</Text>
              <Ionicons name="lock-closed" size={10} color="#10B981" />
              <Text style={styles.onDevice}>On-Device</Text>
            </View>
            <Text style={styles.outputText}>{output}</Text>
          </View>
        )}

        <View style={styles.noCloudNote}>
          <Ionicons name="cloud-offline-outline" size={14} color="#9D4EDD" />
          <Text style={styles.noCloudText}>On-device translation — no internet used</Text>
        </View>
      </ScrollView>
      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, gap: 14 },
  card: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(236,72,153,0.2)", gap: 10 },
  cardLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#EC4899", letterSpacing: 0.8 },
  input: { fontSize: 15, fontFamily: "Poppins_400Regular", color: "#FFF", minHeight: 90, textAlignVertical: "top" },
  langPicker: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  langText: { flex: 1, fontSize: 15, fontFamily: "Poppins_500Medium", color: "#FFF" },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  langChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(236,72,153,0.15)" },
  langChipActive: { backgroundColor: "rgba(236,72,153,0.2)", borderColor: "#EC4899" },
  langChipText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.7)" },
  langChipTextActive: { color: "#EC4899", fontFamily: "Poppins_600SemiBold" },
  translateBtn: { backgroundColor: "#EC4899", borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  translateBtnText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  outputHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  onDevice: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#10B981" },
  outputText: { fontSize: 18, fontFamily: "Poppins_500Medium", color: "#FFF", lineHeight: 28 },
  noCloudNote: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  noCloudText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(157,78,221,0.8)" },
});
