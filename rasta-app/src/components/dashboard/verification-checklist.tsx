"use client";

import { CheckCircle2, Circle, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resource } from "@/types";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  description: string;
}

interface VerificationChecklistProps {
  resource: Resource;
}

export default function VerificationChecklist({ resource }: VerificationChecklistProps) {
  // Build checklist from existing data
  const items: ChecklistItem[] = [
    {
      id: "address",
      label: "Address confirmed",
      checked: !!resource.address && resource.address.length > 10,
      description: "Full street address provided",
    },
    {
      id: "phone",
      label: "Phone confirmed",
      checked: !!resource.phone && resource.phone.length >= 10,
      description: "Valid contact number",
    },
    {
      id: "hours",
      label: "Hours specified",
      checked: !!resource.hours && !resource.hours.toLowerCase().includes("call"),
      description: "Specific opening hours listed",
    },
    {
      id: "languages",
      label: "Languages listed",
      checked: resource.languages.length > 0,
      description: "Languages spoken by staff",
    },
    {
      id: "description",
      label: "Description complete",
      checked: resource.description.length >= 150,
      description: "Detailed description (150+ characters)",
    },
    {
      id: "verified",
      label: "Admin verified",
      checked: !!resource.verifiedAt,
      description: "Manually verified by Rasta team",
    },
  ];

  const completedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
          <CardTitle>Verification Progress</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[var(--color-ink)]">
              {completedCount} of {totalCount} checks complete
            </p>
            <p className="text-sm font-medium text-[var(--color-teal)]">{progress}%</p>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-teal)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                item.checked
                  ? "border-[var(--color-teal)] bg-[var(--color-teal-light)]"
                  : "border-[var(--color-teal-light)] bg-[var(--color-surface)]"
              }`}
            >
              {item.checked ? (
                <CheckCircle2 className="h-5 w-5 text-[var(--color-teal)] shrink-0 mt-0.5" aria-hidden />
              ) : (
                <Circle className="h-5 w-5 text-[var(--color-ink-faint)] shrink-0 mt-0.5" aria-hidden />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    item.checked ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer message */}
        {progress === 100 ? (
          <div className="p-4 rounded-lg bg-[var(--color-teal-light)] border border-[var(--color-teal)] text-center">
            <CheckCircle2 className="h-8 w-8 text-[var(--color-teal)] mx-auto mb-2" aria-hidden />
            <p className="text-sm font-medium text-[var(--color-ink)]">
              All checks complete!
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              Your listing meets all verification criteria
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-teal-light)]">
            <p className="text-sm text-[var(--color-ink-muted)]">
              <strong className="text-[var(--color-ink)]">Next steps:</strong> Complete the
              remaining checks to improve your listing's visibility and trustworthiness.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
