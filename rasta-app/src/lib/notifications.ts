import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Types ──────────────────────────────────────────────────────────────────

export type NotificationType = "status_change" | "ai_review_ready";

export interface Notification {
  id: string;
  orgId: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Timestamp;
}

// ── Create notification ────────────────────────────────────────────────────

export async function createNotification(
  orgId: string,
  message: string,
  type: NotificationType
): Promise<void> {
  try {
    await addDoc(collection(db, "notifications"), {
      orgId,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("[createNotification] Failed to create notification:", error);
    throw error;
  }
}

// ── Fetch unread notifications ─────────────────────────────────────────────

export async function getUnreadNotifications(orgId: string): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, "notifications"),
      where("orgId", "==", orgId),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Notification, "id">),
    }));
  } catch (error) {
    console.error("[getUnreadNotifications] Firestore query failed for orgId:", orgId, error);
    return [];
  }
}

// ── Fetch recent notifications (read + unread) ─────────────────────────────

export async function getRecentNotifications(
  orgId: string,
  limit = 10
): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, "notifications"),
      where("orgId", "==", orgId),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    return snap.docs.slice(0, limit).map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Notification, "id">),
    }));
  } catch (error) {
    console.error("[getRecentNotifications] Firestore query failed for orgId:", orgId, error);
    return [];
  }
}

// ── Mark notification as read ──────────────────────────────────────────────

export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
    });
  } catch (error) {
    console.error("[markNotificationRead] Failed to mark notification as read:", error);
    throw error;
  }
}

// ── Mark all notifications as read ─────────────────────────────────────────

export async function markAllNotificationsRead(orgId: string): Promise<void> {
  try {
    const unread = await getUnreadNotifications(orgId);
    
    const promises = unread.map((notif) =>
      updateDoc(doc(db, "notifications", notif.id), { read: true })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("[markAllNotificationsRead] Failed to mark all notifications as read:", error);
    throw error;
  }
}
