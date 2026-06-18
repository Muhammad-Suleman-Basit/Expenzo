// MonthSelector.js — a reusable "‹  June 2026  ›" row.
//
// It's CONTROLLED: the parent screen holds the selected month in state and
// passes it in as `monthKey` ("YYYY-MM"); when an arrow is tapped we call
// `onChangeMonth` with the new month key.

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";
import { formatMonthLabel } from "../utils/format";

// Current month as a key like "2026-06". Exported so screens can use it as the
// default value for their month state.
export function currentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Move a month key forward/back by `delta` months (JS Dates handle rollover).
function shiftMonth(monthKey, delta) {
  const parts = monthKey.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const date = new Date(year, month - 1 + delta, 1);
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${newYear}-${newMonth}`;
}

export default function MonthSelector({ monthKey, onChangeMonth }) {
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.arrowButton}
        onPress={() => onChangeMonth(shiftMonth(monthKey, -1))}
      >
        <Ionicons name="chevron-back" size={22} color={colors.textDark} />
      </Pressable>

      <Text style={styles.label}>{formatMonthLabel(monthKey)}</Text>

      <Pressable
        style={styles.arrowButton}
        onPress={() => onChangeMonth(shiftMonth(monthKey, 1))}
      >
        <Ionicons name="chevron-forward" size={22} color={colors.textDark} />
      </Pressable>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  arrowButton: {
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
  label: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
  },
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);
