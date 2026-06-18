// OverviewScreen (the "Home" tab) — the original design restored:
// a greeting, a purple summary card, and a Recent Transactions list.
//
// Unlike the first version (which was hard-coded $0.00), this one shows REAL
// data from the expenses store so it stays in sync as you add expenses.

import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useExpenses } from "../context/ExpensesContext";
import ExpenseListItem from "../components/ExpenseListItem";
import ProgressBar from "../components/ProgressBar";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";
import { getMonthKey } from "../utils/format";

// Current month as a key like "2026-06".
function currentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function OverviewScreen({ navigation }) {
  const { expenses, monthlyLimit, profileName, formatMoney } = useExpenses();
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  // ----- Real numbers for the summary card -----
  // Total spent across ALL time.
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Spent in the current month only.
  const thisMonthKey = currentMonthKey();
  const thisMonthSpent = expenses
    .filter((e) => getMonthKey(e.date) === thisMonthKey)
    .reduce((sum, e) => sum + e.amount, 0);

  // How many expenses in total.
  const count = expenses.length;

  // The 3 most recent expenses (newest date first). Copy before sorting.
  const recent = [...expenses]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 3);

  // ----- Budget for the current month -----
  const hasBudget = monthlyLimit > 0; // 0 means "not set"
  // How far through the budget we are, as a percentage (can go over 100).
  const ratio = hasBudget ? (thisMonthSpent / monthlyLimit) * 100 : 0;
  // Pick the bar color from the percentage.
  let budgetColor = colors.income; // green: comfortably under budget
  if (ratio > 100) {
    budgetColor = colors.expense; // red: over budget
  } else if (ratio >= 80) {
    budgetColor = colors.orange; // orange: getting close
  }
  // Money left (negative means we've gone over).
  const remaining = monthlyLimit - thisMonthSpent;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ----- HEADER: greeting + bell ----- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Greetings,</Text>
            <Text style={styles.name}>{profileName}</Text>
          </View>
          <Pressable
            style={styles.bellButton}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textDark} />
          </Pressable>
        </View>

        {/* ----- SUMMARY CARD (purple) ----- */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardLabel}>Total Spent</Text>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={20} color={colors.white} />
            </View>
          </View>

          <Text style={styles.cardAmount}>{formatMoney(totalSpent)}</Text>

          {/* Two sub-cards: This Month spend (tap to view the month's
              expenses), and number of transactions. */}
          <View style={styles.subRow}>
            <Pressable
              style={styles.subCard}
              onPress={() => navigation.navigate("MonthlyExpenses")}
            >
              <View style={styles.subCircle}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.subLabel}>This Month</Text>
                <Text style={styles.subValue}>{formatMoney(thisMonthSpent)}</Text>
              </View>
            </Pressable>

            <View style={styles.subCard}>
              <View style={styles.subCircle}>
                <Ionicons name="receipt-outline" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.subLabel}>Transactions</Text>
                <Text style={styles.subValue}>{count}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ----- THIS MONTH'S BUDGET ----- */}
        <View style={styles.budgetCard}>
          <Text style={styles.budgetTitle}>This month's budget</Text>

          {hasBudget ? (
            <>
              <ProgressBar percent={ratio} color={budgetColor} />
              <Text style={[styles.budgetText, { color: budgetColor }]}>
                {remaining >= 0
                  ? `${formatMoney(remaining)} left`
                  : `Over by ${formatMoney(-remaining)}`}
              </Text>
            </>
          ) : (
            <Text style={styles.budgetHint}>Set a monthly budget in Settings.</Text>
          )}
        </View>

        {/* ----- RECENT TRANSACTIONS ----- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Pressable onPress={() => navigation.navigate("Expenses")}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {recent.length === 0 ? (
          // Empty state when there are no expenses at all.
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="document-text-outline" size={36} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Start tracking your expenses now!</Text>
          </View>
        ) : (
          // Show the 3 most recent expenses, reusing our row component.
          // Tapping a row opens the Add/Edit screen in EDIT mode for it.
          recent.map((expense) => (
            <ExpenseListItem
              key={expense.id}
              expense={expense}
              onPress={() => navigation.navigate("AddEditExpense", { expense })}
            />
          ))
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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 15,
    color: colors.textMuted,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Summary card
  card: {
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
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: colors.textLight,
    fontSize: 15,
    opacity: 0.9,
  },
  walletIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardAmount: {
    color: colors.textLight,
    fontSize: 40,
    fontWeight: "bold",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  subRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  subCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  subCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  subLabel: {
    color: colors.textLight,
    fontSize: 13,
    opacity: 0.9,
  },
  subValue: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "bold",
  },

  // Budget card
  budgetCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  budgetText: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: spacing.sm,
  },
  budgetHint: {
    fontSize: 14,
    color: colors.textMuted,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: radius.pill,
    backgroundColor: "rgba(154,160,180,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
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
