"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock, CheckCircle2, XCircle, Image, Settings, ListChecks,
  Sparkles, Calendar, Eye,
} from "lucide-react";
import { useRequireAuth } from "@/lib/auth-helpers";
import { getResourcesByOrg } from "@/lib/resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusCard from "@/components/dashboard/status-card";
import EditListing from "@/components/dashboard/edit-listing";
import ListingAssistant from "@/components/ui/listing-assistant";
import PhotosSection from "@/components/dashboard/photos-section";
import AccountSettings from "@/components/dashboard/account-settings";
import VerificationChecklist from "@/components/dashboard/verification-checklist";
import type { Resource } from "@/types";

const STATUS_META = {
  pending:  { label: "Pending review", icon: Clock,         color: "text-[var(--color-sand)]",        bg: "bg-[var(--color-sand-light)]" },
  approved: { label: "Live",           icon: CheckCircle2,  color: "text-[var(--color-teal)]",        bg: "bg-[var(--color-teal-light)]" },
  rejected: { label: "Not approved",   icon: XCircle,       color: "text-[var(--color-terracotta)]",  bg: "bg-[var(--color-terracotta-light)]" },
};

export default function DashboardClient() {
  const { user, orgUser, loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listing" | "preview" | "photos" | "settings" | "verification">("listing");

  // Guard: redirect admin users to /admin
  useEffect(() => {
    if (authLoading) return;
    
    if (orgUser?.isAdmin) {
      console.log("[Dashboard] Admin user detected, redirecting to /admin");
      router.replace("/admin");
    }
  }, [authLoading, orgUser, router]);

  useEffect(() => {
    if (!user) return;
    getResourcesByOrg(user.uid)
      .then(setResources)
      .finally(() => setDataLoading(false));
  }, [user]);

  function patchResource(id: string, data: Partial<Resource>) {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
  }

  if (authLoading || dataLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Don't render for admin users
  if (orgUser?.isAdmin) return null;

  const primaryResource = resources.find((r) => r.status === "approved") || resources[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {orgUser?.orgName ?? "Organisation"} · {user?.email}
        </p>
      </motion.div>

      {/* Section 1: Status Card */}
      {primaryResource && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <StatusCard resource={primaryResource} />
        </motion.div>
      )}

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {(["approved", "pending", "rejected"] as const).map((status) => {
          const count = resources.filter((r) => r.status === status).length;
          const { label, color, bg, icon: Icon } = STATUS_META[status];
          return (
            <div
              key={status}
              className={`rounded-[var(--radius-card)] ${bg} p-4 text-center`}
            >
              <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} aria-hidden />
              <p className={`font-mono text-2xl font-medium ${color}`}>{count}</p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{label}</p>
            </div>
          );
        })}
      </motion.div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-[var(--color-ink-muted)]">
            <p className="mb-4">No listings yet.</p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] border border-[var(--color-teal)] text-[var(--color-teal)] hover:bg-[var(--color-teal-light)] px-4 py-2 text-sm font-medium transition-colors"
            >
              Add your first listing
            </a>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <nav className="flex gap-2 border-b border-[var(--color-teal-light)] overflow-x-auto" aria-label="Dashboard sections">
              {[
                { id: "listing" as const, label: "Edit Listing", icon: ListChecks },
                { id: "preview" as const, label: "View Public", icon: Eye },
                { id: "photos" as const, label: "Photos", icon: Image },
                { id: "settings" as const, label: "Account", icon: Settings },
                { id: "verification" as const, label: "Verification", icon: CheckCircle2 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? "border-[var(--color-teal)] text-[var(--color-teal)]"
                      : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Section 2 & 3: Edit Listing + AI Assistant */}
            {activeTab === "listing" && primaryResource && (
              <>
                {/* Section 3: AI Assistant - Always visible at top */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
                      <CardTitle>Improve Your Listing</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                      Chat with our AI assistant to identify gaps and strengthen your listing. 
                      Get personalized suggestions on what to add or improve.
                    </p>
                    <ListingAssistant
                      resource={primaryResource}
                      onNotesUpdated={(notes) => {
                        if (primaryResource.id) patchResource(primaryResource.id, { aiReviewNotes: notes });
                      }}
                    />
                    {primaryResource.aiReviewNotes && (
                      <div className="mt-4 p-3 rounded-lg bg-[var(--color-teal-light)] border border-[var(--color-teal)]">
                        <p className="text-xs font-medium text-[var(--color-ink)] mb-1 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" aria-hidden />
                          Latest AI Review
                        </p>
                        <p className="text-xs text-[var(--color-ink-muted)] whitespace-pre-wrap">
                          {primaryResource.aiReviewNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Section 2: Edit Listing */}
                <EditListing
                  resource={primaryResource}
                  onSaved={(data) => {
                    if (primaryResource.id) patchResource(primaryResource.id, data);
                  }}
                />
              </>
            )}

            {/* View Public Listing - Link */}
            {activeTab === "preview" && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-[var(--color-teal)]" aria-hidden />
                  <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                    View how your listing appears to visitors
                  </p>
                  <a
                    href="/dashboard/listing"
                    className="inline-block rounded-[var(--radius-btn)] bg-[var(--color-teal)] px-6 py-2.5 text-white font-medium hover:bg-[var(--color-teal-dark)] transition-colors"
                  >
                    View Public Preview
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Section 4: Photos */}
            {activeTab === "photos" && primaryResource && (
              <PhotosSection resource={primaryResource} />
            )}

            {/* Section 5: Account Settings */}
            {activeTab === "settings" && user && (
              <AccountSettings 
                user={user} 
                orgUser={orgUser}
                resource={primaryResource}
                onResourceUpdated={(data) => {
                  if (primaryResource?.id) patchResource(primaryResource.id, data);
                }}
              />
            )}

            {/* Section 6: Verification Checklist */}
            {activeTab === "verification" && primaryResource && (
              <VerificationChecklist resource={primaryResource} />
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
