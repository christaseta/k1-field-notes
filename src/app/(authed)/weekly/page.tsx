import Link from "next/link";
import { redirect } from "next/navigation";
import { currentWeeklySet } from "@/lib/questions";
import { createClient } from "@/lib/supabase/server";
import { QuestionRunner } from "@/components/QuestionRunner";

export default async function WeeklyPage() {
  const supabase = await createClient();
  const set = currentWeeklySet();

  const { data } = await supabase
    .from("submissions")
    .select("id")
    .eq("kind", "weekly")
    .eq("question_set_id", set.id)
    .limit(1);

  if ((data?.length ?? 0) > 0) redirect("/thanks?already=weekly");

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
          Weekly check-in
        </p>
        <h1 className="text-[28px] leading-[32px] -tracking-[0.5px] text-[var(--text-strong)] font-medium mt-1">
          {set.title}
        </h1>
      </div>
      <QuestionRunner set={set} kind="weekly" />
    </div>
  );
}
