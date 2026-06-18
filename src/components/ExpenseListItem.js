// ExpenseListItem.js — shows ONE expense as a row.
// We reuse this for every item in the Expenses list.
//
// Layout:
//   [colored icon circle]   Category name          $12.50
//                           note (grey)            Jun 18, 2026 (grey)

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useExpenses } from "../context/ExpensesContext";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";

// Turn an ISO date string "YYYY-MM-DD" into something friendly like "Jun 18, 2026".
// We split the string ourselves (instead of using new Date) so the day can never
// shift because of the phone's timezone.
function formatDate(iso) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = String(iso).split("-"); // ["2026", "06", "18"]
  if (parts.length !== 3) return iso; // fallback: just show whatever we got
  const year = parts[0];
  const month = months[parseInt(parts[1], 10) - 1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}, ${year}`;
}

// onPress / onLongPress are optional. When the parent passes them (e.g. the
// Expenses list), the row becomes tappable (edit) and long-pressable (delete).
// Where they're not passed (e.g. Home's recent list), the row just shows info.
export default function ExpenseListItem({ expense, onPress, onLongPress }) {
  // Look up this expense's category (from the live list) for its color + icon.
  // If the category can't be found, fall back to a neutral grey "tag".
  const { categories, formatMoney } = useExpenses();
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;
  const category = categories.find((c) => c.name === expense.category);
  const color = category ? category.color : colors.textMuted;
  const icon = category ? category.icon : "pricetag";

  return (
    <Pressable style={styles.row} onPress={onPress} onLongPress={onLongPress}>
      {/* LEFT: colored circle with the category icon */}
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color={colors.white} />
      </View>

      {/* MIDDLE: category name + optional note */}
      <View style={styles.middle}>
        <Text style={styles.category}>{expense.category}</Text>
        {/* Only show the note line if there actually is a note. */}
        {expense.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {expense.note}
          </Text>
        ) : null}
      </View>

      {/* RIGHT: amount + date */}
      <View style={styles.right}>
        <Text style={styles.amount}>{formatMoney(expense.amount)}</Text>
        <Text style={styles.date}>{formatDate(expense.date)}</Text>
      </View>
    </Pressable>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  middle: {
    flex: 1, // take up the leftover space so the amount stays on the right
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  note: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.expense, // red — money going out
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);
