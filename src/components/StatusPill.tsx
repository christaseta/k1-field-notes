import type { StatusPill as StatusPillType } from "@/lib/status";

const VARIANT_STYLES: Record<StatusPillType["variant"], string> = {
  ready: "bg-[var(--pill-ready-bg)] text-[var(--text-on-accent)]",
  due: "bg-[var(--pill-due-bg)] text-white",
  overdue: "bg-[var(--pill-overdue-bg)] text-white",
  complete: "bg-[#2a2a2a] text-[var(--text-disabled)]",
};

export function StatusPill({ pill }: { pill: StatusPillType }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-[10px] font-medium tracking-wider tabular-nums ${VARIANT_STYLES[pill.variant]}`}
    >
      {pill.label}
    </span>
  );
}
