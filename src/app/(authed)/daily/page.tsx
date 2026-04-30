import Link from "next/link";
import { redirect } from "next/navigation";
import { dailyQuestionSet } from "@/lib/questions";
import { createClient } from "@/lib/supabase/server";
import { QuestionRunner } from "@/components/QuestionRunner";

export default async function DailyPage() {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("submissions")
    .select("id")
    .eq("kind", "daily")
    .gte("submitted_at", startOfDay.toISOString())
    .limit(1);

  if ((data?.length ?? 0) > 0) redirect("/thanks?already=daily");

  return (
    <div className="pt-4 space-y-6">
      <Link
        href="/home"
        className="inline-flex items-center text-[14px] text-[var(--text-subtle)] hover:text-[var(--text-standard)]"
      >
        ← Home
      </Link>
      <div>
        <p className="text-[12px] tracking-wider uppercase text-[var(--accent)] font-medium">
          Daily check-in
        </p>
        <h1 className="text-[28px] leading-[32px] -tracking-[0.5px] text-[var(--text-strong)] font-medium mt-1">
          {dailyQuestionSet.title}
        </h1>
      </div>
      <QuestionRunner set={dailyQuestionSet} kind="daily" />
    </div>
  );
}
