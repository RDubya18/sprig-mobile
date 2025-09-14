// screens/TransactionsScreen.tsx
import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useMonth } from "../lib/date";
import { colors } from "../lib/colors";
import Skeleton from "../components/Skeleton";
import { getTransactions, getDistinctCategories, TxRow } from "../db/db";

export default function TransactionsScreen() {
  const { monthKey, monthTitle } = useMonth();

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string | undefined>(undefined);
  const [cats, setCats] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<TxRow[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const loadCats = React.useCallback(async () => {
    const distinct = await getDistinctCategories(monthKey);
    setCats(distinct.map(d => d.category));
  }, [monthKey]);

  const loadRows = React.useCallback(async () => {
    const data = await getTransactions(monthKey, {
      search: search.trim() || undefined,
      category,
    });
    setRows(data);
  }, [monthKey, search, category]);

  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadCats(), loadRows()]);
    setRefreshing(false);
  }, [loadCats, loadRows]);

  React.useEffect(() => {
    (async () => {
      setInitialLoading(true);
      await Promise.all([loadCats(), loadRows()]);
      setInitialLoading(false);
    })();
  }, [loadCats, loadRows]);

  const renderSkeletonRow = (_: any, i: number) => (
    <View key={`sk-${i}`} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Skeleton.Line width={"60%"} height={16} />
        <Skeleton.Line width={120} height={12} style={{ marginTop: 6 }} />
      </View>
      <Skeleton.Line width={70} height={16} />
    </View>
  );

  const renderTx = ({ item }: { item: TxRow }) => (
    <View style={styles.row}>
      <View>
        <Text style={styles.merchant}>{item.merchant || item.description || "—"}</Text>
        <Text style={styles.subtle}>
          {item.category || "Uncategorized"} · {item.date}
        </Text>
      </View>
      <Text style={[styles.amount, item.amount < 0 ? styles.negative : styles.positive]}>
        {item.amount < 0 ? "-" : "+"}${Math.abs(item.amount).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.month}>{monthTitle}</Text>
      </View>

      {/* Search */}
      <TextInput
        style={styles.input}
        placeholder="Search merchant or description"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={refresh}
        returnKeyType="search"
      />

      {/* Category chips (skeleton if first load) */}
      {initialLoading ? (
        <View style={{ flexDirection: "row", gap: 8, paddingVertical: 6 }}>
          <Skeleton.Line width={80} height={28} radius={14} />
          <Skeleton.Line width={90} height={28} radius={14} />
          <Skeleton.Line width={70} height={28} radius={14} />
        </View>
      ) : (
        <FlatList
          data={cats}
          keyExtractor={(c) => c}
          horizontal
          contentContainerStyle={{ paddingVertical: 6, gap: 8 }}
          renderItem={({ item }) => {
            const active = category === item;
            return (
              <Pressable
                onPress={() => {
                  setCategory(active ? undefined : item);
                  // reload rows quickly on chip toggle
                  setTimeout(refresh, 0);
                }}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      )}

      {/* List (skeleton for initial load) */}
      {initialLoading ? (
        <View>
          {Array.from({ length: 8 }).map(renderSkeletonRow)}
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => `${r.id}`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={renderTx}
          ListEmptyComponent={
            <Text style={[styles.subtle, { paddingTop: 16 }]}>No transactions match.</Text>
          }
        />
      )}
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
  month: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink700 ?? "#334155",
  },
  input: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border ?? "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border ?? "#E5E7EB",
    backgroundColor: "#FFF",
  },
  chipActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  chipText: {
    color: colors.ink700 ?? "#334155",
  },
  chipTextActive: {
    fontWeight: "700",
    color: colors.ink900 ?? "#0F172A",
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border ?? "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  merchant: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink900 ?? "#0F172A",
  },
  subtle: {
    color: colors.ink500 ?? "#64748B",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  negative: { color: colors.red ?? "#DC2626" },
  positive: { color: colors.green ?? "#16A34A" },
});
