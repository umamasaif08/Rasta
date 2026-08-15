import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Clock, Mail } from "lucide-react";

export const metadata: Metadata = { 
  title: "Help & FAQ",
  description: "Learn about verification, AI assistance, listing statuses, and how to get support."
};

export default function HelpPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--color-surface-2)] py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="font-display text-4xl font-bold text-[var(--color-ink)] mb-3">
            Help & FAQ
          </h1>
          <p className="text-lg text-[var(--color-ink-muted)]">
            Common questions about verification, listing management, and getting support.
          </p>
        </header>

        {/* Help Sections */}
        <div className="space-y-6">
          {/* Section 1: What does Verified mean? */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[var(--color-teal)] flex-shrink-0 mt-1" aria-hidden />
                <CardTitle className="text-2xl font-display">
                  What does "Verified" mean?
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-[var(--color-ink-muted)]">
              <p>
                Verification is based on <strong>objective checks</strong> that confirm your 
                organization's legitimacy and contact information accuracy.
              </p>
              <p>To become verified, your listing must:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Have a confirmed physical address</li>
                <li>Have a verified phone number</li>
                <li>Pass admin review for accuracy and completeness</li>
              </ul>
              <p className="pt-2">
                <strong>Important:</strong> Verification is completely separate from the AI chat 
                assistant. Using the AI assistant does not grant or affect your verification 
                status—it's simply a tool to help improve your listing quality.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: How the AI assistant works */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-[var(--color-sage)] flex-shrink-0 mt-1" aria-hidden />
                <CardTitle className="text-2xl font-display">
                  How the AI assistant works
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-[var(--color-ink-muted)]">
              <p>
                The AI assistant is a conversational tool that helps you <strong>strengthen your 
                listing</strong> by identifying gaps and suggesting improvements.
              </p>
              <p>It works by:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Analyzing your current listing data (hours, languages, description, etc.)</li>
                <li>Asking adaptive follow-up questions about missing or unclear information</li>
                <li>Providing a plain-language summary of what's strong and what could be improved</li>
                <li>Suggesting concrete next steps to make your listing more helpful to visitors</li>
              </ul>
              <p className="pt-2">
                <strong>Note:</strong> The AI assistant does not approve listings, grant verification 
                status, or replace human admin review. It's purely advisory—a helper to make your 
                listing as clear and complete as possible.
              </p>
            </CardContent>
          </Card>

          {/* Section 3: Listing statuses explained */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-[var(--color-terracotta)] flex-shrink-0 mt-1" aria-hidden />
                <CardTitle className="text-2xl font-display">
                  Listing statuses explained
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-[var(--color-ink-muted)]">
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] mb-1.5">
                  Pending Review
                </h3>
                <p>
                  Your listing has been submitted and is waiting for admin approval. We typically 
                  review new listings within <strong>24 hours</strong>. During this time, your 
                  listing is not visible to the public.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] mb-1.5">
                  Live (Approved)
                </h3>
                <p>
                  Your listing has been approved and is now visible on the public resources page. 
                  You can continue to edit your listing details at any time—edits to already-approved 
                  listings do not require re-approval.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] mb-1.5">
                  Not Approved
                </h3>
                <p>
                  Your listing did not meet our quality or accuracy standards. Common reasons include 
                  incomplete information, unverifiable contact details, or content that doesn't align 
                  with our mission. Check your dashboard for the specific reason and resubmit after 
                  making corrections.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Contact support */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Mail className="h-6 w-6 text-[var(--color-sand)] flex-shrink-0 mt-1" aria-hidden />
                <CardTitle className="text-2xl font-display">
                  Contact support
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-[var(--color-ink-muted)]">
              <p>
                If your listing has been stuck in pending review for more than 48 hours, or if you 
                have questions about verification, approval status, or technical issues, we're here 
                to help.
              </p>
              <p>
                <a 
                  href="mailto:support@rasta.org?subject=Help%20with%20my%20listing"
                  className="inline-flex items-center gap-2 text-[var(--color-teal)] hover:text-[var(--color-teal-dark)] font-medium underline underline-offset-2 transition-colors"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  support@rasta.org
                </a>
              </p>
              <p className="text-sm">
                Please include your organization name and registered email address when contacting 
                support so we can locate your account quickly.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Back to Dashboard CTA */}
        <div className="mt-10 text-center">
          <a 
            href="/dashboard"
            className="inline-block rounded-[var(--radius-btn)] bg-[var(--color-teal)] px-6 py-3 text-white font-medium hover:bg-[var(--color-teal-dark)] transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
