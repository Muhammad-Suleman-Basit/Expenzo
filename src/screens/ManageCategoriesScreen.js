// ManageCategoriesScreen — see all categories and add your own.
// Defaults are marked "Default" and can't be deleted; your own can be deleted.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useExpenses } from "../context/ExpensesContext";
import AppPopup from "../components/AppPopup";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";

// Colors the user can pick for a new category.
const COLOR_OPTIONS = [
  "#FF9F43", "#54A0FF", "#FF6BD6", "#FF6B6B", "#5F27CD", "#1DD1A1",
  "#8395A7", "#3B82F6", "#E0A100", "#10AC84", "#EE5253", "#0ABDE3",
];

// Icons the user can pick (Ionicons names).
const ICON_OPTIONS = [
  "pricetag", "cart", "restaurant", "bus", "home", "heart", "game-controller",
  "school", "gift", "airplane", "medkit", "fitness", "paw", "cafe", "car",
  "card", "basket", "shirt", "construct", "book", "wifi", "barbell",
];

export default function ManageCategoriesScreen({ navigation }) {
  const { categories, addCategory, deleteCategory } = useExpenses();
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  // Add-category modal state.
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);

  // Our app popup.
  const [popup, setPopup] = useState({ visible: false });
  function closePopup() {
    setPopup((p) => ({ ...p, visible: false }));
  }

  // Open the modal with fresh (reset) fields.
  function openAdd() {
    setName("");
    setSelectedColor(COLOR_OPTIONS[0]);
    setSelectedIcon(ICON_OPTIONS[0]);
    setShowAdd(true);
  }

  function handleAdd() {
    const trimmed = name.trim();
    if (trimmed === "") {
      setPopup({
        visible: true,
        variant: "error",
        title: "Name required",
        message: "Please enter a category name.",
        confirmText: "OK",
        onConfirm: closePopup,
      });
      return;
    }
    // Don't allow two categories with the same name (case-insensitive).
    const exists = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setPopup({
        visible: true,
        variant: "error",
        title: "Already exists",
        message: `A category called "${trimmed}" already exists.`,
        confirmText: "OK",
        onConfirm: closePopup,
      });
      return;
    }

    addCategory({
      name: trimmed,
      color: selectedColor,
      icon: selectedIcon,
      isDefault: false,
    });
    setShowAdd(false);
  }

  function confirmDelete(category) {
    setPopup({
      visible: true,
      variant: "danger",
      title: `Delete "${category.name}"?`,
      message: "Existing expenses keep their data but will show as uncategorized.",
      confirmText: "Delete",
      onConfirm: () => {
        deleteCategory(category.name);
        closePopup();
      },
      cancelText: "Cancel",
      onCancel: closePopup,
    });
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* ----- HEADER ----- */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Categories</Text>
        <Pressable style={styles.headerButton} onPress={openAdd}>
          <Ionicons name="add" size={26} color={colors.textDark} />
        </Pressable>
      </View>

      {/* ----- LIST ----- */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((cat) => (
          <View key={cat.name} style={styles.row}>
            <View style={[styles.circle, { backgroundColor: cat.color }]}>
              <Ionicons name={cat.icon} size={22} color={colors.white} />
            </View>
            <Text style={styles.name}>{cat.name}</Text>

            {cat.isDefault ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Default</Text>
              </View>
            ) : (
              <Pressable onPress={() => confirmDelete(cat)} hitSlop={10}>
                <Ionicons name="trash-outline" size={22} color={colors.expense} />
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      {/* ----- ADD CATEGORY MODAL ----- */}
      <Modal
        visible={showAdd}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdd(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Category</Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Category Name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />

            {/* Color picker */}
            <Text style={styles.pickerLabel}>Color</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerRow}
            >
              {COLOR_OPTIONS.map((color) => {
                const selected = selectedColor === color;
                return (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.swatch,
                      { backgroundColor: color },
                      selected && styles.swatchSelected,
                    ]}
                  >
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color={colors.white} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Icon picker */}
            <Text style={styles.pickerLabel}>Icon</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerRow}
            >
              {ICON_OPTIONS.map((icon) => {
                const selected = selectedIcon === icon;
                return (
                  <Pressable
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    style={[
                      styles.iconChoice,
                      selected && { backgroundColor: selectedColor },
                    ]}
                  >
                    <Ionicons
                      name={icon}
                      size={22}
                      color={selected ? colors.white : colors.textDark}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Live preview */}
            <View style={styles.previewRow}>
              <Text style={styles.pickerLabel}>Preview</Text>
              <View style={[styles.previewCircle, { backgroundColor: selectedColor }]}>
                <Ionicons name={selectedIcon} size={20} color={colors.white} />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAdd(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAdd}
              >
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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

  // Header
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

  // List
  content: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  circle: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  pickerRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  swatchSelected: {
    borderColor: colors.textDark,
  },
  iconChoice: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  previewCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
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
  addButton: {
    backgroundColor: colors.primary,
  },
  addText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);
