// Centralized design system for Sprig

import { StyleSheet, Platform } from "react-native";

/** 🌱 Core color palette */
export const sprig = {
  // Brand
  green: "#16A34A",
  red: "#EF4444",

  // Backgrounds
  background: "#F9FAFB", // light gray / off-white
  dark: "#111827", // dark mode background

  // Borders
  border: "#E5E7EB",

  // Ink (text shades)
  ink900: "#111827", // darkest text
  ink700: "#374151", // strong secondary
  ink600: "#4B5563", // muted text
  ink500: "#6B7280", // subtle text

  // Outline / divider
  outline: "#E5E7EB",

  // Utility
  white: "#FFFFFF", // ✅ Added
  black: "#000000",

  // Shadows
  shadow: "#000000",
};

/** 📏 Spacing scale */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** 📝 Text presets */
export const text = StyleSheet.create({
  h1: { fontSize: 32, fontWeight: "900", color: sprig.ink900 },
  h2: { fontSize: 24, fontWeight: "800", color: sprig.ink900 },
  h3: { fontSize: 18, fontWeight: "800", color: sprig.ink900 },
  p: { fontSize: 16, fontWeight: "400", color: sprig.ink700 },
  subtle: { fontSize: 14, fontWeight: "600", color: sprig.ink600 },
});

/** 📦 Card wrapper style */
export const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: spacing.md,
  shadowColor: sprig.shadow,
  shadowOpacity: 0.06,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

/** 🖥️ Mono font (good for numbers, code, etc.) */
export const mono = {
  fontFamily: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
};
