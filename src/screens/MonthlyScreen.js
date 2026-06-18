// MonthlyScreen — spending for ONE selected month.
// A month switcher, the total spent, and the top 3 categories for that month.

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useExpenses } from "../context/ExpensesContext";
import MonthSelector, { currentMonthKey } from "../components/MonthSelector";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";
import { getMonthKey } from "../utils/format";

export default function MonthlyScreen({ navigation }) {
  const { expenses, categories, formatMoney } = useExpenses();
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  // Look up a category's color + icon by its name (grey fallback if missing).
  function findCategory(name) {
    const cat = categories.find((c) => c.name === name);
    return {
      color: cat ? cat.color : colors.textMuted,
      icon: cat ? cat.icon : "pricetag",
    };
  }

  // The month currently being viewed. Defaults to this month.
  const [monthKey, setMonthKey] = useState(currentMonthKey());

  // Only the expenses that belong to the selected month. useMemo recomputes
  // whenever expenses OR the month changes — that keeps every total in sync.
  const monthExpenses = useMemo(
    () => expenses.filter((e) => getMonthKey(e.date) === monthKey),
    [expenses, monthKey]
  );

  // Total spent this month.
  const total = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses]
  );

  // Top 3 categories this month, highest total first.
  const topCategories = useMemo(() => {
    const totalsByName = {};
    for (const e of monthExpenses) {
      totalsByName[e.category] = (totalsByName[e.category] || 0) + e.amount;
    }
    return Object.keys(totalsByName)
      .map((name) => ({ name, total: totalsByName[name] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [monthExpenses]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ----- MONTH SELECTOR (reused component) ----- */}
        <MonthSelector monthKey={monthKey} onChangeMonth={setMonthKey} />

        {/* ----- SPENT THIS MONTH (big purple card) ----- */}
        <View style={styles.spentCard}>
          <Text style={styles.spentLabel}>Spent this month</Text>
          <Text style={styles.spentAmount}>{formatMoney(total)}</Text>
        </View>

        {/* ----- TOP CATEGORIES ----- */}
        <Text style={styles.sectionTitle}>Top categories</Text>

        {topCategories.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="pie-chart-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No expenses this month yet.</Text>
          </View>
        ) : (
          topCategories.map((item) => {
            const { color, icon } = findCategory(item.name);
            return (
              <View key={item.name} style={styles.catRow}>
                <View style={[styles.catCircle, { backgroundColor: color }]}>
                  <Ionicons name={icon} size={22} color={colors.white} />
                </View>
                <Text style={styles.catName}>{item.name}</Text>
                <Text style={styles.catTotal}>{formatMoney(item.total)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ----- FLOATING + BUTTON ----- */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("AddEditExpense")}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </Pressable>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  content: {
    padding: spacing.lg,
  },

  // Spent card
  spentCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  spentLabel: {
    color: colors.textLight,
    fontSize: 15,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  spentAmount: {
    color: colors.textLight,
    fontSize: 40,
    fontWeight: "bold",
  },

  // Section
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: spacing.md,
  },

  // Category row
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  catCircle: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  catName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  catTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textDark,
  },

  // Empty state
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  // Floating action button
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);
