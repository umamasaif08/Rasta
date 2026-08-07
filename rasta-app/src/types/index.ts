import { Timestamp } from "firebase/firestore";

export type ResourceCategory = "shelter" | "food" | "clinic" | "legal";
export type ResourceStatus = "pending" | "approved" | "rejected";
export type UserRole = "org" | "admin";
export type ReportStatus = "open" | "resolved";

export interface Resource {
  id?: string;
  name: string;
  category: ResourceCategory;
  description: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  languages: string[];
  servesWomen: boolean;
  servesChildren: boolean;
  status: ResourceStatus;
  createdBy: string;
  createdAt: Timestamp | null;
  lastUpdated: Timestamp | null;
  verifiedAt: Timestamp | null;
}

export interface OrgUser {
  uid: string;
  orgName: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp | null;
}

export interface Report {
  id?: string;
  resourceId: string;
  reason: string;
  reporterContact: string | null;
  status: ReportStatus;
  createdAt: Timestamp | null;
}

// Lightweight type used for list/map views (no timestamps)
export interface ResourceSummary {
  id: string;
  name: string;
  category: ResourceCategory;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  languages: string[];
  servesWomen: boolean;
  servesChildren: boolean;
  status: ResourceStatus;
}
