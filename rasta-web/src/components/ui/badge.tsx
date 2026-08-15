import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        sand:       "bg-[var(--color-sand)] text-[var(--color-ink)]",
        teal:       "bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] border border-[var(--color-teal)]",
        sage:       "bg-[var(--color-sage-light)] text-[var(--color-sage)] border border-[var(--color-sage)]",
        terracotta: "bg-[var(--color-terracotta-light)] text-[var(--color-terracotta)]",
        outline:    "border border-[var(--color-ink-faint)] text-[var(--color-ink-muted)]",
        shelter:    "bg-[var(--color-teal-light)] text-[var(--color-teal-dark)]",
        food:       "bg-[var(--color-cream)] text-[var(--color-terracotta)]",
        clinic:     "bg-[var(--color-sage-light)] text-[var(--color-sage)]",
        legal:      "bg-[var(--color-sand-light)] text-[var(--color-ink-muted)]",
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
