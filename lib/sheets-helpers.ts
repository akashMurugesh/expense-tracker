import { MONTH_NAMES } from "./constants";
import type { Transaction, Category, Budget, Account } from "./types";

// Convert a Date to the tab name format "MMM YYYY" (e.g. "Apr 2026")
export function getMonthTab(date?: Date): string {
  const d = date ?? new Date();
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

// Parse a DD/MM/YYYY date string into a month tab name
export function dateToMonthTab(dateStr: string): string {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return getMonthTab();
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(year)) return getMonthTab();
  return `${MONTH_NAMES[month]} ${year}`;
}

// ── Row parsers ──────────────────────────────────────────────────
// Convert raw string[] rows from Google Sheets into typed objects.
// rowIndex is the 1-based sheet row number (needed for update/delete).

export function parseTransaction(row: string[], rowIndex: number): Transaction {
  return {
    rowIndex,
    account: row[0] ?? "",
    date: row[1] ?? "",
    description: row[2] ?? "",
    debit: row[3] ? parseFloat(row[3]) : null,
    credit: row[4] ? parseFloat(row[4]) : null,
    incomeExpense: row[5] ? parseFloat(row[5]) : 0,
    subcategory: row[6] ?? "",
    category: row[7] ?? "",
    categoryType: (row[8] as "Income" | "Expense") ?? "Expense",
  };
}

export function parseCategory(row: string[], rowIndex: number): Category {
  return {
    rowIndex,
    category: row[0] ?? "",
    subcategory: row[1] ?? "",
    categoryType: (row[2] as "Income" | "Expense") ?? "Expense",
  };
}

export function parseBudget(row: string[], rowIndex: number): Budget {
  return {
    rowIndex,
    month: row[0] ?? "",
    category: row[1] ?? "",
    limit: row[2] ? parseFloat(row[2]) : 0,
  };
}

export function parseAccount(row: string[], rowIndex: number): Account {
  return {
    rowIndex,
    name: row[0] ?? "",
  };
}