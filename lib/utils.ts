import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MONTH_NAMES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toMonthTab(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}
