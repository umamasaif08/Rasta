"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useRequireAuth } from "@/lib/auth-helpers";
import { getResourcesByOrg } from "@/lib/resources";
import { Card, CardContent } from "@/components/ui/card";
import ResourceCard from "@/components/ui/resource-card";
import type { Resource, ResourceSummary } from "@/types";
import { format } from "date-fns";

export default function PublicListingPreviewPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getResourcesByOrg(user.uid)
      .then(setResources)
      .finally(() => setDataLoading(false));
  }, [user]);

  if (authLoading || dataLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-4">
          <div className="h-16 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
          <div className="h-80 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
        </div>
      </div>
    );
  }

  const primaryResource = resources.find((r) => r.status === "approved") || resources[0];

  if (!primaryResource) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center text-[var(--color-ink-muted)]">
            <p className="mb-4">No listing found.</p>
            <a
              href="/dashboard"
              className="inline-block text-[var(--color-teal)] hover:underline"
            >
              Return to dashboard
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert Resource to ResourceSummary for the card component
  const resourceSummary: ResourceSummary = {
    id: primaryResource.id || "",
    name: primaryResource.name,
    category: primaryResource.category,
    description: primaryResource.description,
    address: primaryResource.address,
    lat: primaryResource.lat,
    lng: primaryResource.lng,
    phone: primaryResource.phone,
    hours: primaryResource.hours,
    languages: primaryResource.languages,
    servesWomen: primaryResource.servesWomen,
    servesChildren: primaryResource.servesChildren,
    status: primaryResource.status,
  };

  function formatTimestamp(timestamp: any) {
    if (!timestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "MMM d, yyyy");
    } catch {
      return null;
    }
  }

  const statusDate = primaryResource.status === "approved" 
    ? formatTimestamp(primaryResource.verifiedAt || primaryResource.createdAt)
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
              Public Listing Preview
            </h1>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              How your listing appears to visitors
            </p>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-[var(--color-teal)] hover:text-[var(--color-teal-dark)] hover:underline underline-offset-2 transition-colors"
          >
            ← Back to dashboard
          </a>
        </div>
      </motion.div>

      {/* Status Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {primaryResource.status === "approved" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      Live {statusDate ? `since ${statusDate}` : ""}
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                      Your listing is publicly visible on the Resources page.
                    </p>
                  </div>
                </>
              )}
              {primaryResource.status === "pending" && (
                <>
                  <Clock className="h-5 w-5 text-[var(--color-sand)]" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      Pending review
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                      This won't be visible to the public until approved. We typically review listings within 24 hours.
                    </p>
                  </div>
                </>
              )}
              {primaryResource.status === "rejected" && (
                <>
                  <XCircle className="h-5 w-5 text-[var(--color-terracotta)]" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      Not approved
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                      Check the Edit Listing tab for details and make corrections before resubmitting.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resource Card Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="max-w-sm mx-auto">
          <ResourceCard resource={resourceSummary} index={0} />
        </div>
      </motion.div>

      {/* Explanation Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-sm text-[var(--color-ink-muted)] mb-4">
          This is exactly what visitors see when they search <strong>{primaryResource.category}</strong> on Rasta.
        </p>
        
        {primaryResource.status === "approved" && (
          <a
            href="/resources"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-teal)] hover:text-[var(--color-teal-dark)] hover:underline underline-offset-2 transition-colors"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            View on public Resources page
          </a>
        )}
      </motion.div>
    </div>
  );
}
