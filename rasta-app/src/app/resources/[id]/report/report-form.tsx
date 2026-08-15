"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { submitReport } from "@/lib/resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const REASONS = [
  "Phone number is wrong or disconnected",
  "Address has changed",
  "Opening hours are incorrect",
  "Service is no longer available",
  "Other",
];

export default function ReportForm({ resourceId }: { resourceId: string }) {
  const router = useRouter();
  const [reason,  setReason]  = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) { setError("Please describe the issue."); return; }
    if (reason.length > 500) { setError("Description is too long (max 500 characters)."); return; }
    if (reason.length < 10) { setError("Description must be at least 10 characters."); return; }
    if (contact.length > 200) { setError("Contact info is too long (max 200 characters)."); return; }
    setLoading(true);
    setError(null);
    try {
      await submitReport({
        resourceId,
        reason: reason.trim(),
        reporterContact: contact.trim() || null,
      });
      setDone(true);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <CheckCircle2 className="h-12 w-12 text-[var(--color-teal)] mx-auto mb-4" />
          </motion.div>
          <h2 className="font-display text-xl font-semibold mb-2">Thank you</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            Your report has been submitted. We'll follow up with the organisation.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          {/* Reason presets */}
          <div>
            <Label className="mb-2 block">What needs updating?</Label>
            <div className="flex flex-col gap-2">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 rounded-[var(--radius-btn)] border px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                    reason === r
                      ? "border-[var(--color-teal)] bg-[var(--color-teal-light)] text-[var(--color-teal-dark)]"
                      : "border-[var(--color-teal-light)] text-[var(--color-ink)] hover:border-[var(--color-teal)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="sr-only"
                  />
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                      reason === r
                        ? "border-[var(--color-teal)] bg-[var(--color-teal)]"
                        : "border-[var(--color-ink-faint)]"
                    }`}
                  >
                    {reason === r && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  {r}
                </label>
              ))}
            </div>

            {reason === "Other" && (
              <Textarea
                className="mt-3"
                placeholder="Describe the issue…"
                rows={3}
                value={reason === "Other" ? "" : reason}
                onChange={(e) => setReason(e.target.value || "Other")}
                aria-label="Describe the issue"
              />
            )}
          </div>

          {/* Optional contact */}
          <div>
            <Label htmlFor="contact" className="mb-1.5 block">
              Your contact (optional)
            </Label>
            <Input
              id="contact"
              type="text"
              placeholder="Phone or email — only visible to admin"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
              Never shown publicly.
            </p>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-terracotta)]" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="terracotta"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Submitting…" : "Submit report"}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
