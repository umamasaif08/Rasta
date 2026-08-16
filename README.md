# Rasta

A web app that helps people find verified, up-to-date free resources in Karachi — shelters, food distribution, free/low-cost clinics, and legal aid — and lets the organizations providing them keep their own listings current.

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

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Maps**: Leaflet
- **Auth**: Firebase Auth
- **AI**: OpenAI GPT-4

## Features

- Browse resources by category (Shelter, Food, Clinic, Legal Aid)
- Filter by language, services (women/children)
- Map view with pins
- Organization dashboard for managing listings
- AI Listing Assistant for improvement suggestions
- Admin approval workflow
- Public reporting system
- Low-bandwidth text-only mode

## Documentation

See `project Details/` for full documentation:
- `PROJECT_SPEC.md` - Feature requirements
- `BUILD_PHASES.md` - Development timeline
- `CLAUDE.md` - AI coding guidelines