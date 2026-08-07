import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Register Your Organisation",
  description: "Register your NGO, clinic, shelter or legal aid service on Rasta.",
};

export default function RegisterPage() {
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
