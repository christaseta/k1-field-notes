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

  return <QuestionRunner set={set} kind="weekly" />;
}
