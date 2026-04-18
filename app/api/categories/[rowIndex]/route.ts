import { type NextRequest } from "next/server";
import { updateRow, deleteRow } from "@/lib/google-sheets";
import { CATEGORIES_TAB } from "@/lib/constants";

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

    const { category, subcategory, categoryType } = await request.json();

    if (!category || !subcategory || !categoryType) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await updateRow(CATEGORIES_TAB, rowIndex, [category, subcategory, categoryType]);

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ rowIndex: string }> }
) {
  try {
    const { rowIndex: rowIndexStr } = await params;
    const rowIndex = parseInt(rowIndexStr, 10);
    if (isNaN(rowIndex)) {
      return Response.json({ error: "Invalid row index" }, { status: 400 });
    }

    await deleteRow(CATEGORIES_TAB, rowIndex);

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return Response.json({ error: message }, { status: 500 });
  }
}