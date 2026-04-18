import useSWR from "swr";
import type { Transaction, Category, Account, Budget } from "./types";

// Generic fetcher for SWR
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("API request failed");
    return res.json();
  });

// ── Summary (dashboard data) ────────────────────────────────────
interface SummaryData {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  byCategory: { category: string; amount: number; budget: number | null }[];
  recentTransactions: Transaction[];
  budgets: Budget[];
}

export function useSummary(month?: string) {
  const url = `/api/summary${month ? `?month=${month}` : ""}`;
  return useSWR<SummaryData>(url, fetcher);
}

// ── Transactions ─────────────────────────────────────────────────
interface TransactionsData {
  transactions: Transaction[];
  month: string;
}

export function useTransactions(month?: string) {
  const url = `/api/transactions${month ? `?month=${month}` : ""}`;
  return useSWR<TransactionsData>(url, fetcher);
}

// ── Categories ───────────────────────────────────────────────────
interface CategoriesData {
  categories: Category[];
}

export function useCategories() {
  return useSWR<CategoriesData>("/api/categories", fetcher);
}

// ── Accounts ─────────────────────────────────────────────────────
interface AccountsData {
  accounts: Account[];
}

export function useAccounts() {
  return useSWR<AccountsData>("/api/accounts", fetcher);
}