"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, Flag, ShieldCheck,
  ChevronDown, ChevronUp, MapPin, Phone, Languages,
  AlertTriangle, RefreshCw, History as HistoryIcon, Search,
} from "lucide-react";
import { useRequireAuth } from "@/lib/auth-helpers";
import {
  getPendingResources, approveResource, rejectResource,
  getOpenReports, resolveReport, getAllResources,
} from "@/lib/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resource, Report } from "@/types";

// ── Animation variants ────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" as const },
  }),
  exit: { opacity: 0, x: -32, transition: { duration: 0.25 } },
};

// ── Pending card ──────────────────────────────────────────────────────────

function PendingCard({
  resource,
  index,
  onApprove,
  onReject,
}: {
  resource: Resource;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [expanded,      setExpanded]      = useState(false);
  const [rejecting,     setRejecting]     = useState(false);
  const [rejectReason,  setRejectReason]  = useState("");
  const [actioning,     setActioning]     = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    if (!resource.id) return;
    setActioning("approve");
    await approveResource(resource.id);
    onApprove(resource.id);
  }

  async function handleReject() {
    if (!resource.id) return;
    setActioning("reject");
    await rejectResource(resource.id, rejectReason.trim() || undefined);
    onReject(resource.id, rejectReason);
  }

  const CATEGORY_BADGE: Record<string, "shelter" | "food" | "clinic" | "legal"> = {
    shelter: "shelter", food: "food", clinic: "clinic", legal: "legal",
  };

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Card animate={false} className="overflow-hidden border-[var(--color-sand)] bg-[var(--color-sand-light)]/40">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant={CATEGORY_BADGE[resource.category] ?? "outline"}>
                  {resource.category}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-muted)]">
                  <Clock className="h-3 w-3" /> Pending review
                </span>
              </div>
              <CardTitle className="text-base leading-snug">{resource.name}</CardTitle>
            </div>
            <button
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? "Collapse" : "Expand"}
              className="text-[var(--color-ink-faint)] hover:text-[var(--color-teal)] transition-colors mt-0.5"
            >
              {expanded
                ? <ChevronUp className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Always-visible quick info */}
          <div className="flex flex-col gap-1 text-xs text-[var(--color-ink-muted)]">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-[var(--color-sage)]" />{resource.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-[var(--color-sage)]" />{resource.phone}
            </span>
          </div>

          {/* Expandable full detail */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="border-t border-[var(--color-sand)] pt-3 space-y-2 text-xs text-[var(--color-ink-muted)]">
                  <p className="text-[var(--color-ink)] text-sm leading-relaxed">{resource.description}</p>
                  <p><span className="font-medium text-[var(--color-ink)]">Hours:</span> {resource.hours}</p>
                  <p className="flex items-center gap-1.5">
                    <Languages className="h-3 w-3" />
                    {resource.languages.join(", ")}
                  </p>
                  {(resource.servesWomen || resource.servesChildren) && (
                    <div className="flex gap-2">
                      {resource.servesWomen    && <Badge variant="teal">Women</Badge>}
                      {resource.servesChildren && <Badge variant="sage">Children</Badge>}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reject reason input */}
          <AnimatePresence>
            {rejecting && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Input
                  placeholder="Rejection reason (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="text-xs h-8"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="default"
              disabled={actioning !== null}
              onClick={handleApprove}
              className="flex-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {actioning === "approve" ? "Approving…" : "Approve"}
            </Button>

            {rejecting ? (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={actioning !== null}
                  onClick={handleReject}
                  className="flex-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {actioning === "reject" ? "Rejecting…" : "Confirm reject"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setRejecting(false); setRejectReason(""); }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-[var(--color-terracotta)] text-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-light)]"
                onClick={() => setRejecting(true)}
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Report card ───────────────────────────────────────────────────────────

function ReportCard({
  report,
  index,
  onResolve,
}: {
  report: Report & { id: string };
  index: number;
  onResolve: (id: string) => void;
}) {
  const [resolving, setResolving] = useState(false);

  async function handleResolve() {
    setResolving(true);
    await resolveReport(report.id);
    onResolve(report.id);
  }

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Card animate={false} className="border-[var(--color-terracotta-light)] bg-[var(--color-terracotta-light)]/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Flag className="h-4 w-4 text-[var(--color-terracotta)] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-ink)] leading-snug">
                {report.reason}
              </p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                Resource ID:{" "}
                <a
                  href={`/resources/${report.resourceId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-teal)] hover:underline font-mono"
                >
                  {report.resourceId.slice(0, 12)}…
                </a>
              </p>
              {report.reporterContact && (
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                  Contact: <span className="text-[var(--color-ink)]">{report.reporterContact}</span>
                </p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={resolving}
            onClick={handleResolve}
            className="w-full border-[var(--color-teal)] text-[var(--color-teal)] hover:bg-[var(--color-teal-light)]"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {resolving ? "Resolving…" : "Mark resolved"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-36 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
      ))}
    </div>
  );
}

// ── Main admin client ─────────────────────────────────────────────────────

type Tab = "pending" | "reports" | "history";

export default function AdminClient() {
  const { user, orgUser, loading: authLoading } = useRequireAuth(); // Remove "admin" role check
  const router = useRouter();

  const [tab,        setTab]        = useState<Tab>("pending");
  const [pending,    setPending]    = useState<Resource[]>([]);
  const [reports,    setReports]    = useState<(Report & { id: string })[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  
  // History tab filters
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("all");

  // Guard: redirect non-admin users to dashboard
  useEffect(() => {
    if (authLoading) return;
    
    // If not logged in, useRequireAuth will handle redirect to /login
    // If logged in but not isAdmin, redirect to dashboard
    if (orgUser && !orgUser.isAdmin) {
      console.error(
        "[Admin] Access denied: isAdmin is not true for this user.",
        "User:",
        { uid: orgUser.uid, email: orgUser.email, isAdmin: orgUser.isAdmin }
      );
      router.replace("/dashboard");
    }
  }, [authLoading, orgUser, router]);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    try {
      const [p, r, all] = await Promise.all([
        getPendingResources(), 
        getOpenReports(),
        getAllResources(),
      ]);
      setPending(p);
      setReports(r);
      setAllResources(all);
    } catch {
      setError("Failed to load data. Check your connection.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && orgUser?.isAdmin) loadData();
  }, [authLoading, orgUser, loadData]);

  if (authLoading) return <Skeleton />;
  if (!orgUser || !orgUser.isAdmin) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8 gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-[var(--color-teal)]" />
            <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
              Admin
            </h1>
          </div>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {pending.length} pending · {reports.length} open reports
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loadingData}
          aria-label="Refresh"
          className="p-2 rounded-[var(--radius-btn)] border border-[var(--color-teal-light)] text-[var(--color-ink-muted)] hover:text-[var(--color-teal)] hover:bg-[var(--color-teal-light)] transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
        </button>
      </motion.div>

      {/* Tab switcher */}
      <div className="relative mb-6">
        <div className="relative flex flex-wrap sm:flex-nowrap rounded-[var(--radius-btn)] bg-[var(--color-surface-2)] border border-[var(--color-teal-light)] p-1 gap-1 sm:gap-0 overflow-hidden" role="tablist" aria-label="Admin tabs">
          {(["pending", "reports", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative z-10 flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-[6px] transition-colors ${
                tab === t ? "text-white" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {/* Animated sliding pill - only rendered under active tab */}
              {tab === t && (
                <motion.div
                  layoutId="admin-tab-indicator"
                  className="absolute inset-0 rounded-[6px] bg-[var(--color-teal)] shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              
              {t === "pending" && (
                <>
                  <Clock className="h-3.5 w-3.5 hidden xs:inline-block" />
                  <span className="sm:hidden">Pending</span>
                  <span className="hidden sm:inline">Pending</span>
                  {pending.length > 0 && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-mono ${tab === "pending" ? "bg-white/20" : "bg-[var(--color-sand)] text-[#3a2f1e]"}`}>
                      {pending.length}
                    </span>
                  )}
                </>
              )}
              {t === "reports" && (
                <>
                  <Flag className="h-3.5 w-3.5" />
                  Reports
                  {reports.length > 0 && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-mono ${tab === "reports" ? "bg-white/20" : "bg-[var(--color-terracotta-light)] text-[var(--color-terracotta)]"}`}>
                      {reports.length}
                    </span>
                  )}
                </>
              )}
              {t === "history" && (
                <>
                  <HistoryIcon className="h-3.5 w-3.5" />
                  History
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-terracotta-light)] p-3 text-sm text-[var(--color-terracotta)]"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === "pending" && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {loadingData ? (
              <Skeleton />
            ) : pending.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="All clear"
                body="No pending submissions right now."
                iconColor="text-[var(--color-teal)]"
              />
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {pending.map((r, i) => (
                    <PendingCard
                      key={r.id}
                      resource={r}
                      index={i}
                      onApprove={(id) => setPending((p) => p.filter((x) => x.id !== id))}
                      onReject={(id) => setPending((p) => p.filter((x) => x.id !== id))}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {tab === "reports" && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {loadingData ? (
              <Skeleton />
            ) : reports.length === 0 ? (
              <EmptyState
                icon={Flag}
                title="No open reports"
                body="No reports to review right now."
                iconColor="text-[var(--color-sage)]"
              />
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {reports.map((r, i) => (
                    <ReportCard
                      key={r.id}
                      report={r}
                      index={i}
                      onResolve={(id) => setReports((rs) => rs.filter((x) => x.id !== id))}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {loadingData ? (
              <Skeleton />
            ) : (
              <HistoryView
                resources={allResources}
                searchQuery={historySearch}
                onSearchChange={setHistorySearch}
                statusFilter={historyStatusFilter}
                onStatusFilterChange={setHistoryStatusFilter}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── History view ──────────────────────────────────────────────────────────

interface HistoryEntry {
  resourceId: string;
  resourceName: string;
  status: string;
  changedAt: string;
  reason?: string;
}

function HistoryView({
  resources,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: {
  resources: Resource[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}) {
  // Flatten all status history entries from all resources
  const allHistory: HistoryEntry[] = resources.flatMap((resource) => {
    if (resource.statusHistory && resource.statusHistory.length > 0) {
      return resource.statusHistory.map((entry) => ({
        resourceId: resource.id || "",
        resourceName: resource.name,
        status: entry.status,
        changedAt: entry.changedAt,
        reason: entry.reason,
      }));
    } else {
      // Fallback for resources without statusHistory
      return [
        {
          resourceId: resource.id || "",
          resourceName: resource.name,
          status: resource.status,
          changedAt: resource.createdAt
            ? new Date(resource.createdAt.toDate()).toISOString()
            : new Date().toISOString(),
          reason: undefined,
        },
      ];
    }
  });

  // Sort by date, most recent first
  const sorted = allHistory.sort((a, b) => {
    return new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime();
  });

  // Apply filters
  const filtered = sorted.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.resourceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format date
  function formatDate(isoString: string) {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  }

  // Status badge color
  function getStatusColor(status: string) {
    switch (status) {
      case "approved":
        return "text-[var(--color-teal)] bg-[var(--color-teal-light)]";
      case "pending":
        return "text-[var(--color-sand)] bg-[var(--color-sand-light)]";
      case "rejected":
        return "text-[var(--color-terracotta)] bg-[var(--color-terracotta-light)]";
      default:
        return "text-[var(--color-ink-muted)] bg-[var(--color-surface-2)]";
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card animate={false}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-faint)]" />
              <Input
                type="text"
                placeholder="Search by organization name..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="h-9 rounded-[var(--radius-btn)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* History list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No history found"
          body="Try adjusting your search or filters."
          iconColor="text-[var(--color-ink-muted)]"
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((entry, i) => (
              <motion.div
                key={`${entry.resourceId}-${entry.changedAt}-${i}`}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <Card animate={false} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-ink)] mb-1 truncate">
                          {entry.resourceName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-medium capitalize ${getStatusColor(
                              entry.status
                            )}`}
                          >
                            {entry.status}
                          </span>
                          <span>·</span>
                          <Clock className="h-3 w-3 inline" aria-hidden />
                          <span>{formatDate(entry.changedAt)}</span>
                          {!resources.find((r) => r.id === entry.resourceId)
                            ?.statusHistory && (
                            <>
                              <span>·</span>
                              <span className="text-[var(--color-ink-faint)] italic">
                                (history not tracked before this date)
                              </span>
                            </>
                          )}
                        </div>
                        {entry.reason && (
                          <p className="text-xs text-[var(--color-ink-muted)] mt-2 italic">
                            Reason: {entry.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon, title, body, iconColor,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  iconColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-16 text-center"
    >
      <Icon className={`h-10 w-10 mx-auto mb-3 ${iconColor} opacity-60`} />
      <p className="font-semibold text-[var(--color-ink)]">{title}</p>
      <p className="text-sm text-[var(--color-ink-muted)] mt-1">{body}</p>
    </motion.div>
  );
}
