import type { Category } from "./expenses";

export const CATEGORY_STYLES: Record<
  Category,
  { chip: string; dot: string; hex: string; emoji: string }
> = {
  Food: {
    chip: "bg-cat-food/15 text-cat-food border-cat-food/30",
    dot: "bg-cat-food",
    hex: "var(--cat-food)",
    emoji: "🍽️",
  },
  Travel: {
    chip: "bg-cat-travel/15 text-cat-travel border-cat-travel/30",
    dot: "bg-cat-travel",
    hex: "var(--cat-travel)",
    emoji: "🛺",
  },
  Education: {
    chip: "bg-cat-education/15 text-cat-education border-cat-education/30",
    dot: "bg-cat-education",
    hex: "var(--cat-education)",
    emoji: "📚",
  },
  Entertainment: {
    chip: "bg-cat-entertainment/15 text-cat-entertainment border-cat-entertainment/30",
    dot: "bg-cat-entertainment",
    hex: "var(--cat-entertainment)",
    emoji: "🎬",
  },
  Shopping: {
    chip: "bg-cat-shopping/15 text-cat-shopping border-cat-shopping/30",
    dot: "bg-cat-shopping",
    hex: "var(--cat-shopping)",
    emoji: "🛍️",
  },
  Bills: {
    chip: "bg-cat-bills/15 text-cat-bills border-cat-bills/30",
    dot: "bg-cat-bills",
    hex: "var(--cat-bills)",
    emoji: "🧾",
  },
  Other: {
    chip: "bg-cat-other/15 text-cat-other border-cat-other/30",
    dot: "bg-cat-other",
    hex: "var(--cat-other)",
    emoji: "✨",
  },
};
