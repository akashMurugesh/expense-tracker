import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MONTH_NAMES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Date to tab name: "Apr 2026"
export function toMonthTab(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

// Format number as Indian Rupees: ₹1,23,456
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date string DD/MM/YYYY
export function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Parse DD/MM/YYYY to Date object
export function parseDate(dateStr: string): Date {
  const [dd, mm, yyyy] = dateStr.split("/").map(Number);
  return new Date(yyyy, mm - 1, dd);
}
