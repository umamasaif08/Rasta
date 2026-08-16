# Rasta — Phased Build Plan (Agent Instructions)

**How to work through this document:**
Build ONE phase at a time. After finishing a phase, STOP. Do not start the next phase automatically. Summarize what was built, list anything that needs manual setup (e.g. Firebase console steps, API keys), and explicitly wait for the human to say "do phase 2" (or "do phase 2 and 3", etc.) before continuing. If the human asks for changes to a phase, make them and stop again — do not proceed until told.

Refer to `PROJECT_SPEC.md` for the full data model, security rules, and design tokens — this document only sequences the work.

---

## Phase 1 — Foundation
1. **Project scaffold** — Vite + React + Next.js + Tailwind CSS set up, folder structure created, design tokens (colors, fonts) wired into Tailwind config.
2. **Firebase project setup** — Firestore + Auth initialized, security rules from `PROJECT_SPEC.md` §5 deployed, Firebase config connected to the app.
3. **Data model + seed data** — `resources` and `users` collections created, 15–20 real Karachi resources manually seeded with `status: "approved"` so there's real data to build against.

**Stop here.** Confirm Firebase connects and seed data is visible in the console before moving on.

---

## Phase 2 — Public Search Experience
1. **List view with filters** — homepage renders approved resources as a list, filter by category / open-now / language, mobile-first.
2. **Resource detail view** — individual resource page/modal with full info, "get directions" link, "report outdated info" button (writes to `reports` collection, no login needed).
3. **Low-bandwidth / print fallback view** — plain-text route with minimal CSS, fast-loading, printable.

**Stop here.** This is the core value of the app — confirm search/filter actually works well before adding accounts on top of it.

---

## Phase 3 — Organization Features
1. **Org registration** — form + Firebase Auth account creation, first listing submitted as `status: "pending"` in the same flow.
2. **Org login** — secondary nav link, session handling via `onAuthStateChanged`.
3. **Org dashboard** — logged-in org can view/edit their own listing(s), see approval status.

**Stop here.** Test the full org signup → pending → (manually flip to approved in console) → edit flow.

---

## Phase 4 — Admin & Trust Layer
1. **Admin role + auth** — one `role: "admin"` account, admin-only route protection.
2. **Admin dashboard: approval queue** — list pending submissions, approve/reject with optional reason.
3. **Admin dashboard: reports queue** — view open "outdated info" reports, mark resolved.

**Stop here.** Confirm a full org submission can go from pending → admin review → approved → publicly visible.

---

## Phase 5 — Map & Visual Polish
1. **Map view** — `react-leaflet` toggle alongside the list view, reads the same filtered data, marker clustering if needed.
2. **Hero + signature motion** — beacon pulse animation, category cards, hero search bar, using Motion (Framer Motion).
3. **Responsive + accessibility pass** — mobile breakpoints, visible keyboard focus states, `prefers-reduced-motion` respected, contrast check on the palette.

**Stop here.** This is the last phase — after this, do a full end-to-end walkthrough of every workflow in `PROJECT_SPEC.md` §8.

---

## Notes for the agent
- Each phase should leave the app in a working, demoable state — never leave it half-broken between phases.
- If a phase reveals that an earlier decision needs to change (e.g. a Firestore field is missing), make the smallest fix needed and mention it in the phase summary — don't silently redesign earlier phases.
- When summarizing a completed phase, be concrete: what routes/components exist now, what still needs a manual step (API keys, Firebase console actions), and what the human should test before approving the next phase.
