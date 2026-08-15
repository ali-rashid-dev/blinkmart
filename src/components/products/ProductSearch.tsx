import { Search, X } from "lucide-react";

export function ProductSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="field-shell relative flex items-center rounded-2xl border border-border bg-card px-4 focus-within:border-primary focus-within:shadow-[0_0_0_4px_var(--color-accent)]">
      <Search aria-hidden="true" className="size-[18px] shrink-0 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search products by name, brand or SKU"
        placeholder="Search by product, brand or SKU…"
        className="h-12 w-full bg-transparent px-3 text-[15px] text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden sm:h-14"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
