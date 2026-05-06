/**
 * Segmented progress bar used in question flows. One segment per question;
 * completed segments are bright, remaining ones are muted.
 */
export function SegmentedProgress({
  current,
  total,
}: {
  /** 1-indexed current step. */
  current: number;
  total: number;
}) {
  return (
    <div className="flex gap-2 w-full" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full ${
            i < current ? "bg-[#d9d9d9]" : "bg-[var(--text-disabled)]"
          }`}
        />
      ))}
    </div>
  );
}
