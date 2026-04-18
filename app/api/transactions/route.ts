import { type NextRequest } from "next/server";
import { getSheetData, appendRow, tabExists, createTab } from "@/lib/google-sheets";
import { CATEGORIES_TAB } from "@/lib/constants";
import { getMonthTab, dateToMonthTab, parseTransaction, parseCategory } from "@/lib/sheets-helpers";
import type { CreateTransactionRequest } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const month = request.nextUrl.searchParams.get("month") || getMonthTab();
    const rows = await getSheetData(month);

    // Skip header row (index 0). Sheet rows are 1-indexed, header is row 1.
    const transactions = rows.slice(1).map((row, i) => parseTransaction(row, i + 2));

    return Response.json({ transactions, month });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch transactions";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTransactionRequest = await request.json();

    // Validate required fields
    if (!body.account || !body.date || !body.description || !body.amount || !body.type || !body.subcategory) {
      return Response.json(
        { error: "Missing required fields: account, date, description, amount, type, subcategory" },
        { status: 400 }
      );
    }

    // Look up the parent category and categoryType from the Categories tab
    const categoryRows = await getSheetData(CATEGORIES_TAB);
    const categories = categoryRows.slice(1).map((row, i) => parseCategory(row, i + 2));
    const matched = categories.find((c) => c.subcategory === body.subcategory);

    const parentCategory = matched?.category ?? "Uncategorized";
    const categoryType = matched?.categoryType ?? body.type;

    // Determine which month tab this transaction belongs to
    const monthTab = dateToMonthTab(body.date);

    // Create the tab if it doesn't exist yet
    const exists = await tabExists(monthTab);
    if (!exists) {
      await createTab(monthTab);
    }

    // Build the row
    const isExpense = body.type === "Expense";
    const debit = isExpense ? body.amount : "";
    const credit = isExpense ? "" : body.amount;
    const incomeExpense = isExpense ? -body.amount : body.amount;

    await appendRow(monthTab, [
      body.account,
      body.date,
      body.description,
      debit,
      credit,
      incomeExpense,
      body.subcategory,
      parentCategory,
      categoryType,
    ]);

    return Response.json({ success: true, month: monthTab }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create transaction";
    return Response.json({ error: message }, { status: 500 });
  }
}