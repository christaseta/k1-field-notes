"use client";

/* eslint-disable @next/next/no-img-element */

const VIDEO_EXTS = new Set(["mp4", "mov", "webm", "m4v", "ogg", "ogv"]);

function isVideoUrl(url: string): boolean {
  const path = url.split("?")[0];
  const ext = path.split(".").pop()?.toLowerCase();
  return !!ext && VIDEO_EXTS.has(ext);
}

function PlayBadge() {
  return (
    <span aria-hidden className="media-thumbs__play">
      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
        <path d="M6 4l10 6-10 6V4z" fill="white" fillOpacity="0.95" />
      </svg>
    </span>
  );
}

/**
 * Small thumbnail strip for submission media. Used inline in spotlight
 * cards / response rows. Click opens the original in a new tab.
 */
export function MediaThumbs({
  urls,
  size = 32,
}: {
  urls: string[];
  size?: number;
}) {
  if (!urls?.length) return null;
  return (
    <div className="media-thumbs">
      {urls.map((u) => {
        const video = isVideoUrl(u);
        return (
          <a
            key={u}
            href={u}
            target="_blank"
            rel="noreferrer"
            className="media-thumbs__item"
            style={{ width: size, height: size }}
            aria-label={video ? "Open video" : "Open photo"}
            onClick={(e) => e.stopPropagation()}
          >
            {video ? (
              <>
                <video src={u} muted playsInline preload="metadata" />
                <PlayBadge />
              </>
            ) : (
              <img src={u} alt="" />
            )}
          </a>
        );
      })}
    </div>
  );
}

/**
 * Full-bleed gallery used inside the modal — larger preview, wraps to grid.
 */
export function MediaGallery({ urls }: { urls: string[] }) {
  if (!urls?.length) return null;
  return (
    <div className="media-gallery">
      {urls.map((u) => {
        const video = isVideoUrl(u);
        return (
          <a
            key={u}
            href={u}
            target="_blank"
            rel="noreferrer"
            className="media-gallery__item"
          >
            {video ? (
              <>
                <video src={u} muted playsInline preload="metadata" />
                <PlayBadge />
              </>
            ) : (
              <img src={u} alt="" />
            )}
          </a>
        );
      })}
    </div>
  );
}
