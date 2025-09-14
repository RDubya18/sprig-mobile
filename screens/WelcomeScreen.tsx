// screens/WelcomeScreen.tsx
import * as React from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../lib/colors";
import Card from "../components/Card";
import { importSampleCsv, pickCsvAndImport, ImportSummary } from "../lib/importer";

type Props = {
  onDone: () => void; // navigate to Home
};

const SAMPLE_CSV = [
  "Date,Description,Merchant,Category,Amount",
  "2025-08-02,LYFT RIDE,LYFT,Transport,-23.50",
  "2025-08-03,SAFEWAY 334,SAFEWAY,Groceries,-86.12",
  "2025-08-10,STARBUCKS,STARBUCKS,Coffee,-6.25",
  "2025-08-12,ACME PAYROLL,,Income,2500.00",
  "2025-08-15,NETFLIX,NETFLIX,Subscriptions,-15.49",
  "2025-08-22,SHELL 1234,SHELL,Gas,-48.10",
  "2025-09-01,RENT,,, -1800.00",
  "2025-09-02,UBER EATS,UBER,Food Delivery,-27.35",
].join("\n");

export default function WelcomeScreen({ onDone }: Props) {
  const [busy, setBusy] = React.useState<null | "csv" | "sample">(null);
  const [lastSummary, setLastSummary] = React.useState<ImportSummary | null>(null);

  const handleCSV = async () => {
    try {
      setBusy("csv");
      const summary = await pickCsvAndImport();
      setLastSummary(summary);
      if (summary.inserted > 0) await AsyncStorage.setItem("sprig.onboarded", "1");
    } catch (e: any) {
      Alert.alert("Import failed", e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleSample = async () => {
    try {
      setBusy("sample");
      const summary = await importSampleCsv(SAMPLE_CSV);
      setLastSummary(summary);
      if (summary.inserted > 0) await AsyncStorage.setItem("sprig.onboarded", "1");
    } catch (e: any) {
      Alert.alert("Import failed", e?.message ?? String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Welcome to Sprig</Text>
      <Text style={styles.subtle}>Post-Mint budgeting that respects your data.</Text>

      <Card style={{ marginTop: 16 }}>
        <Text style={styles.cardTitle}>Get started</Text>
        <Text style={styles.desc}>
          Import your CSV to see budgets and reports. Or try sample data first (you can delete later).
        </Text>

        <View style={{ height: 12 }} />

        <Pressable
          onPress={handleCSV}
          style={[styles.btn, busy && styles.btnDisabled]}
          disabled={!!busy}
          accessibilityRole="button"
        >
          {busy === "csv" ? <ActivityIndicator /> : <Text style={styles.btnTxt}>Import CSV</Text>}
        </Pressable>

        <View style={{ height: 8 }} />

        <Pressable
          onPress={handleSample}
          style={[styles.btnOutline, busy && styles.btnDisabled]}
          disabled={!!busy}
          accessibilityRole="button"
        >
          {busy === "sample" ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnOutlineTxt}>Try sample data</Text>
          )}
        </Pressable>
      </Card>

      {lastSummary && (
        <Card style={{ marginTop: 16 }}>
          <Text style={styles.cardTitle}>Import summary</Text>
          <View style={styles.kv}><Text style={styles.k}>Rows parsed</Text><Text style={styles.v}>{lastSummary.parsed}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Duplicates skipped</Text><Text style={styles.v}>{lastSummary.duplicates}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Inserted</Text><Text style={styles.v}>{lastSummary.inserted}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Total skipped</Text><Text style={styles.v}>{lastSummary.skipped}</Text></View>

          <Pressable onPress={onDone} style={[styles.btn, { marginTop: 12 }]} accessibilityRole="button">
            <Text style={styles.btnTxt}>Continue</Text>
          </Pressable>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: colors.background ?? "#F5F7F9" },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink900 ?? "#0F172A" },
  subtle: { marginTop: 4, color: colors.ink600 ?? "#475569" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
  desc: { marginTop: 6, color: colors.ink600 ?? "#475569" },
  btn: {
    alignItems: "center", justifyContent: "center", paddingVertical: 12,
    borderRadius: 12, backgroundColor: colors.green ?? "#16A34A",
  },
  btnTxt: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  btnOutline: {
    alignItems: "center", justifyContent: "center", paddingVertical: 12,
    borderRadius: 12, backgroundColor: "#FFF", borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border ?? "#E5E7EB",
  },
  btnOutlineTxt: { fontWeight: "700", fontSize: 16, color: colors.ink900 ?? "#0F172A" },
  btnDisabled: { opacity: 0.6 },
  kv: { marginTop: 8, flexDirection: "row", justifyContent: "space-between" },
  k: { color: colors.ink700 ?? "#334155" },
  v: { color: colors.ink900 ?? "#0F172A", fontWeight: "700" },
});
