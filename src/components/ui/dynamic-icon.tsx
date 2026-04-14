"use client";

import { forwardRef, lazy, Suspense, memo } from "react";
import { LucideProps, icons } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Type: every valid Lucide icon name
// ---------------------------------------------------------------------------
export type IconName = keyof typeof icons;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  /** Lucide icon name as a string, e.g. "ShoppingCart", "Star", "Heart" */
  name: IconName;
  /** Optional wrapper className (applied to a span around the icon) */
  wrapperClassName?: string;
  /** Fallback shown while the icon resolves (default: empty span) */
  fallback?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const DynamicIcon = memo(
  forwardRef<SVGSVGElement, DynamicIconProps>(
    ({ name, wrapperClassName, fallback, className, ...props }, ref) => {
      const LucideIcon = icons[name];

      if (!LucideIcon) {
        console.warn(`[DynamicIcon] Icon "${name}" not found in lucide-react`);
        return (
          <span
            className={cn(
              "inline-flex items-center justify-center w-5 h-5 rounded bg-cream-200",
              wrapperClassName
            )}
          />
        );
      }

      return (
        <span className={cn("inline-flex shrink-0", wrapperClassName)}>
          <LucideIcon
            ref={ref}
            className={cn("h-5 w-5", className)}
            {...props}
          />
        </span>
      );
    }
  )
);

DynamicIcon.displayName = "DynamicIcon";
export { DynamicIcon };

// ---------------------------------------------------------------------------
// Helpers: get all available icon names (useful for admin/search)
// ---------------------------------------------------------------------------
export function getAvailableIcons(): IconName[] {
  return Object.keys(icons) as IconName[];
}

export function iconExists(name: string): name is IconName {
  return name in icons;
}

// ---------------------------------------------------------------------------
// Preset icon maps for common e-commerce use cases
// ---------------------------------------------------------------------------
export const ECOMMERCE_ICONS: { [key: string]: IconName } = {
  cart: "ShoppingCart",
  bag: "ShoppingBag",
  heart: "Heart",
  star: "Star",
  search: "Search",
  user: "User",
  settings: "Settings",
  orders: "Package",
  shipping: "Truck",
  payment: "CreditCard",
  secure: "ShieldCheck",
  quality: "Award",
  discount: "BadgePercent",
  support: "Headphones",
  location: "MapPin",
  phone: "Phone",
  email: "Mail",
  clock: "Clock",
  check: "Check",
  close: "X",
  menu: "Menu",
  filter: "SlidersHorizontal",
  sort: "ArrowUpDown",
  grid: "LayoutGrid",
  list: "LayoutList",
  home: "House",
  tech: "Cpu",
  fashion: "Shirt",
  sports: "Dumbbell",
  beauty: "Sparkles",
  toys: "Gamepad2",
  whatsapp: "MessageCircle",
};
