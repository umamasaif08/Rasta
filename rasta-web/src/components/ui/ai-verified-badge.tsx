"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface AiVerifiedBadgeProps {
  /** Static placeholder date — real scheduled verification comes later */
  verifiedDate?: string;
  size?: "sm" | "xs";
}

/**
 * "Verified by AI" badge.
 * Clicking it opens a small tooltip explaining what the badge means and
 * showing a placeholder date. Real scheduled re-verification is a future feature.
 */
export default function AiVerifiedBadge({
  verifiedDate = "Jul 2025",
  size = "xs",
}: AiVerifiedBadgeProps) {
  const [open, setOpen] = useState(false);

  const textClass = size === "sm" ? "text-xs" : "text-[10px]";
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-3 w-3";

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        aria-expanded={open}
        aria-label="AI verified — click to learn more"
        className={`inline-flex items-center gap-1 rounded-full bg-[var(--color-teal-light)] border border-[var(--color-teal)] ${textClass} font-medium text-[var(--color-teal-dark)] px-2 py-0.5 hover:bg-[var(--color-teal)] hover:text-white transition-colors`}
      >
        <Sparkles className={iconClass} aria-hidden />
        AI Verified
      </button>

      {/* Tooltip popover */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — closes on outside click */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] shadow-lg p-4"
              role="tooltip"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--color-teal)]" aria-hidden />
                  <span className="text-xs font-semibold text-[var(--color-ink)]">
                    Verified by AI
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                  className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-3">
                This listing's description was reviewed and cleaned by Claude AI to
                ensure clarity and completeness. The underlying details (address, phone,
                hours) are provided by the organisation and verified by the Rasta admin team.
              </p>

              <div className="flex items-center justify-between text-[10px] text-[var(--color-ink-faint)]">
                <span>Last reviewed: <strong className="text-[var(--color-ink)]">{verifiedDate}</strong></span>
                <span className="rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] px-2 py-0.5">
                  Placeholder
                </span>
              </div>

              {/* Arrow pointer */}
              <div
                className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 border-b border-r border-[var(--color-teal-light)] bg-[var(--color-surface)]"
                aria-hidden
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
