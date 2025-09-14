import * as React from "react";
import { View, Text, StyleSheet, Pressable, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sprig, spacing, cardStyle, text } from "lib/theme";
import { getBudgets, setBudget } from "db/db";

type Props = { onBack: () => void };

export default function BudgetsScreen({ onBack }: Props) {
  const [rows, setRows] = React.useState<{ category: string; monthly_target: number }[]>([]);
  const [cat, setCat] = React.useState("");
  const [amt, setAmt] = React.useState("");

  React.useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const data = await getBudgets();
    setRows(data);
  }
  async function save() {
    if (!cat.trim()) return;
    const n = Number(amt);
    if (Number.isNaN(n)) return;
    await setBudget(cat.trim(), n);
    setCat("");
    setAmt("");
    refresh();
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Budgets</Text>
        <View style={{ width: 68 }} />
      </View>

      <View style={{ padding: spacing.md }}>
        {/* Add/Edit */}
        <View style={[cardStyle]}>
          <Text style={styles.cardTitle}>Add / Edit Budget</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <TextInput
              placeholder="Category"
              placeholderTextColor={sprig.ink500}
              value={cat}
              onChangeText={setCat}
              style={[styles.input, { flex: 1 }]}
            />
            <TextInput
              placeholder="Amount"
              placeholderTextColor={sprig.ink500}
              keyboardType="numeric"
              value={amt}
              onChangeText={setAmt}
              style={[styles.input, { width: 120 }]}
            />
          </View>
          <Pressable onPress={save} style={[styles.primary, { marginTop: 10 }]}>
            <Text style={styles.primaryTxt}>Save</Text>
          </Pressable>
        </View>

        {/* List */}
        <View style={[cardStyle, { marginTop: spacing.lg }]}>
          <Text style={styles.cardTitle}>Your Categories</Text>
          {rows.length === 0 ? (
            <Text style={styles.noData}>Add a budget to get started.</Text>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(it) => it.category}
              style={{ marginTop: 8 }}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <Text style={styles.cat}>{item.category}</Text>
                  <Text style={styles.amt}>
                    {item.monthly_target.toLocaleString(undefined, { style: "currency", currency: "USD" })}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: sprig.background },
  topbar: {
    paddingTop: 8, paddingHorizontal: spacing.md, paddingBottom: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  backBtn: {
    paddingVertical: 8, paddingHorizontal: 10, backgroundColor: sprig.white,
    borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: sprig.border,
  },
  backTxt: { color: sprig.green, fontWeight: "800" },
  title: { color: sprig.ink900, fontSize: 20, fontWeight: "900" },

  cardTitle: { color: sprig.ink900, fontWeight: "900", fontSize: 16 },
  noData: { color: sprig.ink600, fontWeight: "700", marginTop: 8 },

  input: {
    backgroundColor: sprig.white, color: sprig.ink900, borderRadius: 10,
    borderWidth: 1, borderColor: sprig.border, paddingHorizontal: 12, paddingVertical: 10,
  },
  primary: { backgroundColor: sprig.green, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  primaryTxt: { color: sprig.white, fontWeight: "800" },

  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: sprig.border,
  },
  cat: { color: sprig.ink900, fontWeight: "800" },
  amt: { color: sprig.ink900, fontWeight: "900" },
});
