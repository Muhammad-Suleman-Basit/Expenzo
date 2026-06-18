// theme.js — the ONE place that holds our app's design.
//
// We have TWO palettes (light + dark) that share the same keys. Components get
// the right one via the useTheme() hook, which reads the darkMode preference.
//
// Brand colors (primary, income, expense, etc.) are the same in both themes.
// Only the backgrounds / surfaces / text colors flip.

import { useExpenses } from "../context/ExpensesContext";

// Colors that are identical in both themes (brand + money + accents).
const shared = {
  primary: "#6C5CE7",
  primaryLight: "#8B7DF0",
  primaryDark: "#5A4BD6",
  income: "#3FC76A", // green
  expense: "#FF5C5C", // red
  orange: "#F5A623",
  teal: "#1ED9B0",
  white: "#FFFFFF", // literal white (for icons/text ON colored backgrounds)
  black: "#000000",
};

// LIGHT theme.
export const lightColors = {
  ...shared,
  bgLight: "#F4F5F9", // screen background
  surface: "#FFFFFF", // cards / rows on the screen
  textDark: "#15151E", // primary text
  textLight: "#FFFFFF", // text on colored (e.g. purple) cards
  textMuted: "#9AA0B4", // secondary text
  border: "#E6E8F0", // dividers / faint borders
};

// DARK theme (same keys, flipped values).
export const darkColors = {
  ...shared,
  bgLight: "#0E0E10", // screen background (dark)
  surface: "#1C1C1E", // cards / rows (dark grey)
  textDark: "#F2F3F7", // primary text (now light)
  textLight: "#FFFFFF", // text on colored cards (still white)
  textMuted: "#9AA0B4", // secondary text (reads fine on dark)
  border: "#2A2A30", // dividers (dark)
};

// Backward-compat: a default `colors` (light) so nothing crashes if some spot
// still imports it directly. Prefer useTheme() in components.
export const colors = lightColors;

// The hook every component uses to get the current palette.
// Returns { colors, isDark }. Because lightColors/darkColors are stable module
// objects, components can precompute a light + dark StyleSheet once and just
// pick one — so switching themes does ZERO style work (no lag).
export function useTheme() {
  const { darkMode } = useExpenses();
  return { colors: darkMode ? darkColors : lightColors, isDark: darkMode };
}

// ----- SPACING ----- (same in both themes)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// ----- RADIUS ----- (same in both themes)
export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
};
