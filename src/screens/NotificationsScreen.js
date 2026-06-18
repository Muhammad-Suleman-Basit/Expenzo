// NotificationsScreen — opened from the bell on Home. For now there are no
// notifications, so it shows a friendly empty state in the middle.

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";

export default function NotificationsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* ----- HEADER ----- */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        {/* empty spacer so the title stays centered */}
        <View style={styles.headerButton} />
      </View>

      {/* ----- EMPTY STATE (centered) ----- */}
      <View style={styles.empty}>
        <View style={styles.iconCircle}>
          <Ionicons name="notifications-off-outline" size={54} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No Notifications Yet</Text>
        <Text style={styles.emptySubtitle}>
          You have no new notifications at this time.
        </Text>
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
    empty: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl, // nudge the content slightly above true center
    },
    iconCircle: {
      width: 110,
      height: 110,
      borderRadius: radius.pill,
      backgroundColor: "rgba(154,160,180,0.15)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textDark,
      marginBottom: spacing.sm,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
    },
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);
