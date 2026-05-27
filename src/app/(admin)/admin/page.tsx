import "./dashboard.css";
import Dashboard from "./Dashboard";
import {
  getQuestionCompareData,
  getStudyOverview,
  getWeeklyDigests,
} from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const { study, weeks, participants } = await getStudyOverview();
  const [digests, compare] = await Promise.all([
    getWeeklyDigests(weeks),
    getQuestionCompareData(weeks),
  ]);
  return (
    <Dashboard
      study={study}
      weeks={weeks}
      digests={digests}
      compare={compare}
      participants={participants}
    />
  );
}
