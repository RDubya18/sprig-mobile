// screens/SettingsScreen.tsx
import * as React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import Card from "../components/Card";
import { colors } from "../lib/colors";

type Props = {
  onOpenRules?: () => void;
  onOpenExport?: () => void;
};

export default function SettingsScreen({ onOpenRules, onOpenExport }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Settings</Text>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.section}>Data</Text>

        <Pressable
          onPress={onOpenExport}
          style={styles.item}
          accessibilityRole="button"
          accessibilityLabel="Open Export Center"
        >
          <Text style={styles.itemText}>Export Center</Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>

        <Pressable
          onPress={onOpenRules}
          style={styles.item}
          accessibilityRole="button"
          accessibilityLabel="Manage Rules"
        >
          <Text style={styles.itemText}>Rules</Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.section}>About</Text>
        <View style={styles.itemStatic}>
          <Text style={styles.itemText}>Version</Text>
          <Text style={styles.meta}>0.1.0</Text>
        </View>
        <View style={styles.itemStatic}>
          <Text style={styles.itemText}>Privacy</Text>
          <Text style={styles.meta}>Local-first; you control export.</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    backgroundColor: colors.background ?? "#F5F7F9",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink900 ?? "#0F172A",
  },
  section: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink700 ?? "#334155",
    marginBottom: 8,
  },
  item: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border ?? "#E5E7EB",
  },
  itemStatic: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border ?? "#E5E7EB",
  },
  itemText: {
    fontSize: 16,
    color: colors.ink900 ?? "#0F172A",
  },
  meta: {
    color: colors.ink600 ?? "#475569",
  },
  chev: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink700 ?? "#334155",
  },
});
