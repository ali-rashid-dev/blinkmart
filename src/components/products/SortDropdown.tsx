"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortValue } from "./filters";

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "newest", label: "Newest Arrivals" },
];

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (next: SortValue) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v as SortValue)}>
      <SelectTrigger
        aria-label="Sort products"
        className="h-10 w-[11.5rem] rounded-xl border-border bg-card text-sm"
      >
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {sortOptions.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
