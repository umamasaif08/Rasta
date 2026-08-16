# Rasta

A website that helps people find verified, up-to-date free resources in Karachi — shelters, food distribution, free/low-cost clinics, and legal aid — and lets the organizations providing them keep their own listings current.

## Project Structure

```
Rasta/
├── project Details/          # Project documentation & reports
│   ├── README.md            # Project overview
│   ├── PROJECT_SPEC.md      # Feature specifications
│   ├── BUILD_PHASES.md      # Build timeline & phases
│   ├── CLAUDE.md            # AI agent guidelines
│   ├── FIVE_FIXES_SUMMARY.md
│   ├── SIX_FIXES_FINAL_REPORT.md
│   ├── E2E_TEST_SCRIPT.md
│   └── LICENSE
│
├── rasta-web/                # Next.js web application
│   ├── src/                 # Source code (DO NOT modify structure)
│   ├── public/              # Static assets
│   ├── scripts/             # Build/seed scripts
│   ├── .env                 # Environment variables (DO NOT move)
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── .gitignore
└── README.md                 # This file
```

## Quick Start

```bash
cd rasta-web
npm install
npm run dev
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Maps**: Leaflet
- **Auth**: Firebase Auth
- **AI**: OpenAI GPT-4

# Rasta-overview

A public web app helping people in Karachi find verified free shelters, food distribution, clinics, and legal aid — while letting the organizations that provide these services register, manage, and improve their own listings.

---

## Setup & Run Instructions

```bash
npm install && npm run dev
```

Then open `http://localhost:3000`.

### Environment variables

Before running, create a `.env.local` file in the project root (never commit this file) with:

```
# Firebase client config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# OpenAI (server-only — never exposed to the client)
OPENAI_API_KEY=
```

---

## Architecture Overview

| Part | What it does |
|---|---|
| **Homepage / public dashboard** (`/`) | Public-facing category browsing (Shelter / Food / Clinic / Legal Aid) and the Organizations/Resources flip-card grid. No login required. |
| **Resources page** | Search, filters (language, open now, serves women/children), list + map view toggle (Leaflet + OpenStreetMap). |
| **Resource / Organization detail page** | Full details for a single approved listing — description, address, phone, hours, map pin. |
| **Registration flow** (`/register`) | 3-step signup for organizations: account → org details → listing details. Creates a Firebase Auth user and a `resources` document tagged with `createdBy`. |
| **Org dashboard** (`/dashboard`) | Logged-in org's home base: Status Card, Edit Listing, AI "Improve Your Listing" assistant, Photos, Account Settings (incl. bio), and Verification Checklist. |
| **Admin dashboard** (`/admin`) | Restricted to accounts with `isAdmin: true`. Pending request review (approve/reject with detail view), full organization list with filters, status history log, and admin account settings. |
| **Firebase Auth** | Handles account creation/login for organizations and admins. |
| **Firestore** | Three collections: `resources` (listings, with `status`, `aiReviewNotes`, `verificationStatus`, `statusHistory`), `users` (org/admin accounts), `reports` (flagged outdated info). |
| **Firestore Security Rules** | Enforce that orgs can only write to their own resource docs, only admins can approve/reject, and public reads are limited to `status == "approved"`. |

---

## AI Integration Explained

**What it is:** One AI assistant with two jobs, both running server-side via the OpenAI API (key never exposed to the client):

1. **At registration time** — helps clean up and structure a raw submission as an organization fills out their listing.
2. **On the org dashboard** — a chat interface (`ListingAssistant`) that asks gap-based questions about a listing (e.g. missing hours, vague description) and returns a plain-language summary of what could be improved.

**Why this design:** Verification (`status: approved`) is deliberately kept separate from anything the AI does. Verification is tied only to objective checks — address, phone, admin approval — never to how well someone chats with the assistant. This matters because Rasta is a trust-and-safety product: it tells vulnerable people "this place is real, go here." An AI that could be talked into approving a listing would be a real-world risk. So the AI's role is strictly advisory — it improves listing *quality*, a human grants *verification*.

**Why OpenAI over Anthropic:** the project originally scoped Claude/Anthropic for this role but switched to OpenAI's API for the current implementation; the integration pattern (server-side call, key in environment variables only, structured prompt asking for gap analysis of listing fields) would carry over similarly to either provider.

---

## Known Limitations & Future Improvements

- **No automated monitoring/alerting** beyond Vercel's build-failure emails — Firestore errors are currently only logged to the browser console, not aggregated anywhere.
- **No org-to-org collaboration features** (e.g. referrals between organizations) — considered, intentionally deferred until core flows are fully stable.
- **Reports feature** (flagging outdated listings) has a data model (`reports` collection) and admin resolution flow, but is not yet surfaced in the org-facing dashboard nav — deferred as a possible future addition once the core experience is calmer.
- **Notifications** are currently limited to admin's own pending-count badge and org-facing status/AI-review notifications — no real-time (`onSnapshot`) updates yet, just fetch-on-load/fetch-on-click.
- **Testing coverage is partial** — unit tests exist for at least one core component (flip card) plus an edge-case test; broader coverage across the admin dashboard and AI assistant is a natural next step.
- **Performance & accessibility** — Lighthouse and WAVE/axe audits are being run iteratively as UI issues are found and fixed (see Performance & Accessibility Audit section of the project submission); ongoing rather than fully complete.
- **Category browsing buttons** on the homepage currently filter/scope the existing Resources page rather than linking to dedicated category-specific pages — a possible future enhancement.

## Documentation

See `project Details/` for full documentation:
- `PROJECT_SPEC.md` - Feature requirements
- `BUILD_PHASES.md` - Development timeline
- `CLAUDE.md` - AI coding guidelines