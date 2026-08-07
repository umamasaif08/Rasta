import { Suspense } from "react";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import ResourcesClient from "./resources-client";

export const metadata: Metadata = {
  title: "Find Resources",
  description:
    "Browse verified free shelters, food, clinics and legal aid in Karachi. Filter by category, language, and more.",
};

// Revalidate every 5 minutes — balances freshness with performance
export const revalidate = 300;

export default function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Find resources
        </h1>
        <p className="mt-1 text-[var(--color-ink-muted)] text-sm">
          Verified free shelters, food, clinics, and legal aid in Karachi.
        </p>
      </div>

      {/* Search bar */}
      <form method="GET" className="mb-4 relative" aria-label="Search resources">
        <label htmlFor="q" className="sr-only">Search by name, area, or type</label>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-faint)]"
          aria-hidden
        />
        <input
          id="q"
          name="q"
          type="search"
          placeholder="Search by name, area, or type…"
          autoComplete="off"
          className="w-full h-11 rounded-[var(--radius-btn)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] pl-9 pr-4 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]"
        />
      </form>

      {/* Client island: filters + live list */}
      <Suspense fallback={<ResourcesSkeleton />}>
        <ResourcesClient searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function ResourcesSkeleton() {
  return (
    <div className="space-y-3 mt-4" aria-busy="true" aria-label="Loading resources">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse"
        />
      ))}
    </div>
  );
}
