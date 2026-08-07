import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin, Phone, Clock, Languages, ArrowLeft,
  Navigation, Flag, Users,
} from "lucide-react";
import { getResourceById } from "@/lib/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DetailAnimations from "./detail-animations";
import type { ResourceCategory } from "@/types";

export const revalidate = 300;

// Leaflet requires client — dynamic import, no SSR
const MapView = dynamic(() => import("@/components/ui/map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
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

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  shelter: "Shelter", food: "Food", clinic: "Clinic", legal: "Legal Aid",
};
const CATEGORY_BADGE: Record<ResourceCategory, "shelter" | "food" | "clinic" | "legal"> = {
  shelter: "shelter", food: "food", clinic: "clinic", legal: "legal",
};

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getResourceById(id);
  if (!resource || resource.status !== "approved") notFound();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    resource.address + ", Karachi"
  )}`;

  const hasCoords = resource.lat !== 0 && resource.lng !== 0;

  // Minimal ResourceSummary for the map
  const mapResource = {
    id:             id,
    name:           resource.name,
    category:       resource.category,
    address:        resource.address,
    lat:            resource.lat,
    lng:            resource.lng,
    phone:          resource.phone,
    hours:          resource.hours,
    languages:      resource.languages,
    servesWomen:    resource.servesWomen,
    servesChildren: resource.servesChildren,
    status:         resource.status,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Back */}
      <Link
        href="/resources"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-teal)] transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden />
        Back to results
      </Link>

      {/* Animated content wrapper */}
      <DetailAnimations>
        {/* Header */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] p-6 mb-4">
          <div className="flex items-start gap-2 flex-wrap mb-3">
            <Badge variant={CATEGORY_BADGE[resource.category]}>
              {CATEGORY_LABELS[resource.category]}
            </Badge>
            <Badge variant="sand">✓ Verified</Badge>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)] leading-snug mb-3">
            {resource.name}
          </h1>
          <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Info rows */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] divide-y divide-[var(--color-teal-light)] mb-4">
          {[
            { icon: MapPin,     label: "Address",   content: resource.address },
            { icon: Phone,      label: "Phone",     content: <a href={`tel:${resource.phone}`} className="text-[var(--color-teal)] hover:underline">{resource.phone}</a> },
            { icon: Clock,      label: "Hours",     content: resource.hours },
            { icon: Languages,  label: "Languages", content: resource.languages.join(", ") },
          ].map(({ icon: Icon, label, content }) => (
            <div key={label} className="flex items-start gap-3 px-5 py-4">
              <Icon className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-sage)]" aria-hidden />
              <div>
                <p className="text-xs text-[var(--color-ink-faint)] mb-0.5">{label}</p>
                <div className="text-sm text-[var(--color-ink)]">{content}</div>
              </div>
            </div>
          ))}
          {(resource.servesWomen || resource.servesChildren) && (
            <div className="flex items-start gap-3 px-5 py-4">
              <Users className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-sage)]" aria-hidden />
              <div>
                <p className="text-xs text-[var(--color-ink-faint)] mb-1">Serves</p>
                <div className="flex gap-2 flex-wrap">
                  {resource.servesWomen    && <Badge variant="teal">Women</Badge>}
                  {resource.servesChildren && <Badge variant="sage">Children</Badge>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mini-map — only shown when we have real coords */}
        {hasCoords && (
          <div className="mb-4">
            <MapView
              resources={[mapResource]}
              focusId={id}
              className="h-48"
              zoom={15}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
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

        {/* Report link */}
        <div className="mt-6 text-center">
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
