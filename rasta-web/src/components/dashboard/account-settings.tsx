"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateResource } from "@/lib/resources";
import { Settings, Mail, Lock, UserCircle, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrgUser, Resource } from "@/types";

interface AccountSettingsProps {
  user: User;
  orgUser: OrgUser | null;
  resource?: Resource;
  onResourceUpdated?: (data: Partial<Resource>) => void;
}

export default function AccountSettings({ user, orgUser, resource, onResourceUpdated }: AccountSettingsProps) {
  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Contact person
  const [contactName, setContactName] = useState(orgUser?.orgName || "");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Organization Bio
  const [bio, setBio] = useState(resource?.description || "");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [bioSuccess, setBioSuccess] = useState(false);

  async function handleEmailChange() {
    if (!newEmail || !emailPassword) {
      setEmailError("Both fields are required");
      return;
    }

    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(false);

    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email!, emailPassword);
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        email: newEmail,
      });

      setEmailSuccess(true);
      setNewEmail("");
      setEmailPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setEmailError("Incorrect password");
      } else if (err.code === "auth/email-already-in-use") {
        setEmailError("This email is already in use");
      } else if (err.code === "auth/invalid-email") {
        setEmailError("Invalid email address");
      } else {
        setEmailError(err.message || "Failed to change email");
      }
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordChange() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect");
      } else if (err.code === "auth/weak-password") {
        setPasswordError("Password is too weak");
      } else {
        setPasswordError(err.message || "Failed to change password");
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleContactNameChange() {
    if (!contactName.trim()) {
      setContactError("Contact name cannot be empty");
      return;
    }

    setContactLoading(true);
    setContactError(null);
    setContactSuccess(false);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        orgName: contactName.trim(),
      });
      setContactSuccess(true);
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setContactLoading(false);
    }
  }

  async function handleBioChange() {
    if (!resource?.id) {
      setBioError("No resource found to update");
      return;
    }

    if (!bio.trim()) {
      setBioError("Bio cannot be empty");
      return;
    }

    if (bio.length > 500) {
      setBioError("Bio is too long (max 500 characters)");
      return;
    }

    if (bio.length < 10) {
      setBioError("Bio must be at least 10 characters");
      return;
    }

    setBioLoading(true);
    setBioError(null);
    setBioSuccess(false);

    try {
      await updateResource(resource.id, {
        description: bio.trim(),
      });
      
      if (onResourceUpdated) {
        onResourceUpdated({ description: bio.trim() });
      }
      
      setBioSuccess(true);
    } catch (err) {
      setBioError(err instanceof Error ? err.message : "Failed to update bio");
    } finally {
      setBioLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Contact Person */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
            <CardTitle>Organisation Name</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact-name" className="mb-1.5 block">
              Organisation / Contact Name
            </Label>
            <Input
              id="contact-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Edhi Foundation"
            />
          </div>

          {contactError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-terracotta-light)] border border-[var(--color-terracotta)] text-[var(--color-terracotta)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
              <p className="text-sm">{contactError}</p>
            </div>
          )}

          {contactSuccess && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-teal-light)] border border-[var(--color-teal)] text-[var(--color-teal)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
              <p className="text-sm">Name updated successfully</p>
            </div>
          )}

          <Button onClick={handleContactNameChange} disabled={contactLoading}>
            {contactLoading ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      {/* Organization Bio */}
      {resource && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
              <CardTitle>Organization Bio</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--color-ink-muted)]">
              This description appears on your public listing when visitors flip your card.
            </p>

            <div>
              <Label htmlFor="org-bio" className="mb-1.5 block">
                Description
              </Label>
              <textarea
                id="org-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell visitors about your organization, services, and mission..."
                rows={6}
                className="w-full rounded-[var(--radius-btn)] border border-[var(--color-teal-light)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] resize-vertical"
              />
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                {bio.length} characters
              </p>
            </div>

            {bioError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-terracotta-light)] border border-[var(--color-terracotta)] text-[var(--color-terracotta)]">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                <p className="text-sm">{bioError}</p>
              </div>
            )}

            {bioSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-teal-light)] border border-[var(--color-teal)] text-[var(--color-teal)]">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                <p className="text-sm">Bio updated successfully</p>
              </div>
            )}

            <Button onClick={handleBioChange} disabled={bioLoading}>
              {bioLoading ? "Saving..." : "Save Bio"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Email Change */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
            <CardTitle>Change Email</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-ink-muted)]">
            Current email: <strong>{user.email}</strong>
          </p>

          <div>
            <Label htmlFor="new-email" className="mb-1.5 block">New Email</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
            />
          </div>

          <div>
            <Label htmlFor="email-password" className="mb-1.5 block">Current Password (to confirm)</Label>
            <Input
              id="email-password"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {emailError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-terracotta-light)] border border-[var(--color-terracotta)] text-[var(--color-terracotta)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
              <p className="text-sm">{emailError}</p>
            </div>
          )}

          {emailSuccess && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-teal-light)] border border-[var(--color-teal)] text-[var(--color-teal)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
              <p className="text-sm">Email changed successfully</p>
            </div>
          )}

          <Button onClick={handleEmailChange} disabled={emailLoading}>
            {emailLoading ? "Changing..." : "Change Email"}
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
            <CardTitle>Change Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password" className="mb-1.5 block">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="new-password" className="mb-1.5 block">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <Label htmlFor="confirm-password" className="mb-1.5 block">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {passwordError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-terracotta-light)] border border-[var(--color-terracotta)] text-[var(--color-terracotta)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
              <p className="text-sm">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-teal-light)] border border-[var(--color-teal)] text-[var(--color-teal)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
              <p className="text-sm">Password changed successfully</p>
            </div>
          )}

          <Button onClick={handlePasswordChange} disabled={passwordLoading}>
            {passwordLoading ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
