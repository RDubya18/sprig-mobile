import * as React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../lib/colors";

export type TabKey = "home" | "budgets" | "tx" | "reports" | "settings";
type Props = { active: TabKey; onTab: (key: TabKey) => void };

export default function TabBar({ active, onTab }: Props) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "budgets", label: "Budgets" },
    { key: "tx", label: "Tx" },
    { key: "reports", label: "Reports" },
    { key: "settings", label: "Settings" },
  ];
  return (
    <View style={styles.wrap}>
      {tabs.map(t => (
        <Pressable key={t.key} onPress={() => onTab(t.key)} style={[styles.tab, active === t.key && styles.active]}>
          <Text style={[styles.txt, active === t.key && styles.txtActive]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "space-around", padding: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: "#FFF" },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  active: { backgroundColor: "#F0FDF4" },
  txt: { color: colors.ink700 },
  txtActive: { fontWeight: "700", color: colors.ink900 },
});
