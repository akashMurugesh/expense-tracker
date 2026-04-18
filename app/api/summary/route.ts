import { type NextRequest } from "next/server";
import { getSheetData } from "@/lib/google-sheets";
import { BUDGETS_TAB } from "@/lib/constants";
import { getMonthTab, parseTransaction, parseBudget } from "@/lib/sheets-helpers";

export async function GET(request: NextRequest) {
  try {
    const month = request.nextUrl.searchParams.get("month") || getMonthTab();

    // Fetch transactions and budgets in parallel
    const [transactionRows, budgetRows] = await Promise.all([
      getSheetData(month),
      getSheetData(BUDGETS_TAB),
    ]);

    // Parse transactions (skip header)
    const transactions = transactionRows.slice(1).map((row, i) => parseTransaction(row, i + 2));

    // Parse budgets (skip header), filter to current month
    const allBudgets = budgetRows.slice(1).map((row, i) => parseBudget(row, i + 2));
    const budgets = allBudgets.filter((b) => b.month === month);

    // ── Compute summary ──────────────────────────────────────────
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      if (t.categoryType === "Income") {
        totalIncome += t.incomeExpense;
      } else {
        totalExpenses += Math.abs(t.incomeExpense);
      }
    }

    const netBalance = totalIncome - totalExpenses;
    const transactionCount = transactions.length;

    // ── Spending by category (expenses only) ─────────────────────
    const categoryMap = new Map<string, number>();
    for (const t of transactions) {
      if (t.categoryType === "Expense") {
        const current = categoryMap.get(t.category) ?? 0;
        categoryMap.set(t.category, current + Math.abs(t.incomeExpense));
      }
    }

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        budget: budgets.find((b) => b.category === category)?.limit ?? null,
      }))
      .sort((a, b) => b.amount - a.amount);

    // ── Recent transactions (last 5) ─────────────────────────────
    const recentTransactions = transactions.slice(-5).reverse();

    return Response.json({
      month,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      transactionCount,
      byCategory,
      recentTransactions,
      budgets,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch summary";
    return Response.json({ error: message }, { status: 500 });
  }
}