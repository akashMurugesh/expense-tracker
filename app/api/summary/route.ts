import { type NextRequest } from "next/server";
import { getSheetData } from "@/lib/google-sheets";
import { BUDGETS_TAB } from "@/lib/constants";
import { getMonthTab, parseTransaction, parseBudget } from "@/lib/sheets-helpers";

const round = (n: number) => Math.round(n * 100) / 100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const month = searchParams.get("month") || getMonthTab();
    const member = searchParams.get("member");

    const [transactionRows, budgetRows] = await Promise.all([
      getSheetData(month),
      getSheetData(BUDGETS_TAB),
    ]);

    const allTransactions = transactionRows.slice(1).map((row, i) => parseTransaction(row, i + 2));
    const allBudgets = budgetRows.slice(1).map((row, i) => parseBudget(row, i + 2));
    const budgets = allBudgets.filter((b) => b.month === month);

    // Apply member filter if specified
    const transactions = member
      ? allTransactions.filter((t) => t.member === member)
      : allTransactions;

    // ── Compute totals ───────────────────────────────────────────
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      if (t.categoryType === "Income") {
        totalIncome += t.incomeExpense;
      } else {
        totalExpenses += Math.abs(t.incomeExpense);
      }
    }

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
        amount: round(amount),
        budget: budgets.find((b) => b.category === category)?.limit ?? null,
      }))
      .sort((a, b) => b.amount - a.amount);

    // ── Top 10 costliest expenses ────────────────────────────────
    const expenseTransactions = transactions.filter((t) => t.categoryType === "Expense");
    const topExpenses = [...expenseTransactions]
      .sort((a, b) => Math.abs(b.incomeExpense) - Math.abs(a.incomeExpense))
      .slice(0, 10);

    return Response.json({
      month,
      totalIncome: round(totalIncome),
      totalExpenses: round(totalExpenses),
      netBalance: round(totalIncome - totalExpenses),
      transactionCount: transactions.length,
      expenseCount: expenseTransactions.length,
      byCategory,
      topExpenses,
      budgets,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch summary";
    return Response.json({ error: message }, { status: 500 });
  }
}
