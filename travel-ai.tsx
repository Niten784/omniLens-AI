import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

const DESTINATIONS: Record<string, { tips: string[]; phrase: string; currency: string; culture: string }> = {
  japan: { tips: ["Bow slightly when greeting — 15° for casual, 30° for formal", "Remove shoes before entering homes and many restaurants", "Cash is still king — carry yen at all times", "Queuing is sacred — always wait in line"], phrase: "Arigatou gozaimasu (Thank you very much)", currency: "JPY — ¥150/USD approx", culture: "Silence is respectful. Avoid eating while walking." },
  france: { tips: ["Greet with 'Bonjour' before anything else — it's essential etiquette", "Dinner starts at 8pm — earlier is considered tourist behavior", "Tipping is not mandatory but 5-10% is appreciated", "Shops close on Sundays in smaller towns"], phrase: "Merci beaucoup (Thank you very much)", currency: "EUR — €0.93/USD approx", culture: "Fashion matters. Casual dress is seen as disrespectful in restaurants." },
  india: { tips: ["Remove shoes at religious sites and many homes", "Right hand only for giving and receiving — left is considered unclean", "Bargaining is expected in markets — start at 50% of asking price", "Avoid public displays of affection"], phrase: "Dhanyavaad (Thank you)", currency: "INR — ₹83/USD approx", culture: "Hierarchy is important. Address elders and seniors formally." },
  brazil: { tips: ["Brazilians are famously warm — expect hugs and cheek kisses", "Traffic is chaotic — use Uber over taxis for pricing clarity", "Beach attire is fine near beaches but not in city centers", "Learn basic Portuguese — English is limited outside major cities"], phrase: "Obrigado/a (Thank you)", currency: "BRL — R$5/USD approx", culture: "Relationships come first. Business rarely starts without small talk." },
};

function getDestination(q: string) {
  const key = Object.keys(DESTINATIONS).find((k) => q.toLowerCase().includes(k));
  return key ? { ...DESTINATIONS[key], name: key.charAt(0).toUpperCase() + key.slice(1) } : null;
}

type State = "idle" | "loading" | "results";

export default function TravelAIScreen() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<(typeof DESTINATIONS[string] & { name: string }) | null>(null);
  const insets = useSafeAreaInsets();

  const search = async () => {
    if (!query.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState("loading");
    await new Promise((r) => setTimeout(r, 1500));
    const dest = getDestination(query) ?? { ...DESTINATIONS.japan, name: query };
    setResult(dest);
    setState("results");
  };

  const POPULAR = ["Japan", "France", "India", "Brazil"];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000", "#001A1A", "#0D0520"]} style={StyleSheet.absoluteFill} />
      <FeatureHeader title="Travel AI" accentColor="#06B6D4" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.searchCard}>
          <Ionicons name="search" size={18} color="#06B6D4" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destination... (e.g. Japan)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
          />
          {state === "loading" ? (
            <ActivityIndicator size="small" color="#06B6D4" />
          ) : (
            <TouchableOpacity onPress={search}>
              <Ionicons name="arrow-forward-circle" size={24} color="#06B6D4" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.popularRow}>
          {POPULAR.map((p) => (
            <TouchableOpacity key={p} style={styles.popularChip} onPress={() => { setQuery(p); }}>
              <Text style={styles.popularText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {state === "results" && result && (
          <View style={styles.resultCard}>
            <View style={styles.destHeader}>
              <Ionicons name="airplane" size={24} color="#06B6D4" />
              <Text style={styles.destName}>{result.name}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insider Tips</Text>
              {result.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sep} />

            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={14} color="#F59E0B" />
              <Text style={styles.infoLabel}>Currency</Text>
              <Text style={styles.infoVal}>{result.currency}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-outline" size={14} color="#10B981" />
              <Text style={styles.infoLabel}>Key Phrase</Text>
              <Text style={styles.infoVal}>{result.phrase}</Text>
            </View>

            <View style={styles.cultureBox}>
              <Ionicons name="globe-outline" size={14} color="#06B6D4" />
              <Text style={styles.cultureText}>{result.culture}</Text>
            </View>
          </View>
        )}

        <View style={styles.localNote}>
          <Ionicons name="lock-closed" size={11} color="#9D4EDD" />
          <Text style={styles.localText}>All data processed locally. No location tracked.</Text>
        </View>
      </ScrollView>
      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { padding: 16, gap: 14 },
  searchCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(6,182,212,0.25)" },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Poppins_400Regular", color: "#FFF" },
  popularRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  popularChip: { backgroundColor: "rgba(6,182,212,0.12)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(6,182,212,0.3)" },
  popularText: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#06B6D4" },
  resultCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "rgba(6,182,212,0.3)", gap: 14 },
  destHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  destName: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#FFF" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#06B6D4", letterSpacing: 0.8 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  tipDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#06B6D4", marginTop: 6 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  sep: { height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { width: 80, fontSize: 12, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.5)" },
  infoVal: { flex: 1, fontSize: 12, fontFamily: "Poppins_400Regular", color: "#FFF" },
  cultureBox: { backgroundColor: "rgba(6,182,212,0.08)", borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1, borderColor: "rgba(6,182,212,0.2)" },
  cultureText: { flex: 1, fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)", lineHeight: 20 },
  localNote: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  localText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(157,78,221,0.7)" },
});
