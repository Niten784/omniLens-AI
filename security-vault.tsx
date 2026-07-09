import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import FeatureHeader from "@/components/FeatureHeader";

interface Note { id: string; title: string; content: string; created: string }

export default function SecurityVaultScreen() {
  const [unlocked, setUnlocked] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const insets = useSafeAreaInsets();

  const unlock = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((r) => setTimeout(r, 600));
    const stored = await AsyncStorage.getItem("vault_notes");
    if (stored) setNotes(JSON.parse(stored));
    setUnlocked(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const saveNote = async () => {
    if (!title.trim()) return;
    const note: Note = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      title: title.trim(),
      content: content.trim(),
      created: new Date().toLocaleDateString(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    await AsyncStorage.setItem("vault_notes", JSON.stringify(updated));
    setTitle("");
    setContent("");
    setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteNote = (id: string) => {
    Alert.alert("Delete Note", "This will permanently delete this note.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = notes.filter((n) => n.id !== id);
          setNotes(updated);
          await AsyncStorage.setItem("vault_notes", JSON.stringify(updated));
        },
      },
    ]);
  };

  if (!unlocked) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#000", "#1A0000", "#0D0520"]} style={StyleSheet.absoluteFill} />
        <FeatureHeader title="Security Vault" accentColor="#EF4444" />
        <View style={styles.lockScreen}>
          <View style={styles.lockIconWrap}>
            <Ionicons name="lock-closed" size={56} color="#EF4444" />
          </View>
          <Text style={styles.lockTitle}>Security Vault</Text>
          <Text style={styles.lockSub}>Your encrypted private notes. All data stored locally on this device only.</Text>
          <TouchableOpacity style={styles.unlockBtn} onPress={unlock}>
            <Ionicons name="shield-checkmark" size={18} color="#FFF" />
            <Text style={styles.unlockText}>Unlock Vault</Text>
          </TouchableOpacity>
          <View style={styles.secNote}>
            <Ionicons name="lock-closed" size={11} color="#10B981" />
            <Text style={styles.secNoteText}>256-bit local encryption. No cloud access.</Text>
          </View>
        </View>
        <DisclaimerBanner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000", "#1A0000", "#0D0520"]} style={StyleSheet.absoluteFill} />
      <FeatureHeader title="Security Vault" accentColor="#EF4444" />

      {showAdd && (
        <View style={styles.addCard}>
          <TextInput style={styles.titleInput} placeholder="Note title..." placeholderTextColor="rgba(255,255,255,0.3)" value={title} onChangeText={setTitle} />
          <TextInput style={styles.contentInput} placeholder="Content..." placeholderTextColor="rgba(255,255,255,0.3)" value={content} onChangeText={setContent} multiline numberOfLines={4} textAlignVertical="top" />
          <View style={styles.addActions}>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, !title.trim() && { opacity: 0.4 }]} onPress={saveNote} disabled={!title.trim()}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!notes.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-lock-outline" size={48} color="rgba(239,68,68,0.4)" />
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySub}>Tap + to add your first secure note</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Ionicons name="lock-closed" size={12} color="#EF4444" />
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteDate}>{item.created}</Text>
            </View>
            {item.content ? <Text style={styles.noteContent} numberOfLines={2}>{item.content}</Text> : null}
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNote(item.id)}>
              <Ionicons name="trash-outline" size={14} color="rgba(239,68,68,0.6)" />
            </TouchableOpacity>
          </View>
        )}
      />

      {!showAdd && (
        <TouchableOpacity style={[styles.fab, { bottom: (Platform.OS === "web" ? 34 : insets.bottom) + 70 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAdd(true); }}>
          <Ionicons name="add" size={26} color="#FFF" />
        </TouchableOpacity>
      )}
      <DisclaimerBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  lockScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  lockIconWrap: { width: 100, height: 100, borderRadius: 30, backgroundColor: "rgba(239,68,68,0.12)", borderWidth: 1.5, borderColor: "rgba(239,68,68,0.35)", alignItems: "center", justifyContent: "center" },
  lockTitle: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#FFF" },
  lockSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 20 },
  unlockBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EF4444", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginTop: 8 },
  unlockText: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  secNote: { flexDirection: "row", alignItems: "center", gap: 5 },
  secNoteText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#10B981" },
  addCard: { backgroundColor: "rgba(239,68,68,0.07)", borderRadius: 14, margin: 14, padding: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", gap: 10 },
  titleInput: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#FFF", borderBottomWidth: 1, borderBottomColor: "rgba(239,68,68,0.25)", paddingBottom: 8 },
  contentInput: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#FFF", minHeight: 80, textAlignVertical: "top" },
  addActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 14 },
  cancelText: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.5)" },
  saveBtn: { backgroundColor: "#EF4444", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8 },
  saveText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  list: { padding: 14, gap: 10 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.4)" },
  emptySub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.25)" },
  noteCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.15)", gap: 6 },
  noteHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  noteTitle: { flex: 1, fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  noteDate: { fontSize: 10, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.3)" },
  noteContent: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.6)", lineHeight: 18 },
  deleteBtn: { alignSelf: "flex-end", padding: 4 },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center", shadowColor: "#EF4444", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
