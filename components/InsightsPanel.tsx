// components/InsightsPanel.tsx
import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "./Card";
import { colors } from "../lib/colors";

export default function InsightsPanel({ items }: { items: { message: string; type: "increase" | "decrease" }[] }) {
  if (!items?.length) return null;
  return (
    <Card style={{ marginTop: 12 }}>
      <Text style={styles.title}>Category Coach</Text>
      <View style={{ marginTop: 8, gap: 8 }}>
        {items.map((it, idx) => (
          <View key={idx} style={styles.row}>
            <View style={[styles.badge, it.type === "increase" ? styles.up : styles.down]} />
            <Text style={styles.msg}>{it.message}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#DDD" },
  up: { backgroundColor: colors.green ?? "#16A34A" },
  down: { backgroundColor: colors.red ?? "#DC2626" },
  msg: { color: colors.ink800 ?? "#1F2937" },
});
