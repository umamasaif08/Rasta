# Rasta — Karachi Community Resource Finder
### Full Project Specification & Build Prompt

---

## 1. What this is

A website that helps people find verified, up-to-date free resources in Karachi — shelters, food distribution, free/low-cost clinics, and legal aid — and lets the organizations providing them keep their own listings current.

**Primary users:**
- **Seekers** — people looking for help, or more often, social workers, volunteers, and family members searching on someone's behalf. No login required.
- **Organizations** — NGOs, clinics, shelters. Register once, log in to manage their own listing(s).
- **Admin** (you) — approves new listings before they go public, moderates reports.

**Design direction — palette:**

| Color | Hex | Role |
|---|---|---|
| Teal | `#008585` | Primary — nav bar, hero background, CTA buttons |
| Terracotta | `#C7522A` | Accent — beacon pulse, urgent actions, hover states |
| Sage | `#74A892` | Secondary — icons, category markers |
| Sand | `#E5C185` | Tags/badges (e.g. "Verified") |
| Cream | `#FBF2C4` | Section backgrounds, cards |

Text stays a dark neutral ink (`#152524`) for contrast rather than pulling from the five accent colors, since none of them read cleanly as body text on light backgrounds.

Fraunces for display headlines, Inter for UI/body, IBM Plex Mono for stats/data. One signature motion moment (a slow "beacon" pulse on the hero search, now in terracotta against the teal hero), everything else calm and restrained. No login gate on the homepage — search is public and immediate.

---

## 2. Tech stack

- **Frontend:** React (Vite),Next.js, Tailwind CSS, Motion (Framer Motion)/anime.js/lottie-react/React Spring for animation, `react-leaflet` + OpenStreetMap tiles for maps, `lucide-react` for icons
- **Backend:** Firebase — Firestore (database), Firebase Auth (org accounts only), Firebase Storage (optional — org logos/photos), Firebase Hosting (deploy)
- **Geocoding:** Nominatim (OpenStreetMap, free) or Google Geocoding API — called once at listing creation/edit time, never at search time

---

## 3. Data model (Firestore)

```
users/{uid}
  - orgName: string
  - email: string
  - role: "org" | "admin"
  - createdAt: timestamp

resources/{resourceId}
  - name: string
  - category: "shelter" | "food" | "clinic" | "legal"
  - description: string
  - address: string
  - lat: number
  - lng: number
  - phone: string
  - hours: string              // e.g. "Open 24 hours" or "Mon–Sat, 9am–5pm"
  - languages: string[]        // e.g. ["Urdu", "English", "Sindhi"]
  - servesWomen: boolean       // optional filters relevant to safety
  - servesChildren: boolean
  - status: "pending" | "approved" | "rejected"
  - createdBy: uid
  - createdAt: timestamp
  - lastUpdated: timestamp
  - verifiedAt: timestamp | null

reports/{reportId}             // "this info is outdated" flags
  - resourceId: string
  - reason: string
  - reporterContact: string | null   // optional, not required
  - status: "open" | "resolved"
  - createdAt: timestamp
```

---

## 4. Authentication

**No auth for seekers.** The homepage, search, filters, and map are fully public — zero friction.

**Firebase Auth (email/password) for organizations only.**
- An org registers via the "Register Your Organization" form → this creates both a Firebase Auth account AND their first `resources` document (status: `pending`) in the same flow.
- Returning orgs log in via a small, secondary "Org Login" nav link (not prominent on the homepage) to edit their own listing(s) or check approval status.
- No email verification step for MVP — keep it simple; the admin-approval step is the real quality gate.
- One `role: "admin"` account (you) with access to an approval dashboard.

**Session handling:** Firebase Auth's built-in session persistence (`onAuthStateChanged` listener in a React context). No custom JWT handling needed — Firebase manages this securely by default.

---

## 5. Security

**Firestore Security Rules** (the actual backend security layer — write these carefully, this is what prevents data tampering):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }
    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    function isOwner(resourceData) {
      return isSignedIn() && request.auth.uid == resourceData.createdBy;
    }

    match /resources/{resourceId} {
      // Public can read only approved listings
      allow read: if resource.data.status == "approved" || isOwner(resource.data) || isAdmin();
      // Only signed-in orgs can create, must set their own uid, must start as pending
      allow create: if isSignedIn() &&
        request.resource.data.createdBy == request.auth.uid &&
        request.resource.data.status == "pending";
      // Only the owning org (fields only, not status) or admin (any field) can update
      allow update: if isAdmin() ||
        (isOwner(resource.data) && request.resource.data.status == resource.data.status);
      allow delete: if isAdmin() || isOwner(resource.data);
    }

    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isAdmin() || request.auth.uid == userId;
    }

    match /reports/{reportId} {
      allow create: if true;        // anyone can report outdated info, no login needed
      allow read, update: if isAdmin();
    }
  }
}
```

**Other security practices:**
- Sanitize/validate all form inputs client-side AND rely on Firestore rules server-side (never trust client-side validation alone).
- Rate-limit the "report outdated info" endpoint informally (e.g. via Firebase App Check) to prevent spam.
- Never expose the Firebase config as a "secret" concern — the client config is meant to be public; real security lives entirely in the Firestore rules above.
- Phone numbers and addresses of resources are meant to be public (that's the point), but reporter contact info on reports should never be publicly readable — only admin.
- Use HTTPS-only (Firebase Hosting does this by default).

---

## 6. Core features (MVP)

1. **Public homepage** — hero search bar, category quick-filters (shelter / food / clinic / legal), live count of verified resources.
2. **Search & filter results** — list view (default, mobile-first, fast) and map view (toggle), filter by category, distance, open-now, language spoken.
3. **Resource detail** — name, address, phone, hours, languages, "get directions" link, "report outdated info" button.
4. **Org registration** — form + account creation, submits first listing as pending.
5. **Org dashboard** — view/edit own listing(s), see approval status.
6. **Admin dashboard** — list of pending submissions, approve/reject, view open reports.
7. **Low-bandwidth fallback view** — plain-text, no map, minimal CSS, fast on 2G; also print-friendly for physical handouts at NGO offices.

## 7. Stretch features (post-MVP, mention in write-up as future work)

- WhatsApp/SMS-based search ("text your area, get 3 nearest shelters back")
- Multi-language UI toggle (Urdu / English / Sindhi)
- Org analytics (how many people viewed/contacted them)
- Verification badge with periodic re-confirmation reminders emailed to orgs
- Community-submitted photos of locations

---

## 8. User workflows

**Seeker workflow:**
Homepage → search/filter → list or map view → tap a result → see phone/address/hours → contact directly by call or visit (no in-app booking).

**Organization workflow:**
Nav → "Register Your Organization" → fill form (org info + first listing) → account created, listing set to `pending` → wait for admin approval → (once approved) can log in anytime via "Org Login" → edit hours/contact/description → edits go live immediately for org-owned fields, but flipping `status` remains admin-only.

**Admin workflow:**
Log in → admin dashboard → review pending queue → approve (goes live) or reject (with optional reason) → review open reports → mark resolved after checking with the org.

---

## 9. Build order

1. Firebase project setup (Firestore + Auth), security rules above
2. Data model + seed 15–20 real Karachi resources manually
3. Public list view with filters (no map yet) — prove the data layer works
4. Org registration + login (Firebase Auth) + org dashboard (edit own listing)
5. Admin dashboard (approve/reject queue)
6. Map view (`react-leaflet`) — reads the same filtered data as the list
7. Low-bandwidth/print fallback view
8. Visual polish pass: hero beacon animation, category cards, listing cards, responsive check, keyboard focus states, reduced-motion support

---

## 10. What to say in your capstone write-up

- Name the real problem: resource info in Karachi is scattered across outdated PDFs, WhatsApp groups, and word of mouth.
- Name your actual primary users honestly: intermediaries (caseworkers, volunteers, family) as much as direct seekers — and explain the low-bandwidth fallback as your answer to the digital-access gap.
- Show the admin-approval step as a deliberate safety decision, not just moderation — bad data here has real-world consequences.
- List the stretch features as evidence you thought past the MVP, without overclaiming you built them.
