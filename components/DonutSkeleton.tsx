// components/DonutSkeleton.tsx
import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../lib/colors";

type Props = { size?: number; style?: ViewStyle | ViewStyle[] };

export default function DonutSkeleton({ size = 160, style }: Props) {
  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colors.border ?? "#E5E7EB",
        },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: size * 0.66,
            height: size * 0.66,
            borderRadius: (size * 0.66) / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignSelf: "center",
    borderWidth: 12,
    backgroundColor: "#F3F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    backgroundColor: "#E9EEF5",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border ?? "#E5E7EB",
  },
});
