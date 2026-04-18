import { type NextRequest } from "next/server";
import { updateRow, deleteRow } from "@/lib/google-sheets";
import { ACCOUNTS_TAB } from "@/lib/constants";

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

    const { name } = await request.json();

    if (!name) {
      return Response.json({ error: "Account name is required" }, { status: 400 });
    }

    await updateRow(ACCOUNTS_TAB, rowIndex, [name]);

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update account";
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

    await deleteRow(ACCOUNTS_TAB, rowIndex);

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete account";
    return Response.json({ error: message }, { status: 500 });
  }
}