// screens/ExportScreen.tsx
import * as React from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import Card from "../components/Card";
import { colors } from "../lib/colors";
import { shareCsv, shareJson } from "../lib/export";
import {
  getAllTransactions,
  getAllBudgets,
  getAllRules,
  getAllGoals,
} from "../db/db";

type Props = {
  onBack: () => void;
};

export default function ExportScreen({ onBack }: Props) {
  const [busy, setBusy] = React.useState<null | string>(null);

  const handleExportTx = async () => {
    try {
      setBusy("transactions");
      const rows = await getAllTransactions();
      await shareCsv(`sprig-transactions.csv`, rows as any);
    } catch (e: any) {
      Alert.alert("Export failed", e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleExportConfig = async () => {
    try {
      setBusy("config");
      const [budgets, rules, goals] = await Promise.all([
        getAllBudgets(),
        getAllRules(),
        getAllGoals(),
      ]);
      await shareJson(`sprig-config.json`, { budgets, rules, goals });
    } catch (e: any) {
      Alert.alert("Export failed", e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Export</Text>
        <Pressable onPress={onBack} accessibilityRole="button" style={styles.backBtn}>
          <Text style={styles.backTxt}>Close</Text>
        </Pressable>
      </View>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.cardTitle}>Your data</Text>
        <Text style={styles.subtle}>
          Export transactions as CSV, and budgets/rules/goals as JSON. You can re-import or back it up anywhere.
        </Text>

        <View style={{ height: 12 }} />

        <Pressable
          onPress={handleExportTx}
          style={[styles.btn, busy === "transactions" && styles.btnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Export transactions as CSV"
          disabled={!!busy}
        >
          {busy === "transactions" ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnTxt}>Export Transactions (CSV)</Text>
          )}
        </Pressable>

        <View style={{ height: 8 }} />

        <Pressable
          onPress={handleExportConfig}
          style={[styles.btn, busy === "config" && styles.btnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Export budgets, rules, and goals as JSON"
          disabled={!!busy}
        >
          {busy === "config" ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnTxt}>Export Budgets/Rules/Goals (JSON)</Text>
          )}
        </Pressable>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.background ?? "#F5F7F9",
  },
  header: {
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink900 ?? "#0F172A",
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border ?? "#E5E7EB",
  },
  backTxt: {
    fontWeight: "600",
    color: colors.ink700 ?? "#334155",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink900 ?? "#0F172A",
  },
  subtle: {
    marginTop: 6,
    color: colors.ink600 ?? "#475569",
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.green ?? "#16A34A",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnTxt: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
