// components/ProgressBar.tsx
import * as React from "react";
import { View, StyleSheet, AccessibilityValue } from "react-native";
import { colors } from "../lib/colors";

type Props = {
  /** 0 → 1 */
  progress: number;
  /** Forwarded to RN for screen readers */
  accessibilityValue?: AccessibilityValue;
  /** Height of the bar (px) */
  height?: number;
  /** Optional style overrides */
  style?: any;
};

export default function ProgressBar({
  progress,
  accessibilityValue,
  height = 12,
  style,
}: Props) {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: "#F1F5F9", borderRadius: height / 2 },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={accessibilityValue ?? { min: 0, max: 100, now: Math.round(p * 100) }}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${p * 100}%`,
            height,
            borderRadius: height / 2,
            backgroundColor: colors.green ?? "#16A34A",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border ?? "#E5E7EB",
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  fill: {
    width: "0%",
  },
});
