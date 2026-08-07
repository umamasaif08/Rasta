"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle2, XCircle, Pencil, Save, X as XIcon,
} from "lucide-react";
import { useRequireAuth } from "@/lib/auth-helpers";
import { getResourcesByOrg, updateResource } from "@/lib/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resource } from "@/types";

const STATUS_META = {
  pending:  { label: "Pending review", icon: Clock,         color: "text-[var(--color-sand)]",        bg: "bg-[var(--color-sand-light)]" },
  approved: { label: "Live",           icon: CheckCircle2,  color: "text-[var(--color-teal)]",        bg: "bg-[var(--color-teal-light)]" },
  rejected: { label: "Not approved",   icon: XCircle,       color: "text-[var(--color-terracotta)]",  bg: "bg-[var(--color-terracotta-light)]" },
};

interface EditState {
  description: string;
  address:     string;
  phone:       string;
  hours:       string;
}

function EditableRow({
  resource,
  onSaved,
}: {
  resource: Resource;
  onSaved: (updated: Partial<Resource>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [form, setForm] = useState<EditState>({
    description: resource.description,
    address:     resource.address,
    phone:       resource.phone,
    hours:       resource.hours,
  });

  const set = (k: keyof EditState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!resource.id) return;
    setSaving(true);
    setError(null);
    try {
      await updateResource(resource.id, form);
      onSaved(form);
      setEditing(false);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const { label, icon: Icon, color, bg } = STATUS_META[resource.status];

  return (
    <Card animate={false} className="overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base">{resource.name}</CardTitle>
          <span className={`inline-flex items-center gap-1.5 mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${color}`}>
            <Icon className="h-3 w-3" aria-hidden />
            {label}
          </span>
        </div>
        {resource.status === "approved" && (
          <button
            onClick={() => { setEditing((e) => !e); setError(null); }}
            aria-label={editing ? "Cancel editing" : "Edit listing"}
            className="mt-0.5 text-[var(--color-ink-faint)] hover:text-[var(--color-teal)] transition-colors"
          >
            {editing ? <XIcon className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
        )}
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div>
                <Label htmlFor={`desc-${resource.id}`} className="mb-1 block text-xs">Description</Label>
                <Textarea id={`desc-${resource.id}`} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`addr-${resource.id}`} className="mb-1 block text-xs">Address</Label>
                  <Input id={`addr-${resource.id}`} value={form.address} onChange={(e) => set("address", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`phone-${resource.id}`} className="mb-1 block text-xs">Phone</Label>
                  <Input id={`phone-${resource.id}`} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor={`hours-${resource.id}`} className="mb-1 block text-xs">Hours</Label>
                <Input id={`hours-${resource.id}`} value={form.hours} onChange={(e) => set("hours", e.target.value)} />
              </div>
              {error && <p className="text-xs text-[var(--color-terracotta)]" role="alert">{error}</p>}
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={save} disabled={saving}>
                  <Save className="h-3.5 w-3.5" aria-hidden />
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setError(null); }}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-[var(--color-ink-muted)] space-y-1"
            >
              <p className="line-clamp-2">{resource.description}</p>
              <p>📍 {resource.address}</p>
              <p>📞 {resource.phone} · {resource.hours}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────

export default function DashboardClient() {
  const { user, orgUser, loading: authLoading } = useRequireAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

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
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Your dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {orgUser?.orgName ?? "Organisation"} · {user?.email}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {(["approved", "pending", "rejected"] as const).map((status) => {
          const count = resources.filter((r) => r.status === status).length;
          const { label, color, bg, icon: Icon } = STATUS_META[status];
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-[var(--radius-card)] ${bg} p-4 text-center`}
            >
              <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} aria-hidden />
              <p className={`font-mono text-2xl font-medium ${color}`}>{count}</p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Listings */}
      <h2 className="font-semibold text-[var(--color-ink)] mb-4">Your listings</h2>

      {resources.length === 0 ? (
        <div className="py-12 text-center text-[var(--color-ink-muted)]">
          <p className="mb-4">No listings yet.</p>
          <Button asChild variant="outline">
            <a href="/register">Add your first listing</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((r) => (
            <EditableRow
              key={r.id}
              resource={r}
              onSaved={(data) => r.id && patchResource(r.id, data)}
            />
          ))}
        </div>
      )}

      {/* Pending notice */}
      {resources.some((r) => r.status === "pending") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 rounded-[var(--radius-card)] bg-[var(--color-sand-light)] border border-[var(--color-sand)] p-4 text-sm text-[var(--color-ink-muted)]"
        >
          <strong className="text-[var(--color-ink)]">Pending listings</strong> are
          reviewed within 24 hours. You'll be able to edit them once they're approved.
        </motion.div>
      )}
    </div>
  );
}
