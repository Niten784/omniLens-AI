import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DisclaimerBanner() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.banner, { paddingBottom: insets.bottom + 6 }]}>
      <View style={styles.row}>
        <Ionicons name="lock-closed" size={10} color="#10B981" />
        <Text style={styles.text}>Secure & Private</Text>
        <Text style={styles.sep}>|</Text>
        <Ionicons name="information-circle-outline" size={10} color="#F59E0B" />
        <Text style={styles.text}>Informational only</Text>
        <Text style={styles.sep}>|</Text>
        <Text style={styles.niten}>Developed by NITEN</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "rgba(0,0,0,0.85)",
    borderTopWidth: 1,
    borderTopColor: "rgba(147,51,234,0.20)",
    paddingTop: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  text: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Poppins_400Regular",
  },
  sep: {
    fontSize: 10,
    color: "rgba(255,255,255,0.2)",
  },
  niten: {
    fontSize: 10,
    color: "rgba(147,51,234,0.8)",
    fontFamily: "Poppins_600SemiBold",
  },
});
