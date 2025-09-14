// screens/AccountsScreen.tsx
import * as React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { colors } from "../lib/colors";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import { Account, getAccounts } from "../db/db";

type Props = {
  onBack: () => void;
  onOpenAccount: (id: number) => void;
};

export default function AccountsScreen({ onBack, onOpenAccount }: Props) {
  const [rows, setRows] = React.useState<Account[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await getAccounts();
      if (!mounted) return;
      setRows(data);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
        <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backTxt}>Close</Text>
        </Pressable>
      </View>

      <Card style={{ marginTop: 12 }}>
        {loading ? (
          <View style={{ paddingVertical: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={styles.row}>
                <View>
                  <Skeleton.Line width={160} height={16} />
                  <Skeleton.Line width={100} height={12} style={{ marginTop: 6 }} />
                </View>
                <Skeleton.Line width={90} height={16} />
              </View>
            ))}
          </View>
        ) : rows.length === 0 ? (
          <Text style={[styles.subtle, { paddingVertical: 12 }]}>No accounts yet.</Text>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(a) => `${a.id}`}
            renderItem={({ item }) => (
              <Pressable onPress={() => onOpenAccount(item.id)} style={styles.row} accessibilityRole="button">
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.subtle}>{prettyType(item.type)}{item.last_reconciled ? ` · Reconciled ${item.last_reconciled}` : ""}</Text>
                </View>
                <Text style={styles.balance}>${item.balance.toFixed(2)}</Text>
              </Pressable>
            )}
          />
        )}
      </Card>
    </View>
  );
}

function prettyType(t: string) {
  const map: Record<string,string> = {
    checking: "Checking",
    savings: "Savings",
    credit: "Credit Card",
    brokerage: "Brokerage",
    cash: "Cash",
    other: "Other",
  };
  return map[t] ?? t;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, backgroundColor: colors.background ?? "#F5F7F9" },
  header: { paddingTop: 8, paddingBottom: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
  backBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#FFF", borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border ?? "#E5E7EB" },
  backTxt: { fontWeight: "600", color: colors.ink700 ?? "#334155" },
  row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border ?? "#E5E7EB", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "600", color: colors.ink900 ?? "#0F172A" },
  subtle: { color: colors.ink500 ?? "#64748B" },
  balance: { fontSize: 16, fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
});
