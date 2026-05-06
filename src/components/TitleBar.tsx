import Link from "next/link";

/**
 * Top bar inside the authed shell. Each page renders its own so the bar can
 * adapt to the screen — e.g. flow screens show "Weekly update" + step counter,
 * or replace the title with a back button on routes the seller dropped into
 * from somewhere else.
 */
export function TitleBar({
  title,
  right,
  backHref,
}: {
  /** Pass nothing to render an empty (still safe-area-padded) bar. */
  title?: React.ReactNode;
  right?: React.ReactNode;
  /** When set, replaces the title with a back chevron linking to this path. */
  backHref?: string;
}) {
  return (
    <div className="safe-area-inset-top">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-2.5 min-h-[40px] gap-2">
        <div className="flex items-center gap-1 min-w-0">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Back"
              className="-ml-2 p-2 text-[var(--text-strong)] hover:text-white"
            >
              <ChevronLeft />
            </Link>
          ) : null}
          {title ? (
            <p className="text-[16px] font-medium text-[var(--text-strong)] leading-4 truncate">
              {title}
            </p>
          ) : null}
        </div>
        {right ? (
          <p className="text-[16px] font-normal text-[var(--text-strong)] leading-4 shrink-0">
            {right}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12.5 4 6.5 10l6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
