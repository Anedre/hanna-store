import { cn } from "@/lib/utils";

interface BrandBadgeProps {
  brand: string;
  className?: string;
}

export function BrandBadge({ brand, className }: BrandBadgeProps) {
  if (!brand) return null;

  return (
    <span
      className={cn(
        "inline-block text-[10px] font-semibold uppercase tracking-wider text-cream-500 bg-cream-100 px-1.5 py-0.5 rounded",
        className
      )}
    >
      {brand}
    </span>
  );
}
