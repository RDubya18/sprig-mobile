// screens/HomeScreen.tsx
import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useMonth } from "../lib/date";
import { colors } from "../lib/colors";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import InsightsPanel from "../components/InsightsPanel";
import Skeleton from "../components/Skeleton";
import { getBudgets, sumSpentForMonth, getAccounts } from "../db/db";
import { getCategoryInsights } from "../lib/insights";

type Props = {
  monthPicker?: React.ReactNode;
  onOpenAccounts?: () => void;
};

export default function HomeScreen({ monthPicker, onOpenAccounts }: Props) {
  const { monthKey, monthTitle, activeMonth } = useMonth();
  const [totalBudget, setTotalBudget] = React.useState(0);
  const [spent, setSpent] = React.useState(0);
  const [insights, setInsights] = React.useState<{ message: string; type: "increase" | "decrease" }[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Accounts preview
  const [acctLoading, setAcctLoading] = React.useState(true);
  const [acctRows, setAcctRows] = React.useState<{ id:number; name:string; balance:number }[]>([]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      const budgets = await getBudgets();
      const total = budgets.reduce((acc, b) => acc + (b.monthly_target || 0), 0);
      const s = await sumSpentForMonth(monthKey);
      const ii = await getCategoryInsights(activeMonth);
      if (!mounted) return;
      setTotalBudget(total);
      setSpent(s);
      setInsights(ii);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [monthKey, activeMonth]);

  React.useEffect(() => {
    let mounted = true;
    setAcctLoading(true);
    (async () => {
      const rows = await getAccounts();
      if (!mounted) return;
      // show top 3 by absolute balance desc
      const top = rows
        .slice()
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
        .slice(0, 3)
        .map(r => ({ id: r.id, name: r.name, balance: r.balance }));
      setAcctRows(top);
      setAcctLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const remaining = Math.max(totalBudget - spent, 0);
  const pct = totalBudget > 0 ? Math.min(spent / totalBudget, 1) : 0;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Ava!</Text>
          <Text style={styles.subtle}>Your data, your control.</Text>
        </View>
        {monthPicker ?? <Text style={styles.monthLabel}>{monthTitle}</Text>}
      </View>

      {/* Snapshot */}
      <Card style={{ marginTop: 12 }}>
        <Text style={styles.cardTitle}>This month</Text>
        <View style={{ marginTop: 10 }}>
          <View style={styles.row}>
            <Text style={styles.label}>Remaining</Text>
            {loading ? (
              <Skeleton.Line width={90} height={20} />
            ) : (
              <Text style={styles.value}>${remaining.toFixed(2)}</Text>
            )}
          </View>
          {loading ? (
            <Skeleton.Block height={12} radius={6} style={{ marginTop: 8 }} />
          ) : (
            <ProgressBar
              progress={pct}
              accessibilityValue={{ now: Math.round(pct * 100), min: 0, max: 100 }}
            />
          )}
          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.subtle}>Budget</Text>
            <Text style={styles.subtle}>Spent</Text>
          </View>
          <View style={styles.row}>
            {loading ? (
              <>
                <Skeleton.Line width={70} height={16} />
                <Skeleton.Line width={70} height={16} />
              </>
            ) : (
              <>
                <Text style={styles.valueSub}>${totalBudget.toFixed(2)}</Text>
                <Text style={styles.valueSub}>${spent.toFixed(2)}</Text>
              </>
            )}
          </View>
        </View>
      </Card>

      <InsightsPanel items={insights} />

      {/* Accounts preview card */}
      <Card style={{ marginTop: 12 }}>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>Accounts</Text>
          <Pressable onPress={onOpenAccounts} accessibilityRole="button">
            <Text style={styles.link}>See all ›</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 8 }}>
          {acctLoading ? (
            <>
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </>
          ) : acctRows.length === 0 ? (
            <Text style={styles.subtle}>No accounts yet.</Text>
          ) : (
            acctRows.map((a) => (
              <View key={a.id} style={styles.row}>
                <Text style={styles.name}>{a.name}</Text>
                <Text style={styles.balance}>${a.balance.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>
      </Card>
    </ScrollView>
  );
}

function RowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton.Line width={140} height={16} />
      <Skeleton.Line width={80} height={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: colors.background ?? "#F5F7F9" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { fontSize: 22, fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
  subtle: { fontSize: 14, color: colors.ink500 ?? "#64748B" },
  monthLabel: { fontSize: 16, fontWeight: "600", color: colors.ink700 ?? "#334155" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border ?? "#E5E7EB" },
  label: { fontSize: 14, color: colors.ink700 ?? "#334155" },
  value: { fontSize: 20, fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
  valueSub: { fontSize: 16, fontWeight: "600", color: colors.ink900 ?? "#0F172A" },
  link: { fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
  name: { fontSize: 16, color: colors.ink900 ?? "#0F172A" },
  balance: { fontSize: 16, fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
});
