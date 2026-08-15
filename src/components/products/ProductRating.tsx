import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductRating({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "xs";
}) {
  const px = size === "xs" ? "size-3" : "size-3.5";
  return (
    <div className="flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={cn(
              px,
              i <= Math.round(rating)
                ? "fill-primary text-primary"
                : "fill-transparent text-border",
            )}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}
