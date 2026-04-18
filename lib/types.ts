export interface Transaction {
  rowIndex: number;          // Row number in the sheet (for update/delete)
  account: string;
  date: string;              // DD/MM/YYYY
  description: string;
  debit: number | null;
  credit: number | null;
  incomeExpense: number;     // +credit or -debit
  subcategory: string;
  category: string;
  categoryType: "Income" | "Expense";
}

export interface Category {
  rowIndex: number;
  category: string;
  subcategory: string;
  categoryType: "Income" | "Expense";
}

export interface Budget {
  rowIndex: number;
  month: string;             // "MMM YYYY"
  category: string;
  limit: number;
}

export interface Account {
  rowIndex: number;
  name: string;
}

// API request types
export interface CreateTransactionRequest {
  account: string;
  date: string;
  description: string;
  amount: number;
  type: "Income" | "Expense";
  subcategory: string;
}

export interface CreateCategoryRequest {
  category: string;
  subcategory: string;
  categoryType: "Income" | "Expense";
}

export interface CreateBudgetRequest {
  month: string;
  category: string;
  limit: number;
}