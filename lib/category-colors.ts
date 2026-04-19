// Stable color palette for category badges
// Each unique category name gets a deterministic color

const CATEGORY_COLORS = [
  { bg: "bg-violet-500/15", text: "text-violet-700 dark:text-violet-400" },
  { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400" },
  { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400" },
  { bg: "bg-rose-500/15", text: "text-rose-700 dark:text-rose-400" },
  { bg: "bg-sky-500/15", text: "text-sky-700 dark:text-sky-400" },
  { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400" },
  { bg: "bg-pink-500/15", text: "text-pink-700 dark:text-pink-400" },
  { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-400" },
  { bg: "bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-400" },
  { bg: "bg-lime-500/15", text: "text-lime-700 dark:text-lime-400" },
  { bg: "bg-cyan-500/15", text: "text-cyan-700 dark:text-cyan-400" },
  { bg: "bg-fuchsia-500/15", text: "text-fuchsia-700 dark:text-fuchsia-400" },
];

// Simple hash to get a consistent index for a given string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCategoryColor(category: string): { bg: string; text: string } {
  const index = hashString(category) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[index];
}
