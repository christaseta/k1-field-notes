"use client";

import { useState } from "react";

export type Attachment = {
  id: string;
  file: File;
  url: string; // object URL for preview
  kind: "image" | "video";
};

const MAX_ATTACHMENTS = 4;

export function makeAttachment(file: File): Attachment {
  return {
    id: crypto.randomUUID(),
    file,
    url: URL.createObjectURL(file),
    kind: file.type.startsWith("video/") ? "video" : "image",
  };
}

/**
 * Row of attachment thumbnails shown above the textarea in the open-ended
 * input cards. Each chip is ~56px square with a small × to remove. Videos
 * get a play-triangle overlay so they're visually distinct from photos.
 */
export function AttachmentTray({
  attachments,
  onRemove,
}: {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-2">
      {attachments.map((a) => (
        <div
          key={a.id}
          className="relative size-14 rounded-xl overflow-hidden bg-[#2a2a2a] shrink-0"
        >
          {a.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.url}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <video
              src={a.url}
              className="size-full object-cover"
              muted
              playsInline
            />
          )}
          {a.kind === "video" && (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M6 4l10 6-10 6V4z"
                  fill="white"
                  fillOpacity="0.9"
                />
              </svg>
            </span>
          )}
          <button
            type="button"
            onClick={() => onRemove(a.id)}
            aria-label="Remove attachment"
            className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path
                d="M2 2l6 6M8 2l-6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Hook that owns attachment state + handlers for the picker + tray.
 * Used by both SpontaneousForm and OpenAnswerInput so the behavior is
 * identical on every open-ended surface.
 */
export function useAttachments() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const add = (files: FileList | File[] | null) => {
    if (!files) return;
    // Snapshot into a real array immediately so we don't rely on the
    // FileList ref staying alive once the <input> value is cleared.
    const list: File[] = Array.isArray(files) ? files : Array.from(files);
    if (list.length === 0) return;
    setAttachments((prev) => {
      const remaining = MAX_ATTACHMENTS - prev.length;
      if (remaining <= 0) return prev;
      const next = [...prev];
      for (let i = 0; i < Math.min(list.length, remaining); i++) {
        next.push(makeAttachment(list[i]));
      }
      return next;
    });
  };

  const remove = (id: string) =>
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((a) => a.id !== id);
    });

  const reset = () =>
    setAttachments((prev) => {
      prev.forEach((a) => URL.revokeObjectURL(a.url));
      return [];
    });

  return { attachments, add, remove, reset, atCap: attachments.length >= MAX_ATTACHMENTS };
}
