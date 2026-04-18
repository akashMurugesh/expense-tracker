import { google } from "googleapis";

// Authenticate with the service account
function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// Get the Sheets API client
function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;

// Read data from a tab
export async function getSheetData(tabName: string, range?: string) {
  const sheets = getSheets();
  const fullRange = range ? `'${tabName}'!${range}` : `'${tabName}'`;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: fullRange,
    });
    return response.data.values || [];
  } catch (error: unknown) {
    const err = error as { code?: number };
    // If tab doesn't exist, return empty
    if (err.code === 400) return [];
    throw error;
  }
}

// Convert a column count to a sheet column letter (1=A, 2=B, ... 26=Z)
function colLetter(count: number): string {
  return String.fromCharCode(64 + count);
}

// Append a row to a tab
export async function appendRow(tabName: string, values: (string | number)[]) {
  const sheets = getSheets();
  const endCol = colLetter(values.length);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `'${tabName}'!A:${endCol}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}

// Update a specific row in a tab
export async function updateRow(
  tabName: string,
  rowIndex: number,
  values: (string | number)[]
) {
  const sheets = getSheets();
  const endCol = colLetter(values.length);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'${tabName}'!A${rowIndex}:${endCol}${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}

// Delete a row from a tab
export async function deleteRow(tabName: string, rowIndex: number) {
  const sheets = getSheets();

  // First, get the sheet's numeric ID (not the same as SHEET_ID)
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === tabName
  );

  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    throw new Error(`Tab "${tabName}" not found`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1, // 0-indexed
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
}

// Create a new tab with an optional header row
export async function createTab(tabName: string, headers?: string[]) {
  const sheets = getSheets();

  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: tabName },
            },
          },
        ],
      },
    });

    // Add header row — use provided headers or default to transaction headers
    const headerRow = headers ?? [
      "Account",
      "Date",
      "Description",
      "Debit",
      "Credit",
      "Income/Expense",
      "Subcategory",
      "Category",
      "Category Type",
    ];
    await appendRow(tabName, headerRow);
  } catch (error: unknown) {
    const err = error as { message?: string };
    // Tab already exists — that's fine
    if (err.message?.includes("already exists")) return;
    throw error;
  }
}

// Ensure a tab exists, creating it with the right headers if missing
export async function ensureTab(tabName: string, headers?: string[]) {
  const exists = await tabExists(tabName);
  if (!exists) {
    await createTab(tabName, headers);
  }
}

// Get list of all tab names
export async function getTabList(): Promise<string[]> {
  const sheets = getSheets();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });
  return (
    spreadsheet.data.sheets?.map((s) => s.properties?.title || "") || []
  );
}

// Check if a tab exists
export async function tabExists(tabName: string): Promise<boolean> {
  const tabs = await getTabList();
  return tabs.includes(tabName);
}