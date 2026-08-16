import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Phone, Globe, Calendar, Users,
  CheckCircle2, ExternalLink, MapPin,
} from "lucide-react";
import { ORGANISATIONS, CATEGORY_LABEL } from "@/data/organisations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const org = ORGANISATIONS.find((o) => o.id === id);
  if (!org) return { title: "Organisation not found" };
  return {
    title: org.name,
    description: org.description,
  };
}

// Map OrgCategory to badge variant
const BADGE_VARIANT: Record<string, "shelter" | "food" | "clinic" | "legal" | "teal"> = {
  shelter: "shelter",
  food:    "food",
  clinic:  "clinic",
  legal:   "legal",
  multi:   "teal",
};

export default async function OrganisationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = ORGANISATIONS.find((o) => o.id === id);
  if (!org) notFound();

  // Resolve CSS variable strings to real hex for inline styles
  // We use the raw org.color string which is already a CSS var reference
  const accentStyle = { color: org.color } as React.CSSProperties;
  const accentBgStyle = {
    background: `color-mix(in srgb, ${org.color} 10%, transparent)`,
  } as React.CSSProperties;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-teal)] transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden />
        Back to home
      </Link>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[var(--radius-card)] mb-5 p-6 pb-8"
        style={accentBgStyle}
      >
        {/* Decorative circle */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-15"
          style={{ background: org.color }}
        />

        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white text-lg font-bold shadow-md"
            style={{ background: org.color }}
            aria-hidden
          >
            {org.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={BADGE_VARIANT[org.category] ?? "outline"}>
                {CATEGORY_LABEL[org.category]}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full bg-[var(--color-sand)] text-[#3a2f1e] px-2.5 py-0.5">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-ink)] leading-snug mb-2">
              {org.name}
            </h1>
            <p className="text-xs text-[var(--color-ink-muted)] italic">{org.tagline}</p>
          </div>
        </div>
      </div>

      {/* ── About ─────────────────────────────────────────────────────── */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] p-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-faint)] mb-3">
          About
        </p>
        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
          {org.description}
        </p>
      </div>

      {/* ── Info grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Founded */}
        <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0" style={accentBgStyle}>
            <Calendar className="h-4 w-4" style={accentStyle} aria-hidden />
          </div>
          <div>
            <p className="text-xs text-[var(--color-ink-faint)] font-medium mb-0.5">Established</p>
            <p className="text-sm font-semibold text-[var(--color-ink)]">{org.founded}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0" style={accentBgStyle}>
            <Phone className="h-4 w-4" style={accentStyle} aria-hidden />
          </div>
          <div>
            <p className="text-xs text-[var(--color-ink-faint)] font-medium mb-0.5">Phone</p>
            <a
              href={`tel:${org.phone}`}
              className="text-sm font-semibold hover:underline transition-colors"
              style={accentStyle}
            >
              {org.phone}
            </a>
          </div>
        </div>

        {/* Website */}
        <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0" style={accentBgStyle}>
            <Globe className="h-4 w-4" style={accentStyle} aria-hidden />
          </div>
          <div>
            <p className="text-xs text-[var(--color-ink-faint)] font-medium mb-0.5">Website</p>
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold hover:underline transition-colors"
              style={accentStyle}
            >
              {org.website.replace(/^https?:\/\//, "")}
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </div>
        </div>

        {/* Serves */}
        <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0" style={accentBgStyle}>
            <Users className="h-4 w-4" style={accentStyle} aria-hidden />
          </div>
          <div>
            <p className="text-xs text-[var(--color-ink-faint)] font-medium mb-1.5">Serves</p>
            <div className="flex flex-wrap gap-1.5">
              {org.serves.map((s) => (
                <span
                  key={s}
                  className="text-xs font-medium rounded-full px-2.5 py-0.5 border"
                  style={{
                    background: `color-mix(in srgb, ${org.color} 10%, transparent)`,
                    borderColor: `color-mix(in srgb, ${org.color} 30%, transparent)`,
                    color: org.color,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <a href={`tel:${org.phone}`} className="flex-1">
          <Button variant="default" size="lg" className="w-full">
            <Phone className="h-4 w-4" aria-hidden />
            Call now
          </Button>
        </a>
        <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" size="lg" className="w-full">
            <Globe className="h-4 w-4" aria-hidden />
            Visit website
          </Button>
        </a>
      </div>

      {/* ── Browse their resources ────────────────────────────────────── */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface-2)] p-5 text-center">
        <MapPin className="h-5 w-5 mx-auto mb-2 text-[var(--color-ink-faint)]" aria-hidden />
        <p className="text-sm text-[var(--color-ink-muted)] mb-3">
          Looking for a specific location or service by this organisation?
        </p>
        <Link
          href={`/resources?q=${encodeURIComponent(org.name.split(" ")[0])}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-teal)] hover:underline"
        >
          Search their listings →
        </Link>
      </div>
    </div>
  );
}
