// App.tsx
import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./screens/HomeScreen";
import BudgetsScreen from "./screens/BudgetsScreen";
import TransactionsScreen from "./screens/TransactionsScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import RulesScreen from "./screens/RulesScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import ExportScreen from "./screens/ExportScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import AccountsScreen from "./screens/AccountsScreen";
import AccountDetailScreen from "./screens/AccountDetailScreen";

import TabBar from "./components/TabBar";
import TopBar from "./components/TopBar";
import MonthPicker from "./components/MonthPicker";

import { MonthContext, startOfMonth, yyyyMm, formatMonthTitle } from "./lib/date";
import { colors } from "./lib/colors";

type ViewKey =
  | "welcome" | "home" | "budgets" | "tx" | "reports" | "settings"
  | "rules" | "notifications" | "export" | "accounts" | "accountDetail";

export default function App() {
  const [view, setView] = React.useState<ViewKey>("home");
  const [activeMonth, setActiveMonth] = React.useState<Date>(startOfMonth(new Date()));
  const [detailAccountId, setDetailAccountId] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      const onboarded = await AsyncStorage.getItem("sprig.onboarded");
      if (!onboarded) setView("welcome");
    })();
  }, []);

  const monthKey = React.useMemo(() => yyyyMm(activeMonth), [activeMonth]);
  const monthTitle = React.useMemo(() => formatMonthTitle(activeMonth), [activeMonth]);
  const monthPickerEl = <MonthPicker value={activeMonth} onChange={setActiveMonth} style={{ marginTop: 8 }} />;

  return (
    <MonthContext.Provider value={{ activeMonth, setActiveMonth, monthKey, monthTitle }}>
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" />
        <TopBar
          onOpenSettings={() => setView("settings")}
          onOpenNotifications={() => setView("notifications")}
        />

        <View style={styles.body}>
          {view === "welcome" && <WelcomeScreen onDone={() => setView("home")} />}

          {view === "home" && (
            <HomeScreen
              monthPicker={monthPickerEl}
              onOpenAccounts={() => setView("accounts")}
            />
          )}
          {view === "budgets" && <BudgetsScreen />}
          {view === "tx" && <TransactionsScreen />}
          {view === "reports" && <ReportsScreen monthPicker={monthPickerEl} monthTitle={monthTitle} />}
          {view === "settings" && (
            <SettingsScreen onOpenRules={() => setView("rules")} onOpenExport={() => setView("export")} />
          )}
          {view === "rules" && <RulesScreen onBack={() => setView("settings")} />}
          {view === "notifications" && <NotificationsScreen onBack={() => setView("home")} />}
          {view === "export" && <ExportScreen onBack={() => setView("settings")} />}

          {view === "accounts" && (
            <AccountsScreen
              onBack={() => setView("home")}
              onOpenAccount={(id) => { setDetailAccountId(id); setView("accountDetail"); }}
            />
          )}
          {view === "accountDetail" && detailAccountId != null && (
            <AccountDetailScreen id={detailAccountId} onBack={() => setView("accounts")} />
          )}
        </View>

        {!(view === "rules" || view === "export" || view === "welcome" || view === "accounts" || view === "accountDetail") && (
          <TabBar active={view === "tx" ? "tx" : (view as any)} onTab={(key: ViewKey) => setView(key)} />
        )}
      </SafeAreaView>
    </MonthContext.Provider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background ?? "#F5F7F9" },
  body: { flex: 1, paddingHorizontal: 16 },
});
