"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Phone } from "lucide-react";
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
    // Outer wrapper gives the 3-D perspective
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      className="group"
      style={{ perspective: "1200px" }}
    >
      {/* Flip container */}
      <div
        className="relative cursor-pointer"
        style={{
          height: 220,
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${org.name} — ${flipped ? "showing description, press to flip back" : "press to see more"}`}
      >
        {/* ── FRONT ───────────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] p-5 flex flex-col justify-between overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Background accent blob */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-10"
            style={{ background: org.color }}
          />

          <div className="relative z-10">
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
            <h3 className="font-semibold text-[var(--color-ink)] text-sm leading-snug mb-1">
              {org.name}
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
              {org.tagline}
            </p>
          </div>

          {/* Flip hint */}
          <div className="relative z-10 flex items-center justify-between mt-3">
            <span className="text-xs text-[var(--color-ink-faint)]">
              Est. {org.founded}
            </span>
            <span className="text-xs text-[var(--color-teal)] font-medium opacity-70 group-hover:opacity-100 transition-opacity">
              Tap to learn more →
            </span>
          </div>
        </div>

        {/* ── BACK ────────────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-[var(--radius-card)] p-5 flex flex-col justify-between overflow-hidden text-white"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(135deg, ${org.color} 0%, color-mix(in srgb, ${org.color} 70%, #000) 100%)`,
          }}
        >
          {/* Description */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-2 leading-snug">
              {org.name}
            </h3>
            <p className="text-xs text-white/85 leading-relaxed line-clamp-5">
              {org.description}
            </p>
          </div>

          {/* Serves tags */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {org.serves.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3">
              <a
                href={`tel:${org.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] text-white/80 hover:text-white transition-colors"
              >
                <Phone className="h-3 w-3" aria-hidden />
                {org.phone}
              </a>
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-auto flex items-center gap-1 text-[10px] text-white/80 hover:text-white transition-colors"
              >
                Website
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
