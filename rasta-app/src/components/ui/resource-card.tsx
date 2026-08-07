"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Globe2, Users, Baby, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ResourceSummary, ResourceCategory } from "@/types";

// ── Category meta ──────────────────────────────────────────────────────────
const CATEGORY_META: Record<
  ResourceCategory,
  { label: string; accent: string; bg: string; border: string; dot: string }
> = {
  shelter: {
    label:  "Shelter",
    accent: "var(--color-teal)",
    bg:     "var(--color-teal-light)",
    border: "var(--color-teal)",
    dot:    "#008585",
  },
  food: {
    label:  "Food",
    accent: "var(--color-terracotta)",
    bg:     "var(--color-cream)",
    border: "var(--color-terracotta)",
    dot:    "#C7522A",
  },
  clinic: {
    label:  "Clinic",
    accent: "var(--color-sage)",
    bg:     "var(--color-sage-light)",
    border: "var(--color-sage)",
    dot:    "#74A892",
  },
  legal: {
    label:  "Legal Aid",
    accent: "var(--color-ink-muted)",
    bg:     "var(--color-sand-light)",
    border: "var(--color-sand)",
    dot:    "#E5C185",
  },
};

const CATEGORY_BADGE: Record<ResourceCategory, "shelter" | "food" | "clinic" | "legal"> = {
  shelter: "shelter",
  food:    "food",
  clinic:  "clinic",
  legal:   "legal",
};

// ── Stagger variants (used by the parent grid) ─────────────────────────────
export const cardVariants = {
  hidden:   { opacity: 0, y: 22, scale: 0.97 },
  visible:  (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: {
      delay:    i * 0.055,
      duration: 0.38,
      ease:     "easeOut" as const,
    },
  }),
};

// ── Component ──────────────────────────────────────────────────────────────
interface ResourceCardProps {
  resource: ResourceSummary;
  index?: number;
}

export default function ResourceCard({ resource, index = 0 }: ResourceCardProps) {
  const meta = CATEGORY_META[resource.category];

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hovered"
      className="h-full"
    >
      <Link href={`/resources/${resource.id}`} className="block h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] rounded-[var(--radius-card)]">
        <motion.article
          variants={{
            hovered: {
              y:         -6,
              boxShadow: `0 16px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)`,
              transition: { type: "spring", stiffness: 300, damping: 22 },
            },
          }}
          className="relative h-full flex flex-col rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] overflow-hidden shadow-sm"
          aria-label={`${resource.name} — ${meta.label}`}
        >
          {/* Coloured top stripe */}
          <motion.div
            variants={{
              hovered: { scaleX: 1 },
            }}
            initial={{ scaleX: 0 }}
            style={{ background: meta.accent, transformOrigin: "left" }}
            className="h-1 w-full"
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Card body */}
          <div className="flex flex-col flex-1 p-5 gap-3">

            {/* Top row: badge + arrow */}
            <div className="flex items-center justify-between">
              <Badge variant={CATEGORY_BADGE[resource.category]}>
                {meta.label}
              </Badge>
              <motion.div
                variants={{ hovered: { x: 3, y: -3, opacity: 1 } }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowUpRight
                  className="h-4 w-4"
                  style={{ color: meta.accent }}
                  aria-hidden
                />
              </motion.div>
            </div>

            {/* Name */}
            <motion.h3
              variants={{ hovered: { color: meta.accent } }}
              transition={{ duration: 0.18 }}
              className="font-semibold text-[var(--color-ink)] text-base leading-snug"
              style={{ color: "var(--color-ink)" }}
            >
              {resource.name}
            </motion.h3>

            {/* Info rows */}
            <ul className="flex flex-col gap-2 text-xs text-[var(--color-ink-muted)] flex-1">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: meta.accent }} aria-hidden />
                <span className="leading-relaxed">{resource.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: meta.accent }} aria-hidden />
                <span className="line-clamp-1">{resource.hours}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: meta.accent }} aria-hidden />
                <span
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-[var(--color-teal)] transition-colors"
                >
                  {resource.phone}
                </span>
              </li>
              {resource.languages.length > 0 && (
                <li className="flex items-center gap-2">
                  <Globe2 className="h-3.5 w-3.5 shrink-0" style={{ color: meta.accent }} aria-hidden />
                  <span className="line-clamp-1">{resource.languages.join(", ")}</span>
                </li>
              )}
            </ul>

            {/* Footer: audience tags + verified */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-teal-light)]">
              <div className="flex gap-1.5 flex-wrap">
                {resource.servesWomen && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] px-2 py-0.5">
                    <Users className="h-2.5 w-2.5" aria-hidden /> Women
                  </span>
                )}
                {resource.servesChildren && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium rounded-full bg-[var(--color-sage-light)] text-[var(--color-sage)] px-2 py-0.5">
                    <Baby className="h-2.5 w-2.5" aria-hidden /> Children
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium text-[var(--color-sand)] bg-[var(--color-sand-light)] rounded-full px-2 py-0.5">
                ✓ Verified
              </span>
            </div>
          </div>

          {/* Hover glow overlay */}
          <motion.div
            variants={{ hovered: { opacity: 1 } }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)]"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${meta.bg} 0%, transparent 70%)`,
            }}
            aria-hidden
          />
        </motion.article>
      </Link>
    </motion.div>
  );
}
