"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Upload, Trash2, Loader2, AlertCircle } from "lucide-react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Resource } from "@/types";

interface PhotosSectionProps {
  resource: Resource;
}

export default function PhotosSection({ resource }: PhotosSectionProps) {
  const [photos, setPhotos] = useState<string[]>([]);  // URLs from storage
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storage = getStorage();
  const MAX_PHOTOS = 5;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        // Upload to Firebase Storage
        const fileName = `${resource.id}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `resource-photos/${fileName}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      const newUrls = await Promise.all(uploadPromises);
      const updatedPhotos = [...photos, ...newUrls];

      // Save to Firestore (assuming we add a photos field to Resource type)
      if (resource.id) {
        await updateDoc(doc(db, "resources", resource.id), {
          photos: updatedPhotos,
        });
      }

      setPhotos(updatedPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  }

  async function handleDelete(url: string) {
    try {
      // Delete from storage
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);

      // Update Firestore
      const updatedPhotos = photos.filter((p) => p !== url);
      if (resource.id) {
        await updateDoc(doc(db, "resources", resource.id), {
          photos: updatedPhotos,
        });
      }

      setPhotos(updatedPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
          <CardTitle>Photos</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-[var(--color-ink-muted)]">
          Add up to {MAX_PHOTOS} photos of your facility, services, or team. Photos help build trust with people seeking help.
        </p>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-terracotta-light)] border border-[var(--color-terracotta)] text-[var(--color-terracotta)]">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Upload button */}
        {photos.length < MAX_PHOTOS && (
          <div>
            <input
              type="file"
              id="photo-upload"
              multiple
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="sr-only"
            />
            <label htmlFor="photo-upload">
              <span
                className={`inline-flex items-center gap-2 rounded-[var(--radius-btn)] border border-[var(--color-teal-light)] px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  uploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[var(--color-teal-light)] hover:border-[var(--color-teal)]"
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" aria-hidden />
                    Upload Photos ({photos.length}/{MAX_PHOTOS})
                  </>
                )}
              </span>
            </label>
          </div>
        )}

        {/* Photo grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {photos.map((url, i) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square rounded-lg overflow-hidden border border-[var(--color-teal-light)] group"
                >
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDelete(url)}
                    aria-label={`Delete photo ${i + 1}`}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-[var(--color-teal-light)] rounded-lg">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 text-[var(--color-ink-faint)]" aria-hidden />
            <p className="text-sm text-[var(--color-ink-muted)]">No photos yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
