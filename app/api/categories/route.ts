import { type NextRequest } from "next/server";
import { getSheetData, appendRow, ensureTab } from "@/lib/google-sheets";
import { CATEGORIES_TAB, TAB_HEADERS } from "@/lib/constants";
import { parseCategory } from "@/lib/sheets-helpers";
import type { CreateCategoryRequest } from "@/lib/types";

export async function GET() {
  try {
    const rows = await getSheetData(CATEGORIES_TAB);
    const categories = rows.slice(1).map((row, i) => parseCategory(row, i + 2));

    return Response.json({ categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryRequest = await request.json();

    if (!body.category || !body.subcategory || !body.categoryType) {
      return Response.json(
        { error: "Missing required fields: category, subcategory, categoryType" },
        { status: 400 }
      );
    }

    await ensureTab(CATEGORIES_TAB, TAB_HEADERS[CATEGORIES_TAB]);
    await appendRow(CATEGORIES_TAB, [body.category, body.subcategory, body.categoryType]);

    return Response.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return Response.json({ error: message }, { status: 500 });
  }
}