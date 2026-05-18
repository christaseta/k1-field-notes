import type { StatusPill as StatusPillType } from "@/lib/status";

const VARIANT_STYLES: Record<StatusPillType["variant"], string> = {
  ready: "bg-[#12BF94] text-black",
  due: "bg-[#FF9F40] text-black",
  overdue: "bg-[#F25B3D] text-black",
  complete: "bg-[#2a2a2a] text-[var(--text-disabled)]",
};

export function StatusPill({ pill }: { pill: StatusPillType }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-[10px] font-medium tracking-wider tabular-nums font-['Cash_Sans_Mono'] ${VARIANT_STYLES[pill.variant]}`}
    >
      {pill.label}
    </span>
  );
}
