// components/Card.tsx
import * as React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { colors } from "../lib/colors";

type Props = ViewProps & {
  muted?: boolean;    // softer background
  padded?: boolean;   // default true
  round?: number;     // default 16
};

export default function Card({ style, children, muted, padded = true, round = 16, ...rest }: Props) {
  return (
    <View
      style={[
        styles.base,
        { borderRadius: round, backgroundColor: muted ? "#F5F7FA" : colors.card },
        padded && styles.padded,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  padded: { padding: 14 },
});
