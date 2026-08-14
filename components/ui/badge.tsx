/**
 * components/ui/badge.tsx
 */
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default:  "bg-warm-100 text-warm-700",
        brand:    "bg-brand-100 text-brand-700",
        gold:     "bg-amber-100 text-amber-700",
        success:  "bg-green-100 text-green-700",
        warning:  "bg-yellow-100 text-yellow-700",
        danger:   "bg-red-100 text-red-700",
        outline:  "border border-warm-300 text-warm-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
