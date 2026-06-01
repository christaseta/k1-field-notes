import { cookies } from "next/headers";
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
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo")?.value === "true";
  
  const supabase = await createClient();
  const now = new Date();

  const { data: seller } = await supabase
    .from("sellers")
    .select("display_name, weekly_day_pref")
    .single();
  
  // Use demo name if in demo mode and no seller data
  const displayName = seller?.display_name || (isDemo ? "Amanda" : "");

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
  const firstName = displayName.split(" ")[0]?.trim() ?? "";
  const week = currentProgramWeek(now);

  return (
    <div
      className="h-[100dvh] flex flex-col"
      style={{
        backgroundImage: "url(/dot-bg.png)",
        backgroundSize: "100% auto",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <TitleBar />
      <div className="flex-1 min-h-0 overflow-y-auto max-w-md w-full mx-auto px-4 pt-6 pb-6 flex flex-col gap-10 animate-fade-in">
        <section>
        <div className="flex justify-end">
          <Link
            href="/settings"
            aria-label="Settings"
            className="shrink-0 transition-all duration-150 ease-out hover:opacity-80 active:scale-90 active:opacity-60"
          >
            <Image
              src="/icons/ui/settings.svg"
              alt=""
              width={40}
              height={40}
            />
          </Link>
        </div>
        <h1 className="mt-12 text-[40px] leading-[42px] tracking-[-1px] text-[var(--text-standard)] font-normal">
          {firstName ? (
            <>
              {greeting},<br />
              {firstName}
            </>
          ) : (
            greeting
          )}
        </h1>
        <p className="mt-4 text-[16px] font-medium text-white -tracking-[0.035px]">
          {programLabel(now)}
        </p>
      </section>

      {/*
        Completed cards drop to the bottom so the next thing-to-do is always
        in the most reachable position.
      */}
      <section className="flex flex-col gap-1 -mx-2">
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
                  title={`How did week ${week} go?`}
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
      <div
        className="shrink-0 px-4 pt-2"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-md mx-auto">
          <VoicePromptHero />
        </div>
      </div>
    </div>
  );
}

function subtitleForWeekly(set: QuestionSet): string {
  const n = set.questions.length;
  // Rough estimate: ~1 minute per question, capped to a friendlier round number.
  const minutes = Math.max(2, Math.min(5, n));
  return `${n} questions, around ${minutes} min to complete.`;
}

