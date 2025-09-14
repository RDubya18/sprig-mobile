import * as React from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sprig, spacing, cardStyle } from "lib/theme";

type Props = { onBack: () => void };

export default function ProfileScreen({ onBack }: Props) {
  const [name, setName] = React.useState("Ava");
  const [family, setFamily] = React.useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.topbar}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 68 }} />
      </View>

      <View style={{ padding: spacing.md }}>
        <View style={[cardStyle]}>
          <Text style={styles.cardTitle}>Account</Text>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={sprig.ink500}
            style={styles.input}
          />

          <View style={styles.row}>
            <Text style={styles.label}>Family plan</Text>
            <Switch value={family} onValueChange={setFamily} />
          </View>
        </View>

        <View style={[cardStyle, { marginTop: spacing.lg }]}>
          <Text style={styles.cardTitle}>Data & Privacy</Text>
          <Text style={styles.subtle}>
            Sprig is local-first. Export or delete your data any time from Settings.
          </Text>
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

  cardTitle: { color: sprig.ink900, fontWeight: "900", fontSize: 16, marginBottom: 8 },
  label: { color: sprig.ink900, fontWeight: "800", marginTop: 8 },
  subtle: { color: sprig.ink600, fontWeight: "700" },

  input: {
    backgroundColor: sprig.white, color: sprig.ink900, borderRadius: 10,
    borderWidth: 1, borderColor: sprig.border, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
});
