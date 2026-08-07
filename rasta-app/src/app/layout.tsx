import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

/* ─── Fonts ─────────────────────────────────────────────────────────── */
const fraunces = Fraunces({
  subsets:  ["latin"],
  variable: "--font-fraunces",
  axes:     ["opsz", "SOFT", "WONK"],
  weight:   "variable",
  display:  "swap",
});

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets:  ["latin"],
  variable: "--font-ibm-plex-mono",
  weight:   ["400", "500"],
  display:  "swap",
});

/* ─── Metadata ──────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default:  "Rasta — Find Free Resources in Karachi",
    template: "%s · Rasta",
  },
  description:
    "Rasta helps people find verified free shelters, food distribution, clinics, and legal aid across Karachi — with no login required.",
  keywords: [
    "Karachi resources",
    "free shelter Karachi",
    "free food Karachi",
    "free clinic Karachi",
    "legal aid Karachi",
    "NGO directory Karachi",
  ],
  openGraph: {
    title:       "Rasta — Find Free Resources in Karachi",
    description: "Verified shelters, food, clinics & legal aid in Karachi. No login needed.",
    type:        "website",
    locale:      "en_PK",
  },
};

/* ─── Root Layout ───────────────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-ink)] font-body antialiased">
        <AuthProvider>
          <Navbar />

          {/* Skip-link target */}
          <main id="main-content" className="flex-1 outline-none" tabIndex={-1}>
            {children}
          </main>

          <footer className="border-t border-[var(--color-teal-light)] bg-[var(--color-surface-2)] py-8">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--color-ink-muted)]">
              <p>© {new Date().getFullYear()} Rasta · Made for Karachi</p>
              <nav aria-label="Footer links" className="flex items-center gap-4">
                <a href="/resources"      className="hover:text-[var(--color-teal)] transition-colors">Find Resources</a>
                <a href="/low-bandwidth"  className="hover:text-[var(--color-teal)] transition-colors">Plain text</a>
                <a href="/register"       className="hover:text-[var(--color-teal)] transition-colors">Register Org</a>
                <a href="mailto:hello@rasta.pk" className="hover:text-[var(--color-teal)] transition-colors">Contact</a>
              </nav>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
