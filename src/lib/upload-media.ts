"use client";

import { createClient } from "@/lib/supabase/client";
import type { Attachment } from "@/components/AttachmentTray";

const BUCKET = "submission-media";

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
      throw new Error(`Photo upload failed: ${error.message}`);
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(pub.publicUrl);
  }
  return urls;
}
