"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, Sparkles, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getRecentNotifications,
  markNotificationRead,
  type Notification,
} from "@/lib/notifications";

interface NotificationsDropdownProps {
  orgId: string;
}

export default function NotificationsDropdown({ orgId }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on mount and when bell is clicked
  useEffect(() => {
    fetchNotifications();
  }, [orgId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const notifs = await getRecentNotifications(orgId, 10);
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (error) {
      console.error("[NotificationsDropdown] Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleNotificationClick(notif: Notification) {
    if (notif.read) return;

    try {
      await markNotificationRead(notif.id);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("[NotificationsDropdown] Failed to mark notification as read:", error);
    }
  }

  function getNotificationIcon(type: Notification["type"]) {
    switch (type) {
      case "status_change":
        return <CheckCircle2 className="h-4 w-4 text-[var(--color-teal)]" aria-hidden />;
      case "ai_review_ready":
        return <Sparkles className="h-4 w-4 text-[var(--color-sage)]" aria-hidden />;
      default:
        return <Bell className="h-4 w-4 text-[var(--color-ink-muted)]" aria-hidden />;
    }
  }

  function formatTimestamp(createdAt: Notification["createdAt"]) {
    try {
      const date = createdAt.toDate();
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "recently";
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative rounded p-1.5 hover:bg-white/10 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-4 w-4" aria-hidden />
        
        {/* Badge count */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--color-terracotta)] text-white text-[11px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[var(--radius-card)] bg-[var(--color-surface)] shadow-2xl border border-[var(--color-teal-light)] z-50 max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-teal-light)]">
              <h3 className="font-semibold text-[var(--color-ink)]">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>

            {/* Notifications list */}
            <div className="overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="p-8 text-center text-sm text-[var(--color-ink-muted)]">
                  <Clock className="h-6 w-6 mx-auto mb-2 animate-pulse" aria-hidden />
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--color-ink-muted)]">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" aria-hidden />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--color-teal-light)]">
                  {notifications.map((notif) => (
                    <motion.li
                      key={notif.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: "var(--color-surface-2)" }}
                      className={`p-4 cursor-pointer transition-colors ${
                        !notif.read ? "bg-[var(--color-teal-light)]/30" : ""
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-relaxed ${
                              !notif.read
                                ? "font-medium text-[var(--color-ink)]"
                                : "text-[var(--color-ink-muted)]"
                            }`}
                          >
                            {notif.message}
                          </p>
                          <p className="text-xs text-[var(--color-ink-faint)] mt-1">
                            {formatTimestamp(notif.createdAt)}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="flex-shrink-0 h-2 w-2 rounded-full bg-[var(--color-teal)] mt-1.5" />
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
