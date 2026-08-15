"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import RegisterForm from "./register-form";

export default function RegisterPageWrapper() {
  const { user, orgUser, loading } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (loading) return;
    
    if (user && orgUser) {
      console.log("[Register] User already logged in, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [loading, user, orgUser, router]);

  // Show nothing while checking auth or while redirecting
  if (loading || (user && orgUser)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="text-center text-[var(--color-ink-muted)]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Register your organisation
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Your listing will be reviewed and published once approved. You can
          update it any time after logging in.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
