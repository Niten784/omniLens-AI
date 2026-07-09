import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

interface Post { id: string; text: string; category: string; time: string; likes: number }

const SEED: Post[] = [
  { id: "1", text: "Just identified a rare Orchid species in my garden using Plant Doctor! It's a Phalaenopsis amabilis.", category: "Plants", time: "2h ago", likes: 12 },
  { id: "2", text: "Scam Shield caught a fake bank SMS that looked incredibly convincing. Saved me from a phishing attack!", category: "Security", time: "5h ago", likes: 28 },
  { id: "3", text: "Learn Mode told me fascinating facts about brutalist architecture while I was walking through downtown.", category: "Education", time: "1d ago", likes: 8 },
];

const CATS = ["General", "Plants", "Security", "Education", "Travel", "Tech"];

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>(SEED);
  const [newText, setNewText] = useState("");
  const [cat, setCat] = useState("General");
  const [showCompose, setShowCompose] = useState(false);
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("community_posts");
      if (stored) setPosts([...SEED, ...JSON.parse(stored)]);
    })();
  }, []);

  const publish = async () => {
    if (!newText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const post: Post = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      text: newText.trim(),
      category: cat,
      time: "Just now",
      likes: 0,
    };
    const updated = [post, ...posts];
    setPosts(updated);
    const custom = updated.filter((p) => !SEED.find((s) => s.id === p.id));
    await AsyncStorage.setItem("community_posts", JSON.stringify(custom));
    setNewText("");
    setShowCompose(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const like = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts((p) => p.map((post) => post.id === id ? { ...post, likes: post.likes + 1 } : post));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000", "#1A0020", "#0D0520"]} style={StyleSheet.absoluteFill} />
      <FeatureHeader title="Community" accentColor="#F472B6" />

      {showCompose && (
        <View style={styles.composeCard}>
          <View style={styles.catRow}>
            {CATS.map((c) => (
              <TouchableOpacity key={c} style={[styles.catChip, c === cat && styles.catChipActive]} onPress={() => setCat(c)}>
                <Text style={[styles.catText, c === cat && styles.catTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.composeInput}
            placeholder="Share your discovery..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={newText}
            onChangeText={setNewText}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View style={styles.composeActions}>
            <TouchableOpacity onPress={() => setShowCompose(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.publishBtn, !newText.trim() && { opacity: 0.4 }]} onPress={publish} disabled={!newText.trim()}>
              <Text style={styles.publishText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!posts.length}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.catPill}>
                <Text style={styles.catPillText}>{item.category}</Text>
              </View>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <Text style={styles.postText}>{item.text}</Text>
            <TouchableOpacity style={styles.likeRow} onPress={() => like(item.id)}>
              <Ionicons name="heart-outline" size={15} color="#F472B6" />
              <Text style={styles.likeCount}>{item.likes}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {!showCompose && (
        <TouchableOpacity style={[styles.fab, { bottom: (Platform.OS === "web" ? 34 : insets.bottom) + 70 }]} onPress={() => setShowCompose(true)}>
          <Ionicons name="add" size={26} color="#FFF" />
        </TouchableOpacity>
      )}

      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  list: { padding: 16, gap: 12 },
  composeCard: { backgroundColor: "rgba(244,114,182,0.08)", borderRadius: 16, margin: 16, padding: 14, borderWidth: 1, borderColor: "rgba(244,114,182,0.3)", gap: 10 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  catChip: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(244,114,182,0.15)" },
  catChipActive: { backgroundColor: "rgba(244,114,182,0.2)", borderColor: "#F472B6" },
  catText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)" },
  catTextActive: { color: "#F472B6", fontFamily: "Poppins_600SemiBold" },
  composeInput: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#FFF", minHeight: 70, textAlignVertical: "top" },
  composeActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 14 },
  cancelText: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.5)" },
  publishBtn: { backgroundColor: "#F472B6", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8 },
  publishText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  postCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(244,114,182,0.15)", gap: 8 },
  postHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  catPill: { backgroundColor: "rgba(244,114,182,0.15)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  catPillText: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#F472B6" },
  timeText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.35)" },
  postText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.85)", lineHeight: 22 },
  likeRow: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" },
  likeCount: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#F472B6" },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#F472B6", alignItems: "center", justifyContent: "center", shadowColor: "#F472B6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
