import * as React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";

import { colors } from "./lib/colors";
import {
  initDb,
  insertTransactions,
  sumSpentForMonth,
  type TxRow,
  initBudgets,
  getBudgets,
  sumSpendByCategoryForMonth,
  initRules,
  applyRulesToUncategorized,
} from "./db/db";

import TransactionsScreen from "./screens/TransactionsScreen";
import ReportsScreen from "./screens/ReportsScreen";
import BudgetsScreen from "./screens/BudgetsScreen";


/* ------------------------- helpers ------------------------- */

const START_BUDGET = 4200;

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function monthName(d = new Date()) {
  return d.toLocaleDateString(undefined, { month: "long" });
}
function yyyyMm(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Parse CSV text -> TxRow[] (handles varied headers + debit/credit) */
function parseCsvTextToRows(text: string): TxRow[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (parsed.errors.length) console.warn("CSV parse warnings:", parsed.errors);

  const normalizeKey = (k: string) => k.trim().toLowerCase();
  const rows: TxRow[] = [];

  for (const rec of parsed.data) {
    if (!rec) continue;
    const lower: Record<string, string> = {};
    Object.keys(rec).forEach((k) => (lower[normalizeKey(k)] = String(rec[k] ?? "")));

    const date =
      lower["date"] || lower["posting date"] || lower["posted"] || lower["trans. date"] || "";
    const description =
      lower["description"] || lower["merchant"] || lower["payee"] || lower["memo"] || "";

    let amount = 0;
    if (lower["debit"] && lower["credit"]) {
      const debit = Number(String(lower["debit"]).replace(/[^0-9.\-]/g, "")) || 0;
      const credit = Number(String(lower["credit"]).replace(/[^0-9.\-]/g, "")) || 0;
      amount = credit !== 0 ? credit : -Math.abs(debit);
    } else {
      const rawAmt =
        lower["amount"] || lower["amt"] || lower["value"] || lower["transaction amount"] || "";
      amount = Number(String(rawAmt).replace(/[^0-9.\-]/g, "")) || 0;
    }

    const category = lower["category"] || lower["cat"] || "";
    if (!date || !description) continue;

    rows.push({ date, description, amount, category: category || undefined });
  }
  return rows;
}

/* ------------------------- inner app ------------------------- */

function AppInner() {
  const insets = useSafeAreaInsets();

  // Home snapshot + navigation
  const [spent, setSpent] = React.useState<number>(0);
  const [view, setView] =
    React.useState<"home" | "tx" | "reports" | "budgets">("home");

  // when navigating to Transactions from drill-ins
  const [txFilterCategory, setTxFilterCategory] = React.useState<string | undefined>(undefined);

  // Budgets at a Glance
  const [budgetMap, setBudgetMap] = React.useState<Record<string, number>>({});
  const [catSpend, setCatSpend] = React.useState<Array<{ category: string; spent: number }>>([]);

  React.useEffect(() => {
    (async () => {
      try {
        await initDb();
        await initBudgets();
        await initRules();
        await refreshSpend();
        await refreshBudgetsAndCatSpend();
      } catch (e) {
        console.error("DB init error:", e);
        Alert.alert("Database error", "We couldn’t initialize local storage.");
      }
    })();
  }, []);

  async function refreshSpend() {
    const total = await sumSpentForMonth(yyyyMm(new Date()));
    setSpent(Math.max(0, total || 0));
  }

  async function refreshBudgetsAndCatSpend() {
    const [budgets, spentRows] = await Promise.all([
      getBudgets(),
      sumSpendByCategoryForMonth(yyyyMm(new Date())),
    ]);
    const map: Record<string, number> = {};
    budgets.forEach((b) => (map[b.category] = b.monthly_target));
    setBudgetMap(map);
    setCatSpend(spentRows);
  }

  /** Improved picker: shows Recents / Files / Downloads / iCloud / Drive */
  async function onImportCsv() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "application/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "text/plain",
          "public.comma-separated-values-text",
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) return;

      const { uri, name } = res.assets[0];
      const text = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const mapped = parseCsvTextToRows(text);
      if (mapped.length === 0) {
        Alert.alert("Nothing to import", "We couldn’t find usable rows in that CSV.");
        return;
      }

      const inserted = await insertTransactions(mapped);
      // optionally re-apply rules to older uncategorized rows
      await applyRulesToUncategorized();
      await refreshSpend();
      await refreshBudgetsAndCatSpend();

      Alert.alert("Import complete", `${inserted} transactions added from ${name}.`);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Import error", "Something went wrong reading that file.");
    }
  }

  /** One-tap test: create a sample CSV in-memory and import it */
  async function importSampleCsv() {
    const sample = [
      "Date,Description,Amount,Category",
      "2025-09-01,Paycheck,1500,Income",
      "2025-09-03,Starbucks,-5.75,Dining",
      "2025-09-04,Lyft,-23.40,Transport",
      "2025-09-05,Trader Joe's,-82.10,Groceries",
      "2025-09-06,Shell,-47,Transport",
    ].join("\n");

    try {
      const mapped = parseCsvTextToRows(sample);
      const inserted = await insertTransactions(mapped);
      await applyRulesToUncategorized();
      await refreshSpend();
      await refreshBudgetsAndCatSpend();
      Alert.alert("Sample loaded", `${inserted} sample transactions added.`);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not import the sample file.");
    }
  }

  const remaining = Math.max(0, START_BUDGET - spent);
  const progressPct = Math.min(100, (spent / START_BUDGET) * 100);

  if (view === "tx")
    return (
      <TransactionsScreen
        onBack={() => {
          setTxFilterCategory(undefined);
          setView("home");
        }}
        initialCategory={txFilterCategory}
      />
    );

  if (view === "reports")
    return (
      <ReportsScreen
        onBack={() => setView("home")}
        onOpenCategory={(cat) => {
          setTxFilterCategory(cat);
          setView("tx");
        }}
      />
    );

  if (view === "budgets") return <BudgetsScreen onBack={() => setView("home")} />;

  return (
    <SafeAreaView
      style={[
        styles.screen,
        Platform.OS === "android" ? { paddingTop: insets.top || 8 } : null,
      ]}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>🌱 Sprig</Text>
          <Text style={styles.subtle}>
            {monthName()} • Simple budgeting that respects your data
          </Text>
        </View>

        {/* Snapshot card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>This Month’s Growth</Text>
            <Text style={styles.kpi}>
              Remaining{" "}
              <Text style={{ color: colors.green }}>{formatMoney(remaining)}</Text>
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.meta}>
            Spent {formatMoney(spent)} / {formatMoney(START_BUDGET)}
          </Text>

          {/* File import */}
          <Pressable style={styles.importBtn} onPress={onImportCsv}>
            <Text style={styles.importBtnText}>Import CSV</Text>
          </Pressable>

          {/* One-tap test */}
          <Pressable
            style={[styles.ctaBtn, { backgroundColor: "#475569" }]}
            onPress={importSampleCsv}
          >
            <Text style={styles.ctaBtnText}>Load sample CSV</Text>
          </Pressable>

          {/* Go to Transactions */}
          <Pressable
            style={[styles.ctaBtn, { backgroundColor: colors.blue }]}
            onPress={() => setView("tx")}
          >
            <Text style={styles.ctaBtnText}>View all transactions</Text>
          </Pressable>

          {/* Go to Reports */}
          <Pressable
            style={[styles.ctaBtn, { backgroundColor: colors.green }]}
            onPress={() => setView("reports")}
          >
            <Text style={styles.ctaBtnText}>View reports</Text>
          </Pressable>

          {/* Go to Budgets */}
          <Pressable
            style={[styles.ctaBtn, { backgroundColor: "#8B5CF6" }]}
            onPress={() => setView("budgets")}
          >
            <Text style={styles.ctaBtnText}>View budgets</Text>
          </Pressable>
        </View>

        {/* Budgets at a Glance */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Budgets at a Glance</Text>
            <Pressable
              onPress={() => setView("budgets")}
              style={[styles.importBtn, { backgroundColor: "#8B5CF6", paddingVertical: 6 }]}
            >
              <Text style={styles.importBtnText}>Edit</Text>
            </Pressable>
          </View>

          {catSpend.length === 0 ? (
            <Text style={styles.meta}>No spending yet this month.</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {catSpend.slice(0, 5).map((row) => {
                const target = budgetMap[row.category];
                const over = typeof target === "number" ? row.spent > target : false;
                const pctNum =
                  typeof target === "number" ? Math.min(100, (row.spent / target) * 100) : 0;

                return (
                  <Pressable
                    key={row.category}
                    onPress={() => {
                      setTxFilterCategory(row.category);
                      setView("tx");
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                  >
                    <View>
                      <View style={styles.rowBetween}>
                        <Text style={styles.kpi}>{row.category}</Text>
                        <Text style={styles.kpi}>
                          {row.spent.toLocaleString(undefined, { style: "currency", currency: "USD" })}
                          {typeof target === "number"
                            ? ` / ${target.toLocaleString(undefined, { style: "currency", currency: "USD" })}`
                            : ""}
                        </Text>
                      </View>
                      {typeof target === "number" ? (
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              over ? styles.progressFillOver : null,
                              { width: `${pctNum}%` },
                            ]}
                          />
                        </View>
                      ) : (
                        <Text style={[styles.meta, { marginTop: 4 }]}>No budget set</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------- root export with provider ------------------------- */

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

/* ------------------------- styles ------------------------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.dark },
  container: { padding: 16, gap: 16 },

  header: { paddingTop: 4 },
  brand: { color: colors.white, fontSize: 28, fontWeight: "800" },
  subtle: { color: colors.subtle, marginTop: 4 },

  card: {
    backgroundColor: colors.light,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  kpi: { color: colors.text, fontSize: 14, fontWeight: "700" },
  meta: { color: "#475569", marginTop: 2 },

  progressTrack: {
    height: 10,
    backgroundColor: colors.track,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: { height: "100%", backgroundColor: colors.blue },
  progressFillOver: { backgroundColor: "#DC2626" }, // red when over budget

  importBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: colors.green,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  importBtnText: { color: colors.white, fontWeight: "700" },

  ctaBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaBtnText: { color: colors.white, fontWeight: "700" },
});
