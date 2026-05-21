import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { listSubmissions } from "@/lib/admin-queries";
import type { Seller } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function SellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: seller, error } = await supabase
    .from("sellers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!seller) notFound();

  const s = seller as Seller;
  const { rows } = await listSubmissions({ sellerId: id, limit: 100 });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/sellers"
          className="text-[13px] text-[var(--text-subtle)] hover:text-[var(--text-strong)]"
        >
          ← All sellers
        </Link>
        <h1 className="text-[28px] font-medium mt-2">
          {s.display_name || s.email}
        </h1>
        <div className="text-[13px] text-[var(--text-subtle)] mt-1">{s.email}</div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Submissions" value={String(rows.length)} />
        <Field
          label="Weekly day"
          value={
            s.weekly_day_pref != null ? DAYS[s.weekly_day_pref] ?? "—" : "—"
          }
        />
        <Field label="Timezone" value={s.timezone} />
        <Field
          label="Joined"
          value={new Date(s.created_at).toLocaleDateString()}
        />
      </section>

      <section>
        <h2 className="text-[20px] font-medium mb-4">History</h2>
        <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
          <table className="w-full text-[14px]">
            <thead className="bg-[#141414] text-[var(--text-subtle)] text-left text-[12px] uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Preview</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-subtle)]">
                    No submissions from this seller.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-[#2a2a2a] hover:bg-[#141414]">
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--text-subtle)]">
                      <Link
                        href={`/admin/submissions/${row.id}`}
                        className="hover:text-[var(--text-strong)]"
                      >
                        {new Date(row.submitted_at).toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize">{row.kind}</td>
                    <td className="px-4 py-3 text-[var(--text-subtle)]">
                      {row.tags?.length ? row.tags.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-subtle)] truncate max-w-[400px]">
                      {row.note ||
                        row.answers?.find((a) => a.answer)?.answer ||
                        "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#2a2a2a] rounded-lg p-4">
      <div className="text-[12px] uppercase tracking-wide text-[var(--text-subtle)]">
        {label}
      </div>
      <div className="text-[18px] mt-1">{value}</div>
    </div>
  );
}
