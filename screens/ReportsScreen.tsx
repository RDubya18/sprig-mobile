// screens/ReportsScreen.tsx
import * as React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useMonth } from "../lib/date";
import { colors } from "../lib/colors";
import Card from "../components/Card";
import DonutChart from "../components/DonutChart";
import DonutSkeleton from "../components/DonutSkeleton";
import Skeleton from "../components/Skeleton";
import { sumSpendByCategoryForMonth } from "../db/db";

type Props = {
  monthPicker?: React.ReactNode;
  monthTitle?: string;
};

export default function ReportsScreen({ monthPicker, monthTitle }: Props) {
  const { monthKey, monthTitle: ctxMonthTitle } = useMonth();
  const title = monthTitle ?? ctxMonthTitle;

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{ category: string; spend: number }[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    const rows = await sumSpendByCategoryForMonth(monthKey);
    setData(rows);
    setLoading(false);
  }, [monthKey]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        {monthPicker ?? <Text style={styles.month}>{title}</Text>}
      </View>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.cardTitle}>Spending by category</Text>

        {loading ? (
          <View style={{ marginTop: 12 }}>
            <DonutSkeleton size={180} />
            <View style={{ marginTop: 16, gap: 10 }}>
              <Skeleton.Line width={"90%"} />
              <Skeleton.Line width={"80%"} />
              <Skeleton.Line width={"70%"} />
              <Skeleton.Line width={"60%"} />
            </View>
          </View>
        ) : data.length === 0 ? (
          <Text style={[styles.subtle, { marginTop: 12 }]}>No spending this month.</Text>
        ) : (
          <View style={{ marginTop: 12 }}>
            <DonutChart
              data={data.map(d => ({ label: d.category || "Uncategorized", value: d.spend }))}
              accessibilityLabel="Spending by category donut chart"
            />
            <View style={{ marginTop: 12, gap: 8 }}>
              {data.map((d, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.legendLabel}>{d.category || "Uncategorized"}</Text>
                  <Text style={styles.legendValue}>${d.spend.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    backgroundColor: colors.background ?? "#F5F7F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink900 ?? "#0F172A",
  },
  month: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink700 ?? "#334155",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink900 ?? "#0F172A",
  },
  subtle: {
    color: colors.ink500 ?? "#64748B",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendLabel: {
    fontSize: 14,
    color: colors.ink700 ?? "#334155",
  },
  legendValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink900 ?? "#0F172A",
  },
});
