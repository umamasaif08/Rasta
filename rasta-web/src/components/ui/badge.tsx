import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        // Fixed contrast: darkened text colors to meet WCAG AA 4.5:1 ratio
        sand:       "bg-[var(--color-sand)] text-[#5d4a2f]", // was var(--color-ink), now darker brown
        teal:       "bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] border border-[var(--color-teal)]",
        sage:       "bg-[var(--color-sage-light)] text-[#2d4336] border border-[var(--color-sage)]", // was var(--color-sage), now darker green
        terracotta: "bg-[var(--color-terracotta-light)] text-[var(--color-terracotta)]",
        outline:    "border border-[var(--color-ink-faint)] text-[var(--color-ink-muted)]",
        shelter:    "bg-[var(--color-teal-light)] text-[var(--color-teal-dark)]",
        food:       "bg-[var(--color-cream)] text-[#8b3c1a]", // was var(--color-terracotta), now darker red-brown
        clinic:     "bg-[var(--color-sage-light)] text-[#2d4336]", // was var(--color-sage), now darker green
        legal:      "bg-[var(--color-sand-light)] text-[#3a3028]", // was var(--color-ink-muted), now darker brown
      },
    },
    defaultVariants: { variant: "outline" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
