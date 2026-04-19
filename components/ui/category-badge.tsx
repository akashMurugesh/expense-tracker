import { getCategoryColor } from "@/lib/category-colors";

export function CategoryBadge({ category }: { category: string }) {
  const color = getCategoryColor(category);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}
    >
      {category}
    </span>
  );
}
