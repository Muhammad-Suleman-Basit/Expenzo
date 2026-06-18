// MonthlyExpensesScreen — opened from the "This Month" card on Home.
// Shows the chosen month's total + the list of that month's expenses, with a
// month selector to go to the previous / next month.

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useExpenses } from "../context/ExpensesContext";
import ExpenseListItem from "../components/ExpenseListItem";
import MonthSelector, { currentMonthKey } from "../components/MonthSelector";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";
import { getMonthKey } from "../utils/format";

export default function MonthlyExpensesScreen({ navigation }) {
  const { expenses, formatMoney } = useExpenses();
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  // The month being viewed (defaults to the current month).
  const [monthKey, setMonthKey] = useState(currentMonthKey());

  // This month's expenses, newest first.
  const monthExpenses = useMemo(
    () =>
      expenses
        .filter((e) => getMonthKey(e.date) === monthKey)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [expenses, monthKey]
  );

  // Total spent in the selected month.
  const total = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses]
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* ----- HEADER ----- */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Monthly Expenses</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.body}>
        {/* Month switcher (reused component). */}
        <MonthSelector monthKey={monthKey} onChangeMonth={setMonthKey} />

        {/* Total spent for the selected month. */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Spent this month</Text>
          <Text style={styles.totalAmount}>{formatMoney(total)}</Text>
        </View>

        {/* The month's expenses, or a friendly empty state. */}
        {monthExpenses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No expenses this month.</Text>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={monthExpenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExpenseListItem
                expense={item}
                onPress={() =>
                  navigation.navigate("AddEditExpense", { expense: item })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bgLight,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    headerButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textDark,
    },
    body: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    totalCard: {
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: colors.primary,
      shadowOpacity: 0.4,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    totalLabel: {
      color: colors.textLight,
      fontSize: 14,
      opacity: 0.9,
      marginBottom: spacing.xs,
    },
    totalAmount: {
      color: colors.textLight,
      fontSize: 30,
      fontWeight: "bold",
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: spacing.xl,
    },
    empty: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: spacing.xl,
    },
    emptyText: {
      fontSize: 15,
      color: colors.textMuted,
      marginTop: spacing.sm,
    },
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);
