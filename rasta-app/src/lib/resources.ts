import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DUMMY_RESOURCES } from "@/data/resources";
import type { Resource, ResourceSummary, Report } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────────

function toSummary(id: string, data: Resource): ResourceSummary {
  return {
    id,
    name: data.name,
    category: data.category,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    phone: data.phone,
    hours: data.hours,
    languages: data.languages,
    servesWomen: data.servesWomen,
    servesChildren: data.servesChildren,
    status: data.status,
  };
}

// ── Public queries (approved only) ───────────────────────────────────────

/**
 * Returns approved resources.
 * Uses dummy data instantly; silently tries Firestore and merges any live
 * records on top (live records with the same id win).
 */
export async function getApprovedResources(): Promise<ResourceSummary[]> {
  // Start with static data — zero latency
  const staticMap = new Map(DUMMY_RESOURCES.map((r) => [r.id, r]));

  try {
    const q = query(
      collection(db, "resources"),
      where("status", "==", "approved"),
      orderBy("name")
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      staticMap.set(d.id, toSummary(d.id, d.data() as Resource));
    });
  } catch {
    // Firestore unavailable or rules deny — fall through with dummy data
  }

  return Array.from(staticMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export async function getResourceById(id: string): Promise<Resource | null> {
  // Check static data first (instant)
  const dummy = DUMMY_RESOURCES.find((r) => r.id === id);
  if (dummy) {
    // Convert ResourceSummary → Resource shape with null timestamps
    return {
      ...dummy,
      description: getDummyDescription(id),
      createdBy: "SEED_ADMIN",
      createdAt: null,
      lastUpdated: null,
      verifiedAt: null,
    } as Resource;
  }

  // Fall back to Firestore
  try {
    const snap = await getDoc(doc(db, "resources", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Resource) };
  } catch {
    return null;
  }
}

/** Returns a meaningful description for dummy resources by id */
function getDummyDescription(id: string): string {
  const descriptions: Record<string, string> = {
    "edhi-shelter-sohrab": "One of Pakistan's largest welfare organisations. Provides emergency shelter, food, and rehabilitation for destitute men, women, and children. 24-hour intake, no one turned away.",
    "chhipa-women-shelter": "Emergency shelter for women in distress. Provides safe accommodation, meals, and referral to legal and medical support.",
    "saylani-night-shelter": "Nightly shelter for homeless men in the Korangi industrial area. Includes evening meal and basic hygiene facilities.",
    "saylani-gulshan-food": "Hot meals served twice daily to anyone in need. One of the largest community kitchens in Karachi, serving thousands daily.",
    "edhi-food-mithadar": "Daily cooked food distribution at the Mithadar centre. Serves hundreds of labourers, dock workers, and families from the old city.",
    "kkf-ration-north": "Monthly dry-ration packages for low-income families. Registration required on first visit; subsequent pickup recorded by CNIC.",
    "robin-hood-dha": "Volunteer-run weekly redistribution of surplus restaurant food. Serves around 500 meals every Sunday across multiple collection points.",
    "indus-hospital": "Fully free tertiary-care hospital. No fee for any service — OPD, emergency, surgery, diagnostics. One of the largest free hospitals in Asia.",
    "aku-kharadar": "Subsidised primary healthcare for low-income patients. Sliding-scale fees based on income. Maternal & child health, general medicine, vaccines.",
    "siut-civil": "Free dialysis, kidney transplants, and urological treatment for all patients. Fully self-funded, no charges ever.",
    "chhipa-mobile-lyari": "Weekly mobile medical camp offering free consultations, basic medicines, and referrals. Rotates across Lyari neighbourhoods.",
    "jpmc-pbs": "Free outpatient consultations at Jinnah Postgraduate Medical Centre. Covers general medicine, paediatrics, and gynaecology.",
    "marie-stopes-pechs": "Reproductive health, family planning, maternal care, and safe services at heavily subsidised rates for low-income women.",
    "aghs-legal": "Free legal aid for women, minorities, and underprivileged citizens. Handles family law, domestic violence, labour disputes, and civil rights cases.",
    "shrc-karachi": "Government human rights body offering free guidance and complaint filing for rights violations, forced labour, and discrimination.",
    "ku-legal-aid": "Student-run free legal aid clinic supervised by qualified advocates. Handles property disputes, tenant rights, divorce, and labour cases.",
    "war-pechs": "Free legal representation, police reporting assistance, counselling, and medical referrals for survivors of sexual violence. 24-hour helpline.",
    "bllf-orangi": "Free legal aid and advocacy for bonded labourers and brick kiln workers. Coordinates with courts and labour departments for liberation orders.",
    "opp-orangi": "Community-based paralegal support in Orangi Town. Assists with land tenure, eviction notices, utility disputes, and neighbourhood rights.",
    "spo-karachi": "Civil society org offering free legal literacy workshops and individual consultations for minority communities and marginalised groups.",
  };
  return descriptions[id] ?? "A verified free resource in Karachi.";
}

// ── Org queries ───────────────────────────────────────────────────────────

export async function getResourcesByOrg(uid: string): Promise<Resource[]> {
  try {
    const q = query(
      collection(db, "resources"),
      where("createdBy", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Resource) }));
  } catch {
    return [];
  }
}

// ── Write operations ──────────────────────────────────────────────────────

export async function createResource(
  data: Omit<Resource, "id" | "createdAt" | "lastUpdated" | "verifiedAt" | "status">
): Promise<string> {
  const ref = await addDoc(collection(db, "resources"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
    verifiedAt: null,
  });
  return ref.id;
}

export async function updateResource(
  id: string,
  data: Partial<Pick<Resource, "name" | "description" | "address" | "phone" | "hours" | "languages" | "servesWomen" | "servesChildren">>
): Promise<void> {
  await updateDoc(doc(db, "resources", id), {
    ...data,
    lastUpdated: serverTimestamp(),
  });
}

// ── Reports ────────────────────────────────────────────────────────────────

export async function submitReport(
  report: Omit<Report, "id" | "createdAt" | "status">
): Promise<void> {
  await addDoc(collection(db, "reports"), {
    ...report,
    status: "open",
    createdAt: serverTimestamp(),
  });
}

// ── Client-side filtering (runs on already-fetched array) ─────────────────

export interface Filters {
  q?: string;
  category?: string;
  language?: string;
  servesWomen?: boolean;
  servesChildren?: boolean;
  openNow?: boolean;
}

/** Best-effort "open now" check against a free-text hours string */
function isOpenNow(hours: string): boolean {
  if (/24 hour/i.test(hours)) return true;
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "short" }); // Mon Tue …
  const hour = now.getHours();

  // Very rough: "Mon–Sat" or "Mon-Sat"
  const dayMatch = /mon[\u2013-]sat/i.test(hours) && hour >= 8 && hour < 18;
  const dailyMatch = /daily|every day/i.test(hours);
  return dayMatch || dailyMatch;
}

export function filterResources(
  resources: ResourceSummary[],
  filters: Filters
): ResourceSummary[] {
  let list = resources;

  if (filters.q) {
    const lq = filters.q.toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(lq) ||
        r.address.toLowerCase().includes(lq) ||
        r.category.toLowerCase().includes(lq)
    );
  }

  if (filters.category && filters.category !== "all") {
    list = list.filter((r) => r.category === filters.category);
  }

  if (filters.language && filters.language !== "all") {
    list = list.filter((r) =>
      r.languages.some((l) => l.toLowerCase() === filters.language!.toLowerCase())
    );
  }

  if (filters.servesWomen) {
    list = list.filter((r) => r.servesWomen);
  }

  if (filters.servesChildren) {
    list = list.filter((r) => r.servesChildren);
  }

  if (filters.openNow) {
    list = list.filter((r) => isOpenNow(r.hours));
  }

  return list;
}

// ── Admin queries ─────────────────────────────────────────────────────────

export async function getPendingResources(): Promise<Resource[]> {
  const q = query(
    collection(db, "resources"),
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Resource) }));
}

export async function approveResource(id: string): Promise<void> {
  await updateDoc(doc(db, "resources", id), {
    status: "approved",
    verifiedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
}

export async function rejectResource(id: string, reason?: string): Promise<void> {
  await updateDoc(doc(db, "resources", id), {
    status: "rejected",
    lastUpdated: serverTimestamp(),
    ...(reason ? { rejectionReason: reason } : {}),
  });
}

export async function getOpenReports(): Promise<(Report & { id: string })[]> {
  const q = query(
    collection(db, "reports"),
    where("status", "==", "open"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Report) }));
}

export async function resolveReport(id: string): Promise<void> {
  await updateDoc(doc(db, "reports", id), {
    status: "resolved",
  });
}

export async function getAllResources(): Promise<Resource[]> {
  const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Resource) }));
}
