// StatsScreen — charts about your spending. First chart: a pie of spending
// by category for the selected month.

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-chart-kit";
import { subMonths, format } from "date-fns";

import { useExpenses } from "../context/ExpensesContext";
import MonthSelector, { currentMonthKey } from "../components/MonthSelector";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";
import { getMonthKey } from "../utils/format";

export default function StatsScreen() {
  const { expenses, categories, currency } = useExpenses();
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  // The month being viewed. Defaults to the current month.
  const [monthKey, setMonthKey] = useState(currentMonthKey());

  // Expenses that belong to the selected month.
  const monthExpenses = useMemo(
    () => expenses.filter((e) => getMonthKey(e.date) === monthKey),
    [expenses, monthKey]
  );

  // Build the data array PieChart needs: one entry per category that has
  // spending this month, summed, with the category's color pulled from config.
  const chartData = useMemo(() => {
    const totalsByName = {};
    for (const e of monthExpenses) {
      totalsByName[e.category] = (totalsByName[e.category] || 0) + e.amount;
    }

    return Object.keys(totalsByName).map((name) => {
      const cat = categories.find((c) => c.name === name);
      return {
        name: name,
        amount: totalsByName[name],
        color: cat ? cat.color : colors.textMuted,
        legendFontColor: colors.textDark,
        legendFontSize: 13,
      };
    });
  }, [monthExpenses, categories, colors]);

  // chart-kit needs an explicit width. Use the screen width minus our padding.
  const chartWidth = Dimensions.get("window").width - spacing.lg * 2;

  // chart-kit requires a chartConfig prop even for pie charts.
  const chartConfig = {
    color: (opacity = 1) =>
      isDark ? `rgba(242,243,247,${opacity})` : `rgba(0,0,0,${opacity})`,
  };

  // ----- Last 6 months bar chart (does NOT depend on the month selector) -----
  const last6 = useMemo(() => {
    const now = new Date();
    const months = [];
    // Build the 6 months from 5 months ago up to the current month.
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      months.push({ key: format(d, "yyyy-MM"), label: format(d, "MMM") });
    }
    // Total spending for each of those months.
    const totals = months.map((m) =>
      expenses
        .filter((e) => getMonthKey(e.date) === m.key)
        .reduce((sum, e) => sum + e.amount, 0)
    );
    return {
      labels: months.map((m) => m.label), // ["Jan", "Feb", ...]
      datasets: [{ data: totals }],
    };
  }, [expenses]);

  // chartConfig for the bar chart (purple bars on a white background).
  const barChartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`, // primary purple
    labelColor: (opacity = 1) =>
      isDark ? `rgba(242,243,247,${opacity})` : `rgba(21,21,30,${opacity})`,
    barPercentage: 0.6,
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Month selector (reused component). */}
        <MonthSelector monthKey={monthKey} onChangeMonth={setMonthKey} />

        <Text style={styles.heading}>Spending by category</Text>

        {chartData.length === 0 ? (
          // Friendly empty state when there's nothing this month.
          <View style={styles.empty}>
            <Ionicons name="pie-chart-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No expenses this month yet.</Text>
          </View>
        ) : (
          <View style={styles.chartCard}>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="amount" // which field in each entry is the value
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        )}

        {/* ----- LAST 6 MONTHS (overall, ignores the month selector) ----- */}
        <Text style={[styles.heading, styles.headingSpacing]}>Last 6 months</Text>

        {expenses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No expenses yet.</Text>
          </View>
        ) : (
          <View style={styles.chartCard}>
            <BarChart
              data={last6}
              width={chartWidth}
              height={240}
              chartConfig={barChartConfig}
              fromZero // bars start at 0
              showValuesOnTopOfBars // show each month's total above its bar
              yAxisLabel={currency}
              yAxisSuffix=""
              style={styles.barChart}
            />
          </View>
        )}
      </ScrollView>
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
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  headingSpacing: {
    marginTop: spacing.xl, // space between the pie section and the bar section
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  barChart: {
    borderRadius: radius.md,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xl,
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
