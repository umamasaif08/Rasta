import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Phone, MapPin, Clock, Languages, Users, Shield,
} from "lucide-react";
import { getResourceById } from "@/lib/resources";
import { Badge } from "@/components/ui/badge";
import MapView from "@/components/ui/map-view";
import type { ResourceSummary } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = await getResourceById(id);
  
  if (!resource || resource.status !== "approved") {
    return { title: "Resource not found" };
  }
  
  return {
    title: resource.name,
    description: resource.description,
  };
}

// Map category to badge variant
const CATEGORY_BADGE: Record<string, "shelter" | "food" | "clinic" | "legal" | "teal"> = {
  shelter: "shelter",
  food:    "food",
  clinic:  "clinic",
  legal:   "legal",
};

const CATEGORY_LABEL: Record<string, string> = {
  shelter: "Shelter",
  food:    "Food",
  clinic:  "Clinic",
  legal:   "Legal Aid",
};

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getResourceById(id);

  // Not found or not approved = show 404 state
  if (!resource || resource.status !== "approved") {
    notFound();
  }

  // Build a ResourceSummary for the map
  const mapResource: ResourceSummary = {
    id: resource.id!,
    name: resource.name,
    category: resource.category,
    description: resource.description,
    address: resource.address,
    lat: resource.lat,
    lng: resource.lng,
    phone: resource.phone,
    hours: resource.hours,
    languages: resource.languages,
    servesWomen: resource.servesWomen,
    servesChildren: resource.servesChildren,
    status: resource.status,
  };

  const hasCoords = resource.lat && resource.lng;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/resources"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-teal)] transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden />
        Back to resources
      </Link>

      {/* ── Hero Card ───────────────────────────────────────────────────── */}
      <article className="rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] overflow-hidden">
        {/* Header with category color */}
        <div className="bg-[var(--color-teal-light)] px-5 py-4">
          <div className="flex items-center gap-3">
            <Badge variant={CATEGORY_BADGE[resource.category] || "teal"}>
              {CATEGORY_LABEL[resource.category] || resource.category}
            </Badge>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)] mt-2">
            {resource.name}
          </h1>
        </div>

        {/* Description */}
        {resource.description && (
          <div className="px-5 py-4 border-b border-[var(--color-teal-light)]">
            <p className="text-[var(--color-ink)] leading-relaxed">
              {resource.description}
            </p>
          </div>
        )}

        {/* Quick Info Grid */}
        <div className="px-5 py-4 grid gap-4 sm:grid-cols-2">
          {/* Address */}
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-[var(--color-teal)] mt-0.5 shrink-0" aria-hidden />
            <span className="text-sm text-[var(--color-ink)]">
              {resource.address}
            </span>
          </div>

          {/* Phone */}
          {resource.phone && (
            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-[var(--color-teal)] mt-0.5 shrink-0" aria-hidden />
              <a
                href={`tel:${resource.phone}`}
                className="text-sm text-[var(--color-teal)] hover:underline"
              >
                {resource.phone}
              </a>
            </div>
          )}

          {/* Hours */}
          {resource.hours && (
            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-[var(--color-teal)] mt-0.5 shrink-0" aria-hidden />
              <span className="text-sm text-[var(--color-ink)]">
                {resource.hours}
              </span>
            </div>
          )}

          {/* Languages */}
          {resource.languages.length > 0 && (
            <div className="flex items-start gap-2.5">
              <Languages className="h-4 w-4 text-[var(--color-teal)] mt-0.5 shrink-0" aria-hidden />
              <span className="text-sm text-[var(--color-ink)]">
                {resource.languages.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Services badges */}
        <div className="px-5 py-3 border-t border-[var(--color-teal-light)] bg-[var(--color-surface-2)] flex flex-wrap gap-2">
          {resource.servesWomen && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal)]">
              <Users className="h-3 w-3" aria-hidden />
              Women & Girls
            </span>
          )}
          {resource.servesChildren && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--color-terracotta-light)] text-[var(--color-terracotta)]">
              <Shield className="h-3 w-3" aria-hidden />
              Children
            </span>
          )}
          {!resource.servesWomen && !resource.servesChildren && (
            <span className="text-xs text-[var(--color-ink-muted)]">
              Open to all
            </span>
          )}
        </div>
      </article>

      {/* Map */}
      {hasCoords && (
        <section className="mt-6" aria-label="Location on map">
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)] mb-3">
            Location
          </h2>
          <div className="rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-teal-light)]">
            <MapView
              resources={[mapResource]}
              focusId={resource.id}
              zoom={14}
              className="h-[280px]"
            />
          </div>
        </section>
      )}

      {/* Getting there CTA */}
      {hasCoords && (
        <div className="mt-6 text-center">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-teal)] hover:underline"
          >
            Get Directions
            <MapPin className="h-4 w-4" aria-hidden />
          </a>
        </div>
      )}
    </div>
  );
}