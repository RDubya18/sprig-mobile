// screens/AccountDetailScreen.tsx
import * as React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../lib/colors";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import { Account, getAccount, getAccountDeltaFromTransactions } from "../db/db";

type Props = {
  id: number;
  onBack: () => void;
};

export default function AccountDetailScreen({ id, onBack }: Props) {
  const [acct, setAcct] = React.useState<Account | null>(null);
  const [delta, setDelta] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const a = await getAccount(id);
      const d = await getAccountDeltaFromTransactions(id);
      if (!mounted) return;
      setAcct(a);
      setDelta(d);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{acct ? acct.name : "Account"}</Text>
        <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
      </View>

      <Card style={{ marginTop: 12 }}>
        {loading || !acct ? (
          <View style={{ gap: 10 }}>
            <Skeleton.Line width={160} height={20} />
            <Skeleton.Line width={120} height={16} />
            <Skeleton.Line width={"70%"} height={14} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Text style={styles.kv}><Text style={styles.k}>Type:</Text> <Text style={styles.v}>{prettyType(acct.type)}</Text></Text>
            <Text style={styles.kv}><Text style={styles.k}>Manual balance:</Text> <Text style={styles.v}>${acct.balance.toFixed(2)}</Text></Text>
            <Text style={styles.kv}><Text style={styles.k}>Transactions net:</Text> <Text style={styles.v}>${delta.toFixed(2)}</Text></Text>
            <Text style={styles.kv}><Text style={styles.k}>Last reconciled:</Text> <Text style={styles.v}>{acct.last_reconciled ?? "—"}</Text></Text>
          </View>
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.cardTitle}>Reconcile (placeholder)</Text>
        <Text style={styles.subtle}>
          Compare manual balance to transactions net to identify drift. In a future sprint, set{" "}
          <Text style={{ fontWeight: "700" }}>last_reconciled</Text> and adjust the manual balance here.
        </Text>
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
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
  subtle: { marginTop: 6, color: colors.ink600 ?? "#475569" },
  kv: { fontSize: 16, color: colors.ink900 ?? "#0F172A" },
  k: { color: colors.ink700 ?? "#334155" },
  v: { fontWeight: "700", color: colors.ink900 ?? "#0F172A" },
});
