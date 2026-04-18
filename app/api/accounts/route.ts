import { type NextRequest } from "next/server";
import { getSheetData, appendRow, ensureTab } from "@/lib/google-sheets";
import { ACCOUNTS_TAB, TAB_HEADERS } from "@/lib/constants";
import { parseAccount } from "@/lib/sheets-helpers";

export async function GET() {
  try {
    const rows = await getSheetData(ACCOUNTS_TAB);
    const accounts = rows.slice(1).map((row, i) => parseAccount(row, i + 2));

    return Response.json({ accounts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch accounts";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return Response.json({ error: "Account name is required" }, { status: 400 });
    }

    await ensureTab(ACCOUNTS_TAB, TAB_HEADERS[ACCOUNTS_TAB]);
    await appendRow(ACCOUNTS_TAB, [name]);

    return Response.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create account";
    return Response.json({ error: message }, { status: 500 });
  }
}