import { type NextRequest } from "next/server";
import { getSheetData, appendRow, ensureTab } from "@/lib/google-sheets";
import { MEMBERS_TAB, TAB_HEADERS } from "@/lib/constants";
import { parseMember } from "@/lib/sheets-helpers";

export async function GET() {
  try {
    const rows = await getSheetData(MEMBERS_TAB);
    const members = rows.slice(1).map((row, i) => parseMember(row, i + 2));

    return Response.json({ members });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch members";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return Response.json({ error: "Member name is required" }, { status: 400 });
    }

    await ensureTab(MEMBERS_TAB, TAB_HEADERS[MEMBERS_TAB]);
    await appendRow(MEMBERS_TAB, [name]);

    return Response.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create member";
    return Response.json({ error: message }, { status: 500 });
  }
}
