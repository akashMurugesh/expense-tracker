"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Category } from "@/lib/types";

interface SubcategoryComboboxProps {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
}

export function SubcategoryCombobox({
  categories,
  value,
  onChange,
}: SubcategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = categories.filter((c) =>
    c.subcategory.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group by parent category for display
  const grouped = new Map<string, Category[]>();
  for (const cat of filtered) {
    const list = grouped.get(cat.category) ?? [];
    list.push(cat);
    grouped.set(cat.category, list);
  }

  const selectedLabel = value || "Search subcategory...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
        <div className="pb-2">
          <Input
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {grouped.size > 0 ? (
            Array.from(grouped.entries()).map(([group, items]) => (
              <div key={group}>
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  {group}
                </div>
                {items.map((c) => (
                  <button
                    key={c.rowIndex}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-accent",
                      value === c.subcategory && "bg-accent"
                    )}
                    onClick={() => {
                      onChange(c.subcategory);
                      setSearch("");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        value === c.subcategory ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{c.subcategory}</span>
                    <span className={cn(
                      "ml-auto text-xs",
                      c.categoryType === "Income" ? "text-emerald-500" : "text-red-500"
                    )}>
                      {c.categoryType}
                    </span>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No matching subcategory
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
