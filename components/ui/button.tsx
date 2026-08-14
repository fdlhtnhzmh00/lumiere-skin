/**
 * components/ui/button.tsx
 */
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:   "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
        secondary: "bg-warm-100 text-warm-800 hover:bg-warm-200 active:bg-warm-300",
        outline:   "border border-brand-500 text-brand-600 hover:bg-brand-50",
        ghost:     "text-warm-700 hover:bg-warm-100",
        dark:      "bg-warm-900 text-white hover:bg-warm-800",
        danger:    "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm:   "text-xs px-3 py-1.5 rounded-lg",
        md:   "text-sm px-4 py-2 rounded-xl",
        lg:   "text-sm px-6 py-3 rounded-xl",
        icon: "p-2 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
