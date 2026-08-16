"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { AiReviewResponse } from "@/app/api/ai-review/route";

interface AiReviewPanelProps {
  /** Pre-fill the textarea with the resource's current description */
  initialText?: string;
  resourceName?: string;
}

const CONFIDENCE_META = {
  high:   { label: "High confidence",   color: "text-[var(--color-teal)]",       bg: "bg-[var(--color-teal-light)]" },
  medium: { label: "Medium confidence", color: "text-[#5d4a2f]",                  bg: "bg-[var(--color-sand-light)]" }, // Fixed contrast
  low:    { label: "Low confidence",    color: "text-[var(--color-terracotta)]", bg: "bg-[var(--color-terracotta-light)]" },
};

export default function AiReviewPanel({ initialText = "", resourceName }: AiReviewPanelProps) {
  const [open,     setOpen]     = useState(false);
  const [text,     setText]     = useState(initialText);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [result,   setResult]   = useState<AiReviewResponse | null>(null);

  async function handleReview() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-review", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rawText: text, resourceName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "AI review failed. Please try again.");
        return;
      }

      setResult(data as AiReviewResponse);
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-teal-light)] overflow-hidden">
      {/* ── Header toggle ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-teal-light)] transition-colors text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
          <Sparkles className="h-4 w-4 text-[var(--color-teal)]" aria-hidden />
          AI Listing Review
        </span>
        {open
          ? <ChevronUp className="h-4 w-4 text-[var(--color-ink-muted)]" aria-hidden />
          : <ChevronDown className="h-4 w-4 text-[var(--color-ink-muted)]" aria-hidden />}
      </button>

      {/* ── Expandable body ───────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4">
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                Paste a rough description and Claude will clean it up, identify missing
                fields, and suggest improvements. Your API key stays server-side — it is
                never sent to the browser.
              </p>

              {/* Input */}
              <div>
                <Label htmlFor="ai-review-input" className="mb-1.5 block text-xs">
                  Description to review
                </Label>
                <Textarea
                  id="ai-review-input"
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste a rough listing description here…"
                  className="text-sm"
                  maxLength={4000}
                />
                <p className="mt-1 text-right text-xs text-[var(--color-ink-faint)]">
                  {text.length} / 4000
                </p>
              </div>

              {/* Submit */}
              <Button
                onClick={handleReview}
                disabled={loading || !text.trim()}
                variant="default"
                size="md"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Reviewing with Claude…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Review with AI
                  </>
                )}
              </Button>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 rounded-[var(--radius-btn)] bg-[var(--color-terracotta-light)] p-3 text-sm text-[var(--color-terracotta)]"
                    role="alert"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Confidence badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-faint)]">
                        Results
                      </span>
                      <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${CONFIDENCE_META[result.confidence].bg} ${CONFIDENCE_META[result.confidence].color}`}>
                        {CONFIDENCE_META[result.confidence].label}
                      </span>
                    </div>

                    {/* Before / After */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5 flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5 text-[var(--color-terracotta)]" aria-hidden />
                          Original
                        </p>
                        <div className="rounded-[var(--radius-btn)] bg-[var(--color-surface-2)] border border-[var(--color-teal-light)] p-3 text-xs text-[var(--color-ink-muted)] leading-relaxed min-h-[80px]">
                          {text}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-teal)]" aria-hidden />
                          AI-cleaned
                        </p>
                        <div className="rounded-[var(--radius-btn)] bg-[var(--color-teal-light)] border border-[var(--color-teal)] p-3 text-xs text-[var(--color-ink)] leading-relaxed min-h-[80px]">
                          {result.cleanedDescription}
                        </div>
                      </div>
                    </div>

                    {/* Missing fields */}
                    {result.missingFields.length > 0 && (
                      <div className="rounded-[var(--radius-btn)] bg-[var(--color-sand-light)] border border-[var(--color-sand)] p-3">
                        <p className="text-xs font-semibold text-[var(--color-ink)] mb-2">
                          Missing fields
                        </p>
                        <ul className="flex flex-wrap gap-1.5">
                          {result.missingFields.map((f) => (
                            <li
                              key={f}
                              className="rounded-full bg-[var(--color-sand)] text-[#3a2f1e] text-[11px] font-medium px-2.5 py-0.5"
                            >
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {result.suggestions.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-[var(--color-ink-muted)] flex items-center gap-1">
                          <Lightbulb className="h-3.5 w-3.5 text-[var(--color-sage)]" aria-hidden />
                          Suggestions
                        </p>
                        <ul className="space-y-1">
                          {result.suggestions.map((s, i) => (
                            <li
                              key={i}
                              className="text-xs text-[var(--color-ink-muted)] leading-relaxed pl-3 border-l-2 border-[var(--color-sage)]"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Use this description */}
                    <button
                      type="button"
                      onClick={() => setText(result.cleanedDescription)}
                      className="text-xs text-[var(--color-teal)] font-medium hover:underline"
                    >
                      ↑ Use AI-cleaned version as input
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
