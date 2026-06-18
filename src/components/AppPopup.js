// AppPopup.js — one reusable, app-styled popup used everywhere instead of the
// native Alert. It can be a simple message (one button) or a confirmation
// (two buttons: Cancel + a colored action).
//
// Props:
//   visible      : show/hide the popup
//   variant      : "success" | "error" | "danger" | "info"  (picks icon + color)
//   title        : bold heading
//   message      : smaller grey line under the title
//   confirmText  : label of the main button (default "OK")
//   onConfirm    : called when the main button is pressed
//   cancelText   : if provided, a second "Cancel" button is shown
//   onCancel     : called when Cancel (or the Android back button) is pressed

import React from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";

// Each variant decides the icon, the circle color, and the main button color.
// (These are brand colors — identical in light and dark — so lightColors is fine.)
const VARIANTS = {
  success: { icon: "checkmark", circle: lightColors.income, button: lightColors.primary },
  error: { icon: "alert", circle: lightColors.expense, button: lightColors.primary },
  danger: { icon: "trash", circle: lightColors.expense, button: lightColors.expense },
  info: { icon: "information", circle: lightColors.primary, button: lightColors.primary },
};

export default function AppPopup({
  visible,
  variant = "info",
  title,
  message,
  confirmText = "OK",
  onConfirm,
  cancelText,
  onCancel,
}) {
  const v = VARIANTS[variant] || VARIANTS.info;
  const showCancel = !!cancelText;
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      {/* Dimmed backdrop with the card centered on top. */}
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Colored icon circle */}
          <View style={[styles.circle, { backgroundColor: v.circle }]}>
            <Ionicons name={v.icon} size={36} color={colors.white} />
          </View>

          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttonRow}>
            {showCancel && (
              <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.button, { backgroundColor: v.button }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  popup: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignSelf: "stretch",
  },
  button: {
    flex: 1, // buttons share the width evenly (or fill it when there's one)
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);
