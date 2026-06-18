// format.js — small reusable helper functions for formatting.

import { format } from "date-fns";

// Turn a number into a money string, e.g. formatMoney(12.5, "$") -> "$12.50".
// Multi-character symbols (like "Rs.") read better with a space: "Rs. 12.50".
export function formatMoney(number, symbol = "$") {
  const sep = symbol.length > 1 ? " " : "";
  return symbol + sep + Number(number).toFixed(2);
}

// Take an ISO date "YYYY-MM-DD" and return just the month part "YYYY-MM".
// Example: "2026-06-18" -> "2026-06".
export function getMonthKey(dateString) {
  return String(dateString).slice(0, 7);
}

// Take a month key "2026-06" and return a friendly label "June 2026".
export function formatMonthLabel(monthKey) {
  const parts = monthKey.split("-"); // ["2026", "06"]
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-12

  // Build a real Date on the 1st of that month, then let date-fns format it.
  const date = new Date(year, month - 1, 1); // month is 0-11 in JS Dates
  return format(date, "MMMM yyyy"); // "June 2026"
}
