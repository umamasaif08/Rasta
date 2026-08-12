"use client";

import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Resource } from "@/types";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-[var(--color-sand)]",
    bg: "bg-[var(--color-sand-light)]",
    border: "border-[var(--color-sand)]",
    title: "Under Review",
    message: "Your listing is being reviewed by our team. This usually takes less than 24 hours.",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-[var(--color-teal)]",
    bg: "bg-[var(--color-teal-light)]",
    border: "border-[var(--color-teal)]",
    title: "Live & Active",
    message: "Your listing is live and visible to people searching for help.",
  },
  rejected: {
    icon: XCircle,
    color: "text-[var(--color-terracotta)]",
    bg: "bg-[var(--color-terracotta-light)]",
    border: "border-[var(--color-terracotta)]",
    title: "Not Approved",
    message: "Your listing couldn't be approved. Please review the feedback below and make the necessary changes.",
  },
};

interface StatusCardProps {
  resource: Resource;
}

export default function StatusCard({ resource }: StatusCardProps) {
  const config = STATUS_CONFIG[resource.status];
  const Icon = config.icon;

  // Format timestamp
  const lastUpdated = resource.lastUpdated
    ? new Date(resource.lastUpdated.seconds * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Never";

  // Contextual nudge for approved listings
  let nudge = null;
  if (resource.status === "approved") {
    if (!resource.hours || resource.hours.includes("call")) {
      nudge = "Add specific opening hours to help more people find you.";
    } else if (resource.languages.length === 0) {
      nudge = "List the languages your staff speaks to build trust.";
    } else if (resource.description.length < 100) {
      nudge: "Expand your description to help people understand what you offer.";
    }
  }

  return (
    <Card className={`border-2 ${config.border} ${config.bg}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.bg} shrink-0`}>
            <Icon className={`h-6 w-6 ${config.color}`} aria-hidden />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className={`font-semibold text-lg ${config.color} mb-1`}>
              {config.title}
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)] mb-3">
              {config.message}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-ink-faint)]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                Last updated: {lastUpdated}
              </div>
              {resource.verifiedAt && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-teal)]" aria-hidden />
                  Verified
                </div>
              )}
            </div>

            {nudge && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-teal-light)]">
                <AlertCircle className="h-4 w-4 text-[var(--color-teal)] mt-0.5 shrink-0" aria-hidden />
                <p className="text-xs text-[var(--color-ink-muted)]">
                  <strong className="text-[var(--color-ink)]">Quick tip:</strong> {nudge}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
