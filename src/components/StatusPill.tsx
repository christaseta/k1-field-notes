import type { StatusPill as StatusPillType } from "@/lib/status";

const DOT_COLOR: Record<StatusPillType["variant"], string> = {
  ready: "#00C611",
  due: "#F97316",
  overdue: "#F25B3D",
  complete: "#595959",
};

export function StatusPill({ pill }: { pill: StatusPillType }) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium tracking-wider tabular-nums font-['Cash_Sans_Mono'] border border-[#595959] text-[#B8B8B8]">
      {pill.label}
      <span
        aria-hidden
        className="inline-block size-[12px] rounded-full"
        style={{ backgroundColor: DOT_COLOR[pill.variant] }}
      />
    </span>
  );
}
