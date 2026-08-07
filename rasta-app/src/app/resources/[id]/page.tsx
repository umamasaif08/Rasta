import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin, Phone, Clock, Languages, ArrowLeft,
  Navigation, Flag, Users, Baby, CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { getResourceById } from "@/lib/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DetailAnimations from "./detail-animations";
import type { ResourceCategory } from "@/types";

export const revalidate = 300;

const MapView = dynamic(() => import("@/components/ui/map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-52 w-full rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
  ),
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = await getResourceById(id);
  if (!resource) return { title: "Resource not found" };
  return { title: resource.name, description: resource.description };
}

// ── Category styling ──────────────────────────────────────────────────────
const CATEGORY_META: Record<
  ResourceCategory,
  { label: string; accent: string; lightBg: string; badgeVariant: "shelter" | "food" | "clinic" | "legal" }
> = {
  shelter: { label: "Shelter",  accent: "var(--color-teal)",        lightBg: "var(--color-teal-light)",       badgeVariant: "shelter" },
  food:    { label: "Food",     accent: "var(--color-terracotta)",   lightBg: "var(--color-cream)",            badgeVariant: "food"    },
  clinic:  { label: "Clinic",   accent: "var(--color-sage)",         lightBg: "var(--color-sage-light)",       badgeVariant: "clinic"  },
  legal:   { label: "Legal Aid",accent: "var(--color-ink-muted)",    lightBg: "var(--color-sand-light)",       badgeVariant: "legal"   },
};

// ── Page ──────────────────────────────────────────────────────────────────
export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }   = await params;
  const resource = await getResourceById(id);
  if (!resource || resource.status !== "approved") notFound();

  const meta      = CATEGORY_META[resource.category];
  const mapsUrl   = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.address + ", Karachi")}`;
  const hasCoords = resource.lat !== 0 && resource.lng !== 0;

  const mapResource = {
    id, name: resource.name, category: resource.category,
    address: resource.address, lat: resource.lat, lng: resource.lng,
    phone: resource.phone, hours: resource.hours,
    languages: resource.languages, servesWomen: resource.servesWomen,
    servesChildren: resource.servesChildren, status: resource.status,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* ── Back link ─────────────────────────────────────────────────── */}
      <Link
        href="/resources"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-teal)] transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden />
        Back to all resources
      </Link>

      <DetailAnimations>
        {/* ── Hero header ─────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-[var(--radius-card)] mb-4 p-6 pb-8"
          style={{ background: meta.lightBg }}
        >
          {/* Decorative blob */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-20"
            style={{ background: meta.accent }}
          />

          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-4 flex-wrap">
              <Badge variant={meta.badgeVariant} className="text-xs px-3 py-1">
                {meta.label}
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full bg-[var(--color-sand)] text-[var(--color-ink)] px-3 py-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Verified
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-ink)] leading-snug mb-3">
              {resource.name}
            </h1>

            <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed max-w-lg">
              {resource.description}
            </p>
          </div>
        </div>

        {/* ── Contact + hours grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Address */}
          <InfoTile
            icon={MapPin}
            label="Address"
            accent={meta.accent}
          >
            <span className="text-sm text-[var(--color-ink)]">{resource.address}</span>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs mt-1 font-medium transition-colors hover:opacity-80"
              style={{ color: meta.accent }}
            >
              Open in Maps <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </InfoTile>

          {/* Phone */}
          <InfoTile icon={Phone} label="Phone" accent={meta.accent}>
            <a
              href={`tel:${resource.phone}`}
              className="text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: meta.accent }}
            >
              {resource.phone}
            </a>
          </InfoTile>

          {/* Hours */}
          <InfoTile icon={Clock} label="Opening hours" accent={meta.accent}>
            <span className="text-sm text-[var(--color-ink)]">{resource.hours}</span>
          </InfoTile>

          {/* Languages */}
          <InfoTile icon={Languages} label="Languages spoken" accent={meta.accent}>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {resource.languages.map((lang) => (
                <span
                  key={lang}
                  className="text-xs font-medium rounded-full px-2 py-0.5"
                  style={{ background: meta.lightBg, color: meta.accent }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </InfoTile>
        </div>

        {/* ── Who is served ────────────────────────────────────────────── */}
        {(resource.servesWomen || resource.servesChildren) && (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] p-5 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-faint)] mb-3">
              Who is served
            </p>
            <div className="flex gap-3 flex-wrap">
              {resource.servesWomen && (
                <div className="flex items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--color-teal-light)] px-4 py-2.5 text-sm font-medium text-[var(--color-teal-dark)]">
                  <Users className="h-4 w-4" aria-hidden />
                  Women
                </div>
              )}
              {resource.servesChildren && (
                <div className="flex items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--color-sage-light)] px-4 py-2.5 text-sm font-medium text-[var(--color-sage)]">
                  <Baby className="h-4 w-4" aria-hidden />
                  Children
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mini-map ─────────────────────────────────────────────────── */}
        {hasCoords && (
          <div className="mb-4">
            <MapView resources={[mapResource]} focusId={id} className="h-52" zoom={15} />
          </div>
        )}

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row mb-6">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="default" size="lg" className="w-full">
              <Navigation className="h-4 w-4" aria-hidden />
              Get directions
            </Button>
          </a>
          <a href={`tel:${resource.phone}`} className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              <Phone className="h-4 w-4" aria-hidden />
              Call now
            </Button>
          </a>
        </div>

        {/* ── Report link ───────────────────────────────────────────────── */}
        <div className="text-center border-t border-[var(--color-teal-light)] pt-5">
          <Link
            href={`/resources/${id}/report`}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-terracotta)] transition-colors"
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            Report outdated info
          </Link>
        </div>
      </DetailAnimations>
    </div>
  );
}

// ── InfoTile helper component ─────────────────────────────────────────────
function InfoTile({
  icon: Icon,
  label,
  accent,
  children,
}: {
  icon: React.ElementType;
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] p-4">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
        style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
      >
        <Icon className="h-4 w-4" style={{ color: accent }} aria-hidden />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs text-[var(--color-ink-faint)] font-medium">{label}</p>
        {children}
      </div>
    </div>
  );
}
