import { createClient } from "@/lib/supabase/server";
import {
  currentWeeklySet,
  dailyQuestionSet,
  type QuestionSet,
} from "@/lib/questions";
import { currentProgramWeek, programLabel, timeOfDayGreeting } from "@/lib/program";
import { dailyStatus, weeklyStatus } from "@/lib/status";
import Image from "next/image";
import Link from "next/link";
import { VoicePromptHero } from "@/components/VoicePromptHero";
import { TitleBar } from "@/components/TitleBar";
import { FeedbackCard } from "@/components/FeedbackCard";
import { FeedbackCardSheet } from "@/components/FeedbackCardSheet";

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
      <TitleBar />
      <div className="max-w-md w-full mx-auto px-4 pt-6 space-y-6">
        <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] text-[var(--text-subtle)] -tracking-[0.035px]">
            {programLabel(now)}
          </p>
          <Link
            href="/settings"
            aria-label="Settings"
            className="shrink-0"
          >
            <Image
              src="/icons/ui/menu-dots.svg"
              alt=""
              width={36}
              height={36}
            />
          </Link>
        </div>
        <h1 className="text-[40px] leading-[42px] tracking-[-1px] text-[var(--text-standard)] font-normal">
          {firstName ? (
            <>
              {greeting},<br />
              {firstName}
            </>
          ) : (
            greeting
          )}
        </h1>
      </section>

      <div className="pt-4">
        <VoicePromptHero />
      </div>

      {/*
        Completed cards drop to the bottom so the next thing-to-do is always
        in the most reachable position.
      */}
      <section className="flex flex-col gap-4">
        {[
          {
            key: "daily",
            done: dailyDone,
            card: (
              <FeedbackCardSheet kind="daily" set={dailyQuestionSet} done={dailyDone}>
                <FeedbackCard
                  label="Daily"
                  modifier="Optional"
                  title="How'd today go?"
                  subtitle={`${dailyQuestionSet.questions.length} quick questions.`}
                  pill={dailyPill}
                  done={dailyDone}
                />
              </FeedbackCardSheet>
            ),
          },
          {
            key: "weekly",
            done: weeklyComplete,
            card: (
              <FeedbackCardSheet kind="weekly" set={weekly} done={weeklyComplete}>
                <FeedbackCard
                  label="Weekly"
                  modifier="Required"
                  title={`Week ${week} check-in`}
                  subtitle={subtitleForWeekly(weekly)}
                  pill={weeklyPill}
                  done={weeklyComplete}
                />
              </FeedbackCardSheet>
            ),
          },
        ]
          .sort((a, b) => Number(a.done) - Number(b.done))
          .map(({ key, card }) => (
            <div key={key}>{card}</div>
          ))}
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

