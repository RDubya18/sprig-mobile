import * as React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Pressable,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Papa from "papaparse";
import { colors } from "./lib/colors";
import { initDb, insertTransactions, sumSpentForMonth, TxRow } from "./db/db";

/** ---------- Helper: add months safely (keeps your date header logic) ---------- */
function addMonths(date: Date, delta: number) {
  // jump to day 1 to avoid end-of-month rollover issues
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** ---------- CSV types + helper (new DocumentPicker API) ---------- */
type RawTx = {
  date: string;          // "2025-09-01" or "9/1/2025"
  description: string;   // "Starbucks"
  amount: string;        // "-5.75"
  category?: string;
  account?: string;
};

async function pickAndParseCsv(): Promise<RawTx[]> {
  const res = await DocumentPicker.getDocumentAsync({
    type: "text/csv",
    copyToCacheDirectory: true,
    multiple: false,
  });

  // NEW API: check canceled + assets instead of res.type
  if (res.canceled || !res.assets || res.assets.length === 0) {
    return [];
  }

  const file = res.assets[0];
  const text = await fetch(file.uri).then((r) => r.text());

  const parsed = Papa.parse<RawTx>(text, {
    header: true,
    skipEmptyLines: true,
    // If your CSV uses ';' instead of ',', uncomment:
    // delimiter: ";",
  });

  return parsed.data;
}

/** ---------- Helper: format "YYYY-MM" for current month ---------- */
function toYYYYMM(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** ===================== APP ===================== */
export default function App() {
  /* ---------- Keep your month, label, swipe, and scroll exactly as-is ---------- */
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // e.g., "September 2025"
  const monthLabel = React.useMemo(
    () =>
      currentDate.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [currentDate]
  );

  const goPrevMonth = () => setCurrentDate((d) => addMonths(d, -1));
  const goNextMonth = () => setCurrentDate((d) => addMonths(d, +1));

  const SWIPE_THRESHOLD = 40; // px horizontal movement
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gesture: PanResponderGestureState
      ) => {
        const horizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy);
        return horizontal && Math.abs(gesture.dx) > 10;
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dx <= -SWIPE_THRESHOLD) {
          // swipe left → next month
          goNextMonth();
        } else if (gesture.dx >= SWIPE_THRESHOLD) {
          // swipe right → previous month
          goPrevMonth();
        }
      },
    })
  ).current;

  /* ---------- Real "spent this month" from DB ---------- */
  const [spentFromDb, setSpentFromDb] = React.useState(0);

  // You can keep a simple static budget for now (we'll make a budgets table later)
  const budget = 4200;

  // Initialize DB ONCE, then load this month's spend
  React.useEffect(() => {
    (async () => {
      await initDb();
      await refreshMonthSpend(currentDate);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When currentDate changes (swipe), recompute spend for that month
  React.useEffect(() => {
    (async () => {
      await refreshMonthSpend(currentDate);
    })();
  }, [currentDate]);

  async function refreshMonthSpend(d: Date) {
    const key = toYYYYMM(d); // "2025-09"
    const total = await sumSpentForMonth(key);
    setSpentFromDb(total);
  }

  /* ---------- Part 6: Import CSV → save to DB → refresh totals ---------- */
  async function handleImportCsv() {
    try {
      const rows = await pickAndParseCsv();
      if (!rows.length) {
        Alert.alert("Import canceled", "No file selected.");
        return;
      }

      // Save into DB
      const txRows: TxRow[] = rows.map((r) => ({
        date: r.date,
        description: r.description || "Unknown",
        amount: r.amount,
        category: r.category,
      }));

      const inserted = await insertTransactions(txRows);
      await refreshMonthSpend(currentDate);

      Alert.alert("Import complete", `Saved ${inserted} rows to your device.`);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Import failed", err?.message ?? "Unknown error");
    }
  }

  // Calculations for the card (now using DB value for "spent")
  const spent = spentFromDb; // real number from DB
  const remaining = Math.max(budget - spent, 0);
  const percent = budget ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.softSlate }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header (swipe area) - unchanged */}
        <View
          {...panResponder.panHandlers}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: colors.darkCharcoal,
            }}
          >
            Sprig
          </Text>
          <Text
            style={{
              color: "#667",
              minWidth: 160,
              textAlign: "right",
              fontWeight: "600",
            }}
            accessibilityRole="text"
          >
            {monthLabel}
          </Text>
        </View>

        {/* Snapshot card - now powered by DB "spent" */}
        <View
          style={{
            backgroundColor: colors.white,
            padding: 16,
            borderRadius: 12,
            marginTop: 12,
          }}
        >
          <Text style={{ color: colors.darkCharcoal, fontSize: 16, marginBottom: 8 }}>
            This Month’s Growth
          </Text>
          <Text style={{ fontSize: 30, fontWeight: "800", color: colors.primaryGreen }}>
            ${remaining.toFixed(0)} left
          </Text>
          <Text style={{ color: "#667", marginTop: 8 }}>
            Spent ${spent.toFixed(0)} / Budget ${budget.toFixed(0)}
          </Text>

          {/* Progress bar */}
          <View
            style={{
              height: 10,
              backgroundColor: "#e1e5ea",
              borderRadius: 6,
              marginTop: 12,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${percent}%`,
                backgroundColor: colors.secondaryBlue,
              }}
            />
          </View>

          {/* Import button (sits in the main card; move it if you prefer) */}
          <View style={{ marginTop: 16 }}>
            <Pressable
              onPress={handleImportCsv}
              style={{
                backgroundColor: colors.secondaryBlue,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel="Import CSV"
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Import CSV</Text>
            </Pressable>
          </View>
        </View>

        {/* Top Categories (still static for now) */}
        <View
          style={{
            backgroundColor: colors.white,
            padding: 16,
            borderRadius: 12,
            marginTop: 12,
          }}
        >
          <Text style={{ fontWeight: "700", color: colors.darkCharcoal, marginBottom: 8 }}>
            Top Categories
          </Text>
          <Text>Groceries — $520</Text>
          <Text>Dining — $430</Text>
          <Text>Transport — $200</Text>
        </View>

        {/* Upcoming Bills (still static for now) */}
        <View
          style={{
            backgroundColor: colors.white,
            padding: 16,
            borderRadius: 12,
            marginTop: 12,
          }}
        >
          <Text style={{ fontWeight: "700", color: colors.darkCharcoal, marginBottom: 8 }}>
            Upcoming Bills
          </Text>
          <Text>Netflix — $15 — Sep 12</Text>
          <Text>Amazon — $55 — Sep 15</Text>
          <Text>iCloud — $3 — Sep 20</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
