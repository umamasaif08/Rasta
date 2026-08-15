/**
 * Seed script — populates Firestore with 20 real Karachi resources.
 *
 * Usage (after filling .env.local):
 *   npx ts-node --esm scripts/seed.ts
 *
 * Or add to package.json scripts:
 *   "seed": "npx ts-node --esm scripts/seed.ts"
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to a
 * Firebase service account JSON, OR run with `firebase emulators:exec`.
 *
 * Coords are approximate (lat/lng to ~3 decimal places).
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env.local for local runs
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ── Init ──────────────────────────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS!),
    projectId:  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();
const SEED_UID = "SEED_ADMIN"; // placeholder createdBy for seeded records

// ── Data ──────────────────────────────────────────────────────────────────
const resources = [
  // ── Shelters ──────────────────────────────────────────────────────────
  {
    name:            "Edhi Foundation — Karachi Headquarters Shelter",
    category:        "shelter",
    description:
      "One of Pakistan's largest welfare organisations. Provides emergency shelter, food, and rehabilitation for destitute men, women, and children. 24-hour intake.",
    address:         "Edhi Village, Sohrab Goth, Karachi",
    lat:             24.941,
    lng:             67.062,
    phone:           "021-111-111-911",
    hours:           "Open 24 hours, 7 days a week",
    languages:       ["Urdu", "Sindhi", "Pashto"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Chhipa Welfare — Women's Shelter (Saddar)",
    category:        "shelter",
    description:
      "Emergency shelter for women in distress. Provides safe accommodation, meals, and referral to legal/medical support.",
    address:         "Chhipa Centre, M.A. Jinnah Road, Saddar, Karachi",
    lat:             24.860,
    lng:             67.012,
    phone:           "021-111-020-020",
    hours:           "Open 24 hours",
    languages:       ["Urdu", "English"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Saylani Welfare — Night Shelter (Korangi)",
    category:        "shelter",
    description:
      "Nightly shelter for homeless men and families in Korangi industrial area. Includes evening meal and basic hygiene facilities.",
    address:         "Saylani Campus, Korangi Road, Karachi",
    lat:             24.830,
    lng:             67.103,
    phone:           "021-111-729-526",
    hours:           "5:00 PM – 8:00 AM",
    languages:       ["Urdu"],
    servesWomen:     false,
    servesChildren:  false,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },

  // ── Food ─────────────────────────────────────────────────────────────
  {
    name:            "Saylani Mass Food Programme — Gulshan Iqbal",
    category:        "food",
    description:
      "Hot meals served twice daily (lunch & dinner) to anyone in need, no questions asked. One of the largest community kitchens in Karachi.",
    address:         "Saylani Branch, Block 13-D, Gulshan-e-Iqbal, Karachi",
    lat:             24.924,
    lng:             67.090,
    phone:           "021-111-729-526",
    hours:           "12:00 PM – 2:00 PM, 7:00 PM – 9:00 PM",
    languages:       ["Urdu", "Sindhi"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Edhi Foundation — Free Food Distribution (Mithadar)",
    category:        "food",
    description:
      "Daily cooked food distribution at the Mithadar centre. Serves hundreds of labourers, dock workers, and families from the old city area.",
    address:         "Edhi Centre, Mithadar, Lyari, Karachi",
    lat:             24.853,
    lng:             66.989,
    phone:           "021-111-111-911",
    hours:           "1:00 PM – 3:00 PM",
    languages:       ["Urdu", "Balochi"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Khidmat-e-Khalq Foundation — Ration Drive (North Karachi)",
    category:        "food",
    description:
      "Monthly dry-ration packages for low-income families. Registration required on first visit; subsequent pickup is recorded by CNIC.",
    address:         "KKF Office, Sector 11-C, North Karachi",
    lat:             24.990,
    lng:             67.040,
    phone:           "0311-2345678",
    hours:           "Mon–Sat, 9:00 AM – 4:00 PM",
    languages:       ["Urdu"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Robin Hood Army — Surplus Food Redistribution (Defence)",
    category:        "food",
    description:
      "Volunteer-run weekly redistribution of surplus restaurant food. Serves around 500 meals every Sunday at multiple collection points across the city.",
    address:         "Meeting Point: Zamzama Park, Phase 5, DHA, Karachi",
    lat:             24.819,
    lng:             67.075,
    phone:           "0333-2211445",
    hours:           "Sundays 11:00 AM – 2:00 PM",
    languages:       ["Urdu", "English"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },

  // ── Clinics ───────────────────────────────────────────────────────────
  {
    name:            "Indus Hospital — Free OPD & Emergency (Korangi)",
    category:        "clinic",
    description:
      "Fully free tertiary-care hospital. No fee for any service — OPD, emergency, surgery, diagnostics. One of the largest free hospitals in Asia.",
    address:         "Plot C-76, Sector 31/5, Korangi Crossing, Karachi",
    lat:             24.831,
    lng:             67.105,
    phone:           "021-35110000",
    hours:           "Open 24 hours",
    languages:       ["Urdu", "English", "Sindhi"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Aga Khan Health Service — Discount OPD (Kharadar)",
    category:        "clinic",
    description:
      "Subsidised primary healthcare for low-income patients. Sliding-scale fees based on income. Maternal & child health, general medicine, vaccines.",
    address:         "Kharadar General Hospital, Kharadar, Karachi",
    lat:             24.857,
    lng:             67.001,
    phone:           "021-32563270",
    hours:           "Mon–Sat, 8:00 AM – 6:00 PM",
    languages:       ["Urdu", "English", "Gujarati"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "SIUT — Free Kidney & Urology Treatment (Civil Hospital)",
    category:        "clinic",
    description:
      "Sindh Institute of Urology and Transplantation. Free dialysis, kidney transplants, and urological treatment for all patients.",
    address:         "SIUT Building, Civil Hospital Campus, Karachi",
    lat:             24.869,
    lng:             67.027,
    phone:           "021-99215740",
    hours:           "Mon–Sat, 8:00 AM – 2:00 PM (OPD); Emergency 24 hrs",
    languages:       ["Urdu", "English", "Sindhi"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Chhipa Welfare — Free Mobile Medical Camp (Lyari)",
    category:        "clinic",
    description:
      "Weekly mobile medical camp offering free consultations, basic medicines, and referrals. Rotates across Lyari neighbourhoods — call for current location.",
    address:         "Lyari Town (rotating — call ahead), Karachi",
    lat:             24.851,
    lng:             66.991,
    phone:           "021-111-020-020",
    hours:           "Fridays 10:00 AM – 2:00 PM",
    languages:       ["Urdu", "Balochi"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Patients' Behbood Society — Free OPD (JPMC)",
    category:        "clinic",
    description:
      "Free outpatient consultations attached to Jinnah Postgraduate Medical Centre. Covers general medicine, paediatrics, and gynaecology.",
    address:         "JPMC Complex, Rafiqui Shaheed Road, Karachi",
    lat:             24.883,
    lng:             67.035,
    phone:           "021-99201300",
    hours:           "Mon–Fri, 8:00 AM – 1:00 PM",
    languages:       ["Urdu", "English", "Sindhi"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Marie Stopes — Low-Cost Women's Health Clinic (Gulshan)",
    category:        "clinic",
    description:
      "Reproductive health, family planning, maternal care, and safe abortion services at heavily subsidised rates for low-income women.",
    address:         "Block 6, PECHS, Gulshan-e-Iqbal, Karachi",
    lat:             24.907,
    lng:             67.083,
    phone:           "0800-00227",
    hours:           "Mon–Sat, 9:00 AM – 5:00 PM",
    languages:       ["Urdu", "English"],
    servesWomen:     true,
    servesChildren:  false,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },

  // ── Legal Aid ─────────────────────────────────────────────────────────
  {
    name:            "AGHS Legal Aid Cell — Free Legal Consultation (Saddar)",
    category:        "legal",
    description:
      "Free legal aid for women, minorities, and underprivileged citizens. Handles family law, domestic violence, labour disputes, and civil rights cases.",
    address:         "AGHS Office, Kehkashan, Clifton Block 5, Karachi",
    lat:             24.810,
    lng:             67.030,
    phone:           "021-35831902",
    hours:           "Mon–Fri, 10:00 AM – 4:00 PM",
    languages:       ["Urdu", "English", "Sindhi"],
    servesWomen:     true,
    servesChildren:  false,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Sindh Human Rights Commission — Karachi Office",
    category:        "legal",
    description:
      "Government human rights body offering free guidance and complaint filing for rights violations, forced labour, bonded labour, and discriminatory practices.",
    address:         "SHRC Office, Tughlaq House, Garden Road, Karachi",
    lat:             24.872,
    lng:             67.023,
    phone:           "021-99203002",
    hours:           "Mon–Fri, 9:00 AM – 5:00 PM",
    languages:       ["Urdu", "Sindhi", "English"],
    servesWomen:     true,
    servesChildren:  false,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Legal Aid Society — Free Clinics (KU Law Campus)",
    category:        "legal",
    description:
      "Student-run free legal aid clinic supervised by qualified advocates. Handles property disputes, tenant rights, divorce, and labour cases. Walk-in welcome.",
    address:         "Faculty of Law, University of Karachi, Main University Road",
    lat:             24.947,
    lng:             67.115,
    phone:           "021-99261300",
    hours:           "Mon, Wed, Fri — 11:00 AM – 2:00 PM (during term)",
    languages:       ["Urdu", "English"],
    servesWomen:     true,
    servesChildren:  false,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "War Against Rape (WAR) — Crisis & Legal Support",
    category:        "legal",
    description:
      "Specialised support for survivors of sexual violence. Provides free legal representation, police reporting assistance, counselling, and medical referrals.",
    address:         "WAR Office, Block 7, PECHS, Karachi",
    lat:             24.893,
    lng:             67.062,
    phone:           "0800-70806",
    hours:           "Mon–Sat, 9:00 AM – 6:00 PM; helpline 24 hrs",
    languages:       ["Urdu", "English"],
    servesWomen:     true,
    servesChildren:  false,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Bonded Labour Liberation Front — Karachi Chapter",
    category:        "legal",
    description:
      "Free legal aid and advocacy specifically for bonded labourers and brick kiln workers. Coordinates with courts and labour departments for liberation orders.",
    address:         "BLLF Office, Orangi Town, Karachi",
    lat:             24.957,
    lng:             66.998,
    phone:           "021-36626481",
    hours:           "Mon–Fri, 9:00 AM – 5:00 PM",
    languages:       ["Urdu", "Sindhi", "Punjabi"],
    servesWomen:     true,
    servesChildren:  true,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Orangi Pilot Project — Community Legal Support",
    category:        "legal",
    description:
      "Community-based paralegal support in Orangi Town. Assists with land tenure, eviction notices, utility disputes, and neighbourhood rights issues.",
    address:         "OPP-RTI, 1-B, Qasba Colony, Orangi, Karachi",
    lat:             24.963,
    lng:             66.987,
    phone:           "021-36626484",
    hours:           "Mon–Sat, 9:00 AM – 4:00 PM",
    languages:       ["Urdu", "Pashto", "Sindhi"],
    servesWomen:     true,
    servesChildren:  false,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
  {
    name:            "Strengthening Participatory Organization (SPO) — Karachi",
    category:        "legal",
    description:
      "Civil society org offering free legal literacy workshops and individual consultations for minority communities, women, and marginalised groups.",
    address:         "SPO Office, F.B. Area, Block 16, Karachi",
    lat:             24.935,
    lng:             67.069,
    phone:           "021-36349090",
    hours:           "Mon–Fri, 10:00 AM – 5:00 PM",
    languages:       ["Urdu", "English", "Sindhi"],
    servesWomen:     true,
    servesChildren:  false,
    status:          "approved",
    createdBy:       SEED_UID,
    verifiedAt:      Timestamp.now(),
  },
];

// ── Write to Firestore ────────────────────────────────────────────────────
async function seed() {
  const now = Timestamp.now();
  const batch = db.batch();

  for (const resource of resources) {
    const ref = db.collection("resources").doc();
    batch.set(ref, {
      ...resource,
      createdAt:   now,
      lastUpdated: now,
    });
  }

  await batch.commit();
  console.log(`✓ Seeded ${resources.length} resources to Firestore.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
