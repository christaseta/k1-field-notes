import { StatusPill } from "@/components/StatusPill";
import type { StatusPill as StatusPillType } from "@/lib/status";

export function FeedbackCard({
  label,
  modifier,
  title,
  subtitle,
  pill,
  done,
}: {
  label: string;
  modifier: string;
  title: string;
  subtitle: string;
  pill: StatusPillType;
  done: boolean;
}) {
  return (
    <div
      className={`bg-[#141414] rounded-3xl p-6 min-h-[172px] flex flex-col gap-6 ${
        done ? "opacity-70" : "active:scale-[0.99] transition-transform"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[16px] font-medium text-[var(--text-standard)] leading-5">
          {label} <span className="text-[var(--text-strong)]">·</span>{" "}
          <span>{modifier}</span>
        </p>
        <StatusPill pill={pill} />
      </div>
      <div className="space-y-2 mt-auto">
        <h2 className="text-[24px] leading-[24px] -tracking-[0.18px] font-medium text-[var(--text-strong)]">
          {title}
        </h2>
        <p className="text-[16px] text-[var(--text-subtle)] -tracking-[0.035px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
