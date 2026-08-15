"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/types";

/**
 * Redirect to /login if the user is not authenticated.
 * Optionally restrict to a specific role.
 */
export function useRequireAuth(requiredRole?: UserRole) {
  const { user, orgUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole && orgUser?.role !== requiredRole) {
      router.replace("/");
    }
  }, [loading, user, orgUser, requiredRole, router]);

  return { user, orgUser, loading };
}
