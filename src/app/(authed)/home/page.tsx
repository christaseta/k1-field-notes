import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  currentWeeklySet,
  dailyQuestionSet,
  type QuestionSet,
} from "@/lib/questions";
import { currentProgramWeek, programLabel, timeOfDayGreeting } from "@/lib/program";
import { dailyStatus, weeklyStatus, type StatusPill as StatusPillType } from "@/lib/status";
import { StatusPill } from "@/components/StatusPill";
import { VoicePromptHero } from "@/components/VoicePromptHero";
import { TitleBar } from "@/components/TitleBar";

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date();

  const { data: seller } = await supabase
    .from("sellers")
    .select("display_name, weekly_day_pref")
    .single();

  const weekly = currentWeeklySet();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const [{ data: dailyToday }, { data: weeklyDone }] = await Promise.all([
    supabase
      .from("submissions")
      .select("id")
      .eq("kind", "daily")
      .gte("submitted_at", startOfDay.toISOString())
      .limit(1),
    supabase
      .from("submissions")
      .select("id")
      .eq("kind", "weekly")
      .eq("question_set_id", weekly.id)
      .limit(1),
  ]);

  const dailyDone = (dailyToday?.length ?? 0) > 0;
  const weeklyComplete = (weeklyDone?.length ?? 0) > 0;

  const dailyPill = dailyStatus(dailyDone);
  const weeklyPill = weeklyStatus(
    weeklyComplete,
    seller?.weekly_day_pref ?? null,
    now,
  );

  const greeting = timeOfDayGreeting(now);
  const firstName = (seller?.display_name ?? "").split(" ")[0]?.trim() ?? "";
  const week = currentProgramWeek(now);

  return (
    <>
      <TitleBar title="Field Notes" />
      <div className="max-w-md w-full mx-auto px-4 pt-6 space-y-6">
        <section className="space-y-4">
        <h1 className="text-[40px] leading-[40px] tracking-[-1px] text-[var(--text-standard)] font-normal">
          {firstName ? (
            <>
              {greeting},<br />
              {firstName}
            </>
          ) : (
            greeting
          )}
        </h1>
        <p className="text-[14px] text-[var(--text-subtle)] -tracking-[0.035px]">
          {programLabel(now)}
        </p>
      </section>

      <VoicePromptHero />

      <section className="flex flex-col gap-4">
        <FeedbackCard
          href={dailyDone ? null : "/daily"}
          label="Daily"
          modifier="Optional"
          title="How'd today go?"
          subtitle={`${dailyQuestionSet.questions.length} quick questions.`}
          pill={dailyPill}
          done={dailyDone}
        />

        <FeedbackCard
          href={weeklyComplete ? null : "/weekly"}
          label="Weekly"
          modifier="Required"
          title={`Week ${week} check-in`}
          subtitle={subtitleForWeekly(weekly)}
          pill={weeklyPill}
          done={weeklyComplete}
        />
        </section>
      </div>
    </>
  );
}

function subtitleForWeekly(set: QuestionSet): string {
  const n = set.questions.length;
  // Rough estimate: ~1 minute per question, capped to a friendlier round number.
  const minutes = Math.max(2, Math.min(5, n));
  return `${n} questions, around ${minutes} min to complete.`;
}

function FeedbackCard({
  href,
  label,
  modifier,
  title,
  subtitle,
  pill,
  done,
}: {
  href: string | null;
  label: string;
  modifier: string;
  title: string;
  subtitle: string;
  pill: StatusPillType;
  done: boolean;
}) {
  const inner = (
    <div
      className={`bg-[var(--bg-card)] rounded-3xl p-6 flex flex-col gap-6 ${
        done ? "opacity-70" : "active:scale-[0.99] transition-transform"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-medium text-[var(--text-standard)] leading-5">
          {label}{" "}
          <span className="text-[var(--text-strong)]">·</span>{" "}
          <span>{modifier}</span>
        </p>
        <StatusPill pill={pill} />
      </div>
      <div className="space-y-2">
        <h2 className="text-[24px] leading-[24px] -tracking-[0.18px] font-medium text-[var(--text-strong)]">
          {title}
        </h2>
        <p className="text-[14px] text-[var(--text-subtle)] -tracking-[0.035px]">
          {subtitle}
        </p>
      </div>
    </div>
  );

  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}
