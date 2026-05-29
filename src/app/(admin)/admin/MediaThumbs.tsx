"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * Small thumbnail strip for submission media. Used inline in spotlight
 * cards / response rows / modal. Click opens the original in a new tab.
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
      {urls.map((u) => (
        <a
          key={u}
          href={u}
          target="_blank"
          rel="noreferrer"
          className="media-thumbs__item"
          style={{ width: size, height: size }}
          aria-label="Open photo"
          onClick={(e) => e.stopPropagation()}
        >
          <img src={u} alt="" />
        </a>
      ))}
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
      {urls.map((u) => (
        <a
          key={u}
          href={u}
          target="_blank"
          rel="noreferrer"
          className="media-gallery__item"
        >
          <img src={u} alt="" />
        </a>
      ))}
    </div>
  );
}
