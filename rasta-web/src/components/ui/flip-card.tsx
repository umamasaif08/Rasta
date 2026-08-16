"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Phone, ArrowUpRight, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Organisation } from "@/data/organisations";
import { CATEGORY_LABEL } from "@/data/organisations";

const CATEGORY_BADGE_VARIANT: Record<string, "shelter" | "food" | "clinic" | "legal" | "teal"> = {
  shelter: "shelter",
  food:    "food",
  clinic:  "clinic",
  legal:   "legal",
  multi:   "teal",
};

interface FlipCardProps {
  org: Organisation;
  index?: number;
}

export default function FlipCard({ org, index = 0 }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      className="group"
      style={{ perspective: "1200px" }}
    >
      {/* ── Flip container ──────────────────────────────────────────── */}
      <div
        style={{
          height: 240,
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          position: "relative",
        }}
      >
        {/* ── FRONT — dual-purpose: Link OR flip ─────────────────────── */}
        <div
          className="absolute inset-0 rounded-[var(--radius-card)] overflow-hidden cursor-pointer"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="relative h-full rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] hover:border-[var(--color-teal)] hover:shadow-md transition-all duration-200">
            {/* Background accent blob */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-10"
              style={{ background: org.color }}
            />

            <div className="relative z-10 h-full p-5 flex flex-col justify-between">
              <div>
                {/* Avatar + badge row */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-white text-sm font-bold shadow-sm shrink-0"
                    style={{ background: org.color }}
                    aria-hidden
                  >
                    {org.initials}
                  </div>
                  <Badge variant={CATEGORY_BADGE_VARIANT[org.category] ?? "outline"} className="text-xs">
                    {CATEGORY_LABEL[org.category]}
                  </Badge>
                </div>

                {/* Name + tagline */}
                <h3 className="font-semibold text-[var(--color-ink)] text-sm leading-snug mb-1 group-hover:text-[var(--color-teal)] transition-colors">
                  {org.name}
                </h3>
                <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
                  {org.tagline}
                </p>
              </div>

              {/* Footer: year + dual-action hint */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-teal-light)]">
                <span className="text-xs text-[var(--color-ink-faint)]">Est. {org.founded}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--color-ink-faint)] group-hover:text-[var(--color-teal)] transition-colors">
                    Flip for more details
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-ink-faint)] group-hover:text-[var(--color-teal)] transition-colors" aria-hidden />
                </div>
              </div>
            </div>

            {/* Flip button - keyboard accessible */}
            <button
              className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFlipped(true); }}
              aria-label={`Show more about ${org.name}`}
              aria-pressed={flipped}
              title="Show more details"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[var(--color-ink)]" aria-hidden />
            </button>
          </div>
        </div>

        {/* ── BACK — click anywhere to flip back ────────────────────── */}
        <button
          className="absolute inset-0 rounded-[var(--radius-card)] cursor-pointer w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          onClick={() => setFlipped(false)}
          aria-label={`Flip back to front of ${org.name} card`}
          aria-pressed={flipped}
        >
          <div
            className="h-full min-h-[300px] rounded-[var(--radius-card)] p-5 flex flex-col justify-between overflow-y-auto max-h-[500px] text-white hover:brightness-110 transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${org.color} 0%, color-mix(in srgb, ${org.color} 65%, #000) 100%)`,
            }}
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white text-sm leading-snug">{org.name}</h3>
                <RotateCcw className="h-3.5 w-3.5 text-white/60" aria-hidden />
              </div>
              <p className="text-xs text-white/85 leading-relaxed line-clamp-5">{org.description}</p>
            </div>

            <div className="space-y-3">
              {/* Serves pills */}
              <div className="flex flex-wrap gap-1.5">
                {org.serves.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Links row */}
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${org.phone}`}
                  className="flex items-center gap-1 text-[11px] text-white/80 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-3 w-3" aria-hidden />
                  {org.phone}
                </a>
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1 text-[11px] text-white/80 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Website <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </div>

              {/* Full profile link */}
              <div className="flex justify-center pt-1">
                <Link
                  href={`/organisations/${org.id}`}
                  className="text-xs text-white/80 hover:text-white font-medium transition-colors underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Full profile →
                </Link>
              </div>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}