"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Globe2, Users, Baby, Navigation, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AiVerifiedBadge from "@/components/ui/ai-verified-badge";
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
  const [flipped, setFlipped] = useState(false);
  const meta = CATEGORY_META[resource.category];

  // Create directions URL
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.address)}`;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if clicking on nested interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('a, button') && target.closest('a, button') !== e.currentTarget) {
      e.stopPropagation();
      return;
    }
    setFlipped(!flipped);
  };

  const handleDetailViewClick = (e: React.MouseEvent) => {
    // Stop propagation so this doesn't trigger a flip-back
    e.stopPropagation();
    // Navigation handled by the Link component
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="h-full"
    >
      {/* ── Flip container with perspective ─────────────────────────── */}
      <div className="h-full min-h-[300px]" style={{ perspective: "1000px" }}>
        <div
          className="relative h-full cursor-pointer"
          onClick={handleCardClick}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped(!flipped)}
          tabIndex={0}
          role="button"
          aria-label={`${resource.name} — click to flip for details`}
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: "100%",
          }}
        >
          {/* ── FRONT FACE ──────────────────────────────────────────── */}
          <div
            className="absolute inset-0"
            style={{ 
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden", // Safari support
            }}
          >
            <div className="h-full min-h-[300px] rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] shadow-sm overflow-y-auto flex flex-col max-h-[500px]">
              {/* Coloured top stripe */}
              <div
                style={{ background: meta.accent }}
                className="h-1 w-full flex-shrink-0"
              />

              {/* Card body */}
              <div className="flex-1 p-5 flex flex-col">
                {/* Top row: badge + click hint */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={CATEGORY_BADGE[resource.category]}>
                    {meta.label}
                  </Badge>
                  <span className="text-xs text-[var(--color-ink-faint)] font-medium">
                    Click to flip
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-semibold text-[var(--color-ink)] text-base leading-snug mb-3">
                  {resource.name}
                </h3>

                {/* Quick info */}
                <div className="flex-1 space-y-2 text-xs text-[var(--color-ink-muted)]">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: meta.accent }} aria-hidden />
                    <span className="leading-relaxed line-clamp-2">{resource.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: meta.accent }} aria-hidden />
                    <span className="line-clamp-1">{resource.hours}</span>
                  </div>
                </div>

                {/* Footer: audience tags + AI verified badge */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-teal-light)] mt-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {resource.servesWomen && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] px-2 py-0.5">
                        <Users className="h-2.5 w-2.5" aria-hidden /> Women
                      </span>
                    )}
                    {resource.servesChildren && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full bg-[var(--color-sage-light)] text-[#2d4336] px-2 py-0.5">
                        <Baby className="h-2.5 w-2.5" aria-hidden /> Children
                      </span>
                    )}
                  </div>
                  <AiVerifiedBadge />
                </div>
              </div>
            </div>
          </div>

          {/* ── BACK FACE ───────────────────────────────────────────── */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden", // Safari support
              transform: "rotateY(180deg)",
            }}
          >
            <div
              className="h-full min-h-[300px] rounded-[var(--radius-card)] p-5 flex flex-col text-white overflow-y-auto max-h-[500px]"
              style={{
                background: `linear-gradient(135deg, ${meta.accent} 0%, color-mix(in srgb, ${meta.accent} 70%, #000) 100%)`,
              }}
            >
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={CATEGORY_BADGE[resource.category]} className="bg-white/20 text-white border-white/30">
                    {meta.label}
                  </Badge>
                  <span className="text-xs text-white/60 font-medium">
                    Click outside buttons to flip back
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm leading-snug">
                  {resource.name}
                </h3>
              </div>

              {/* Description */}
              <div className="flex-1 mb-4">
                <p className="text-xs text-white/90 leading-relaxed line-clamp-5">
                  {resource.description}
                </p>
              </div>

              {/* Contact details */}
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-xs text-white/80">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
                  <span className="leading-relaxed">{resource.address}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{resource.hours}</span>
                </div>

                {resource.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Globe2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{resource.languages.join(", ")}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2 pt-2">
                  <Link
                    href={`/resources/${resource.id}`}
                    onClick={handleDetailViewClick}
                    className="flex items-center justify-center w-full py-2 px-3 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-[var(--radius-btn)] transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                    View full details
                  </Link>
                  <div className="flex gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center flex-1 py-2 px-3 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-[var(--radius-btn)] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                      Directions
                    </a>
                    <a
                      href={`tel:${resource.phone}`}
                      className="flex items-center justify-center flex-1 py-2 px-3 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-[var(--radius-btn)] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                      Call
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}