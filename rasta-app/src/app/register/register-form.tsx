"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createResource } from "@/lib/resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { ResourceCategory } from "@/types";

const CATEGORIES: { value: ResourceCategory; label: string }[] = [
  { value: "shelter", label: "Shelter" },
  { value: "food",    label: "Food distribution" },
  { value: "clinic",  label: "Clinic / medical" },
  { value: "legal",   label: "Legal aid" },
];

const LANG_OPTIONS = ["Urdu", "English", "Sindhi", "Pashto", "Balochi", "Punjabi", "Gujarati"];

const STEPS = ["Account", "Organisation", "Listing"];

interface FormState {
  // Step 1 — account
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2 — org
  orgName: string;
  // Step 3 — listing
  category: ResourceCategory;
  description: string;
  address: string;
  phone: string;
  hours: string;
  languages: string[];
  servesWomen: boolean;
  servesChildren: boolean;
}

const initial: FormState = {
  email: "", password: "", confirmPassword: "",
  orgName: "",
  category: "shelter",
  description: "", address: "", phone: "", hours: "",
  languages: [], servesWomen: false, servesChildren: false,
};

export default function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const set = (k: keyof FormState, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  function toggleLang(lang: string) {
    set("languages", form.languages.includes(lang)
      ? form.languages.filter((l) => l !== lang)
      : [...form.languages, lang]
    );
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.email.includes("@")) return "Enter a valid email address.";
      if (form.password.length < 8)   return "Password must be at least 8 characters.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    if (step === 1) {
      if (!form.orgName.trim()) return "Organisation name is required.";
    }
    if (step === 2) {
      if (!form.description.trim()) return "Description is required.";
      if (!form.address.trim())     return "Address is required.";
      if (!form.phone.trim())       return "Phone number is required.";
      if (!form.hours.trim())       return "Hours are required.";
      if (form.languages.length === 0) return "Select at least one language.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => s + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    setLoading(true);
    setError(null);
    try {
      const uid = await signUp(form.email, form.password, form.orgName);

      await createResource({
        name:           form.orgName,
        category:       form.category,
        description:    form.description,
        address:        form.address,
        lat:            0,
        lng:            0,
        phone:          form.phone,
        hours:          form.hours,
        languages:      form.languages,
        servesWomen:    form.servesWomen,
        servesChildren: form.servesChildren,
        createdBy:      uid,
      });
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      if (msg.includes("email-already-in-use")) {
        setError("That email is already registered. Try logging in.");
      } else if (msg.includes("weak-password")) {
        setError("Password is too weak. Use at least 8 characters.");
      } else if (msg.includes("invalid-email")) {
        setError("That email address isn't valid.");
      } else if (msg.includes("network-request-failed")) {
        setError("Network error — check your connection and try again.");
      } else if (msg.includes("permission-denied")) {
        setError("Could not save your listing — Firestore rules blocked the write. Contact support.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <CheckCircle2 className="h-14 w-14 text-[var(--color-teal)] mx-auto mb-4" />
        </motion.div>
        <h2 className="font-display text-2xl font-semibold mb-2">You're registered!</h2>
        <p className="text-[var(--color-ink-muted)] text-sm mb-6 max-w-xs mx-auto">
          Your listing has been submitted for review. We'll make it live once
          it's approved — usually within 24 hours.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Go to your dashboard
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <nav aria-label="Registration steps" className="mb-8">
        <ol className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  i < step
                    ? "bg-[var(--color-teal)] text-white"
                    : i === step
                    ? "border-2 border-[var(--color-teal)] text-[var(--color-teal)]"
                    : "border-2 border-[var(--color-teal-light)] text-[var(--color-ink-faint)]"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`mt-1 text-xs ${i === step ? "text-[var(--color-teal)] font-medium" : "text-[var(--color-ink-faint)]"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 ${i < step ? "bg-[var(--color-teal)]" : "bg-[var(--color-teal-light)]"}`} />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <form onSubmit={handleSubmit} noValidate>
        <AnimatePresence mode="wait">
          {/* Step 0 — Account */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-4">
              <div>
                <Label htmlFor="email" className="mb-1.5 block">Email address</Label>
                <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@organisation.org" required />
              </div>
              <div>
                <Label htmlFor="password" className="mb-1.5 block">Password</Label>
                <Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 8 characters" required />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="mb-1.5 block">Confirm password</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="Repeat password" required />
              </div>
            </motion.div>
          )}

          {/* Step 1 — Organisation */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-4">
              <div>
                <Label htmlFor="orgName" className="mb-1.5 block">Organisation name</Label>
                <Input id="orgName" type="text" value={form.orgName} onChange={(e) => set("orgName", e.target.value)} placeholder="e.g. Edhi Foundation" required />
              </div>
            </motion.div>
          )}

          {/* Step 2 — Listing */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-4">
              <div>
                <Label htmlFor="category" className="mb-1.5 block">Service type</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v as ResourceCategory)}>
                  <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description" className="mb-1.5 block">Description</Label>
                <Textarea id="description" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe your service, who you serve, and what you provide." required />
              </div>
              <div>
                <Label htmlFor="address" className="mb-1.5 block">Address</Label>
                <Input id="address" type="text" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full street address, Karachi" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone" className="mb-1.5 block">Phone</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="021-XXXXXXXX" required />
                </div>
                <div>
                  <Label htmlFor="hours" className="mb-1.5 block">Hours</Label>
                  <Input id="hours" type="text" value={form.hours} onChange={(e) => set("hours", e.target.value)} placeholder="Mon–Sat, 9am–5pm" required />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Languages spoken</Label>
                <div className="flex flex-wrap gap-2">
                  {LANG_OPTIONS.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLang(lang)}
                      aria-pressed={form.languages.includes(lang)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        form.languages.includes(lang)
                          ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white"
                          : "border-[var(--color-teal-light)] text-[var(--color-ink-muted)] hover:border-[var(--color-teal)]"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-6">
                {[
                  { key: "servesWomen"   as const, label: "Serves women" },
                  { key: "servesChildren"as const, label: "Serves children" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={(e) => set(key, e.target.checked)}
                      className="h-4 w-4 accent-[var(--color-teal)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-[var(--color-terracotta)]"
            role="alert"
          >
            {error}
          </motion.p>
        )}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setError(null); setStep((s) => s - 1); }}
            >
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} className="ml-auto">
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="ml-auto">
              {loading ? "Registering…" : "Submit for review"}
            </Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
        Already registered?{" "}
        <a href="/login" className="text-[var(--color-teal)] hover:underline font-medium">
          Log in
        </a>
      </p>
    </div>
  );
}
