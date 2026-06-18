// ExpensesScreen.js — shows the full list of expenses you've added.

import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useExpenses } from "../context/ExpensesContext";
import ExpenseListItem from "../components/ExpenseListItem";
import AppPopup from "../components/AppPopup";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";

export default function ExpensesScreen({ navigation }) {
  // Read the shared expenses list (and delete function) from our data store.
  const { expenses, deleteExpense } = useExpenses();
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  // Our app popup (used instead of the native Alert).
  const [popup, setPopup] = useState({ visible: false });
  function closePopup() {
    setPopup((p) => ({ ...p, visible: false }));
  }

  // Ask the user to confirm before deleting, then delete if they say yes.
  function confirmDelete(expense) {
    setPopup({
      visible: true,
      variant: "danger",
      title: "Delete this expense?",
      message: expense.note ? `"${expense.note}"` : expense.category,
      confirmText: "Delete",
      onConfirm: () => {
        deleteExpense(expense.id);
        closePopup();
      },
      cancelText: "Cancel",
      onCancel: closePopup,
    });
  }

  // Make a COPY before sorting (never mutate the original array from context),
  // then sort newest date first. Date strings are "YYYY-MM-DD", which sort the
  // same alphabetically as they do by date. Array.sort is stable, so expenses
  // added on the same day keep their order (newest added stays on top).
  const sorted = [...expenses].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Text style={styles.title}>Expenses</Text>

      {sorted.length === 0 ? (
        // ----- EMPTY STATE (no expenses yet) -----
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={36} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No expenses yet.</Text>
          <Text style={styles.emptySubtitle}>Tap + to add one.</Text>
        </View>
      ) : (
        // ----- THE LIST -----
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseListItem
              expense={item}
              // Tap a row -> open the Add/Edit screen in EDIT mode for this expense.
              onPress={() => navigation.navigate("AddEditExpense", { expense: item })}
              // Long-press a row -> confirm and delete.
              onLongPress={() => confirmDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Our reusable popup (delete confirmation). */}
      <AppPopup
        visible={popup.visible}
        variant={popup.variant}
        title={popup.title}
        message={popup.message}
        confirmText={popup.confirmText}
        onConfirm={popup.onConfirm}
        cancelText={popup.cancelText}
        onCancel={popup.onCancel}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },

  // Empty state
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);
