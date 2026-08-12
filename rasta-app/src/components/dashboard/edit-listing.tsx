"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Save, X, FileEdit } from "lucide-react";
import { updateResource } from "@/lib/resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Resource } from "@/types";

interface EditListingProps {
  resource: Resource;
  onSaved: (data: Partial<Resource>) => void;
}

interface EditState {
  description: string;
  address: string;
  phone: string;
  hours: string;
}

export default function EditListing({ resource, onSaved }: EditListingProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EditState>({
    description: resource.description,
    address: resource.address,
    phone: resource.phone,
    hours: resource.hours,
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const canEdit = resource.status === "approved";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
            <CardTitle>Edit Listing</CardTitle>
          </div>
          {canEdit && !editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-2"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!canEdit ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            You can edit your listing once it's been approved. Pending listings are locked while under review.
          </p>
        ) : (
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="desc" className="mb-1.5 block">Description</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Describe your services, who you serve, and what help you provide..."
                  />
                </div>

                <div>
                  <Label htmlFor="addr" className="mb-1.5 block">Address</Label>
                  <Input
                    id="addr"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Full street address, Karachi"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="mb-1.5 block">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="021-XXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours" className="mb-1.5 block">Hours</Label>
                    <Input
                      id="hours"
                      value={form.hours}
                      onChange={(e) => set("hours", e.target.value)}
                      placeholder="Mon–Sat, 9am–5pm"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[var(--color-terracotta)]" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button onClick={save} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" aria-hidden />
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditing(false);
                      setError(null);
                      setForm({
                        description: resource.description,
                        address: resource.address,
                        phone: resource.phone,
                        hours: resource.hours,
                      });
                    }}
                  >
                    <X className="h-4 w-4 mr-1.5" aria-hidden />
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
                className="space-y-3 text-sm"
              >
                <div>
                  <p className="text-xs font-medium text-[var(--color-ink-muted)] mb-1">Description</p>
                  <p className="text-[var(--color-ink)]">{resource.description}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--color-ink-muted)] mb-1">Address</p>
                  <p className="text-[var(--color-ink)]">{resource.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-ink-muted)] mb-1">Phone</p>
                    <p className="text-[var(--color-ink)]">{resource.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--color-ink-muted)] mb-1">Hours</p>
                    <p className="text-[var(--color-ink)]">{resource.hours}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
