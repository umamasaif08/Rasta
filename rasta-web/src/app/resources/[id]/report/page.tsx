import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResourceById } from "@/lib/resources";
import ReportForm from "./report-form";

export const metadata: Metadata = { title: "Report Outdated Info" };

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getResourceById(id);
  if (!resource || resource.status !== "approved") notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)] mb-1">
        Report outdated info
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-6">
        For:{" "}
        <span className="font-medium text-[var(--color-ink)]">{resource.name}</span>
      </p>
      <ReportForm resourceId={id} />
    </div>
  );
}
