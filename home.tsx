import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: W } = Dimensions.get("window");
const CARD_GAP = 10;
const CARD_SIZE = (W - 32 - CARD_GAP * 3) / 4;

interface Feature {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  tag: string;
}

const FEATURES: Feature[] = [
  { id: "human-scan", title: "Human\nScan", icon: "person-circle-outline", color: "#7C3AED", route: "/human-scan", tag: "Health" },
  { id: "plant-doctor", title: "Plant\nDoctor", icon: "leaf-outline", color: "#10B981", route: "/plant-doctor", tag: "Nature" },
  { id: "vehicle-ai", title: "Vehicle\nAI", icon: "car-sport-outline", color: "#3B82F6", route: "/vehicle-ai", tag: "Tech" },
  { id: "doc-scanner", title: "Doc\nScanner", icon: "document-text-outline", color: "#F59E0B", route: "/doc-scanner", tag: "Utility" },
  { id: "translate", title: "Live\nTranslate", icon: "language-outline", color: "#EC4899", route: "/translate", tag: "Language" },
  { id: "scam-shield", title: "Scam\nShield", icon: "shield-checkmark-outline", color: "#EF4444", route: "/scam-shield", tag: "Security" },
  { id: "learn-mode", title: "Learn\nMode", icon: "school-outline", color: "#8B5CF6", route: "/learn-mode", tag: "Education" },
  { id: "travel-ai", title: "Travel\nAI", icon: "airplane-outline", color: "#06B6D4", route: "/travel-ai", tag: "Travel" },
  { id: "curiosity", title: "Curiosity", icon: "telescope-outline", color: "#F97316", route: "/curiosity", tag: "Explore" },
  { id: "problem-solver", title: "Problem\nSolver", icon: "calculator-outline", color: "#A855F7", route: "/problem-solver", tag: "Math" },
  { id: "ai-voice", title: "AI\nVoice", icon: "mic-outline", color: "#14B8A6", route: "/ai-voice", tag: "Voice" },
  { id: "community", title: "Community", icon: "people-outline", color: "#F472B6", route: "/community", tag: "Social" },
  { id: "security-vault", title: "Security\nVault", icon: "lock-closed-outline", color: "#EF4444", route: "/security-vault", tag: "Privacy" },
  { id: "security", title: "Security", icon: "shield-outline", color: "#9D4EDD", route: "/security", tag: "Settings" },
  { id: "privacy-dash", title: "Privacy\nDash", icon: "eye-off-outline", color: "#10B981", route: "/privacy-dashboard", tag: "Privacy" },
  { id: "live-scanner", title: "Live\nScanner", icon: "scan-outline", color: "#00D4FF", route: "/live-scanner", tag: "AI Vision" },
  { id: "vehicle-watch", title: "Vehicle\nWatch", icon: "car-outline", color: "#F97316", route: "/vehicle-watch", tag: "Alert" },
  { id: "person-watch", title: "Person\nWatch", icon: "person-circle-outline", color: "#EC4899", route: "/person-watch", tag: "Alert" },
  { id: "speed-radar", title: "Speed\nRadar", icon: "speedometer-outline", color: "#FACC15", route: "/speed-radar", tag: "Radar" },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(withTiming(0.92, { duration: 80 }), withTiming(1, { duration: 120 }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => router.push(feature.route as any), 100);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={animStyle}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <BlurView intensity={Platform.OS === "ios" ? 18 : 0} tint="dark" style={[styles.card, { borderColor: feature.color + "44" }]}>
          <View style={[styles.cardInner, { backgroundColor: Platform.OS === "ios" ? "rgba(255,255,255,0.04)" : "rgba(20,0,40,0.85)" }]}>
            <View style={[styles.iconWrap, { backgroundColor: feature.color + "22" }]}>
              <Ionicons name={feature.icon} size={20} color={feature.color} />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{feature.title}</Text>
            <Text style={[styles.cardTag, { color: feature.color + "BB" }]}>{feature.tag}</Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

function PrivacyModal({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <BlurView intensity={40} tint="dark" style={styles.modalCard}>
          <View style={styles.modalInner}>
            <Ionicons name="shield-checkmark" size={48} color="#10B981" />
            <Text style={styles.modalTitle}>Privacy Guaranteed</Text>
            <Text style={styles.modalBody}>
              We never store, upload, or share your images. All processing happens on your device.
              {"\n\n"}Your data never leaves your phone.
            </Text>
            <Text style={styles.modalNiten}>Developed by NITEN</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={onDismiss}>
              <Text style={styles.modalBtnText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [privacyVisible, setPrivacyVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const seen = await SecureStore.getItemAsync("privacy_shown");
      if (!seen) {
        setPrivacyVisible(true);
      }
    })();
  }, []);

  const handleDismissPrivacy = async () => {
    await SecureStore.setItemAsync("privacy_shown", "true");
    setPrivacyVisible(false);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000000", "#0D0520", "#1A0A2E"]} style={StyleSheet.absoluteFill} />

      <PrivacyModal visible={privacyVisible} onDismiss={handleDismissPrivacy} />

      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.headerSub}>OmniLens AI</Text>
          <Text style={styles.headerTitle}>Explore Reality</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/settings")} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <FlatList
        data={FEATURES}
        keyExtractor={(f) => f.id}
        numColumns={4}
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 20 },
        ]}
        columnWrapperStyle={styles.row}
        scrollEnabled={!!FEATURES.length}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => <FeatureCard feature={item} index={index} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#9D4EDD",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(147,51,234,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: "rgba(147,51,234,0.15)", marginHorizontal: 16 },
  grid: { padding: 16, gap: CARD_GAP },
  row: { gap: CARD_GAP },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE + 8,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    gap: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 9.5,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 13,
  },
  cardTag: {
    fontSize: 8,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 24,
    overflow: "hidden",
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  modalInner: {
    backgroundColor: "rgba(0,20,10,0.8)",
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  modalBody: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 22,
  },
  modalNiten: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#9D4EDD",
  },
  modalBtn: {
    marginTop: 8,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  modalBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
  },
});
