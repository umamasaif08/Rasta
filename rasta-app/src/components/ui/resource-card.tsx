"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Languages, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ResourceSummary, ResourceCategory } from "@/types";

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  shelter: "Shelter",
  food:    "Food",
  clinic:  "Clinic",
  legal:   "Legal Aid",
};

const CATEGORY_BADGE: Record<ResourceCategory, "shelter" | "food" | "clinic" | "legal"> = {
  shelter: "shelter",
  food:    "food",
  clinic:  "clinic",
  legal:   "legal",
};

interface ResourceCardProps {
  resource: ResourceSummary;
  index?: number; // for stagger
}

export const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: "easeOut" as const,
    },
  }),
};

export default function ResourceCard({ resource, index = 0 }: ResourceCardProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Link href={`/resources/${resource.id}`} className="block group">
        <Card className="transition-all duration-200 group-hover:border-[var(--color-teal)]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Category + verified badge */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={CATEGORY_BADGE[resource.category]}>
                    {CATEGORY_LABELS[resource.category]}
                  </Badge>
                  <Badge variant="sand">✓ Verified</Badge>
                </div>

                {/* Name */}
                <h3 className="font-semibold text-[var(--color-ink)] text-base leading-snug mb-2 group-hover:text-[var(--color-teal)] transition-colors">
                  {resource.name}
                </h3>

                {/* Meta row */}
                <ul className="flex flex-col gap-1.5 text-sm text-[var(--color-ink-muted)]">
                  <li className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-sage)]" aria-hidden />
                    <span className="truncate">{resource.address}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--color-sage)]" aria-hidden />
                    <span className="truncate">{resource.hours}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--color-sage)]" aria-hidden />
                    <a
                      href={`tel:${resource.phone}`}
                      className="hover:text-[var(--color-teal)] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {resource.phone}
                    </a>
                  </li>
                  {resource.languages.length > 0 && (
                    <li className="flex items-center gap-2">
                      <Languages className="h-3.5 w-3.5 shrink-0 text-[var(--color-sage)]" aria-hidden />
                      <span>{resource.languages.join(", ")}</span>
                    </li>
                  )}
                </ul>

                {/* Audience tags */}
                {(resource.servesWomen || resource.servesChildren) && (
                  <div className="flex gap-2 mt-3">
                    {resource.servesWomen && (
                      <Badge variant="teal">Women</Badge>
                    )}
                    {resource.servesChildren && (
                      <Badge variant="sage">Children</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ArrowRight
                className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)] group-hover:text-[var(--color-teal)] group-hover:translate-x-0.5 transition-all mt-1"
                aria-hidden
              />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
