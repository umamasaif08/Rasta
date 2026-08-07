"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Home, Utensils, Stethoscope, Scale, ArrowRight, Search } from "lucide-react";
import { getApprovedResources } from "@/lib/resources";
import FlipCard from "@/components/ui/flip-card";
import { ORGANISATIONS } from "@/data/organisations";

// ── Animation variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ── Animated counter ──────────────────────────────────────────────────────
function AnimatedCount({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ── Category cards ────────────────────────────────────────────────────────
const categories = [
  {
    label: "Shelter", icon: Home, href: "/resources?category=shelter",
    bg: "bg-[var(--color-teal-light)]", iconColor: "text-[var(--color-teal)]",
    border: "border-[var(--color-teal)]", glow: "hover:shadow-[0_8px_24px_rgba(0,133,133,0.18)]",
  },
  {
    label: "Food", icon: Utensils, href: "/resources?category=food",
    bg: "bg-[var(--color-cream)]", iconColor: "text-[var(--color-terracotta)]",
    border: "border-[var(--color-terracotta)]", glow: "hover:shadow-[0_8px_24px_rgba(199,82,42,0.15)]",
  },
  {
    label: "Clinic", icon: Stethoscope, href: "/resources?category=clinic",
    bg: "bg-[var(--color-sage-light)]", iconColor: "text-[var(--color-sage)]",
    border: "border-[var(--color-sage)]", glow: "hover:shadow-[0_8px_24px_rgba(116,168,146,0.18)]",
  },
  {
    label: "Legal Aid", icon: Scale, href: "/resources?category=legal",
    bg: "bg-[var(--color-sand-light)]", iconColor: "text-[var(--color-ink-muted)]",
    border: "border-[var(--color-sand)]", glow: "hover:shadow-[0_8px_24px_rgba(229,193,133,0.25)]",
  },
] as const;

// ── How it works steps ────────────────────────────────────────────────────
const steps = [
  {
    step: "01", title: "Search or browse",
    body: "Find help by category or search by name, neighbourhood, or need. No account needed.",
  },
  {
    step: "02", title: "See verified listings",
    body: "Every listing is reviewed before it goes live. Organisations keep their own info up to date.",
  },
  {
    step: "03", title: "Contact directly",
    body: "Call, visit, or get directions. No in-app booking — just real phone numbers and addresses.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [resourceCount, setResourceCount] = useState(0);
  const [query, setQuery] = useState("");
  const howRef = useRef<HTMLElement>(null);
  const howInView = useInView(howRef, { once: true, margin: "-80px" });

  useEffect(() => {
    getApprovedResources().then((r) => setResourceCount(r.length)).catch(() => {});
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        aria-label="Site introduction"
        className="relative overflow-hidden bg-[var(--color-teal)] text-white"
      >
        {/* Subtle background mesh */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 20%, #E5C185 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 80%, #74A892 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
          {/* Beacon pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative mx-auto mb-8 flex h-16 w-16 items-center justify-center"
          >
            {/* Outer rings */}
            {[1, 2, 3].map((i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute inset-0 rounded-full border-2 border-[var(--color-terracotta)]"
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 2.4 }}
                transition={{
                  duration: 2.4,
                  delay: i * 0.6,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-terracotta)] shadow-lg">
              <Home className="h-6 w-6 text-white" aria-hidden />
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
          >
            Find free help in Karachi
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-4 text-lg text-white/80 max-w-xl mx-auto leading-relaxed"
          >
            Verified shelters, food distribution, free clinics, and legal aid —
            updated by the organisations themselves.
          </motion.p>

          {/* Live count badge */}
          <AnimatePresence>
            {resourceCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--color-sand)] animate-pulse" aria-hidden />
                <AnimatedCount target={resourceCount} /> verified resources
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search bar */}
          <motion.form
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            action="/resources"
            method="GET"
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:max-w-lg mx-auto"
            aria-label="Search resources"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search by name, area, or type
            </label>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" aria-hidden />
              <input
                id="hero-search"
                name="q"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, area, or type…"
                autoComplete="off"
                className="w-full rounded-[var(--radius-btn)] bg-white/15 pl-9 pr-4 py-3 text-white placeholder:text-white/50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sand)] text-base backdrop-blur-sm"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="flex items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--color-terracotta)] px-6 py-3 font-medium text-white hover:bg-[#b04522] transition-colors shadow-md"
            >
              Search
              <ArrowRight className="h-4 w-4" aria-hidden />
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* ── Category cards ────────────────────────────────────────────────── */}
      <section
        aria-label="Browse by category"
        className="mx-auto max-w-5xl px-4 py-14 sm:py-18"
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)] mb-8"
        >
          Browse by category
        </motion.p>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          role="list"
        >
          {categories.map(({ label, icon: Icon, href, bg, iconColor, border, glow }) => (
            <motion.li key={label} variants={cardReveal}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-3 rounded-[var(--radius-card)] border-2 ${border} ${bg} ${glow} px-4 py-7 text-center transition-all duration-200 group`}
              >
                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.12 }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className={`h-8 w-8 ${iconColor}`} aria-hidden />
                </motion.div>
                <span className="font-semibold text-[var(--color-ink)] text-sm tracking-wide">
                  {label}
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section
        ref={howRef}
        aria-label="How Rasta works"
        className="bg-[var(--color-surface-2)] py-14 sm:py-20 border-y border-[var(--color-teal-light)]"
      >
        <div className="mx-auto max-w-4xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="font-display text-2xl font-semibold text-center mb-12"
          >
            How Rasta works
          </motion.h2>

          <ol className="grid gap-8 sm:grid-cols-3" role="list">
            {steps.map(({ step, title, body }, i) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, y: 24 }}
                animate={howInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.12 }}
                className="relative flex flex-col gap-2"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden sm:block absolute top-5 left-[calc(100%_-_8px)] w-8 h-px bg-[var(--color-teal-light)]"
                  />
                )}
                <motion.span
                  className="font-mono text-4xl font-bold text-[var(--color-teal)] leading-none"
                  initial={{ opacity: 0 }}
                  animate={howInView ? { opacity: 0.35 } : {}}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                >
                  {step}
                </motion.span>
                <h3 className="font-semibold text-[var(--color-ink)] mt-1">{title}</h3>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section
        aria-label="Site statistics"
        className="bg-[var(--color-teal)] text-white py-10"
      >
        <div className="mx-auto max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center"
          >
            {[
              { value: resourceCount || 20, suffix: "+", label: "Verified resources" },
              { value: 4,  suffix: "",  label: "Categories" },
              { value: 7,  suffix: "",  label: "Languages" },
              { value: 0,  suffix: "",  label: "Login required" },
            ].map(({ value, suffix, label }) => (
              <div key={label}>
                <p className="font-mono text-3xl font-semibold text-[var(--color-sand)]">
                  <AnimatedCount target={value} suffix={suffix} />
                </p>
                <p className="text-sm text-white/70 mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured organisations ────────────────────────────────────── */}
      <section
        aria-label="Featured organisations"
        className="mx-auto max-w-6xl px-4 py-14 sm:py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)] mb-2">
            Who's on Rasta
          </p>
          <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
            Trusted organisations
          </h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
            Flip each card to learn more about the organisation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ORGANISATIONS.map((org, i) => (
            <FlipCard key={org.id} org={org} index={i} />
          ))}
        </div>
      </section>

      {/* ── CTA for organisations ─────────────────────────────────────────── */}
      <section
        aria-label="For organisations"
        className="mx-auto max-w-3xl px-4 py-14 sm:py-20 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-semibold mb-3">
            Are you an organisation?
          </h2>
          <p className="text-[var(--color-ink-muted)] mb-7 max-w-md mx-auto leading-relaxed">
            Register your NGO, shelter, clinic, or legal aid service. Your listing
            will be reviewed and published so people who need you can find you.
          </p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="inline-block"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--color-teal)] px-7 py-3.5 font-medium text-white hover:bg-[var(--color-teal-dark)] transition-colors shadow-md"
            >
              Register your organisation
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
