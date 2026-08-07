"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Watermelon-style animated card — lifts on hover */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { animate?: boolean }
>(({ className, animate = true, ...props }, ref) => {
  const base = cn(
    "rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] shadow-sm",
    className
  );

  if (!animate) {
    return <div ref={ref} className={base} {...props} />;
  }

  return (
    <motion.div
      ref={ref}
      className={base}
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,133,133,0.12)" }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      // Forward only safe HTML attributes — exclude drag-event handlers
      // that conflict with Framer Motion's own event types
      id={props.id}
      style={props.style}
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
      role={props.role}
      aria-label={props["aria-label"]}
    >
      {props.children}
    </motion.div>
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-5 pb-0", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold text-[var(--color-ink)] leading-snug", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-3", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center px-5 pb-5 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
