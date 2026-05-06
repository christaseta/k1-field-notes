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

  return <QuestionRunner set={dailyQuestionSet} kind="daily" />;
}
