"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { value: "all",     label: "All categories" },
  { value: "shelter", label: "Shelter" },
  { value: "food",    label: "Food" },
  { value: "clinic",  label: "Clinic" },
  { value: "legal",   label: "Legal Aid" },
];

const LANGUAGES = [
  { value: "all",     label: "Any language" },
  { value: "Urdu",    label: "Urdu" },
  { value: "English", label: "English" },
  { value: "Sindhi",  label: "Sindhi" },
  { value: "Pashto",  label: "Pashto" },
  { value: "Balochi", label: "Balochi" },
  { value: "Punjabi", label: "Punjabi" },
];

// ── Inner component that uses useSearchParams ──────────────────────────────
function FilterBarInner({ total }: { total: number }) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === "all" || value === "false") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const hasFilters =
    params.has("category") || params.has("language") ||
    params.has("women")    || params.has("children")  || params.has("openNow");

  const clearAll = () => {
    const next = new URLSearchParams(params.toString());
    ["category", "language", "women", "children", "openNow"].forEach((k) => next.delete(k));
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-teal-light)] rounded-[var(--radius-card)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="h-4 w-4 text-[var(--color-teal)]" aria-hidden />
        <span className="text-sm font-medium text-[var(--color-ink)]">Filters</span>
        <span className="ml-auto font-mono text-xs text-[var(--color-ink-muted)]">
          {total} result{total !== 1 ? "s" : ""}
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-[var(--color-terracotta)] hover:underline ml-2"
          >
            <X className="h-3 w-3" aria-hidden /> Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={params.get("category") ?? "all"}
          onValueChange={(v) => update("category", v)}
        >
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={params.get("language") ?? "all"}
          onValueChange={(v) => update("language", v)}
        >
          <SelectTrigger aria-label="Filter by language">
            <SelectValue placeholder="Any language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 sm:col-span-2 lg:col-span-2 flex-wrap">
          {[
            { key: "openNow",  label: "Open now" },
            { key: "women",    label: "Serves women" },
            { key: "children", label: "Serves children" },
          ].map(({ key, label }) => {
            const active = params.get(key) === "true";
            return (
              <button
                key={key}
                onClick={() => update(key, active ? "false" : "true")}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white"
                    : "border-[var(--color-teal-light)] text-[var(--color-ink-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Public export wraps in motion + Suspense ───────────────────────────────
export default function FilterBar({ total }: { total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Suspense fallback={
        <div className="h-20 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
      }>
        <FilterBarInner total={total} />
      </Suspense>
    </motion.div>
  );
}
