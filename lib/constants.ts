// Tab names in Google Sheet
export const CATEGORIES_TAB = "Categories";
export const BUDGETS_TAB = "Budgets";
export const ACCOUNTS_TAB = "Accounts";

// Budget threshold percentages
export const BUDGET_WARNING_THRESHOLD = 0.7;  // Yellow at 70%
export const BUDGET_DANGER_THRESHOLD = 0.9;   // Red at 90%

// Month tab format helper — converts a Date to "MMM YYYY" (e.g., "Apr 2026")
export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Header rows for each known tab (used when auto-creating tabs)
export const TAB_HEADERS: Record<string, string[]> = {
  [CATEGORIES_TAB]: ["Category", "Subcategory", "CategoryType"],
  [ACCOUNTS_TAB]: ["Name"],
  [BUDGETS_TAB]: ["Month", "Category", "Limit"],
};