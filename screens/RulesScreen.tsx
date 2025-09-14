// screens/RulesScreen.tsx
import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sprig, spacing, cardStyle } from "lib/theme";
import { getRules, addRuleCompat as addRule, deleteRule, RuleRow } from "db/db";


type Props = { onBack: () => void };

export default function RulesScreen({ onBack }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<RuleRow[]>([]);
  const [matchType, setMatchType] = React.useState<"merchant_exact" | "merchant_contains">(
    "merchant_contains"
  );
  const [pattern, setPattern] = React.useState("");
  const [category, setCategory] = React.useState("");

  React.useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const data = await getRules();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  async function onAdd() {
    const p = pattern.trim().toLowerCase();
    const c = category.trim();
    if (!p || !c) return;
    setLoading(true);
    try {
      await addRule(matchType, p, c);
      setPattern("");
      setCategory("");
      await refresh();
      Alert.alert("Rule added", `New rule for "${c}" saved.`);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: number) {
    setLoading(true);
    try {
      await deleteRule(id);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onApply() {
    setLoading(true);
    try {
      const updated = await applyRulesToUncategorized();
      Alert.alert("Applied", `Updated ${updated} uncategorized transaction(s).`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Rules</Text>
        <View style={{ width: 68 }} />
      </View>

      <View style={{ padding: spacing.md }}>
        {/* Add rule */}
        <View style={[cardStyle]}>
          <Text style={styles.cardTitle}>Add Rule</Text>

          <View style={styles.row}>
            <Pressable
              onPress={() => setMatchType("merchant_contains")}
              style={[styles.segment, matchType === "merchant_contains" && styles.segmentActive]}
            >
              <Text style={[styles.segmentTxt, matchType === "merchant_contains" && styles.segmentTxtActive]}>
                contains
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMatchType("merchant_exact")}
              style={[styles.segment, matchType === "merchant_exact" && styles.segmentActive]}
            >
              <Text style={[styles.segmentTxt, matchType === "merchant_exact" && styles.segmentTxtActive]}>
                exact
              </Text>
            </Pressable>
          </View>

          <TextInput
            placeholder='Merchant text (e.g., "lyft")'
            placeholderTextColor={sprig.ink500}
            autoCapitalize="none"
            autoCorrect={false}
            value={pattern}
            onChangeText={setPattern}
            style={[styles.input, { marginTop: 8 }]}
          />
          <TextInput
            placeholder='Category (e.g., "Transport")'
            placeholderTextColor={sprig.ink500}
            value={category}
            onChangeText={setCategory}
            style={[styles.input, { marginTop: 8 }]}
          />

          <Pressable onPress={onAdd} style={[styles.primary, { marginTop: 10 }]}>
            <Text style={styles.primaryTxt}>Save rule</Text>
          </Pressable>
        </View>

        {/* List + apply */}
        <View style={[cardStyle, { marginTop: spacing.lg }]}>
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>Existing Rules</Text>
            <Pressable onPress={onApply} style={styles.linkBtn}>
              <Text style={styles.link}>Apply to uncategorized</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 16 }} color={sprig.green} />
          ) : rows.length === 0 ? (
            <Text style={styles.subtle}>No rules yet—add your first above.</Text>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(it) => String(it.id)}
              style={{ marginTop: 8 }}
              renderItem={({ item }) => (
                <View style={styles.ruleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleCat}>{item.category}</Text>
                    <Text style={styles.ruleMeta}>
                      {item.match_type === "merchant_exact" ? "exact:" : "contains:"} {item.pattern}
                    </Text>
                  </View>
                  <Pressable onPress={() => onDelete(item.id)} hitSlop={8}>
                    <Text style={styles.delete}>Delete</Text>
                  </Pressable>
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
    paddingTop: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: sprig.white,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sprig.border,
  },
  backTxt: { color: sprig.green, fontWeight: "800" },
  title: { color: sprig.ink900, fontSize: 20, fontWeight: "900" },

  cardTitle: { color: sprig.ink900, fontWeight: "900", fontSize: 16 },
  subtle: { color: sprig.ink600, fontWeight: "700", marginTop: 8 },

  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },

  segment: {
    backgroundColor: sprig.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sprig.border,
  },
  segmentActive: { backgroundColor: "#EAF5EE", borderColor: sprig.green },
  segmentTxt: { color: sprig.ink700, fontWeight: "800" },
  segmentTxtActive: { color: sprig.green },

  input: {
    backgroundColor: sprig.white,
    color: sprig.ink900,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: sprig.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primary: {
    backgroundColor: sprig.green,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryTxt: { color: sprig.white, fontWeight: "800" },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  linkBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  link: { color: sprig.green, fontWeight: "800" },

  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sprig.border,
  },
  ruleCat: { color: sprig.ink900, fontWeight: "800" },
  ruleMeta: { color: sprig.ink600, fontWeight: "700", marginTop: 2 },
  delete: { color: sprig.red, fontWeight: "800" },
});
