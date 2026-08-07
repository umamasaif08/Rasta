import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Organisation Login",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)] mb-2">
        Organisation login
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-8">
        Log in to manage your listings and check approval status.
      </p>
      <LoginForm />
    </div>
  );
}
