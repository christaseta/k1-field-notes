/**
 * Top bar inside the authed shell. Each page renders its own so the bar can
 * adapt to the screen — e.g. flow screens show "Weekly update" + step counter.
 */
export function TitleBar({
  title,
  right,
}: {
  /** Pass nothing to render an empty (still safe-area-padded) bar. */
  title?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="safe-area-inset-top">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-2.5 min-h-[40px]">
        {title ? (
          <p className="text-[16px] font-medium text-[var(--text-strong)] leading-4">
            {title}
          </p>
        ) : null}
        {right ? (
          <p className="text-[16px] font-normal text-[var(--text-strong)] leading-4">
            {right}
          </p>
        ) : null}
      </div>
    </div>
  );
}
