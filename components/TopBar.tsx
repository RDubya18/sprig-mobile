import * as React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../lib/colors";

type Props = { onOpenSettings?: () => void; onOpenNotifications?: () => void };
export default function TopBar({ onOpenSettings, onOpenNotifications }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.logo}>Sprig</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable onPress={onOpenNotifications} style={styles.pill}><Text>🔔</Text></Pressable>
        <Pressable onPress={onOpenSettings} style={styles.pill}><Text>⚙️</Text></Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { fontWeight: "800", fontSize: 18, color: colors.ink900 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#FFF", borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
});
