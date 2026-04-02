"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

type CategoryMeta = {
  label: { en: string; es: string };
  color: string;
};

type Props = {
  categories: Record<string, CategoryMeta>;
  categoryCounts: Record<string, number>;
  activeCategory: string;
  locale: string;
  isEs: boolean;
};

export function SupplementCategoryTabs({
  categories,
  categoryCounts,
  activeCategory,
  locale,
  isEs,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function handleCategory(cat: string) {
    startTransition(() => {
      const url = cat === "all"
        ? pathname
        : `${pathname}?category=${cat}`;
      router.push(url);
    });
  }

  const tabs = [
    {
      key: "all",
      label: isEs ? "Todo" : "All",
      count: Object.values(categoryCounts).reduce((a, b) => a + b, 0),
    },
    ...Object.entries(categories)
      .filter(([key]) => (categoryCounts[key] ?? 0) > 0)
      .map(([key, meta]) => ({
        key,
        label: isEs ? meta.label.es : meta.label.en,
        count: categoryCounts[key] ?? 0,
      })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab.key === activeCategory;
        return (
          <button
            key={tab.key}
            onClick={() => handleCategory(tab.key)}
            className={`flex-none whitespace-nowrap text-sm font-medium px-4 py-2 rounded-pill transition-all ${
              isActive
                ? "bg-brand-red text-white shadow-sm"
                : "bg-surface-dim text-body-muted hover:bg-brand-pink-soft hover:text-heading"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${isActive ? "opacity-80" : "opacity-60"}`}>
              ({tab.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
