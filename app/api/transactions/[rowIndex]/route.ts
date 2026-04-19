import { type NextRequest } from "next/server";
import { getSheetData, updateRow, deleteRow } from "@/lib/google-sheets";
import { CATEGORIES_TAB, UNCATEGORIZED } from "@/lib/constants";
import { dateToMonthTab, parseCategory } from "@/lib/sheets-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ rowIndex: string }> }
) {
  try {
    const { rowIndex: rowIndexStr } = await params;
    const rowIndex = parseInt(rowIndexStr, 10);
    if (isNaN(rowIndex)) {
      return Response.json({ error: "Invalid row index" }, { status: 400 });
    }

    const body = await request.json();
    const { account, date, description, amount, type, subcategory, month, member } = body;

    if (!account || !date || !description || !amount || !type || !subcategory || !month || !member) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Look up parent category
    const categoryRows = await getSheetData(CATEGORIES_TAB);
    const categories = categoryRows.slice(1).map((row, i) => parseCategory(row, i + 2));
    const matched = categories.find((c) => c.subcategory === subcategory);

    const parentCategory = matched?.category ?? UNCATEGORIZED;
    const categoryType = matched?.categoryType ?? type;

    const isExpense = type === "Expense";
    const debit = isExpense ? amount : "";
    const credit = isExpense ? "" : amount;
    const incomeExpense = isExpense ? -amount : amount;

    // Use the month the transaction currently lives in (not derived from date)
    // so we update the correct tab
    const monthTab = month || dateToMonthTab(date);

    await updateRow(monthTab, rowIndex, [
      account,
      date,
      description,
      debit,
      credit,
      incomeExpense,
      subcategory,
      parentCategory,
      categoryType,
      member,
    ]);

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update transaction";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ rowIndex: string }> }
) {
  try {
    const { rowIndex: rowIndexStr } = await params;
    const rowIndex = parseInt(rowIndexStr, 10);
    if (isNaN(rowIndex)) {
      return Response.json({ error: "Invalid row index" }, { status: 400 });
    }

    const { searchParams } = request.nextUrl;
    const month = searchParams.get("month");
    if (!month) {
      return Response.json({ error: "month query param required" }, { status: 400 });
    }

    await deleteRow(month, rowIndex);

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete transaction";
    return Response.json({ error: message }, { status: 500 });
  }
}