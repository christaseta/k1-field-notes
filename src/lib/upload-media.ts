"use client";

import { createClient } from "@/lib/supabase/client";
import type { Attachment } from "@/components/AttachmentTray";

const BUCKET = "submission-media";
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB — Supabase default upload cap

function extFor(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  // Fallback from MIME (e.g. image/jpeg → jpeg)
  const mimeExt = file.type.split("/")[1];
  return (mimeExt || "bin").toLowerCase();
}

/**
 * Upload attachments to Supabase Storage and return their public URLs.
 * Each file lands at `<auth uid>/<uuid>.<ext>` so storage RLS can enforce
 * per-seller ownership while letting admins read everything.
 */
export async function uploadAttachmentsToStorage(
  attachments: Attachment[],
): Promise<string[]> {
  if (attachments.length === 0) return [];
  const supabase = createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    throw new Error("Not signed in. Sign in again and retry.");
  }
  const uid = userData.user.id;

  // Guard against oversized files before kicking off any uploads so we fail
  // fast and don't leave half-uploaded state.
  for (const a of attachments) {
    if (a.file.size > MAX_FILE_BYTES) {
      const mb = (a.file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `"${a.file.name}" is ${mb} MB — too large. Max is 50 MB per file.`,
      );
    }
  }

  const urls: string[] = [];
  for (const a of attachments) {
    const path = `${uid}/${a.id}.${extFor(a.file)}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, a.file, {
        contentType: a.file.type || "application/octet-stream",
        upsert: false,
      });
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(pub.publicUrl);
  }
  return urls;
}
