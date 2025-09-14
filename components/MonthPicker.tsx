// components/MonthPicker.tsx
import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { addMonths, formatMonthTitle } from "../lib/date";
import { colors } from "../lib/colors";

type Props = {
  value: Date;
  onChange: (d: Date) => void;
  style?: any;
};

export default function MonthPicker({ value, onChange, style }: Props) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="adjustable">
      <Pressable
        onPress={() => onChange(addMonths(value, -1))}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        accessibilityLabel="Previous month"
      >
        <Text style={styles.btnText}>‹</Text>
      </Pressable>

      <Text
        style={styles.title}
        accessibilityRole="header"
        accessibilityLabel={`Current month ${formatMonthTitle(value)}`}
      >
        {formatMonthTitle(value)}
      </Text>

      <Pressable
        onPress={() => onChange(addMonths(value, +1))}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        accessibilityLabel="Next month"
      >
        <Text style={styles.btnText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border ?? "#E5E7EB",
    backgroundColor: "#FFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink700 ?? "#334155",
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink900 ?? "#0F172A",
  },
  pressed: {
    opacity: 0.5,
  },
});
