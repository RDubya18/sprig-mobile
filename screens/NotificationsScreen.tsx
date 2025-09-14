import * as React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sprig, spacing, cardStyle } from "lib/theme";

export default function NotificationsScreen() {
  const rows = [
    { id: 1, title: "Budget reminder", detail: "You’ve used 75% of Groceries this month." },
    { id: 2, title: "Import complete", detail: "CSV import finished. 238 transactions added." },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={{ padding: spacing.md }}>
        <Text style={styles.title}>Notifications</Text>

        <View style={[cardStyle, { marginTop: spacing.md }]}>
          {rows.map((r, i) => (
            <View key={r.id} style={[styles.row, i < rows.length - 1 && styles.rowDivider]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.item}>{r.title}</Text>
                <Text style={styles.subtle}>{r.detail}</Text>
              </View>
              <Pressable hitSlop={8}>
                <Text style={styles.chev}>›</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: sprig.background },
  title: { color: sprig.ink900, fontSize: 22, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: sprig.border },
  item: { color: sprig.ink900, fontWeight: "800" },
  subtle: { color: sprig.ink600, fontWeight: "700", marginTop: 2 },
  chev: { color: sprig.ink600, fontSize: 20, marginLeft: 8 },
});
