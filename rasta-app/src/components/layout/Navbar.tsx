"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import NotificationsDropdown from "@/components/ui/notifications-dropdown";

const publicNavLinks = [
  { href: "/resources",      label: "Resources" },
  { href: "/low-bandwidth",  label: "Plain text" },
  { href: "/help",           label: "Help" },
];

const orgNavLinks = [
  { href: "/dashboard",      label: "Dashboard" },
  { href: "/resources",      label: "Resources" },
  { href: "/help",           label: "Help" },
];

const adminNavLinks = [
  { href: "/admin",          label: "Admin Panel" },
  { href: "/resources",      label: "Resources" },
  { href: "/help",           label: "Help" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, orgUser, signOut } = useAuth();

  // Role-based navigation links
  const navLinks = orgUser?.isAdmin 
    ? adminNavLinks 
    : (orgUser && !orgUser.isAdmin) 
      ? orgNavLinks 
      : publicNavLinks;

  return (
    <>
      {/* ── Skip to main content (a11y) ─────────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-[var(--radius-btn)] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-teal)] focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 bg-[var(--color-teal)] text-white shadow-sm">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <MapPin className="h-5 w-5 text-[var(--color-sand)]" aria-hidden />
            </motion.div>
            <span className="hover:opacity-90 transition-opacity">Rasta</span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden sm:flex items-center gap-6 text-sm font-medium" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative py-0.5 opacity-90 hover:opacity-100 transition-opacity after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white/60 after:transition-all hover:after:w-full"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth (desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={orgUser?.isAdmin ? "/admin" : "/dashboard"}
                  className="text-sm opacity-90 hover:opacity-100 hover:underline underline-offset-4"
                >
                  {orgUser?.isAdmin ? "Admin" : (orgUser?.orgName ?? "Dashboard")}
                </Link>
                {/* Notifications bell — only for org users */}
                {orgUser && !orgUser.isAdmin && user.uid && (
                  <NotificationsDropdown orgId={user.uid} />
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut()}
                  className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Sign out"
                >
                  Sign out
                </motion.button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href="/login"
                  className="opacity-80 hover:opacity-100 transition-opacity hover:underline underline-offset-2"
                >
                  Log in
                </Link>
                <span className="opacity-50">/</span>
                <Link
                  href="/register"
                  className="opacity-80 hover:opacity-100 transition-opacity hover:underline underline-offset-2"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="sm:hidden rounded p-1.5 hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              key="drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="sm:hidden overflow-hidden border-t border-white/20 bg-[var(--color-teal)]"
            >
              <ul className="flex flex-col gap-2 px-4 pb-4 pt-3 text-sm font-medium" role="list">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-1.5 opacity-90 hover:opacity-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}

                <motion.li
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.06 }}
                  className="border-t border-white/20 pt-3"
                >
                  {user ? (
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="block py-1.5 opacity-90 hover:opacity-100 w-full text-left"
                    >
                      Sign out ({orgUser?.orgName})
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login"
                        className="block py-1.5 opacity-90 hover:opacity-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/register"
                        className="block py-1.5 opacity-70 hover:opacity-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
