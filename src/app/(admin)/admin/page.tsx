import Link from "next/link";
import { getOverviewStats, listSubmissions } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#2a2a2a] rounded-lg p-5">
      <div className="text-[12px] uppercase tracking-wide text-[var(--text-subtle)]">
        {label}
      </div>
      <div className="text-[32px] font-medium text-[var(--text-strong)] mt-1">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [stats, recent] = await Promise.all([
    getOverviewStats(),
    listSubmissions({ limit: 10 }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-[28px] font-medium mb-6">Overview</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Stat label="Total submissions" value={stats.totalSubmissions} />
          <Stat label="Last 7 days" value={stats.last7Days} />
          <Stat label="Sellers" value={stats.sellers} />
          <Stat label="Daily" value={stats.daily} />
          <Stat label="Weekly" value={stats.weekly} />
          <Stat label="Spontaneous" value={stats.spontaneous} />
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[20px] font-medium">Recent submissions</h2>
          <Link href="/admin/submissions" className="text-[13px] text-[var(--text-subtle)] hover:text-[var(--text-strong)]">
            View all →
          </Link>
        </div>
        <SubmissionsTable rows={recent.rows} />
      </section>
    </div>
  );
}

import type { SubmissionWithSeller } from "@/lib/admin-queries";

function SubmissionsTable({ rows }: { rows: SubmissionWithSeller[] }) {
  if (!rows.length) {
    return <p className="text-[var(--text-subtle)]">No submissions yet.</p>;
  }
  return (
    <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
      <table className="w-full text-[14px]">
        <thead className="bg-[#141414] text-[var(--text-subtle)] text-left text-[12px] uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Seller</th>
            <th className="px-4 py-3">Kind</th>
            <th className="px-4 py-3">Preview</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[#2a2a2a] hover:bg-[#141414]">
              <td className="px-4 py-3 whitespace-nowrap text-[var(--text-subtle)]">
                <Link href={`/admin/submissions/${row.id}`} className="hover:text-[var(--text-strong)]">
                  {new Date(row.submitted_at).toLocaleString()}
                </Link>
              </td>
              <td className="px-4 py-3">
                {row.seller?.display_name || row.seller?.email || row.seller_id}
              </td>
              <td className="px-4 py-3 capitalize">{row.kind}</td>
              <td className="px-4 py-3 text-[var(--text-subtle)] truncate max-w-[400px]">
                {row.note ||
                  row.answers?.find((a) => a.answer)?.answer ||
                  "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
