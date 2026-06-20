// SettingsScreen — sectioned settings (Profile, General, Budget, Appearance,
// Data, About), styled to match the sample design.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { useExpenses } from "../context/ExpensesContext";
import AppPopup from "../components/AppPopup";
import { expensesToCSV } from "../utils/csv";
import { currencies } from "../config/currencies";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";

// Build initials from a name, e.g. "My Wallet" -> "MW".
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ? parts[0][0] : "";
  const second = parts[1] ? parts[1][0] : "";
  return (first + second).toUpperCase() || "?";
}

// A single tappable settings row: colored icon + label (+ optional right side).
function Row({ icon, iconBg, label, sublabel, right, onPress, showChevron }) {
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={colors.white} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel ? <Text style={styles.rowSub}>{sublabel}</Text> : null}
      </View>
      {right}
      {showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen({ navigation }) {
  const {
    expenses,
    monthlyLimit,
    setMonthlyLimit,
    profileName,
    setProfileName,
    darkMode,
    setDarkMode,
    currency,
    setCurrency,
    formatMoney,
  } = useExpenses();
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  // Budget input.
  const [limitText, setLimitText] = useState(
    monthlyLimit > 0 ? String(monthlyLimit) : ""
  );

  // Edit-profile modal.
  const [showEditName, setShowEditName] = useState(false);
  const [nameText, setNameText] = useState(profileName);

  // Currency picker modal.
  const [showCurrency, setShowCurrency] = useState(false);

  // Our app popup (messages / confirmations).
  const [popup, setPopup] = useState({ visible: false });
  function closePopup() {
    setPopup((p) => ({ ...p, visible: false }));
  }

  // Small helper for rows that aren't built yet.
  function comingSoon(feature) {
    setPopup({
      visible: true,
      variant: "info",
      title: "Coming soon",
      message: `${feature} will be available in a future update.`,
      confirmText: "OK",
      onConfirm: closePopup,
    });
  }

  function openEditName() {
    setNameText(profileName);
    setShowEditName(true);
  }

  function saveName() {
    const trimmed = nameText.trim();
    if (trimmed === "") {
      setPopup({
        visible: true,
        variant: "error",
        title: "Name required",
        message: "Please enter a name.",
        confirmText: "OK",
        onConfirm: closePopup,
      });
      return;
    }
    setProfileName(trimmed);
    setShowEditName(false);
  }

  function handleSaveBudget() {
    const value = parseFloat(limitText);
    if (limitText.trim() === "" || isNaN(value) || value <= 0) {
      setPopup({
        visible: true,
        variant: "error",
        title: "Invalid amount",
        message: "Please enter a number greater than 0.",
        confirmText: "OK",
        onConfirm: closePopup,
      });
      return;
    }
    setMonthlyLimit(value);
    setPopup({
      visible: true,
      variant: "success",
      title: "Budget Set!",
      message: `Your monthly budget is now ${formatMoney(value)}.`,
      confirmText: "Go to Home",
      onConfirm: () => {
        closePopup();
        navigation.navigate("Overview");
      },
    });
  }

  async function handleExport() {
    if (expenses.length === 0) {
      setPopup({
        visible: true,
        variant: "error",
        title: "Nothing to export",
        message: "Add some expenses first.",
        confirmText: "OK",
        onConfirm: closePopup,
      });
      return;
    }
    try {
      const csv = expensesToCSV(expenses);
      const file = new File(Paths.document, "expenses.csv");
      file.create({ overwrite: true });
      file.write(csv);

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        setPopup({
          visible: true,
          variant: "error",
          title: "Sharing unavailable",
          message: "Sharing isn't available on this device.",
          confirmText: "OK",
          onConfirm: closePopup,
        });
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Export expenses",
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      console.log("Export failed:", error);
      setPopup({
        visible: true,
        variant: "error",
        title: "Export failed",
        message: "Something went wrong while exporting. Please try again.",
        confirmText: "OK",
        onConfirm: closePopup,
      });
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* ----- PROFILE ----- */}
        <Pressable style={styles.profileCard} onPress={openEditName}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(profileName)}</Text>
          </View>
          <View style={styles.profileTextWrap}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileSub}>Tap to edit profile</Text>
          </View>
          <Ionicons name="create-outline" size={22} color={colors.textMuted} />
        </Pressable>

        {/* ----- GENERAL ----- */}
        <Text style={styles.sectionLabel}>GENERAL</Text>
        <View style={styles.card}>
          <Row
            icon="language"
            iconBg="#3B82F6"
            label="Language"
            right={<Text style={styles.valueText}>English</Text>}
            onPress={() => comingSoon("Language selection")}
          />
          <View style={styles.divider} />
          <Row
            icon="pricetags"
            iconBg="#F5A623"
            label="Manage Categories"
            showChevron
            onPress={() => navigation.navigate("ManageCategories")}
          />
          <View style={styles.divider} />
          <Row
            icon="cash"
            iconBg="#E0A100"
            label="Currency"
            right={
              <View style={styles.valuePill}>
                <Text style={styles.valuePillText}>{currency}</Text>
              </View>
            }
            onPress={() => setShowCurrency(true)}
          />
        </View>

        {/* ----- BUDGET ----- */}
        <Text style={styles.sectionLabel}>BUDGET</Text>
        <View style={styles.card}>
          <Text style={styles.budgetCurrent}>
            {monthlyLimit > 0
              ? `Current monthly budget: ${formatMoney(monthlyLimit)}`
              : "No budget set yet."}
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.currency}>{currency}</Text>
            <TextInput
              style={styles.input}
              value={limitText}
              onChangeText={setLimitText}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <Pressable style={styles.primaryButton} onPress={handleSaveBudget}>
            <Text style={styles.primaryButtonText}>Save Budget</Text>
          </Pressable>
        </View>

        {/* ----- APPEARANCE ----- */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.card}>
          <Row
            icon="moon"
            iconBg="#38BDF8"
            label="Dark Mode"
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ true: colors.primary, false: "#CBD0DC" }}
                thumbColor={colors.white}
              />
            }
          />
        </View>

        {/* ----- DATA MANAGEMENT ----- */}
        <Text style={styles.sectionLabel}>DATA MANAGEMENT</Text>
        <View style={styles.card}>
          <Row
            icon="download"
            iconBg="#3B82F6"
            label="Export to CSV"
            sublabel="Save your expenses as a CSV file"
            showChevron
            onPress={handleExport}
          />
        </View>

        {/* ----- ABOUT ----- */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <Row
            icon="information-circle"
            iconBg="#8395A7"
            label="Version"
            right={<Text style={styles.valueText}>1.0.0</Text>}
          />
          <View style={styles.divider} />
          <Row
            icon="shield-checkmark"
            iconBg="#1DD1A1"
            label="Privacy Policy"
            showChevron
            onPress={() =>
              setPopup({
                visible: true,
                variant: "info",
                title: "Privacy Policy",
                message:
                  "Your data stays on your device. Nothing is uploaded — the app works fully offline.",
                confirmText: "OK",
                onConfirm: closePopup,
              })
            }
          />
        </View>

        <Text style={styles.appName}>Expense Tracker</Text>
      </ScrollView>

      {/* ----- EDIT NAME MODAL ----- */}
      <Modal
        visible={showEditName}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditName(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Edit profile</Text>
            <TextInput
              style={styles.editInput}
              value={nameText}
              onChangeText={setNameText}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.editButtonRow}>
              <Pressable
                style={[styles.editButton, styles.editCancel]}
                onPress={() => setShowEditName(false)}
              >
                <Text style={styles.editCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.editButton, styles.editSave]}
                onPress={saveName}
              >
                <Text style={styles.editSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ----- CURRENCY PICKER MODAL ----- */}
      <Modal
        visible={showCurrency}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrency(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Choose currency</Text>

            {currencies.map((c) => {
              const selected = c.symbol === currency;
              return (
                <Pressable
                  key={c.symbol}
                  style={styles.currencyOption}
                  onPress={() => {
                    setCurrency(c.symbol);
                    setShowCurrency(false);
                  }}
                >
                  <View style={styles.currencySymbolBox}>
                    <Text style={styles.currencySymbol}>{c.symbol}</Text>
                  </View>
                  <Text style={styles.currencyName}>{c.name}</Text>
                  <Ionicons
                    name={selected ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={selected ? colors.primary : colors.textMuted}
                  />
                </Pressable>
              );
            })}

            <Pressable
              style={styles.currencyCancel}
              onPress={() => setShowCurrency(false)}
            >
              <Text style={styles.editCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Our reusable popup. */}
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: spacing.lg,
  },

  // Profile
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },
  profileSub: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
  },

  // Sections
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: "500",
  },
  rowSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 34 + spacing.md, // line up past the icon
  },
  valueText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  valuePill: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
  },
  valuePillText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textDark,
  },

  // Budget
  budgetCurrent: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
  },
  currency: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textDark,
    paddingVertical: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  appName: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.sm,
  },

  // Edit-name modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  editCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  editInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  editButtonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  editButton: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  editCancel: {
    backgroundColor: colors.border,
  },
  editCancelText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: "bold",
  },
  editSave: {
    backgroundColor: colors.primary,
  },
  editSaveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  // Currency picker
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  currencySymbolBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },
  currencyName: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
  },
  currencyCancel: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: colors.border,
    marginTop: spacing.md,
  },
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);

