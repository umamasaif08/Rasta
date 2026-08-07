"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { List, Map } from "lucide-react";
import FilterBar from "@/components/ui/filter-bar";
import ResourceCard from "@/components/ui/resource-card";
import { getApprovedResources, filterResources } from "@/lib/resources";
import type { ResourceSummary } from "@/types";

// Leaflet cannot run SSR — load MapView only on the client
const MapView = dynamic(() => import("@/components/ui/map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] w-full rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
  ),
});

interface Props {
  searchParams: Promise<Record<string, string>>;
}

type ViewMode = "list" | "map";

export default function ResourcesClient({ searchParams }: Props) {
  const params  = use(searchParams);
  const [all, setAll]         = useState<ResourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [view, setView]       = useState<ViewMode>("list");

  useEffect(() => {
    getApprovedResources()
      .then(setAll)
      .catch(() => setError("Could not load resources. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterResources(all, {
    q:              params.q,
    category:       params.category,
    language:       params.language,
    servesWomen:    params.women === "true",
    servesChildren: params.children === "true",
    openNow:        params.openNow === "true",
  });

  if (loading) {
    return (
      <div className="space-y-3 mt-4" aria-busy>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-[var(--radius-card)] bg-[var(--color-terracotta-light)] p-6 text-center text-[var(--color-terracotta)]">
        {error}
      </div>
    );
  }

  return (
    <>
      <FilterBar total={filtered.length} />

      {/* View toggle */}
      <div className="mt-4 flex items-center justify-end">
        <div className="inline-flex rounded-[var(--radius-btn)] border border-[var(--color-teal-light)] overflow-hidden bg-[var(--color-surface-2)] relative">
          {/* Sliding pill */}
          <motion.div
            className="absolute top-0 bottom-0 w-1/2 bg-[var(--color-teal)] rounded-[var(--radius-btn)]"
            animate={{ x: view === "list" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
          {(["list", "map"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                view === v ? "text-white" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {v === "list"
                ? <><List className="h-3.5 w-3.5" /> List</>
                : <><Map className="h-3.5 w-3.5" /> Map</>}
            </button>
          ))}
        </div>
      </div>

      {/* List / Map content */}
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="mt-4 space-y-3"
            role="list"
            aria-label="Resource listings"
          >
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center text-[var(--color-ink-muted)]"
                >
                  <p className="text-lg font-medium mb-1">No results found</p>
                  <p className="text-sm">Try adjusting your filters or search term.</p>
                </motion.div>
              ) : (
                filtered.map((r, i) => (
                  <div key={r.id} role="listitem">
                    <ResourceCard resource={r} index={i} />
                  </div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22 }}
            className="mt-4"
          >
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-[var(--color-ink-muted)] text-sm">
                No resources match your filters.
              </div>
            ) : (
              <MapView resources={filtered} className="h-[540px]" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
