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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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

export async function getApprovedResources(): Promise<ResourceSummary[]> {
  const q = query(
    collection(db, "resources"),
    where("status", "==", "approved"),
    orderBy("name")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toSummary(d.id, d.data() as Resource));
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const snap = await getDoc(doc(db, "resources", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Resource) };
}

// ── Org queries ───────────────────────────────────────────────────────────

export async function getResourcesByOrg(uid: string): Promise<Resource[]> {
  const q = query(
    collection(db, "resources"),
    where("createdBy", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Resource) }));
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
