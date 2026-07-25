import type { Category } from "@/lib/expenses";
import { CATEGORY_STYLES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function CategoryChip({
  category,
  className,
  size = "md",
}: {
  category: Category;
  className?: string;
  size?: "sm" | "md";
}) {
  const s = CATEGORY_STYLES[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        s.chip,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <span aria-hidden>{s.emoji}</span>
      {category}
    </span>
  );
}
