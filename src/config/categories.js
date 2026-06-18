// categories.js — the DEFAULT categories the app starts with.
//
// These seed the list the first time the app runs. After that, the live list
// (including any categories you add yourself) lives in the data store
// (ExpensesContext) and is saved to the device. Read categories from there,
// not from this file.
//
// Each category has:
//   - name:      shown to the user
//   - color:     hex color for its icon circle / highlight
//   - icon:      an Ionicons name (from @expo/vector-icons)
//   - isDefault: true for these built-ins (they can't be deleted)

export const defaultCategories = [
  { name: "Food", color: "#FF9F43", icon: "fast-food", isDefault: true },
  { name: "Transport", color: "#54A0FF", icon: "bus", isDefault: true },
  { name: "Shopping", color: "#FF6BD6", icon: "bag-handle", isDefault: true },
  { name: "Bills", color: "#FF6B6B", icon: "receipt", isDefault: true },
  { name: "Entertainment", color: "#5F27CD", icon: "game-controller", isDefault: true },
  { name: "Health", color: "#1DD1A1", icon: "medkit", isDefault: true },
  { name: "Other", color: "#8395A7", icon: "pricetag", isDefault: true },
];
