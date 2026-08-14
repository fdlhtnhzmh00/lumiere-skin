/**
 * components/ui/input.tsx
 */
import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-warm-700">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl transition-colors",
            "placeholder:text-warm-400 text-warm-900",
            "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400",
            error
              ? "border-red-400 focus:ring-red-200 focus:border-red-400"
              : "border-warm-300 hover:border-warm-400",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-warm-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
