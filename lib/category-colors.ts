// Single source of truth for category colors.
// Uses a deterministic hash so the same category name always gets the same color
// across every page — dashboard pie chart, category badges, transactions table.

const PALETTE = [
  { bg: "bg-violet-500/15", text: "text-violet-700 dark:text-violet-400", hex: "#7C3AED" },
  { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400", hex: "#22C55E" },
  { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400", hex: "#EAB308" },
  { bg: "bg-rose-500/15", text: "text-rose-700 dark:text-rose-400", hex: "#EF4444" },
  { bg: "bg-sky-500/15", text: "text-sky-700 dark:text-sky-400", hex: "#06B6D4" },
  { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400", hex: "#F97316" },
  { bg: "bg-pink-500/15", text: "text-pink-700 dark:text-pink-400", hex: "#EC4899" },
  { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-400", hex: "#14B8A6" },
  { bg: "bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-400", hex: "#A78BFA" },
  { bg: "bg-lime-500/15", text: "text-lime-700 dark:text-lime-400", hex: "#84CC16" },
  { bg: "bg-cyan-500/15", text: "text-cyan-700 dark:text-cyan-400", hex: "#22D3EE" },
  { bg: "bg-fuchsia-500/15", text: "text-fuchsia-700 dark:text-fuchsia-400", hex: "#D946EF" },
];

export type CategoryColor = { bg: string; text: string; hex: string };

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCategoryColor(category: string): CategoryColor {
  return PALETTE[hashString(category) % PALETTE.length];
}
