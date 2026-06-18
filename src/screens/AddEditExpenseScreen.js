// AddEditExpenseScreen.js — the form for adding a new expense.
// Opens as a modal on top of the tabs (set up in App.js).

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";

// The native date picker (installed with: expo install @react-native-community/datetimepicker)
import DateTimePicker from "@react-native-community/datetimepicker";

import { Ionicons } from "@expo/vector-icons";

// Our category list, data store, and design tokens.
import { useExpenses } from "../context/ExpensesContext";
import AppPopup from "../components/AppPopup";
import { lightColors, darkColors, spacing, radius, useTheme } from "../theme/theme";

// Helper: turn a Date object into an ISO date string "YYYY-MM-DD".
// We build it by hand (instead of toISOString) so the day never shifts
// because of the phone's timezone.
function toISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // months are 0-11
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// The opposite: turn an ISO string "YYYY-MM-DD" back into a real Date object,
// so we can pre-fill the date picker when editing an existing expense.
function parseISODate(iso) {
  const parts = String(iso).split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return new Date(year, month - 1, day);
}

export default function AddEditExpenseScreen({ navigation, route }) {
  // Get add + update + delete, the category list, and the currency symbol.
  const { addExpense, updateExpense, deleteExpense, categories, currency } =
    useExpenses();
  const { colors, isDark } = useTheme();
  const styles = isDark ? stylesDark : stylesLight;

  // If an expense was passed in as a navigation param, we're EDITING it.
  // If not, we're ADDING a new one.
  const editingExpense = route.params?.expense;
  const isEditing = !!editingExpense;

  // ----- Form state -----
  // When editing, pre-fill each field from the existing expense.
  const [amount, setAmount] = useState(
    editingExpense ? String(editingExpense.amount) : "" // number -> string for the input
  );
  const [selectedCategory, setSelectedCategory] = useState(
    editingExpense ? editingExpense.category : null
  );
  const [date, setDate] = useState(
    editingExpense ? parseISODate(editingExpense.date) : new Date()
  );
  const [showPicker, setShowPicker] = useState(false); // is the date picker open?
  const [note, setNote] = useState(editingExpense ? editingExpense.note : "");

  // Our app popup (used instead of the native Alert).
  const [popup, setPopup] = useState({ visible: false });
  function closePopup() {
    setPopup((p) => ({ ...p, visible: false }));
  }

  // Set the screen title based on the mode ("Edit Expense" vs "Add Expense").
  useEffect(() => {
    navigation.setOptions({ title: isEditing ? "Edit Expense" : "Add Expense" });
  }, [isEditing, navigation]);

  // Called when the date picker reports a change.
  function onChangeDate(event, selectedDate) {
    // On Android the picker is a popup; close it after any interaction.
    setShowPicker(false);

    // event.type is "set" when the user confirmed, "dismissed" when cancelled.
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  }

  // Called when the Save button is pressed.
  function handleSave() {
    // parseFloat turns "12.50" into the number 12.5
    const amountNumber = parseFloat(amount);

    // Validate the amount: must be a real number greater than zero.
    if (amount.trim() === "" || isNaN(amountNumber) || amountNumber <= 0) {
      setPopup({
        visible: true,
        variant: "error",
        title: "Invalid amount",
        message: "Please enter an amount greater than 0.",
        confirmText: "OK",
        onConfirm: closePopup,
      });
      return; // stop here — do NOT save
    }

    // Validate the category: one must be selected.
    if (!selectedCategory) {
      setPopup({
        visible: true,
        variant: "error",
        title: "No category",
        message: "Please pick a category.",
        confirmText: "OK",
        onConfirm: closePopup,
      });
      return; // stop here — do NOT save
    }

    // The fields we're saving (same shape for add and edit).
    const data = {
      amount: amountNumber, // a number now
      category: selectedCategory, // a string like "Food"
      note: note.trim(), // trimmed note (may be empty)
      date: toISODate(date), // "YYYY-MM-DD"
    };

    if (isEditing) {
      // Keep the SAME id so updateExpense can find and replace the right one.
      updateExpense({ id: editingExpense.id, ...data });
    } else {
      addExpense(data);
    }

    // Go back to the screen we came from.
    navigation.goBack();
  }

  // Called when the Delete button is pressed (edit mode only).
  // Confirm first, then delete and go back.
  function handleDelete() {
    setPopup({
      visible: true,
      variant: "danger",
      title: "Delete this expense?",
      message: editingExpense.note ? `"${editingExpense.note}"` : editingExpense.category,
      confirmText: "Delete",
      onConfirm: () => {
        deleteExpense(editingExpense.id);
        navigation.goBack();
      },
      cancelText: "Cancel",
      onCancel: closePopup,
    });
  }

  return (
    <>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* ----- AMOUNT ----- */}
      <Text style={styles.label}>Amount</Text>
      <View style={styles.amountBox}>
        <Text style={styles.currency}>{currency}</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* ----- CATEGORY ----- */}
      <Text style={styles.label}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((cat) => {
          const selected = selectedCategory === cat.name;
          return (
            <Pressable
              key={cat.name}
              style={styles.categoryItem}
              onPress={() => setSelectedCategory(cat.name)}
            >
              {/* Colored circle with the category icon */}
              <View
                style={[
                  styles.categoryCircle,
                  { backgroundColor: cat.color },
                  selected && styles.categoryCircleSelected,
                ]}
              >
                <Ionicons name={cat.icon} size={24} color={colors.white} />
              </View>
              {/* Category name, highlighted when selected */}
              <Text
                style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ----- DATE ----- */}
      <Text style={styles.label}>Date</Text>
      <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={styles.dateText}>{toISODate(date)}</Text>
      </Pressable>

      {/* The picker only appears while showPicker is true. */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* ----- NOTE (optional) ----- */}
      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={styles.noteInput}
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Lunch with friends"
        placeholderTextColor={colors.textMuted}
      />

      {/* ----- SAVE ----- */}
      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>

      {/* ----- DELETE (only when editing an existing expense) ----- */}
      {isEditing && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Expense</Text>
        </Pressable>
      )}
    </ScrollView>

      {/* Our reusable popup (validation errors + delete confirmation). */}
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
    </>
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },

  // Amount
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  currency: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textDark,
    paddingVertical: spacing.md,
  },

  // Category
  categoryRow: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryItem: {
    alignItems: "center",
    width: 72,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
    // a transparent border by default so selecting doesn't change the size
    borderWidth: 3,
    borderColor: "transparent",
  },
  categoryCircleSelected: {
    borderColor: colors.primary, // ring around the selected category
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  categoryLabelSelected: {
    color: colors.primary,
    fontWeight: "bold",
  },

  // Date
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  dateText: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: "600",
  },

  // Note
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textDark,
  },

  // Save
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xl,
    // purple glow
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "bold",
  },

  // Delete (red outlined button under Save)
  deleteButton: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.expense, // red
  },
  deleteButtonText: {
    color: colors.expense, // red
    fontSize: 17,
    fontWeight: "bold",
  },
  });
}

const stylesLight = makeStyles(lightColors);
const stylesDark = makeStyles(darkColors);

