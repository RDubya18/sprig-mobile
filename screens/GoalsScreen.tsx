// screens/GoalsScreen.tsx
import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { sprig, cardStyle, spacing, text } from "../lib/theme";

type Props = { onBack?: () => void };

type Goal = {
  id: number;
  name: string;
  target: number;
  contributed: number;
  due?: string | null;
};

const money = (n: number) =>
  (n || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function GoalsScreen({ onBack }: Props) {
  // TODO: wire to goals + goal_ledgers tables
  const goals: Goal[] = [
    { id: 1, name: "Emergency fund", target: 5000, contributed: 1800, due: "2026-06-01" },
    { id: 2, name: "Vacation", target: 2500, contributed: 600, due: "2026-01-15" },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.md, paddingBottom: 48 }}>
      <View style={styles.header}>
        {onBack ? <Pressable onPress={onBack} hitSlop={8}><Text style={styles.back}>‹ Back</Text></Pressable> : <View style={{ width: 48 }} />}
        <Text style={text.h2 as any}>Goals</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={[cardStyle, { marginTop: spacing.md }]}>
        {goals.map((g, i) => {
          const pct = g.target > 0 ? Math.min(100, (g.contributed / g.target) * 100) : 100;
          return (
            <View key={g.id} style={[styles.goal, i < goals.length - 1 && styles.goalBorder]}>
              <Text style={styles.name}>{g.name}</Text>
              <View style={styles.progressWrap}><View style={[styles.progressBar, { width: `${pct}%` }]} /></View>
              <Text style={styles.meta}>
                {money(g.contributed)} / {money(g.target)} {g.due ? `• Due ${g.due}` : ""}
              </Text>
            </View>
          );
        })}

        <Pressable style={[styles.addBtn, { marginTop: spacing.md }]}><Text style={styles.addTxt}>＋ Add goal</Text></Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: sprig.background },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { color: sprig.green, fontWeight: "800", fontSize: 14, paddingHorizontal: 8, paddingVertical: 6 },

  goal: { paddingVertical: 12 },
  goalBorder: { borderBottomColor: "rgba(0,0,0,0.06)", borderBottomWidth: StyleSheet.hairlineWidth },
  name: { color: sprig.ink900, fontWeight: "900" },
  progressWrap: { height: 8, backgroundColor: sprig.outline, borderRadius: 8, overflow: "hidden", marginTop: 6, marginRight: 12 },
  progressBar: { height: "100%", borderRadius: 8, backgroundColor: sprig.green },
  meta: { color: sprig.ink600, fontWeight: "700", fontSize: 12, marginTop: 6 },

  addBtn: { paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: sprig.green },
  addTxt: { color: "#fff", fontWeight: "900" },
});
