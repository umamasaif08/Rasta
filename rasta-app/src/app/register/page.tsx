import type { Metadata } from "next";
import RegisterPageWrapper from "./register-page-wrapper";

export const metadata: Metadata = {
  title: "Register Your Organisation",
  description: "Register your NGO, clinic, shelter or legal aid service on Rasta.",
};

export default function RegisterPage() {
  return <RegisterPageWrapper />;
}
