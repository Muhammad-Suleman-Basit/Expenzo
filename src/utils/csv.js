// csv.js — turn the expenses array into a valid CSV string.

// Escape one value for CSV. The rule: if the text contains a comma, a double
// quote, or a newline, wrap the whole thing in double quotes and double any
// quotes inside it. Otherwise return it as-is.
function escapeCSV(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Build the full CSV text from the expenses.
// Columns: Date,Category,Amount,Note  — one row per expense, sorted by date.
export function expensesToCSV(expenses) {
  // Copy before sorting so we don't change the original array. Oldest first.
  const sorted = [...expenses].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  );

  const header = "Date,Category,Amount,Note";

  const rows = sorted.map((e) =>
    [
      escapeCSV(e.date),
      escapeCSV(e.category),
      escapeCSV(e.amount.toFixed(2)), // e.g. 12.5 -> "12.50"
      escapeCSV(e.note || ""), // note may be empty
    ].join(",")
  );

  // Header first, then all rows, separated by newlines.
  return [header, ...rows].join("\n");
}
